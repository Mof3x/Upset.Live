import { useState } from "react";
import { Link } from "react-router-dom";
import { useBasket } from "../../lib/basket";
import { checkoutEnabled } from "../../lib/checkout";
import "./Navbar.css";
import "../basket/basket.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useBasket();
  // The basket link appears once something is in the basket (and only when online payment is on).
  const basketLabel = checkoutEnabled && count > 0 ? `Basket (${count})` : "";

  return (
    <nav className="navbar">
      <div className="nav-bar-top">
        {/* On phones the basket stays visible next to Menu, without opening the menu. */}
        {basketLabel && (
          <Link to="/basket" className="nav-basket nav-basket--mobile">
            {basketLabel}
          </Link>
        )}
        <button
          className="nav-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="site-nav"
        >
          Menu
        </button>
      </div>

      {/* Close the mobile menu after any link inside it is followed. */}
      <div
        id="site-nav"
        className={`nav-panel ${open ? "open" : ""}`}
        onClick={(event) => {
          if (event.target.closest("a")) setOpen(false);
        }}
      >
        <ul className="nav-section left">
          <li><Link to="/works">Works</Link></li>
          <li><Link to="/texts">Texts</Link></li>
          <li><Link to="/journal">Journal</Link></li>
        </ul>

      <Link to="/" className="logo">
        UpsetXociety
      </Link>

        <ul className="nav-section right">
          <li><Link to="/about">About</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/vault">Vault</Link></li>
          {basketLabel && (
            <li className="nav-basket-item">
              <Link to="/basket" className="nav-basket">{basketLabel}</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}