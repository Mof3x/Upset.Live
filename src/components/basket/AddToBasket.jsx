import { useState } from "react";
import { Link } from "react-router-dom";
import { MAX_QUANTITY, useBasket } from "../../lib/basket";
import "./basket.css";

// The buying control on a Shop or Vault item page: price, how many are left
// (when few), a quantity picker, "Add to basket", and what's already in the
// basket. Only render it for items that are buyable when checkout is enabled
// (see VaultObject in pages/VaultPages.jsx).
// `section` ("shop" or "vault") is where the basket links back to.
export default function AddToBasket({ item, section }) {
  const { lines, add } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null); // { kind: "added" | "error", text }

  const inBasket = lines.find((line) => line.slug === item.slug)?.quantity || 0;
  const limit = Math.min(item.inventory, MAX_QUANTITY);
  const room = Math.max(0, limit - inBasket);
  const chosen = Math.min(quantity, Math.max(room, 1));

  function handleAdd() {
    const result = add({ slug: item.slug, title: item.title, image: item.image, section }, chosen, item.inventory);
    if (result.ok) {
      setQuantity(1);
      setMessage({ kind: "added", text: `Added to your basket.` });
    } else if (result.reason === "full") {
      setMessage({ kind: "error", text: "Your basket holds up to 10 different items. Check out first, then add more." });
    } else {
      setMessage({ kind: "error", text: "Your basket already has all that are available." });
    }
  }

  return (
    <div className="add-to-basket">
      <p className="add-to-basket__price">{item.priceLabel}</p>
      {item.inventory === 1 && <p className="add-to-basket__stock">One available</p>}
      {item.inventory > 1 && item.inventory <= 5 && <p className="add-to-basket__stock">Only {item.inventory} left</p>}

      {room > 0 ? (
        <div className="add-to-basket__row">
          {room > 1 && (
            <label className="add-to-basket__quantity">
              Quantity
              <select value={chosen} onChange={(event) => setQuantity(Number(event.target.value))}>
                {Array.from({ length: room }, (_, index) => index + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" className="basket-button" onClick={handleAdd}>
            Add to basket
            {/* Screen readers hear "Add to basket: <title>"; sighted visitors see the short label. */}
            <span className="basket-hidden">: {item.title}</span>
          </button>
        </div>
      ) : (
        <p className="add-to-basket__note">All that are available are in your basket.</p>
      )}

      {inBasket > 0 && (
        <p className="add-to-basket__note">
          In your basket: {inBasket}. <Link to="/basket">View basket →</Link>
        </p>
      )}
      <p className="add-to-basket__note">Secure payment by Stripe. You'll get a receipt by email.</p>

      {/* aria-live: screen readers announce "Added" or the problem when it appears. */}
      <div role="status" aria-live="polite">
        {message && <p className={message.kind === "error" ? "basket-error" : "add-to-basket__added"}>{message.text}</p>}
      </div>
    </div>
  );
}
