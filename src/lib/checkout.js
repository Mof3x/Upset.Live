// Starting a Stripe checkout from the browser.
//
// The browser never talks to Stripe's API or writes to Directus directly. It
// sends the basket (slugs and quantities) to the checkout Worker
// (workers/checkout). The Worker reads prices and stock from Directus, holds
// the stock and answers with the address of Stripe's hosted payment page.
//
// VITE_CHECKOUT_ENDPOINT is the Worker's address. When it isn't set, the site
// shows no "Add to basket" buttons and items stay "Request information" only.

import { contactEmail } from "./forms";

const endpoint = (import.meta.env.VITE_CHECKOUT_ENDPOINT || "").replace(/\/$/, "");

export const checkoutEnabled = Boolean(endpoint);

// Only ever follow a link to Stripe's own checkout pages, whatever comes back.
const STRIPE_CHECKOUT_ORIGIN = "https://checkout.stripe.com";

// The checkout the visitor last opened and hasn't finished (see savePending).
const PENDING_KEY = "upset-checkout-pending-v1";

// What the visitor sees for errors that don't name items. Sold-out and
// unavailable items are explained on the basket page, which knows their titles.
const messages = {
  too_many_holds: "You have several checkouts open. Finish or close one, or try again in 30 minutes.",
  payment_unavailable: "Payments aren't available right now. Please try again in a few minutes.",
  sold_out: "Something in your basket has just sold out.",
  not_available: "Something in your basket isn't available any more.",
};
const fallbackMessage = `Checkout couldn't start. Please try again, or write to ${contactEmail}.`;

// Thrown when checkout can't start. `code` is the Worker's error code;
// `available` ({ slug: units left }) and `unavailable` ([slug]) name the lines.
export class CheckoutError extends Error {
  constructor(code, details = {}) {
    super(messages[code] || fallbackMessage);
    this.code = code || "unknown";
    this.available = details.available && typeof details.available === "object" ? details.available : {};
    this.unavailable = Array.isArray(details.unavailable) ? details.unavailable : [];
  }
}

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${endpoint}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Network failure: offline, or the Worker can't be reached.
    throw new CheckoutError("network");
  }
  const result = await response.json().catch(() => null);
  return { response, result };
}

// A fingerprint of the basket, to tell whether it changed since the last checkout.
export function basketSignature(lines) {
  return lines
    .map((line) => `${line.slug}\u0000${line.quantity}`)
    .sort()
    .join("\u0001");
}

// Starts one checkout for `lines` ([{ slug, quantity }]) and sends the browser
// to Stripe. Throws a CheckoutError when it can't.
export async function startCheckout(lines) {
  if (!endpoint) throw new CheckoutError("disabled");
  const { response, result } = await post("/checkout", { items: lines.map(({ slug, quantity }) => ({ slug, quantity })) });
  if (!response.ok) throw new CheckoutError(result?.error, result || {});

  const url = typeof result?.url === "string" ? result.url : "";
  if (!url.startsWith(`${STRIPE_CHECKOUT_ORIGIN}/`)) throw new CheckoutError("bad_response");

  savePending({ session: result.session, url, expiresAt: result.expires_at, signature: basketSignature(lines) });
  // A full page change (not a React Router <Link>): Stripe's page is another site.
  window.location.assign(url);
}

// Asks the Worker to cancel an unfinished checkout, so the stock it holds comes
// back within seconds instead of after 30 minutes. Never throws: a failure only
// means the stock comes back when the checkout runs out on its own.
export async function releaseCheckout(session) {
  if (!endpoint || !session) return false;
  try {
    const { response, result } = await post("/release", { session });
    return response.ok && result?.released === true;
  } catch {
    return false;
  }
}

// --- The unfinished checkout -------------------------------------------------
// While a checkout is open, its stock is held for this visitor. If they come
// back to the basket without paying, the basket page uses this to send them
// back to the same payment page (basket unchanged) or to cancel it before
// starting a new one (basket changed), so they never compete with their own hold.

function savePending(pending) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Not saved: the old hold simply runs out after 30 minutes.
  }
}

// Returns { session, url, expiresAt, signature } or null. A checkout that has
// run out is forgotten.
export function getPendingCheckout() {
  try {
    const pending = JSON.parse(window.localStorage.getItem(PENDING_KEY) || "null");
    if (!pending || typeof pending.url !== "string" || !pending.url.startsWith(`${STRIPE_CHECKOUT_ORIGIN}/`)) return null;
    if (!(Number(pending.expiresAt) * 1000 > Date.now())) {
      clearPendingCheckout();
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // Nothing stored.
  }
}
