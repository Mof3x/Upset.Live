import { useState } from "react";
import { startCheckout } from "../../lib/checkout";
import "./BuyButton.css";

// The "Buy" control on a Shop or Vault item page: the price, a button that
// opens Stripe's checkout, and a message when checkout can't start.
// Only render it for items that are buyable and when checkout is enabled
// (see VaultObject in pages/VaultPages.jsx).
export default function BuyButton({ slug, title, priceLabel, from }) {
  // idle -> starting (waiting for the Worker) -> the browser leaves for Stripe,
  // or -> failed (message shown, the button can be pressed again).
  const [state, setState] = useState({ status: "idle", message: "" });

  async function handleClick() {
    if (state.status === "starting") return;
    setState({ status: "starting", message: "" });
    try {
      await startCheckout(slug, from);
      // On success the page is already navigating to Stripe; keep "Opening checkout…".
    } catch (error) {
      setState({ status: "failed", message: error.message });
    }
  }

  return (
    <div className="buy-button">
      <p className="buy-button__price">{priceLabel}</p>
      <button type="button" onClick={handleClick} disabled={state.status === "starting"} aria-describedby="buy-button-note">
        {state.status === "starting" ? "Opening checkout…" : "Buy"}
        {/* Screen readers hear "Buy <title>"; sighted visitors see "Buy". */}
        <span className="buy-button__hidden"> {title}</span>
      </button>
      <p className="buy-button__note" id="buy-button-note">
        Secure payment by Stripe. You'll get a receipt by email.
      </p>
      {/* aria-live: screen readers announce the error when it appears. */}
      <div role="status" aria-live="polite">
        {state.status === "failed" && <p className="buy-button__error">{state.message}</p>}
      </div>
    </div>
  );
}
