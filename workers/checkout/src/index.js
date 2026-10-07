// Checkout Worker for upset.live
// ==============================
//
// A small server (a Cloudflare Worker) that sits between the website, Stripe
// and Directus. The website itself is static (GitHub Pages), so it cannot keep
// a Stripe secret key; this Worker keeps it instead.
//
// It answers two addresses:
//
//   POST /checkout        The Buy button calls this with { slug, from }.
//                         Answers { url } — the Stripe checkout page to send
//                         the buyer to — or { error } with a 4xx/5xx status.
//
//   POST /stripe-webhook  Stripe calls this when something happens to a
//                         checkout. We only act on "checkout.session.expired"
//                         (the buyer never paid), which puts the held unit back.
//
// How stock works (vault_items.inventory in Directus is the stock count):
//
//   1. Buy is clicked  -> we take one unit off the stock straight away (a "hold")
//                         and open a Stripe checkout that lasts about 30 minutes.
//   2. Buyer pays      -> nothing else to do: the unit is already gone.
//   3. Buyer gives up  -> after ~30 minutes Stripe tells us the checkout expired,
//                         and we add the unit back.
//
// Safety rules this file follows:
//
//   - The browser only sends the item's slug. The title, price and stock are
//     read from Directus here, so a visitor can't change what they pay.
//   - The Directus token used here can only read open vault items and change
//     their `inventory` number (the "Checkout Worker" policy). Nothing else.
//   - If something breaks halfway, stock ends up too LOW, never too high. The
//     site might wrongly say "Sold out", but it can never sell something twice.

// How long a checkout (and its hold) lasts. Stripe's minimum is 30 minutes;
// the extra minute stops Stripe rejecting it if the clocks differ slightly.
const HOLD_SECONDS = 31 * 60;

// How many times we retry a stock change when someone else changed the same
// item at the same moment (see adjustInventory).
const CAS_ATTEMPTS = 3;

// How long we remember a Stripe event we've already handled. Stripe can send
// the same event more than once, for up to 3 days.
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
// POST /checkout — start a checkout for one item
// ---------------------------------------------------------------------------

async function handleCheckout(request, env) {
  // Only our own site (and local development) may start a checkout.
  // `origin` is that site's address, e.g. "https://upset.live", or null.
  const origin = allowedOrigin(request, env);
  const cors = corsHeaders(request, env);

  // Browsers send an OPTIONS "pre-flight" request first, asking whether the
  // real POST is allowed. Say yes only to allowed origins.
  if (request.method === "OPTIONS") {
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
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
  if (!origin) return json({ error: "origin_not_allowed" }, 403, cors);

  // Read { slug, from } from the request body.
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400, cors);
  }
  // The slug is used exactly as sent (not trimmed): editors can enter slugs
  // with spaces, and Directus must match the stored value.
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!slug || slug.length > SLUG_MAX_LENGTH) return json({ error: "bad_request" }, 400, cors);
  // `from` only decides where "back" on the Stripe page returns to.
  const from = body.from === "vault" ? "vault" : "shop";

  // Stop one visitor from holding lots of stock at once (see underHoldLimit).
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!(await underHoldLimit(env, ip))) return json({ error: "too_many_holds" }, 429, cors);

  // Look the item up. It must be open to the public, marked "available",
  // have a title and a price above zero...
  const item = await readItem(env, slug);
  if (!item || !(Number(item.price) > 0) || !item.title) return json({ error: "not_available" }, 404, cors);
  // ...and have at least one unit in stock.
  if (!(Number(item.inventory) >= 1)) return json({ error: "sold_out" }, 409, cors);

  // Hold one unit: stock goes down by 1 now. If someone else took the last
  // unit a moment ago, this fails and the buyer is told it's sold out.
  const hold = await adjustInventory(env, item.id, -1);
  if (!hold.ok) return json({ error: "sold_out" }, 409, cors);

  // Ask Stripe for a checkout page. If Stripe fails, give the unit back
  // straight away, because no checkout exists that could expire later.
  let session;
  try {
    session = await createStripeSession(env, item, { from, returnOrigin: origin });
  } catch (error) {
    console.error(error);
    try {
      await adjustInventory(env, item.id, 1);
    } catch (releaseError) {
      // Couldn't put it back either: stock stays one too low (the safe side).
      // Fix the number by hand in Directus if this shows up in the logs.
      console.error("Releasing the hold failed", item.id, releaseError);
    }
    return json({ error: "payment_unavailable" }, 502, cors);
  }

  await countHold(env, ip);
  return json({ url: session.url }, 200, cors);
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
  // unit was taken when the checkout started), so every other event is just
  // acknowledged.
  const event = JSON.parse(payload);
  if (event.type !== "checkout.session.expired") return json({ received: true });

  // Stripe may deliver the same event twice. Handling it twice would put two
  // units back for one checkout, so skip events we've already handled.
  const seenKey = `event:${event.id}`;
  if (await env.EVENTS.get(seenKey)) return json({ received: true, duplicate: true });

  // We stored the item's id on the checkout when we created it.
  const itemId = event.data?.object?.metadata?.vault_item_id;
  if (itemId) {
    const release = await adjustInventory(env, itemId, 1);
    // "missing" means the item is no longer open (or was deleted), so there's
    // nothing to put back. Any other failure answers 500, which makes Stripe
    // send the event again later.
    if (!release.ok && release.reason !== "missing") return json({ error: "retry" }, 500);
  }

  // Only remember the event once the unit is back, so a failed attempt gets
  // retried instead of being skipped.
  await env.EVENTS.put(seenKey, "1", { expirationTtl: EVENT_TTL_SECONDS });
  return json({ received: true });
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

// Changes an item's stock by `delta` (-1 to hold a unit, +1 to put one back).
//
// This is a "compare-and-set": we read the stock (say 1), then tell Directus
// "set it to 0, but ONLY if it is still 1". If two buyers click at the same
// moment, only one of those updates matches; the other gets nothing back,
// reads the new value (0) and is told it's sold out. That is what stops two
// people buying the last unit.
//
// Returns { ok: true, inventory } or { ok: false, reason }, where reason is
// "missing" (item not visible), "sold_out" (would go below 0) or "conflict"
// (kept losing the race after CAS_ATTEMPTS tries).
async function adjustInventory(env, id, delta) {
  for (let attempt = 0; attempt < CAS_ATTEMPTS; attempt += 1) {
    const current = await readInventory(env, id);
    if (current === undefined) return { ok: false, reason: "missing" };
    const next = (current ?? 0) + delta;
    if (next < 0) return { ok: false, reason: "sold_out" };

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

// Creates a Stripe Checkout Session for one unit of `item` and returns it.
// Stripe's API takes form-encoded fields (key=value&...), not JSON.
async function createStripeSession(env, item, { from, returnOrigin }) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

  const itemPath = `/${from}/${encodeURIComponent(item.slug)}`;
  const params = new URLSearchParams();
  params.set("mode", "payment"); // a one-off payment, not a subscription
  // Cards only (this includes Apple Pay and Google Pay). Bank-debit methods
  // are left out because they can fail days later, after the hold has gone.
  params.append("payment_method_types[]", "card");

  // One line on the receipt: the item's title at its Directus price.
  // Stripe wants the amount in pence, so £45.00 becomes 4500.
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", String(env.CURRENCY || "gbp").toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(Math.round(Number(item.price) * 100)));
  params.set("line_items[0][price_data][product_data][name]", item.title);

  // Remember which item this is: the webhook reads it back when the checkout
  // expires, and it shows next to the payment in the Stripe Dashboard.
  params.set("metadata[vault_item_id]", item.id);
  params.set("metadata[slug]", item.slug);
  params.set("payment_intent_data[metadata][vault_item_id]", item.id);

  // When the checkout (and so the hold) runs out.
  params.set("expires_at", String(Math.floor(Date.now() / 1000) + HOLD_SECONDS));

  // Where Stripe sends the buyer afterwards. {CHECKOUT_SESSION_ID} is filled
  // in by Stripe. returnOrigin is our own (allow-listed) site address, so
  // local testing comes back to localhost and the live site to upset.live.
  params.set("success_url", `${returnOrigin}/order/complete?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${returnOrigin}${itemPath}`);

  // Physical items: ask for a delivery address, and add a postage charge if
  // one is configured. Digital releases skip both.
  if (!listFrom(env.DIGITAL_CATEGORIES).includes(item.category_id?.slug)) {
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

// Every started checkout holds a unit for ~30 minutes, so a script could make
// the whole shop look sold out just by clicking Buy over and over. We count
// open holds per IP address (in the EVENTS store) and refuse more than
// MAX_HOLDS_PER_IP at a time. It's approximate, which is fine for this.
async function underHoldLimit(env, ip) {
  const limit = Number(env.MAX_HOLDS_PER_IP || 5);
  if (!ip || !env.EVENTS || !(limit > 0)) return true;
  const count = Number(await env.EVENTS.get(`holds:${ip}`)) || 0;
  return count < limit;
}

// Adds one to this IP address's hold count. The count clears itself once the
// holds would have expired.
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
