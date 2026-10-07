// Starting a Stripe checkout from the browser.
//
// The browser never talks to Stripe or writes to Directus directly. It asks the
// checkout Worker (workers/checkout) to start a checkout for one item, by slug.
// The Worker reads the price and stock from Directus, holds one unit and
// answers with the address of Stripe's hosted payment page.
//
// VITE_CHECKOUT_ENDPOINT is the Worker's address. When it isn't set, the site
// shows no Buy buttons at all and items stay "Request information" only.

const endpoint = (import.meta.env.VITE_CHECKOUT_ENDPOINT || "").replace(/\/$/, "");

export const checkoutEnabled = Boolean(endpoint);

// Only ever follow a link to Stripe's own checkout pages, whatever comes back.
const STRIPE_CHECKOUT_ORIGIN = "https://checkout.stripe.com";

// What the visitor sees for each error the Worker can return.
const messages = {
  sold_out: "This has just sold out, or someone is paying for the last one. If they don't finish, it comes back within about 30 minutes.",
  not_available: "This item isn't available to buy any more.",
  too_many_holds: "You have several checkouts open. Finish or close one, or try again in 30 minutes.",
  payment_unavailable: "Payments aren't available right now. Please try again in a few minutes.",
};
const fallbackMessage = "Checkout couldn't start. Please try again, or ask us using the form below.";

// Asks the Worker for a checkout and sends the browser to Stripe.
// `from` is "shop" or "vault": it decides where Stripe's "back" link returns to.
// Throws an Error with a visitor-friendly message when checkout can't start.
export async function startCheckout(slug, from) {
  if (!endpoint) throw new Error(fallbackMessage);

  let response;
  try {
    response = await fetch(`${endpoint}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ slug, from }),
    });
  } catch {
    // Network failure: offline, or the Worker can't be reached.
    throw new Error(fallbackMessage);
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(messages[result?.error] || fallbackMessage);

  const url = typeof result?.url === "string" ? result.url : "";
  if (!url.startsWith(`${STRIPE_CHECKOUT_ORIGIN}/`)) throw new Error(fallbackMessage);

  // A full page change (not a React Router <Link>): Stripe's page is another site.
  window.location.assign(url);
}
