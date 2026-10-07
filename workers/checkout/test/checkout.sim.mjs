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
let sessions; // Stripe checkout sessions created so far: id -> { status }
let expireCalls; // ids the Worker asked Stripe to expire

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
  sessions = new Map();
  expireCalls = [];
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
  const expire = url.pathname.match(/^\/v1\/checkout\/sessions\/([^/]+)\/expire$/);
  if (expire) {
    expireCalls.push(expire[1]);
    if (stripeMode === "down") return jsonResponse({ error: { message: "stripe down" } }, 500);
    const session = sessions.get(expire[1]);
    if (!session || session.status !== "open") return jsonResponse({ error: { message: "This Checkout Session is not open." } }, 400);
    session.status = "expired";
    return jsonResponse({ id: expire[1], status: "expired" });
  }
  const params = new URLSearchParams(String(init.body));
  stripeCalls.push(params);
  if (onStripe) onStripe();
  if (stripeMode === "fail") return jsonResponse({ error: { message: "card_declined style failure" } }, 400);
  const id = `cs_test_${stripeCalls.length}abc`;
  sessions.set(id, { status: "open" });
  return jsonResponse({ id, url: `https://checkout.stripe.com/c/pay/${id}`, expires_at: Number(params.get("expires_at")) });
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

// An expired-checkout event carrying the holds string the Worker stored ("id:qty,id:qty").
function expiredEvent(id, holds, type = "checkout.session.expired") {
  return JSON.stringify({ id, type, data: { object: { id: "cs_test_x", metadata: holds ? { holds } : {} } } });
}

async function webhook(env, payload, signature) {
  return call(env, { path: "/stripe-webhook", origin: null, ip: null, rawBody: payload, headers: signature ? { "Stripe-Signature": signature } : {} });
}

// A basket body: basket(["night-print", 2], ["cents", 1]) -> { items: [{ slug, quantity }, ...] }
const basket = (...lines) => ({ items: lines.map(([slug, quantity = 1]) => ({ slug, quantity })) });

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
  r = await call(env, { origin: "https://evil.example", body: basket(["night-print"]) });
  check("POST from another site -> 403 and no hold", r.status === 403 && item("i-print").inventory === 3 && stripeCalls.length === 0);
  r = await call(env, { origin: null, body: basket(["night-print"]) });
  check("POST with no Origin -> 403", r.status === 403);
  r = await call(env, { method: "GET" });
  check("GET /checkout -> 405", r.status === 405);
  r = await call(env, { path: "/other" });
  check("unknown path -> 404", r.status === 404);
}

// Basket validation
resetWorld();
{
  const env = makeEnv();
  const bad = [
    ["bad JSON", { rawBody: "{not json" }],
    ["no items", { body: {} }],
    ["empty basket", { body: { items: [] } }],
    ["items not a list", { body: { items: "night-print" } }],
    ["non-string slug", { body: { items: [{ slug: 42, quantity: 1 }] } }],
    ["over-long slug", { body: basket(["x".repeat(201)]) }],
    ["quantity 0", { body: basket(["night-print", 0]) }],
    ["negative quantity", { body: basket(["night-print", -2]) }],
    ["fractional quantity", { body: basket(["night-print", 1.5]) }],
    ["quantity as text", { body: { items: [{ slug: "night-print", quantity: "2" }] } }],
    ["quantity 11 (over the per-line limit of 10)", { body: basket(["cents", 11]) }],
    ["11 different lines (over the limit of 10)", { body: basket(...Array.from({ length: 11 }, (_, n) => [`slug-${n}`])) }],
    ["the same slug twice adding up to 11", { body: basket(["cents", 6], ["cents", 5]) }],
  ];
  for (const [label, request] of bad) {
    const r = await call(env, request);
    check(`${label} -> 400`, r.status === 400 && r.json?.error === "bad_request", `got ${r.status}`);
  }
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
    const r = await call(env, { body: basket([slug]) });
    check(`${label} -> ${expected}`, r.status === expected, `got ${r.status}`);
  }
  const r = await call(env, { body: basket(["night-print"], ["no-price"], ["closed"]) });
  check("basket with unavailable lines -> 404 naming exactly those slugs, nothing held", r.status === 404 && r.json?.unavailable?.join() === "no-price,closed" && item("i-print").inventory === 3);
  check("refusals never call Stripe", stripeCalls.length === 0);
  check("refusals never change stock", item("i-zero").inventory === 0 && item("i-null").inventory === null && item("i-archived").inventory === 2 && item("i-closed").inventory === 2 && item("i-noprice").inventory === 4);
}

// Happy path: a one-line basket (a shop print)
resetWorld();
{
  const env = makeEnv();
  const before = Math.floor(Date.now() / 1000);
  const r = await call(env, { body: basket(["night-print", 2]) });
  check("one-line basket -> 200 with a Stripe URL", r.status === 200 && r.json?.url?.startsWith("https://checkout.stripe.com/"));
  check("answer carries CORS for upset.live", r.headers.get("Access-Control-Allow-Origin") === "https://upset.live");
  check("two units held (3 -> 1)", item("i-print").inventory === 1);
  const p = stripeCalls[0];
  check("Stripe: payment mode, cards only", p.get("mode") === "payment" && p.getAll("payment_method_types[]").join() === "card");
  check("Stripe: £45.00 -> 4500 pence in gbp, quantity 2", p.get("line_items[0][price_data][unit_amount]") === "4500" && p.get("line_items[0][price_data][currency]") === "gbp" && p.get("line_items[0][quantity]") === "2");
  check("Stripe: the Directus title, and the item id on the line", p.get("line_items[0][price_data][product_data][name]") === "Night Print" && p.get("line_items[0][price_data][product_data][metadata][vault_item_id]") === "i-print");
  check("Stripe: holds stored on the session and the payment", p.get("metadata[holds]") === "i-print:2" && p.get("payment_intent_data[metadata][holds]") === "i-print:2");
  const expires = Number(p.get("expires_at"));
  check("Stripe: expires 31 minutes out (>= Stripe's 30-minute minimum)", expires - before >= 31 * 60 - 1 && expires - before <= 31 * 60 + 2, `delta ${expires - before}`);
  check("Stripe: success URL returns to upset.live with the session id placeholder", p.get("success_url") === "https://upset.live/order/complete?session_id={CHECKOUT_SESSION_ID}");
  check("Stripe: cancel URL returns to the basket", p.get("cancel_url") === "https://upset.live/basket");
  check("Stripe: asks for a GB delivery address", p.get("shipping_address_collection[allowed_countries][0]") === "GB" && !p.has("shipping_address_collection[allowed_countries][1]"));
  check("Stripe: no shipping rate unless configured", !p.has("shipping_options[0][shipping_rate]"));
}

// A mixed basket: print x2, the one-off with an awkward slug, a digital release x3
resetWorld();
{
  const env = makeEnv({ SHIPPING_RATE_ID: "shr_test_1", SHIPPING_COUNTRIES: "GB, ie" });
  const r = await call(env, { origin: "http://localhost:5173", body: basket(["night-print", 2], ["Fruits and Goddess ", 1], ["digital-ep", 3]) });
  check("mixed basket -> 200", r.status === 200);
  check("every line held (print 3 -> 1, one-off 1 -> 0, EP 100 -> 97)", item("i-print").inventory === 1 && item("i-oneoff").inventory === 0 && item("i-digital").inventory === 97);
  const p = stripeCalls[0];
  check("three Stripe lines in basket order with Directus prices", p.get("line_items[0][price_data][unit_amount]") === "4500" && p.get("line_items[1][price_data][unit_amount]") === "15000" && p.get("line_items[2][price_data][unit_amount]") === "700" && p.get("line_items[2][quantity]") === "3");
  check("holds string lists all three lines", p.get("metadata[holds]") === "i-print:2,i-oneoff:1,i-digital:3");
  check("a physical item in the basket -> delivery address GB + IE and the shipping rate", p.get("shipping_address_collection[allowed_countries][1]") === "IE" && p.get("shipping_options[0][shipping_rate]") === "shr_test_1");
  check("success and cancel return to localhost in development", p.get("success_url").startsWith("http://localhost:5173/order/complete") && p.get("cancel_url") === "http://localhost:5173/basket");
  const again = await call(env, { body: basket(["Fruits and Goddess "]) });
  check("second buyer of the one-off -> 409 sold_out, 0 available", again.status === 409 && again.json?.error === "sold_out" && again.json?.available?.["Fruits and Goddess "] === 0 && stripeCalls.length === 1);
  const trimmed = await call(env, { body: basket(["Fruits and Goddess"]) });
  check("slug is matched exactly (trimmed slug is not the item)", trimmed.status === 404);
}

// Pence rounding, digital-only basket, duplicate lines merged
resetWorld();
{
  const env = makeEnv();
  await call(env, { body: basket(["cents"]) });
  check("£12.34 -> 1234 (no float drift)", stripeCalls[0].get("line_items[0][price_data][unit_amount]") === "1234");
  await call(env, { body: basket(["digital-ep", 2]) });
  check("digital-only basket: no delivery address, no shipping rate", ![...stripeCalls[1].keys()].some((key) => key.startsWith("shipping")));
  const r = await call(env, { body: basket(["cents", 1], ["cents", 2]) });
  check("the same slug twice is merged into one line of 3", r.status === 200 && stripeCalls[2].get("line_items[0][quantity]") === "3" && !stripeCalls[2].has("line_items[1][quantity]") && item("i-cents").inventory === 1);
}

// Not enough stock for a line: report what's left, hold nothing
resetWorld();
{
  const env = makeEnv();
  const r = await call(env, { body: basket(["night-print", 2], ["cents", 6 - 1], ["Fruits and Goddess ", 2]) });
  check("one line asks for more than exists -> 409 with what's left of that line", r.status === 409 && r.json?.available?.["Fruits and Goddess "] === 1 && Object.keys(r.json.available).length === 1);
  check("nothing held, Stripe not called", item("i-print").inventory === 3 && item("i-cents").inventory === 5 && item("i-oneoff").inventory === 1 && stripeCalls.length === 0);
}

// Race inside a basket: the last line loses its stock between the check and the hold
resetWorld();
{
  const env = makeEnv();
  beforePatch = (target) => {
    if (target.id === "i-oneoff" && target.inventory === 1) target.inventory = 0; // another buyer took it
  };
  const r = await call(env, { body: basket(["night-print", 2], ["cents", 1], ["Fruits and Goddess ", 1]) });
  check("lost race on the last line -> 409 for that line, Stripe never called", r.status === 409 && r.json?.available?.["Fruits and Goddess "] === 0 && stripeCalls.length === 0);
  check("the lines already held are given back (all or nothing)", item("i-print").inventory === 3 && item("i-cents").inventory === 5 && item("i-oneoff").inventory === 0);
}

// Race: stock keeps changing under us -> give up after 3 tries, change nothing
resetWorld();
{
  const env = makeEnv();
  beforePatch = (target) => {
    if (target.id === "i-print") target.inventory += 10;
  };
  const r = await call(env, { body: basket(["night-print"]) });
  check("never-settling stock -> 409 after the retries", r.status === 409 && stripeCalls.length === 0);
  check("exactly 3 update attempts", directusLog.filter((line) => line.startsWith("PATCH")).length === 3);
  check("our own -1 was never applied", item("i-print").inventory === 33);
}

// Real interleaving: two buyers check out the last unit at the same moment
resetWorld();
{
  const env = makeEnv();
  const [a, b] = await Promise.all([
    call(env, { ip: "2.2.2.2", body: basket(["Fruits and Goddess "], ["cents"]) }),
    call(env, { ip: "3.3.3.3", body: basket(["cents"], ["Fruits and Goddess "]) }),
  ]);
  const statuses = [a.status, b.status].sort().join(",");
  check("simultaneous baskets with the same one-off: exactly one 200 and one 409", statuses === "200,409", statuses);
  check("one Stripe session; one-off 0; the loser's cents given back (5 -> 4)", stripeCalls.length === 1 && item("i-oneoff").inventory === 0 && item("i-cents").inventory === 4);
}

// Five buyers, three prints, two each
resetWorld();
{
  const env = makeEnv();
  items.find((entry) => entry.id === "i-print").inventory = 6;
  const results = await Promise.all([1, 2, 3, 4, 5].map((n) => call(env, { ip: `9.9.9.${n}`, body: basket(["night-print", 2]) })));
  const ok = results.filter((result) => result.status === 200).length;
  check("5 simultaneous buyers of 2 each, 6 in stock: 3 succeed, stock 0, never negative", ok === 3 && item("i-print").inventory === 0 && stripeCalls.length === 3, `ok=${ok} inv=${item("i-print").inventory}`);
}

// Stripe failure gives every line back
resetWorld();
{
  const env = makeEnv();
  stripeMode = "fail";
  const r = await call(env, { body: basket(["night-print", 2], ["cents", 3]) });
  check("Stripe failure -> 502 payment_unavailable", r.status === 502 && r.json?.error === "payment_unavailable");
  check("Stripe failure -> every hold released (3 and 5 again)", item("i-print").inventory === 3 && item("i-cents").inventory === 5);
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
  const r = await call(env, { body: basket(["night-print"]) });
  check("failed release -> still 502, stock 2 (too low, never too high)", r.status === 502 && item("i-print").inventory === 2);
}

// Directus fails in the middle of holding a basket -> the earlier lines are given back
resetWorld();
{
  const env = makeEnv();
  let patches = 0;
  beforePatch = () => {
    patches += 1;
    if (patches === 2) throw new Error("network down"); // the second line's update fails
  };
  const r = await call(env, { body: basket(["night-print", 1], ["cents", 1]) });
  check("Directus error on the second line -> 500", r.status === 500 && r.json?.error === "server_error");
  check("no Stripe call; the first line is given back (print 3, cents 5)", stripeCalls.length === 0 && item("i-print").inventory === 3 && item("i-cents").inventory === 5);
}

// Per-visitor hold limit
resetWorld();
{
  const env = makeEnv({ MAX_HOLDS_PER_IP: "2" });
  const first = await call(env, { ip: "7.7.7.7", body: basket(["cents"]) });
  const second = await call(env, { ip: "7.7.7.7", body: basket(["cents"]) });
  const third = await call(env, { ip: "7.7.7.7", body: basket(["cents"]) });
  check("checkouts 1 and 2 from one visitor -> 200", first.status === 200 && second.status === 200);
  check("checkout 3 from the same visitor -> 429 and no hold taken", third.status === 429 && item("i-cents").inventory === 3);
  const other = await call(env, { ip: "8.8.8.8", body: basket(["cents"]) });
  check("another visitor is unaffected", other.status === 200);
  check("the count expires with the holds", env.EVENTS.store.get("holds:7.7.7.7").ttl === 31 * 60);
}

// Misconfiguration and Directus outage
resetWorld();
{
  let r = await call(makeEnv({ DIRECTUS_TOKEN: "" }), { body: basket(["night-print"]) });
  check("missing Directus token -> 500 with CORS (browser can read the error)", r.status === 500 && r.headers.get("Access-Control-Allow-Origin") === "https://upset.live");
  r = await call(makeEnv({ DIRECTUS_TOKEN: "wrong" }), { body: basket(["night-print"]) });
  check("wrong Directus token -> 500, nothing changed", r.status === 500 && item("i-print").inventory === 3);
  directusDown = "all";
  r = await call(makeEnv(), { body: basket(["night-print"]) });
  check("Directus down -> 500", r.status === 500 && r.json?.error === "server_error");
  directusDown = null;
  r = await call(makeEnv({ STRIPE_SECRET_KEY: "" }), { body: basket(["night-print"], ["cents", 2]) });
  check("missing Stripe key -> 502 and every hold is released", r.status === 502 && item("i-print").inventory === 3 && item("i-cents").inventory === 5);
}

// Webhooks
resetWorld();
{
  const env = makeEnv();
  item("i-oneoff").inventory = 0; // a held one-off
  item("i-print").inventory = 1; // two prints held

  let payload = expiredEvent("evt_1", "i-oneoff:1,i-print:2");
  let r = await webhook(env, payload, null);
  check("webhook without signature -> 400, no change", r.status === 400 && item("i-oneoff").inventory === 0);
  r = await webhook(env, payload, signed(payload, { secret: "whsec_wrong" }));
  check("webhook with the wrong secret -> 400", r.status === 400 && item("i-oneoff").inventory === 0);
  r = await webhook(env, payload, signed(payload, { timestamp: Math.floor(Date.now() / 1000) - 3600 }));
  check("webhook signed an hour ago -> 400 (replay refused)", r.status === 400);
  r = await webhook(env, payload.replace("i-print:2", "i-print:9"), signed(payload));
  check("webhook with an edited body -> 400", r.status === 400 && item("i-print").inventory === 1);
  r = await webhook(env, payload, `${signed(payload)},v0=ignored`);
  check("valid expired event -> 200 and every line is back (one-off 0 -> 1, prints 1 -> 3)", r.status === 200 && item("i-oneoff").inventory === 1 && item("i-print").inventory === 3);
  r = await webhook(env, payload, signed(payload));
  check("same event delivered again -> 200 duplicate, nothing added twice", r.status === 200 && r.json?.duplicate === true && item("i-oneoff").inventory === 1 && item("i-print").inventory === 3);

  payload = expiredEvent("evt_2", "i-oneoff:1", "checkout.session.completed");
  r = await webhook(env, payload, signed(payload));
  check("paid checkout event -> 200, stock untouched", r.status === 200 && item("i-oneoff").inventory === 1);

  payload = expiredEvent("evt_3", null);
  r = await webhook(env, payload, signed(payload));
  check("expired checkout without our holds -> 200, ignored", r.status === 200 && item("i-oneoff").inventory === 1);

  payload = expiredEvent("evt_3b", "garbage,:5,i-print:x,i-print:-1");
  r = await webhook(env, payload, signed(payload));
  check("malformed holds are ignored, never applied", r.status === 200 && item("i-print").inventory === 3);

  payload = expiredEvent("evt_4", "i-closed:1,i-cents:1");
  r = await webhook(env, payload, signed(payload));
  check("a line whose item closed since is skipped; the others come back", r.status === 200 && item("i-closed").inventory === 2 && item("i-cents").inventory === 6 && env.EVENTS.store.has("event:evt_4"));

  item("i-null").inventory = null;
  payload = expiredEvent("evt_5", "i-null:2");
  r = await webhook(env, payload, signed(payload));
  check("release onto an empty stock field -> 2", r.status === 200 && item("i-null").inventory === 2);

  // Partial failure: the first line comes back, the second fails; Stripe's retry must not add the first again.
  item("i-print").inventory = 1;
  item("i-cents").inventory = 4;
  let patches = 0;
  beforePatch = () => {
    patches += 1;
    if (patches === 2) throw new Error("network down");
  };
  payload = expiredEvent("evt_6", "i-print:2,i-cents:1");
  r = await webhook(env, payload, signed(payload));
  check("second line fails -> 500 so Stripe retries; first line back once (1 -> 3); event not recorded", r.status === 500 && item("i-print").inventory === 3 && item("i-cents").inventory === 4 && !env.EVENTS.store.has("event:evt_6"));
  beforePatch = null;
  r = await webhook(env, payload, signed(payload));
  check("Stripe's retry: only the missing line comes back (cents 4 -> 5), prints stay 3", r.status === 200 && item("i-print").inventory === 3 && item("i-cents").inventory === 5 && env.EVENTS.store.has("event:evt_6"));
  check("handled events and lines are kept for 7 days", env.EVENTS.store.get("event:evt_6").ttl === 7 * 24 * 60 * 60 && env.EVENTS.store.get("released:evt_6:i-print").ttl === 7 * 24 * 60 * 60);

  r = await call(env, { method: "GET", path: "/stripe-webhook", origin: null });
  check("GET /stripe-webhook -> 405", r.status === 405);
}

// POST /release: cancel an unfinished checkout
resetWorld();
{
  const env = makeEnv();
  const started = await call(env, { body: basket(["Fruits and Goddess "]) });
  check("checkout answers the session id and when it expires", started.status === 200 && started.json?.session === "cs_test_1abc" && Number.isInteger(started.json?.expires_at));
  let r = await call(env, { path: "/release", method: "OPTIONS" });
  check("OPTIONS /release from upset.live -> 204", r.status === 204);
  r = await call(env, { path: "/release", origin: "https://evil.example", body: { session: started.json.session } });
  check("/release from another site -> 403, Stripe not asked", r.status === 403 && expireCalls.length === 0);
  for (const bad of [{}, { session: 42 }, { session: "pi_123" }, { session: "cs_test_../../v1/refunds" }, { session: `cs_test_${"a".repeat(251)}` }]) {
    r = await call(env, { path: "/release", body: bad });
    check(`/release with ${JSON.stringify(bad).slice(0, 40)} -> 400`, r.status === 400);
  }
  check("bad ids never reach Stripe", expireCalls.length === 0);
  r = await call(env, { path: "/release", body: { session: started.json.session } });
  check("/release of an open checkout -> released: true, Stripe expired it", r.status === 200 && r.json?.released === true && sessions.get("cs_test_1abc").status === "expired");
  check("/release does not touch stock itself (the webhook does)", item("i-oneoff").inventory === 0);
  r = await call(env, { path: "/release", body: { session: started.json.session } });
  check("/release again (already expired) -> released: false", r.status === 200 && r.json?.released === false);
  sessions.set("cs_test_paid1", { status: "complete" });
  r = await call(env, { path: "/release", body: { session: "cs_test_paid1" } });
  check("/release of a paid checkout -> released: false, the sale stands", r.status === 200 && r.json?.released === false && sessions.get("cs_test_paid1").status === "complete");
  stripeMode = "down";
  r = await call(env, { path: "/release", body: { session: "cs_test_other" } });
  check("/release while Stripe errors -> 500", r.status === 500);
  stripeMode = "ok";
  // Stripe now sends the expired webhook for the released checkout; it puts the one-off back exactly once.
  const payload = expiredEvent("evt_rel", stripeCalls[0].get("metadata[holds]"));
  await webhook(env, payload, signed(payload));
  await webhook(env, payload, signed(payload));
  check("the webhook after a release puts the stock back exactly once", item("i-oneoff").inventory === 1);
}

// End to end: hold a basket, then the checkout expires
resetWorld();
{
  const env = makeEnv();
  const r = await call(env, { body: basket(["Fruits and Goddess "], ["night-print", 3]) });
  check("e2e: hold the one-off and all three prints", r.status === 200 && item("i-oneoff").inventory === 0 && item("i-print").inventory === 0);
  const payload = expiredEvent("evt_e2e", stripeCalls[0].get("metadata[holds]"));
  await webhook(env, payload, signed(payload));
  check("e2e: buyer gave up, Stripe expired it -> everything back on sale", item("i-oneoff").inventory === 1 && item("i-print").inventory === 3);
  const again = await call(env, { ip: "4.4.4.4", body: basket(["Fruits and Goddess "]) });
  check("e2e: the next buyer can now check out", again.status === 200 && item("i-oneoff").inventory === 0);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
