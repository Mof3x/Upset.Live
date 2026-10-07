// Offline simulation of workers/checkout/src/index.js. Nothing here touches the network:
// it fakes Directus (with the Checkout Worker policy's visibility rule), Stripe and the
// EVENTS store, then drives every path: CORS, validation, holds, races, failures and webhooks.
//
// Run from the repo root (Node 20 or newer):  node workers/checkout/test/checkout.sim.mjs
// Run it after every change to the Worker. Exit code 0 means every check passed.

import { createHmac } from "node:crypto";
import { pathToFileURL } from "node:url";

const workerUrl = process.argv[2] ? pathToFileURL(process.argv[2]).href : new URL("../src/index.js", import.meta.url).href;
const worker = (await import(workerUrl)).default;

let passed = 0;
let failed = 0;
function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name} ${detail}`);
  }
}

// ------------------------------------------------------------- fake services

const TOKEN = "test-directus-token";
const STRIPE_KEY = "sk_test_fake";
const WEBHOOK_SECRET = "whsec_fake";

let items;
let stripeCalls;
let stripeMode; // "ok" | "fail"
let beforePatch; // (item) => void, lets a test change stock between read and update
let directusDown; // "patch" | "all" | null
let directusLog;
let onStripe; // () => void, runs whenever Stripe is called

function resetWorld() {
  items = [
    { id: "i-print", slug: "night-print", title: "Night Print", price: "45.00", inventory: 3, status: "available", vault_classification: "open_public", category_id: { slug: "prints" } },
    { id: "i-oneoff", slug: "Fruits and Goddess ", title: "Fruits and Goddess", price: "150.00", inventory: 1, status: "available", vault_classification: "open_public", category_id: { slug: "originals" } },
    { id: "i-cents", slug: "cents", title: "Cents", price: "12.34", inventory: 5, status: "available", vault_classification: "open_public", category_id: { slug: "prints" } },
    { id: "i-digital", slug: "digital-ep", title: "Digital EP", price: "7.00", inventory: 100, status: "available", vault_classification: "open_public", category_id: { slug: "music-digital-releases" } },
    { id: "i-noprice", slug: "no-price", title: "No Price", price: null, inventory: 4, status: "available", vault_classification: "open_public", category_id: { slug: "prints" } },
    { id: "i-zero", slug: "zero-stock", title: "Zero", price: "20.00", inventory: 0, status: "available", vault_classification: "open_public", category_id: { slug: "prints" } },
    { id: "i-null", slug: "null-stock", title: "Null", price: "20.00", inventory: null, status: "available", vault_classification: "open_public", category_id: { slug: "prints" } },
    { id: "i-archived", slug: "archived", title: "Archived", price: "20.00", inventory: 2, status: "archived", vault_classification: "open_public", category_id: { slug: "prints" } },
    { id: "i-closed", slug: "closed", title: "Closed", price: "20.00", inventory: 2, status: "available", vault_classification: "closed_collective", category_id: { slug: "prints" } },
  ];
  stripeCalls = [];
  stripeMode = "ok";
  beforePatch = null;
  directusDown = null;
  directusLog = [];
  onStripe = null;
}

const item = (id) => items.find((entry) => entry.id === id);
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// The Checkout Worker policy only sees open_public items.
const visible = () => items.filter((entry) => entry.vault_classification === "open_public");

function pick(entry, fields) {
  const out = {};
  for (const field of fields) {
    if (field === "category_id.slug") out.category_id = { slug: entry.category_id?.slug };
    else out[field] = entry[field];
  }
  return out;
}

function matchesFilter(entry, filter) {
  return Object.entries(filter).every(([field, rule]) => {
    if ("_eq" in rule) return entry[field] === rule._eq;
    if ("_null" in rule) return (entry[field] === null) === rule._null;
    throw new Error(`unsupported filter ${JSON.stringify(rule)}`);
  });
}

async function fakeDirectus(url, init) {
  await tick(); // let parallel requests interleave like real network calls
  directusLog.push(`${init.method || "GET"} ${url.pathname}`);
  if (init.headers?.Authorization !== `Bearer ${TOKEN}`) return jsonResponse({ errors: [{ message: "no" }] }, 401);
  if (directusDown === "all") return jsonResponse({ errors: [] }, 503);
  if (url.pathname !== "/items/vault_items") return jsonResponse({ errors: [] }, 404);

  const fields = (url.searchParams.get("fields") || "").split(",").filter(Boolean);

  if ((init.method || "GET") === "GET") {
    const filter = {};
    for (const [key, value] of url.searchParams) {
      const found = key.match(/^filter\[(\w+)\]\[_eq\]$/);
      if (found) filter[found[1]] = { _eq: value };
    }
    const limit = Number(url.searchParams.get("limit") || 100);
    const rows = visible().filter((entry) => matchesFilter(entry, filter)).slice(0, limit);
    return jsonResponse({ data: rows.map((entry) => pick(entry, fields)) });
  }

  if (init.method === "PATCH") {
    if (directusDown === "patch") return jsonResponse({ errors: [] }, 503);
    const body = JSON.parse(init.body);
    if (!body.query?.filter || !body.data || Object.keys(body.data).join() !== "inventory") {
      return jsonResponse({ errors: [{ message: "policy allows inventory only" }] }, 403);
    }
    if (body.data.inventory < 0) return jsonResponse({ errors: [{ message: "validation" }] }, 400);
    const target = visible().find((entry) => entry.id === body.query.filter.id?._eq);
    if (beforePatch && target) beforePatch(target);
    const rows = visible().filter((entry) => matchesFilter(entry, body.query.filter));
    rows.forEach((entry) => {
      entry.inventory = body.data.inventory;
    });
    return jsonResponse({ data: rows.map((entry) => pick(entry, fields)) });
  }
  return jsonResponse({ errors: [] }, 405);
}

async function fakeStripe(url, init) {
  await tick();
  if (init.headers?.Authorization !== `Bearer ${STRIPE_KEY}`) return jsonResponse({ error: { message: "bad key" } }, 401);
  const params = new URLSearchParams(String(init.body));
  stripeCalls.push(params);
  if (onStripe) onStripe();
  if (stripeMode === "fail") return jsonResponse({ error: { message: "card_declined style failure" } }, 400);
  const id = `cs_test_${stripeCalls.length}`;
  return jsonResponse({ id, url: `https://checkout.stripe.com/c/pay/${id}` });
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  if (url.hostname === "cms.test") return fakeDirectus(url, init);
  if (url.hostname === "api.stripe.com") return fakeStripe(url, init);
  throw new Error(`unexpected fetch ${url}`);
};

function makeKv() {
  const store = new Map();
  return {
    store,
    async get(key) {
      await tick();
      return store.has(key) ? store.get(key).value : null;
    },
    async put(key, value, options = {}) {
      await tick();
      store.set(key, { value, ttl: options.expirationTtl });
    },
  };
}

function makeEnv(overrides = {}) {
  return {
    DIRECTUS_URL: "https://cms.test/",
    ALLOWED_ORIGINS: "https://upset.live, http://localhost:5173",
    CURRENCY: "gbp",
    SHIPPING_COUNTRIES: "GB",
    DIGITAL_CATEGORIES: "music-digital-releases",
    MAX_HOLDS_PER_IP: "5",
    STRIPE_SECRET_KEY: STRIPE_KEY,
    STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    DIRECTUS_TOKEN: TOKEN,
    EVENTS: makeKv(),
    ...overrides,
  };
}

// --------------------------------------------------------------- request helpers

async function call(env, { method = "POST", path = "/checkout", origin = "https://upset.live", ip = "1.1.1.1", body, rawBody, headers = {} } = {}) {
  const init = { method, headers: { ...headers } };
  if (origin) init.headers.Origin = origin;
  if (ip) init.headers["CF-Connecting-IP"] = ip;
  if (rawBody !== undefined) init.body = rawBody;
  else if (body !== undefined) init.body = JSON.stringify(body);
  const response = await worker.fetch(new Request(`https://checkout.test${path}`, init), env);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // empty body (OPTIONS)
  }
  return { status: response.status, headers: response.headers, json };
}

function signed(payload, { secret = WEBHOOK_SECRET, timestamp = Math.floor(Date.now() / 1000) } = {}) {
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

function expiredEvent(id, itemId, type = "checkout.session.expired") {
  return JSON.stringify({ id, type, data: { object: { id: "cs_test_x", metadata: itemId ? { vault_item_id: itemId } : {} } } });
}

async function webhook(env, payload, signature) {
  return call(env, { path: "/stripe-webhook", origin: null, ip: null, rawBody: payload, headers: signature ? { "Stripe-Signature": signature } : {} });
}

// ------------------------------------------------------------------- scenarios

// CORS and routing
resetWorld();
{
  const env = makeEnv();
  let r = await call(env, { method: "OPTIONS" });
  check("OPTIONS from upset.live -> 204 with CORS", r.status === 204 && r.headers.get("Access-Control-Allow-Origin") === "https://upset.live");
  r = await call(env, { method: "OPTIONS", origin: "http://localhost:5173" });
  check("OPTIONS from localhost dev -> 204", r.status === 204 && r.headers.get("Access-Control-Allow-Origin") === "http://localhost:5173");
  r = await call(env, { method: "OPTIONS", origin: "https://evil.example" });
  check("OPTIONS from another site -> 403, no CORS header", r.status === 403 && !r.headers.get("Access-Control-Allow-Origin"));
  r = await call(env, { origin: "https://evil.example", body: { slug: "night-print" } });
  check("POST from another site -> 403 and no hold", r.status === 403 && item("i-print").inventory === 3 && stripeCalls.length === 0);
  r = await call(env, { origin: null, body: { slug: "night-print" } });
  check("POST with no Origin -> 403", r.status === 403);
  r = await call(env, { method: "GET" });
  check("GET /checkout -> 405", r.status === 405);
  r = await call(env, { path: "/other" });
  check("unknown path -> 404", r.status === 404);
}

// Request validation
resetWorld();
{
  const env = makeEnv();
  let r = await call(env, { rawBody: "{not json" });
  check("bad JSON -> 400", r.status === 400 && r.json?.error === "bad_request");
  r = await call(env, { body: {} });
  check("missing slug -> 400", r.status === 400);
  r = await call(env, { body: { slug: 42 } });
  check("non-string slug -> 400", r.status === 400);
  r = await call(env, { body: { slug: "x".repeat(201) } });
  check("over-long slug -> 400", r.status === 400);
  check("validation failures never touch Directus or Stripe", directusLog.length === 0 && stripeCalls.length === 0);
}

// Items that must not be sold
resetWorld();
{
  const env = makeEnv();
  for (const [slug, expected, label] of [
    ["missing-slug", 404, "unknown slug"],
    ["no-price", 404, "empty price"],
    ["archived", 404, "archived item"],
    ["closed", 404, "closed_collective item"],
    ["zero-stock", 409, "stock 0"],
    ["null-stock", 409, "empty stock"],
  ]) {
    const r = await call(env, { body: { slug } });
    check(`${label} -> ${expected}`, r.status === expected, `got ${r.status}`);
  }
  check("refusals never call Stripe", stripeCalls.length === 0);
  check("refusals never change stock", item("i-zero").inventory === 0 && item("i-null").inventory === null && item("i-archived").inventory === 2 && item("i-closed").inventory === 2 && item("i-noprice").inventory === 4);
}

// Happy path: a shop print
resetWorld();
{
  const env = makeEnv();
  const before = Math.floor(Date.now() / 1000);
  const r = await call(env, { body: { slug: "night-print", from: "shop" } });
  check("print checkout -> 200 with a Stripe URL", r.status === 200 && r.json?.url?.startsWith("https://checkout.stripe.com/"));
  check("answer carries CORS for upset.live", r.headers.get("Access-Control-Allow-Origin") === "https://upset.live");
  check("one unit held (3 -> 2)", item("i-print").inventory === 2);
  const p = stripeCalls[0];
  check("Stripe: payment mode, cards only", p.get("mode") === "payment" && p.getAll("payment_method_types[]").join() === "card");
  check("Stripe: £45.00 -> 4500 pence in gbp", p.get("line_items[0][price_data][unit_amount]") === "4500" && p.get("line_items[0][price_data][currency]") === "gbp");
  check("Stripe: quantity 1 and the Directus title", p.get("line_items[0][quantity]") === "1" && p.get("line_items[0][price_data][product_data][name]") === "Night Print");
  check("Stripe: item id in session and payment metadata", p.get("metadata[vault_item_id]") === "i-print" && p.get("payment_intent_data[metadata][vault_item_id]") === "i-print" && p.get("metadata[slug]") === "night-print");
  const expires = Number(p.get("expires_at"));
  check("Stripe: expires 31 minutes out (>= Stripe's 30-minute minimum)", expires - before >= 31 * 60 - 1 && expires - before <= 31 * 60 + 2, `delta ${expires - before}`);
  check("Stripe: success URL returns to upset.live with the session id placeholder", p.get("success_url") === "https://upset.live/order/complete?session_id={CHECKOUT_SESSION_ID}");
  check("Stripe: cancel URL returns to the shop item", p.get("cancel_url") === "https://upset.live/shop/night-print");
  check("Stripe: asks for a GB delivery address", p.get("shipping_address_collection[allowed_countries][0]") === "GB" && !p.has("shipping_address_collection[allowed_countries][1]"));
  check("Stripe: no shipping rate unless configured", !p.has("shipping_options[0][shipping_rate]"));
}

// Vault one-off with an awkward slug, from localhost, with a shipping rate
resetWorld();
{
  const env = makeEnv({ SHIPPING_RATE_ID: "shr_test_1", SHIPPING_COUNTRIES: "GB, ie" });
  const r = await call(env, { origin: "http://localhost:5173", body: { slug: "Fruits and Goddess ", from: "vault" } });
  check("one-off checkout -> 200", r.status === 200);
  check("one-off stock 1 -> 0", item("i-oneoff").inventory === 0);
  const p = stripeCalls[0];
  check("cancel URL keeps the encoded slug and the Vault section", p.get("cancel_url") === "http://localhost:5173/vault/Fruits%20and%20Goddess%20");
  check("success URL returns to localhost in development", p.get("success_url").startsWith("http://localhost:5173/order/complete"));
  check("shipping countries GB and IE, rate attached", p.get("shipping_address_collection[allowed_countries][1]") === "IE" && p.get("shipping_options[0][shipping_rate]") === "shr_test_1");
  check("£150.00 -> 15000", p.get("line_items[0][price_data][unit_amount]") === "15000");
  const again = await call(env, { body: { slug: "Fruits and Goddess ", from: "vault" } });
  check("second buyer of the one-off -> 409 sold_out", again.status === 409 && again.json?.error === "sold_out" && stripeCalls.length === 1);
  const trimmed = await call(env, { body: { slug: "Fruits and Goddess" } });
  check("slug is matched exactly (trimmed slug is not the item)", trimmed.status === 404);
}

// Pence rounding and digital items
resetWorld();
{
  const env = makeEnv();
  await call(env, { body: { slug: "cents" } });
  check("£12.34 -> 1234 (no float drift)", stripeCalls[0].get("line_items[0][price_data][unit_amount]") === "1234");
  await call(env, { body: { slug: "digital-ep" } });
  const p = stripeCalls[1];
  check("digital release: no delivery address, no shipping rate", ![...p.keys()].some((key) => key.startsWith("shipping")));
}

// Race: another buyer takes the last unit between our read and our update
resetWorld();
{
  const env = makeEnv();
  beforePatch = (target) => {
    if (target.id === "i-oneoff" && target.inventory === 1) target.inventory = 0;
  };
  const r = await call(env, { body: { slug: "Fruits and Goddess ", from: "vault" } });
  check("lost race for the last unit -> 409, Stripe never called", r.status === 409 && stripeCalls.length === 0);
  check("stock stays 0 (not -1)", item("i-oneoff").inventory === 0);
}

// Race: stock keeps changing under us -> give up after 3 tries, change nothing
resetWorld();
{
  const env = makeEnv();
  beforePatch = (target) => {
    if (target.id === "i-print") target.inventory += 10;
  };
  const r = await call(env, { body: { slug: "night-print" } });
  check("never-settling stock -> 409 after the retries", r.status === 409 && stripeCalls.length === 0);
  check("exactly 3 update attempts", directusLog.filter((line) => line.startsWith("PATCH")).length === 3);
  check("our own -1 was never applied", item("i-print").inventory === 33);
}

// Real interleaving: two buyers click Buy on the last unit at the same moment
resetWorld();
{
  const env = makeEnv();
  const [a, b] = await Promise.all([
    call(env, { ip: "2.2.2.2", body: { slug: "Fruits and Goddess ", from: "vault" } }),
    call(env, { ip: "3.3.3.3", body: { slug: "Fruits and Goddess ", from: "vault" } }),
  ]);
  const statuses = [a.status, b.status].sort().join(",");
  check("simultaneous buyers: exactly one 200 and one 409", statuses === "200,409", statuses);
  check("simultaneous buyers: one Stripe session, stock 0", stripeCalls.length === 1 && item("i-oneoff").inventory === 0);
}

// Five buyers, three prints
resetWorld();
{
  const env = makeEnv();
  const results = await Promise.all([1, 2, 3, 4, 5].map((n) => call(env, { ip: `9.9.9.${n}`, body: { slug: "night-print" } })));
  const ok = results.filter((result) => result.status === 200).length;
  check("5 simultaneous buyers for 3 prints: 3 succeed, stock 0, never negative", ok === 3 && item("i-print").inventory === 0 && stripeCalls.length === 3, `ok=${ok} inv=${item("i-print").inventory}`);
}

// Stripe failure gives the unit back
resetWorld();
{
  const env = makeEnv();
  stripeMode = "fail";
  const r = await call(env, { body: { slug: "night-print" } });
  check("Stripe failure -> 502 payment_unavailable", r.status === 502 && r.json?.error === "payment_unavailable");
  check("Stripe failure -> hold released (back to 3)", item("i-print").inventory === 3);
  check("Stripe failure is not counted against the visitor", !env.EVENTS.store.has("holds:1.1.1.1"));
}

// Stripe failure AND the release fails -> stock stays low (safe side), 502
resetWorld();
{
  const env = makeEnv();
  stripeMode = "fail";
  onStripe = () => {
    directusDown = "patch"; // Directus stops accepting updates while Stripe is failing
  };
  const r = await call(env, { body: { slug: "night-print" } });
  check("failed release -> still 502, stock 2 (too low, never too high)", r.status === 502 && item("i-print").inventory === 2);
}

// Per-visitor hold limit
resetWorld();
{
  const env = makeEnv({ MAX_HOLDS_PER_IP: "2" });
  const first = await call(env, { ip: "7.7.7.7", body: { slug: "cents" } });
  const second = await call(env, { ip: "7.7.7.7", body: { slug: "cents" } });
  const third = await call(env, { ip: "7.7.7.7", body: { slug: "cents" } });
  check("holds 1 and 2 from one visitor -> 200", first.status === 200 && second.status === 200);
  check("hold 3 from the same visitor -> 429 and no hold taken", third.status === 429 && item("i-cents").inventory === 3);
  const other = await call(env, { ip: "8.8.8.8", body: { slug: "cents" } });
  check("another visitor is unaffected", other.status === 200);
  check("hold count expires with the hold", env.EVENTS.store.get("holds:7.7.7.7").ttl === 31 * 60);
}

// Misconfiguration and Directus outage
resetWorld();
{
  let r = await call(makeEnv({ DIRECTUS_TOKEN: "" }), { body: { slug: "night-print" } });
  check("missing Directus token -> 500 with CORS (browser can read the error)", r.status === 500 && r.headers.get("Access-Control-Allow-Origin") === "https://upset.live");
  r = await call(makeEnv({ DIRECTUS_TOKEN: "wrong" }), { body: { slug: "night-print" } });
  check("wrong Directus token -> 500, nothing changed", r.status === 500 && item("i-print").inventory === 3);
  directusDown = "all";
  r = await call(makeEnv(), { body: { slug: "night-print" } });
  check("Directus down -> 500", r.status === 500 && r.json?.error === "server_error");
  directusDown = null;
  r = await call(makeEnv({ STRIPE_SECRET_KEY: "" }), { body: { slug: "night-print" } });
  check("missing Stripe key -> 502 and the hold is released", r.status === 502 && item("i-print").inventory === 3);
}

// Webhooks
resetWorld();
{
  const env = makeEnv();
  item("i-oneoff").inventory = 0; // a held one-off

  let payload = expiredEvent("evt_1", "i-oneoff");
  let r = await webhook(env, payload, null);
  check("webhook without signature -> 400, no change", r.status === 400 && item("i-oneoff").inventory === 0);
  r = await webhook(env, payload, signed(payload, { secret: "whsec_wrong" }));
  check("webhook with the wrong secret -> 400", r.status === 400 && item("i-oneoff").inventory === 0);
  r = await webhook(env, payload, signed(payload, { timestamp: Math.floor(Date.now() / 1000) - 3600 }));
  check("webhook signed an hour ago -> 400 (replay refused)", r.status === 400);
  r = await webhook(env, payload.replace("evt_1", "evt_9"), signed(payload));
  check("webhook with an edited body -> 400", r.status === 400 && item("i-oneoff").inventory === 0);
  const header = signed(payload);
  r = await webhook(env, payload, `${header},v0=ignored`);
  check("valid expired event -> 200 and the unit is back (0 -> 1)", r.status === 200 && item("i-oneoff").inventory === 1);
  r = await webhook(env, payload, signed(payload));
  check("same event delivered again -> 200 duplicate, no second unit", r.status === 200 && r.json?.duplicate === true && item("i-oneoff").inventory === 1);

  payload = expiredEvent("evt_2", "i-oneoff", "checkout.session.completed");
  r = await webhook(env, payload, signed(payload));
  check("paid checkout event -> 200, stock untouched", r.status === 200 && item("i-oneoff").inventory === 1);

  payload = expiredEvent("evt_3", null);
  r = await webhook(env, payload, signed(payload));
  check("expired checkout without our metadata -> 200, ignored", r.status === 200 && item("i-oneoff").inventory === 1);

  payload = expiredEvent("evt_4", "i-closed");
  r = await webhook(env, payload, signed(payload));
  check("expired checkout for an item closed since -> 200, recorded, untouched", r.status === 200 && item("i-closed").inventory === 2 && env.EVENTS.store.has("event:evt_4"));

  item("i-null").inventory = null;
  payload = expiredEvent("evt_5", "i-null");
  r = await webhook(env, payload, signed(payload));
  check("release onto an empty stock field -> 1", r.status === 200 && item("i-null").inventory === 1);

  directusDown = "patch";
  payload = expiredEvent("evt_6", "i-print");
  r = await webhook(env, payload, signed(payload));
  check("release fails while Directus is down -> 500 so Stripe retries; not recorded", r.status === 500 && !env.EVENTS.store.has("event:evt_6") && item("i-print").inventory === 3);
  directusDown = null;
  r = await webhook(env, payload, signed(payload));
  check("Stripe's retry succeeds -> unit back once (3 -> 4), recorded", r.status === 200 && item("i-print").inventory === 4 && env.EVENTS.store.has("event:evt_6"));
  check("handled events are kept for 7 days", env.EVENTS.store.get("event:evt_6").ttl === 7 * 24 * 60 * 60);

  r = await call(env, { method: "GET", path: "/stripe-webhook", origin: null });
  check("GET /stripe-webhook -> 405", r.status === 405);
}

// End to end: hold, then the checkout expires
resetWorld();
{
  const env = makeEnv();
  const r = await call(env, { body: { slug: "Fruits and Goddess ", from: "vault" } });
  check("e2e: hold the one-off (1 -> 0)", r.status === 200 && item("i-oneoff").inventory === 0);
  const payload = expiredEvent("evt_e2e", stripeCalls[0].get("metadata[vault_item_id]"));
  await webhook(env, payload, signed(payload));
  check("e2e: buyer gave up, Stripe expired it -> back on sale (0 -> 1)", item("i-oneoff").inventory === 1);
  const again = await call(env, { ip: "4.4.4.4", body: { slug: "Fruits and Goddess ", from: "vault" } });
  check("e2e: the next buyer can now check out", again.status === 200 && item("i-oneoff").inventory === 0);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
