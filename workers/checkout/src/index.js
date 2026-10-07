// Checkout Worker for upset.live
// ==============================
//
// A small server (a Cloudflare Worker) that sits between the website, Stripe
// and Directus. The website itself is static (GitHub Pages), so it cannot keep
// a Stripe secret key; this Worker keeps it instead.
//
// It answers two addresses:
//
//   POST /checkout        The basket page calls this with
//                         { items: [{ slug, quantity }, ...] }.
//                         Answers { url, session, expires_at } — the Stripe
//                         checkout page to send the buyer to, its id, and when it
//                         (and the hold) runs out — or { error, ... } with a 4xx/5xx.
//
//   POST /release         The basket page calls this with { session } to cancel a
//                         checkout the buyer left unfinished (they came back and
//                         changed their basket). We ask Stripe to expire it; Stripe
//                         then sends the usual "expired" webhook, which puts the
//                         stock back. Answers { released: true | false }.
//
//   POST /stripe-webhook  Stripe calls this when something happens to a
//                         checkout. We only act on "checkout.session.expired"
//                         (the buyer never paid), which puts the held stock back.
//
// How stock works (vault_items.inventory in Directus is the stock count):
//
//   1. Checkout is pressed -> for every line in the basket we take its quantity
//                             off the stock straight away (a "hold") and open
//                             one Stripe checkout that lasts about 30 minutes.
//   2. Buyer pays          -> nothing else to do: the units are already gone.
//   3. Buyer gives up      -> after ~30 minutes Stripe tells us the checkout
//                             expired, and we add every line's units back.
//
// Safety rules this file follows:
//
//   - The browser only sends slugs and quantities. Titles, prices and stock are
//     read from Directus here, so a visitor can't change what they pay.
//   - The Directus token used here can only read open vault items and change
//     their `inventory` number (the "Checkout Worker" policy). Nothing else.
//   - A basket is all or nothing: if one line can't be held, the lines already
//     held are given back and the buyer is told which item ran out.
//   - If something breaks halfway, stock ends up too LOW, never too high. The
//     site might wrongly say "Sold out", but it can never sell something twice.

// How long a checkout (and its hold) lasts. Stripe's minimum is 30 minutes;
// the extra minute stops Stripe rejecting it if the clocks differ slightly.
const HOLD_SECONDS = 31 * 60;

// Basket limits. The site uses the same numbers (src/lib/basket.js). They keep
// one visitor from holding a large share of the stock, and keep the list of
// holds short enough to store on the Stripe checkout (500 characters).
const MAX_LINES = 10;
const MAX_QUANTITY = 10;

// How many times we retry a stock change when someone else changed the same
// item at the same moment (see adjustInventory).
const CAS_ATTEMPTS = 3;

// How long we remember a Stripe event (and each line of it) we've already
// handled. Stripe can send the same event more than once, for up to 3 days.
const EVENT_TTL_SECONDS = 7 * 24 * 60 * 60;

// A Stripe webhook older than this (in seconds) is refused, so an old captured
// request can't be replayed later.
const SIGNATURE_TOLERANCE_SECONDS = 300;

// Slugs longer than this are refused before we ask Directus anything.
const SLUG_MAX_LENGTH = 200;

const encoder = new TextEncoder();

// Entry point: Cloudflare calls this for every request to the Worker.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === "/checkout") return await handleCheckout(request, env);
      if (pathname === "/release") return await handleRelease(request, env);
      if (pathname === "/stripe-webhook") return await handleWebhook(request, env);
      return json({ error: "not_found" }, 404);
    } catch (error) {
      // Anything unexpected (Directus down, a missing secret...) ends here.
      // The details go to the Worker log, never to the visitor.
      console.error(error);
      return json({ error: "server_error" }, 500, corsHeaders(request, env));
    }
  },
};

// ---------------------------------------------------------------------------
// POST /checkout — start one checkout for a whole basket
// ---------------------------------------------------------------------------

async function handleCheckout(request, env) {
  // Only our own site (and local development) may start a checkout.
  // `origin` is that site's address, e.g. "https://upset.live", or null.
  const origin = allowedOrigin(request, env);
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") return preflight(origin, cors);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
  if (!origin) return json({ error: "origin_not_allowed" }, 403, cors);

  // Read and check the basket: [{ slug, quantity }, ...].
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400, cors);
  }
  const lines = basketFrom(body);
  if (!lines) return json({ error: "bad_request" }, 400, cors);

  // Stop one visitor from holding lots of stock at once (see underHoldLimit).
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!(await underHoldLimit(env, ip))) return json({ error: "too_many_holds" }, 429, cors);

  // Look every item up. Each must be open to the public, marked "available",
  // and have a title and a price above zero.
  const items = await Promise.all(lines.map((line) => readItem(env, line.slug)));
  const unavailable = lines
    .filter((line, index) => !items[index] || !(Number(items[index].price) > 0) || !items[index].title)
    .map((line) => line.slug);
  if (unavailable.length) return json({ error: "not_available", unavailable }, 404, cors);

  // Each line needs enough stock. `available` tells the basket page how many
  // are left of every line that is short, so it can offer the rest.
  const short = {};
  lines.forEach((line, index) => {
    const stock = Math.max(0, Math.floor(Number(items[index].inventory) || 0));
    if (stock < line.quantity) short[line.slug] = stock;
  });
  if (Object.keys(short).length) return json({ error: "sold_out", available: short }, 409, cors);

  // Hold every line. If one fails (someone bought the last ones a moment ago),
  // give back the lines already held, so the basket is all or nothing.
  const held = [];
  try {
    for (const [index, line] of lines.entries()) {
      const hold = await adjustInventory(env, items[index].id, -line.quantity);
      if (!hold.ok) {
        await releaseAll(env, held);
        return json({ error: "sold_out", available: { [line.slug]: hold.inventory ?? 0 } }, 409, cors);
      }
      held.push({ id: items[index].id, quantity: line.quantity });
    }
  } catch (error) {
    // Directus failed halfway: give back what was held, then report the error.
    await releaseAll(env, held);
    throw error;
  }

  // Ask Stripe for one checkout page for the whole basket. If Stripe fails,
  // give everything back straight away: no checkout exists that could expire.
  let session;
  try {
    session = await createStripeSession(env, lines, items, held, origin);
  } catch (error) {
    console.error(error);
    await releaseAll(env, held);
    return json({ error: "payment_unavailable" }, 502, cors);
  }

  await countHold(env, ip);
  return json({ url: session.url, session: session.id, expires_at: session.expires_at }, 200, cors);
}

// Browsers send an OPTIONS "pre-flight" request first, asking whether the
// real POST is allowed. Say yes only to allowed origins.
function preflight(origin, cors) {
  if (!origin) return new Response(null, { status: 403, headers: cors });
  return new Response(null, {
    status: 204,
    headers: {
      ...cors,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ---------------------------------------------------------------------------
// POST /release — cancel an unfinished checkout so its stock comes back sooner
// ---------------------------------------------------------------------------

// Only the buyer knows their checkout id (it is in the address of their Stripe
// page), and Stripe refuses to expire a checkout that was already paid, so this
// can never undo a sale. The stock itself is put back by the webhook, the one
// place that releases holds, so it can never be added back twice.
async function handleRelease(request, env) {
  const origin = allowedOrigin(request, env);
  const cors = corsHeaders(request, env);
  if (request.method === "OPTIONS") return preflight(origin, cors);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
  if (!origin) return json({ error: "origin_not_allowed" }, 403, cors);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400, cors);
  }
  const session = typeof body?.session === "string" ? body.session : "";
  if (!/^cs_(test|live)_[A-Za-z0-9]{1,250}$/.test(session)) return json({ error: "bad_request" }, 400, cors);

  return json({ released: await expireStripeSession(env, session) }, 200, cors);
}

// Turns the request body into a clean list of { slug, quantity }, or null when
// it isn't a valid basket. The same slug twice is merged into one line.
function basketFrom(body) {
  if (!Array.isArray(body?.items) || !body.items.length) return null;
  const merged = new Map();
  for (const entry of body.items) {
    // Slugs are used exactly as sent (not trimmed): editors can enter slugs
    // with spaces, and Directus must match the stored value.
    const slug = typeof entry?.slug === "string" ? entry.slug : "";
    const quantity = entry?.quantity;
    if (!slug || slug.length > SLUG_MAX_LENGTH) return null;
    if (!Number.isInteger(quantity) || quantity < 1) return null;
    merged.set(slug, (merged.get(slug) || 0) + quantity);
  }
  if (merged.size > MAX_LINES) return null;
  const lines = [...merged].map(([slug, quantity]) => ({ slug, quantity }));
  return lines.every((line) => line.quantity <= MAX_QUANTITY) ? lines : null;
}

// Puts back every hold in `held`. Used when a basket can't be completed.
// A failure here is logged and skipped: stock stays too low (the safe side).
async function releaseAll(env, held) {
  for (const hold of [...held].reverse()) {
    try {
      const release = await adjustInventory(env, hold.id, hold.quantity);
      if (!release.ok) console.error("Releasing a hold failed", hold.id, release.reason);
    } catch (error) {
      console.error("Releasing a hold failed", hold.id, error);
    }
  }
}

// ---------------------------------------------------------------------------
// POST /stripe-webhook — Stripe tells us what happened to a checkout
// ---------------------------------------------------------------------------

async function handleWebhook(request, env) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Prove the message really comes from Stripe before trusting any of it.
  const payload = await request.text();
  const valid = await verifyStripeSignature(payload, request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return json({ error: "bad_signature" }, 400);

  // We only care about abandoned checkouts. Paid ones need no action (the
  // units were taken when the checkout started), so every other event is just
  // acknowledged.
  const event = JSON.parse(payload);
  if (event.type !== "checkout.session.expired") return json({ received: true });

  // Stripe may deliver the same event twice. Handling it twice would put the
  // stock back twice, so skip events we've already finished.
  const seenKey = `event:${event.id}`;
  if (await env.EVENTS.get(seenKey)) return json({ received: true, duplicate: true });

  // We stored the basket's holds on the checkout when we created it.
  for (const hold of holdsFrom(event.data?.object?.metadata?.holds)) {
    // Each line is remembered on its own once it's back, so if a later line
    // fails and Stripe retries the event, the earlier lines aren't added twice.
    const lineKey = `released:${event.id}:${hold.id}`;
    if (await env.EVENTS.get(lineKey)) continue;
    const release = await adjustInventory(env, hold.id, hold.quantity);
    // "missing" means the item is no longer open (or was deleted), so there's
    // nothing to put back. Any other failure answers 500, which makes Stripe
    // send the event again later.
    if (!release.ok && release.reason !== "missing") return json({ error: "retry" }, 500);
    await env.EVENTS.put(lineKey, "1", { expirationTtl: EVENT_TTL_SECONDS });
  }

  // Only remember the whole event once every line is back.
  await env.EVENTS.put(seenKey, "1", { expirationTtl: EVENT_TTL_SECONDS });
  return json({ received: true });
}

// The holds are stored on the checkout as "id:quantity,id:quantity".
// Anything that doesn't look like that is ignored.
function holdsFrom(value) {
  if (typeof value !== "string" || !value) return [];
  return value
    .split(",")
    .map((part) => {
      const index = part.lastIndexOf(":");
      const id = part.slice(0, index);
      const quantity = Number(part.slice(index + 1));
      return index > 0 && Number.isInteger(quantity) && quantity > 0 ? { id, quantity } : null;
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Directus — reading items and changing stock
// ---------------------------------------------------------------------------

// Calls the Directus API with this Worker's own token and returns `data`.
async function directus(env, path, init = {}) {
  if (!env.DIRECTUS_TOKEN) throw new Error("DIRECTUS_TOKEN is not set");
  const base = String(env.DIRECTUS_URL || "").replace(/\/$/, "");
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.DIRECTUS_TOKEN}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    // The query string is left out of the message, so slugs don't end up in logs.
    throw new Error(`Directus ${init.method || "GET"} ${path.split("?")[0]} failed with ${response.status}`);
  }
  if (response.status === 204) return null;
  const payload = await response.json();
  return payload?.data ?? null;
}

// Finds one item that is open to the public and marked "available".
// Returns null when there's no such item.
async function readItem(env, slug) {
  const params = new URLSearchParams({
    "filter[slug][_eq]": slug,
    "filter[vault_classification][_eq]": "open_public",
    "filter[status][_eq]": "available",
    fields: "id,slug,title,price,inventory,category_id.slug",
    limit: "1",
  });
  const rows = await directus(env, `/items/vault_items?${params}`);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

// Reads an item's current stock.
//   a number   -> the stock count
//   null       -> the stock field is empty (treated as 0)
//   undefined  -> this Worker can't see the item any more (closed, private or deleted)
async function readInventory(env, id) {
  const params = new URLSearchParams({ "filter[id][_eq]": id, fields: "id,inventory", limit: "1" });
  const rows = await directus(env, `/items/vault_items?${params}`);
  if (!Array.isArray(rows) || !rows.length) return undefined;
  const value = rows[0].inventory;
  return value === null || value === undefined ? null : Number(value);
}

// Changes an item's stock by `delta` (negative to hold units, positive to put
// them back).
//
// This is a "compare-and-set": we read the stock (say 1), then tell Directus
// "set it to 0, but ONLY if it is still 1". If two buyers check out at the same
// moment, only one of those updates matches; the other gets nothing back,
// reads the new value (0) and is told it's sold out. That is what stops two
// people buying the last unit.
//
// Returns { ok: true, inventory } or { ok: false, reason, inventory }, where
// reason is "missing" (item not visible), "sold_out" (would go below 0; then
// `inventory` is what's left) or "conflict" (kept losing the race).
async function adjustInventory(env, id, delta) {
  for (let attempt = 0; attempt < CAS_ATTEMPTS; attempt += 1) {
    const current = await readInventory(env, id);
    if (current === undefined) return { ok: false, reason: "missing" };
    const next = (current ?? 0) + delta;
    if (next < 0) return { ok: false, reason: "sold_out", inventory: Math.max(0, current ?? 0) };

    // An empty field has to be matched with _null rather than _eq.
    const match = current === null ? { _null: true } : { _eq: current };
    // Directus "update by query": only rows matching the filter are changed,
    // and the changed rows come back. Zero rows back = someone beat us to it.
    const updated = await directus(env, "/items/vault_items?fields=id,inventory", {
      method: "PATCH",
      body: JSON.stringify({
        query: { filter: { id: { _eq: id }, inventory: match } },
        data: { inventory: next },
      }),
    });
    if (Array.isArray(updated) && updated.length === 1) return { ok: true, inventory: next };
  }
  return { ok: false, reason: "conflict" };
}

// ---------------------------------------------------------------------------
// Stripe — creating the checkout page and checking webhook signatures
// ---------------------------------------------------------------------------

// Creates one Stripe Checkout Session for the whole basket and returns it.
// Stripe's API takes form-encoded fields (key=value&...), not JSON.
async function createStripeSession(env, lines, items, held, returnOrigin) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

  const currency = String(env.CURRENCY || "gbp").toLowerCase();
  const params = new URLSearchParams();
  params.set("mode", "payment"); // a one-off payment, not a subscription
  // Cards only (this includes Apple Pay and Google Pay). Bank-debit methods
  // are left out because they can fail days later, after the hold has gone.
  params.append("payment_method_types[]", "card");

  // One receipt line per basket line: the item's title at its Directus price.
  // Stripe wants amounts in pence, so £45.00 becomes 4500.
  lines.forEach((line, index) => {
    const item = items[index];
    const prefix = `line_items[${index}]`;
    params.set(`${prefix}[quantity]`, String(line.quantity));
    params.set(`${prefix}[price_data][currency]`, currency);
    params.set(`${prefix}[price_data][unit_amount]`, String(Math.round(Number(item.price) * 100)));
    params.set(`${prefix}[price_data][product_data][name]`, item.title);
    params.set(`${prefix}[price_data][product_data][metadata][vault_item_id]`, item.id);
  });

  // Remember what we held: the webhook reads this back when the checkout
  // expires. Stripe allows 500 characters per value; MAX_LINES keeps us under.
  const holds = held.map((hold) => `${hold.id}:${hold.quantity}`).join(",");
  if (holds.length > 500) throw new Error("The basket's holds don't fit on the checkout");
  params.set("metadata[holds]", holds);
  params.set("payment_intent_data[metadata][holds]", holds);

  // When the checkout (and so the hold) runs out.
  params.set("expires_at", String(Math.floor(Date.now() / 1000) + HOLD_SECONDS));

  // Where Stripe sends the buyer afterwards. {CHECKOUT_SESSION_ID} is filled
  // in by Stripe. returnOrigin is our own (allow-listed) site address, so
  // local testing comes back to localhost and the live site to upset.live.
  params.set("success_url", `${returnOrigin}/order/complete?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${returnOrigin}/basket`);

  // Ask for a delivery address (and add postage, if configured) when anything
  // in the basket is physical. A basket of digital releases skips both.
  const digital = listFrom(env.DIGITAL_CATEGORIES);
  if (items.some((item) => !digital.includes(item.category_id?.slug))) {
    listFrom(env.SHIPPING_COUNTRIES || "GB").forEach((country, index) => {
      params.set(`shipping_address_collection[allowed_countries][${index}]`, country.toUpperCase());
    });
    if (env.SHIPPING_RATE_ID) params.set("shipping_options[0][shipping_rate]", env.SHIPPING_RATE_ID);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const session = await response.json().catch(() => null);
  if (!response.ok || !session?.url) {
    throw new Error(`Stripe session failed with ${response.status}: ${session?.error?.message || "no url"}`);
  }
  return session;
}

// Asks Stripe to expire an open checkout. true = expired now (Stripe will send
// the "expired" webhook); false = it was already paid, already expired or unknown.
async function expireStripeSession(env, id) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}/expire`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  if (response.ok) return true;
  if (response.status === 400 || response.status === 404) return false;
  throw new Error(`Stripe expire failed with ${response.status}`);
}

// Checks that a webhook really came from Stripe.
//
// Stripe signs each webhook with the endpoint's secret (whsec_...) and sends
// the signature in a header like "t=1700000000,v1=5257a8...". The signature
// is an HMAC-SHA256 of "<t>.<the raw request body>". We compute the same
// value with our copy of the secret and compare. A wrong secret, an edited
// body or an old timestamp all fail.
async function verifyStripeSignature(payload, header, secret) {
  if (!header || !secret) return false;

  // Split the header into its t= (timestamp) and v1= (signature) parts.
  let timestamp = "";
  const signatures = [];
  for (const part of header.split(",")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }
  if (!/^\d+$/.test(timestamp) || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expected = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

// Compares two strings in a way that takes the same time however many
// characters match, so an attacker can't guess a signature by timing us.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}

// ---------------------------------------------------------------------------
// Abuse limits and small helpers
// ---------------------------------------------------------------------------

// Every started checkout holds stock for ~30 minutes, so a script could make
// the whole shop look sold out just by checking out over and over. We count
// open checkouts per IP address (in the EVENTS store) and refuse more than
// MAX_HOLDS_PER_IP at a time. It's approximate, which is fine for this.
async function underHoldLimit(env, ip) {
  const limit = Number(env.MAX_HOLDS_PER_IP || 5);
  if (!ip || !env.EVENTS || !(limit > 0)) return true;
  const count = Number(await env.EVENTS.get(`holds:${ip}`)) || 0;
  return count < limit;
}

// Adds one to this IP address's checkout count. The count clears itself once
// the holds would have expired.
async function countHold(env, ip) {
  if (!ip || !env.EVENTS) return;
  const key = `holds:${ip}`;
  const count = Number(await env.EVENTS.get(key)) || 0;
  await env.EVENTS.put(key, String(count + 1), { expirationTtl: HOLD_SECONDS });
}

// "a, b,c" -> ["a", "b", "c"]. Used for the comma-separated settings in wrangler.toml.
function listFrom(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

// Returns the request's Origin (the site that sent it) if it's on the
// ALLOWED_ORIGINS list in wrangler.toml, otherwise null.
function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  return origin && listFrom(env.ALLOWED_ORIGINS).includes(origin) ? origin : null;
}

// CORS headers tell the browser which site may read our answer. Only an
// allowed origin gets the header; any other site's page can't use the Worker.
function corsHeaders(request, env) {
  const origin = allowedOrigin(request, env);
  return origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : { Vary: "Origin" };
}

// Builds a JSON response. "no-store" stops anything caching a checkout answer.
function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}
