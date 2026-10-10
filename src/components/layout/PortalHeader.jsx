import { Link, useLocation } from "react-router-dom";
import { useBasket } from "../../lib/basket";
import { checkoutEnabled } from "../../lib/checkout";
import { getPublishedJournalEntries, getPublishedTexts, getPublishedWorks } from "../../lib/queries";
import { normalizeJournalEntry, normalizeText, normalizeWork } from "../../lib/normalise";
import { recordPath } from "../../lib/paths";
import useDirectusResource from "../../lib/useDirectusResource";
import "./PortalHeader.css";
import "../basket/basket.css";

// Folder tabs replace the old navbar. `match` lists the paths that light a tab up.
const TABS = [
  { to: "/", label: "Home", match: (path) => path === "/" },
  { to: "/works", label: "Works", match: (path) => path.startsWith("/works") },
  { to: "/texts", label: "Texts", match: (path) => path.startsWith("/texts") },
  { to: "/journal", label: "Journal", match: (path) => path.startsWith("/journal") },
  { to: "/razz", label: "Razz", match: (path) => path.startsWith("/razz") || path.startsWith("/contributors") },
  { to: "/vault", label: "Vault", match: (path) => path.startsWith("/vault") },
  { to: "/shop", label: "Shop", match: (path) => path.startsWith("/shop") || path.startsWith("/basket") || path.startsWith("/order") },
  {
    to: "/about",
    label: "About",
    match: (path) => ["/about", "/artists", "/contact", "/commissions", "/newsletter"].some((base) => path.startsWith(base)),
  },
];

const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

// Latest titles for the ticker. Each source is optional: if one fails it is simply left out.
function useTickerItems() {
  const works = useDirectusResource(getPublishedWorks, [], normalizeWork, "ticker-works");
  const texts = useDirectusResource(getPublishedTexts, [], normalizeText, "ticker-texts");
  const journal = useDirectusResource(getPublishedJournalEntries, [], normalizeJournalEntry, "ticker-journal");
  const pick = (resource, base, kind, count) =>
    resource.status === "success"
      ? resource.data.slice(0, count).map((item) => ({ key: `${base}:${item.slug}`, kind, label: item.title, to: recordPath(base, item.slug) }))
      : [];
  return [...pick(works, "/works", "Work", 4), ...pick(texts, "/texts", "Text", 3), ...pick(journal, "/journal", "Journal", 3)];
}

export default function PortalHeader() {
  const { pathname } = useLocation();
  const { count } = useBasket();
  const tickerItems = useTickerItems();
  // The basket link appears once something is in the basket (and only when online payment is on).
  const basketLabel = checkoutEnabled && count > 0 ? `Basket (${count})` : "";

  return (
    <header className="portal-header">
      <div className="portal-header__top">
        <Link to="/" className="portal-logo">
          UpsetXociety
        </Link>

        <p className="portal-header__banner">
          <span className="portal-header__banner-eyebrow">Art House</span>
          An independent house for image, sound and thought.
        </p>

        <div className="portal-header__date">
          <strong>{today}</strong>
          <Link to="/journal">Updates from the house ›</Link>
        </div>
      </div>

      <nav className="portal-tabs" aria-label="Primary">
        <ul>
          {TABS.map((tab, index) => {
            const active = tab.match(pathname);
            // The tabs overlap like folder dividers: each sits over the one to its right, the open tab over all.
            return (
              <li key={tab.to} style={{ zIndex: active ? TABS.length + 1 : TABS.length - index }}>
                <Link to={tab.to} className={`portal-tab${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="portal-strip">
        <span className="portal-strip__chevrons" aria-hidden="true">»»</span>
        <Link to="/newsletter" className="portal-pill">
          Newsletter
        </Link>
        <span className="portal-strip__text">News, works, releases and archive updates, occasionally.</span>
        {basketLabel ? (
          <Link to="/basket" className="portal-pill portal-pill--bright nav-basket">
            {basketLabel}
          </Link>
        ) : (
          <Link to="/commissions" className="portal-strip__link">
            Bookings + commissions ›
          </Link>
        )}
      </div>

      {tickerItems.length > 0 && (
        <div className="portal-ticker">
          <span className="portal-ticker__label">UpsetTicker »»»</span>
          <div className="portal-ticker__window">
            {/* Rendered twice so the scroll loops seamlessly; the copy is hidden from screen readers. */}
            <ul className="portal-ticker__track">
              {[0, 1].map((copy) =>
                tickerItems.map((item) => (
                  <li key={`${copy}:${item.key}`} aria-hidden={copy === 1 ? "true" : undefined}>
                    <span className="portal-ticker__kind">{item.kind}</span>
                    <Link to={item.to} tabIndex={copy === 1 ? -1 : undefined}>
                      {item.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
