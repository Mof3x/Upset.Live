import { useState } from "react";
import { Link } from "react-router-dom";
import { PageIntro } from "../components/layout/PageIntro";
import RelatedRail from "../components/rails/RelatedRail";
import MediaFrame from "../components/ui/MediaFrame";
import { MAX_QUANTITY, useBasket } from "../lib/basket";
import {
  basketSignature,
  checkoutEnabled,
  clearPendingCheckout,
  getPendingCheckout,
  releaseCheckout,
  startCheckout,
} from "../lib/checkout";
import { formatPrice, normalizeVaultItem } from "../lib/normalise";
import { recordPath } from "../lib/paths";
import { getOpenVaultItems } from "../lib/queries";
import { gateStatus, usePageTitle } from "../lib/resourceState";
import useDirectusResource from "../lib/useDirectusResource";
import "../components/basket/basket.css";
import "./CorePages.css";

const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// What a line says under its title, by state (see checkLine).
const lineNotes = {
  checking: () => "Checking price and stock…",
  unavailable: () => "No longer available. It won't be included.",
  soldout: () => "Sold out. It won't be included.",
  reduced: (line) => `Only ${line.max} available, so ${line.max} will be ordered.`,
};

// One basket line checked against the live item from Directus. The basket only
// stores what was added; the price, stock and title always come from here.
//   checking    -> live data not loaded yet
//   unavailable -> the item is gone, closed, archived or no longer priced
//   soldout     -> priced, but no stock (or all of it is held at a checkout)
//   reduced     -> fewer left than the basket asks for; the rest is ordered
//   ok          -> ready to order
function checkLine(line, live, gate) {
  if (gate !== "success") return { ...line, state: "checking", max: line.quantity, unitPrice: null };
  if (!live || (!live.buyable && !live.soldOut)) return { ...line, state: "unavailable", max: 0, unitPrice: null };
  if (live.soldOut) return { ...line, state: "soldout", max: 0, unitPrice: live.price };
  const max = Math.min(live.inventory, MAX_QUANTITY);
  return {
    ...line,
    state: line.quantity > max ? "reduced" : "ok",
    quantity: Math.min(line.quantity, max),
    max,
    unitPrice: live.price,
    title: live.title || line.title,
    image: live.image || line.image,
  };
}

function BasketLine({ line, onQuantity, onRemove }) {
  const path = recordPath(`/${line.section}`, line.slug);
  const orderable = line.state === "ok" || line.state === "reduced";
  const note = lineNotes[line.state]?.(line);

  return (
    <li className="basket-line">
      {/* The image repeats the title link, so it's skipped by keyboard and screen readers. */}
      <Link to={path} className="basket-line__image" tabIndex={-1} aria-hidden="true">
        {line.image ? (
          <MediaFrame ratio="4 / 5">
            <img src={line.image} alt="" loading="lazy" />
          </MediaFrame>
        ) : (
          <span className="basket-line__placeholder" />
        )}
      </Link>

      <div className="basket-line__body">
        <h2 className="basket-line__title">
          <Link to={path}>{line.title || line.slug}</Link>
        </h2>
        {line.unitPrice !== null && <p className="basket-line__price">{formatPrice(line.unitPrice)} each</p>}
        {note && <p className={line.state === "checking" || line.state === "reduced" ? "basket-line__note" : "basket-error"}>{note}</p>}

        <div className="basket-line__controls">
          {orderable && line.max > 1 && (
            <label className="basket-line__quantity">
              Quantity
              <select value={line.quantity} onChange={(event) => onQuantity(line.slug, Number(event.target.value))}>
                {Array.from({ length: line.max }, (_, index) => index + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
          {orderable && line.max === 1 && <span className="basket-line__note">Quantity 1</span>}
          <button type="button" className="basket-line__remove" onClick={() => onRemove(line.slug)}>
            Remove<span className="basket-hidden"> {line.title}</span>
          </button>
        </div>
      </div>

      <p className="basket-line__total">{orderable ? formatPrice(line.unitPrice * line.quantity) : ""}</p>
    </li>
  );
}

export default function BasketPage() {
  usePageTitle("Basket");
  const { lines, setQuantity, remove } = useBasket();
  // Bumping `version` fetches prices and stock again (after a checkout error).
  const [version, setVersion] = useState(0);
  const items = useDirectusResource(getOpenVaultItems, [], normalizeVaultItem, `basket:${version}`);
  const gate = gateStatus(items);
  const [state, setState] = useState({ status: "idle", message: "" });

  if (!lines.length) {
    return (
      <main className="core-page page-content">
        <PageIntro eyebrow="Shop" title="Basket" description="Your basket is empty." />
        <RelatedRail
          title="Find something"
          groups={[
            {
              label: "Collections",
              items: [
                { to: "/shop", label: "Browse the Shop" },
                { to: "/vault", label: "Browse the Vault" },
              ],
            },
          ]}
        />
      </main>
    );
  }

  const checked = lines.map((line) => checkLine(line, items.data.find((item) => item.slug === line.slug), gate));
  const order = checked.filter((line) => line.state === "ok" || line.state === "reduced");
  const left = checked.length - order.length;
  const subtotal = order.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
  const orderLines = order.map(({ slug, quantity }) => ({ slug, quantity }));
  // A checkout the visitor opened earlier and hasn't paid (see lib/checkout.js).
  const pending = getPendingCheckout();
  const sameAsPending = Boolean(pending) && pending.signature === basketSignature(orderLines);
  const canCheckout = checkoutEnabled && gate === "success" && order.length > 0 && state.status !== "starting";

  function titleOf(slug) {
    return checked.find((line) => line.slug === slug)?.title || slug;
  }

  function showError(error) {
    if (error.code === "sold_out") {
      const names = Object.keys(error.available).map(titleOf);
      // Keep what's left of each short line; lines with nothing left show "Sold out" after the refresh.
      Object.entries(error.available).forEach(([slug, available]) => {
        if (available > 0) setQuantity(slug, available);
      });
      setVersion((value) => value + 1);
      setState({
        status: "failed",
        message: `${names.join(", ")} just sold out or ran low while you were shopping. Your basket now shows what's left; check it and press Checkout again.`,
      });
    } else if (error.code === "not_available") {
      setVersion((value) => value + 1);
      setState({ status: "failed", message: `${error.unavailable.map(titleOf).join(", ")} can't be bought any more. It won't be included.` });
    } else {
      setState({ status: "failed", message: error.message });
    }
  }

  async function handleCheckout() {
    if (!canCheckout) return;
    // Basket unchanged since the visitor's unfinished checkout: go back to it.
    // Its stock is still held for them, so nothing new is held.
    if (sameAsPending) {
      window.location.assign(pending.url);
      return;
    }
    setState({ status: "starting", message: "" });
    try {
      // Basket changed: cancel the old checkout first, so the visitor doesn't
      // compete with their own hold (it matters most for one-off pieces).
      let released = false;
      if (pending) {
        released = await releaseCheckout(pending.session);
        clearPendingCheckout();
      }
      try {
        await startCheckout(orderLines);
      } catch (error) {
        // A cancelled checkout's stock comes back a few seconds later (Stripe
        // tells the Worker). If that's why an item looked sold out, try once more.
        if (!(released && error.code === "sold_out")) throw error;
        await wait(5000);
        await startCheckout(orderLines);
      }
      // The browser is now going to Stripe; "Opening checkout…" stays until it does.
    } catch (error) {
      showError(error);
    }
  }

  return (
    <main className="core-page page-content">
      <PageIntro eyebrow="Shop" title="Basket" description="Prices and stock are checked again when you check out." />

      {!checkoutEnabled && (
        <p className="core-notice">Online payment isn't switched on yet. Use "Request information" on an item's page instead.</p>
      )}
      {gate === "closed" && <p className="core-notice">The shop isn't open yet, so prices can't be checked.</p>}
      {gate === "error" && (
        <p className="core-notice">
          Prices and stock couldn't be checked.{" "}
          <button type="button" className="basket-line__remove" onClick={() => setVersion((value) => value + 1)}>
            Try again
          </button>
        </p>
      )}

      <ul className="basket-lines" aria-label="Items in your basket">
        {checked.map((line) => (
          <BasketLine key={line.slug} line={line} onQuantity={setQuantity} onRemove={remove} />
        ))}
      </ul>

      <section className="basket-summary" aria-label="Order summary">
        <p className="basket-summary__total">
          <span>Subtotal</span>
          <strong>{gate === "success" ? formatPrice(subtotal) : "…"}</strong>
        </p>
        {left > 0 && order.length > 0 && <p className="basket-summary__note">Items marked above aren't included.</p>}
        <p className="basket-summary__note">
          Any delivery cost is shown on the payment page before you pay. Payment is handled securely by Stripe.
        </p>
        {pending && (
          <p className="core-notice">
            Your items are held for you until {timeFormat.format(new Date(pending.expiresAt * 1000))}.{" "}
            {sameAsPending
              ? "Checkout takes you back to your payment page."
              : "Checkout replaces your earlier checkout with this basket."}
          </p>
        )}
        <button type="button" className="basket-button" onClick={handleCheckout} disabled={!canCheckout}>
          {state.status === "starting" ? "Opening checkout…" : "Checkout"}
        </button>
        <div role="status" aria-live="polite">
          {state.status === "failed" && <p className="basket-error">{state.message}</p>}
        </div>
      </section>
    </main>
  );
}
