import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBasket } from "../../lib/basket";
import { checkoutEnabled } from "../../lib/checkout";
import {
  getPublishedArtists,
  getPublishedJournalEntries,
  getPublishedTexts,
  getPublishedWorks,
} from "../../lib/queries";
import { normalizeArtist, normalizeJournalEntry, normalizeText, normalizeWork } from "../../lib/normalise";
import { recordPath } from "../../lib/paths";
import { NOISE_LEVELS } from "../../lib/noiseLevel";
import { SECTIONS } from "../../lib/sections";
import useDirectusResource from "../../lib/useDirectusResource";
import HubIcon from "../hub/HubIcon";
import "./HubHeader.css";
import "../basket/basket.css";

// The artist strip always shows at least this many slots; empty ones wait for new artists.
const STRIP_SLOTS = 8;

// Latest titles for the bulletin ticker. Each source is optional: if one fails it is simply left out.
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

// Whether the strip is scrolled to either end (each arrow is disabled at its end).
function edgesOf(strip) {
  return {
    start: strip.scrollLeft <= 2,
    end: strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2,
  };
}

// "Pick an artist": a row of portraits with arrows, like a channel's character strip.
function ArtistStrip() {
  const artists = useDirectusResource(getPublishedArtists, [], normalizeArtist, "strip-artists");
  const list = artists.status === "success" ? artists.data : [];
  const windowRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  // The observer also reports once on start, which sets the arrows for the first layout.
  useEffect(() => {
    const strip = windowRef.current;
    if (!strip) return undefined;
    const observer = new ResizeObserver(() => setEdges(edgesOf(strip)));
    observer.observe(strip);
    return () => observer.disconnect();
  }, [list.length]);

  const scroll = (direction) => {
    const strip = windowRef.current;
    strip?.scrollBy({ left: direction * strip.clientWidth * 0.75, behavior: "smooth" });
  };

  const empties = Math.max(0, STRIP_SLOTS - list.length);

  return (
    <div className="hub-strip">
      <div className="hub-strip__row">
        <button type="button" className="hub-strip__arrow" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Previous artists">
          ‹
        </button>
        <ul className="hub-strip__window" ref={windowRef} onScroll={(event) => setEdges(edgesOf(event.currentTarget))}>
          {list.map((artist) => (
            <li key={artist.slug}>
              {/* The portrait is the artist's profile picture (their Directus avatar, copied onto the artist record). */}
              <Link
                to={recordPath("/artists", artist.slug)}
                className={`hub-strip__face${artist.image ? "" : " hub-strip__face--text"}`}
                title={artist.name}
              >
                {artist.image && <img src={artist.image} alt="" loading="lazy" />}
                <span className="hub-strip__name">{artist.name}</span>
              </Link>
            </li>
          ))}
          {Array.from({ length: empties }, (_, index) => (
            <li key={`empty-${index}`} aria-hidden="true">
              <span className="hub-strip__face hub-strip__face--empty">
                <HubIcon name="artists" />
              </span>
            </li>
          ))}
        </ul>
        <button type="button" className="hub-strip__arrow" onClick={() => scroll(1)} disabled={edges.end} aria-label="More artists">
          ›
        </button>
      </div>
      <Link to="/artists" className="hub-strip__label">
        <span aria-hidden="true">«</span> Pick an artist <span aria-hidden="true">»</span>
      </Link>
    </div>
  );
}

// Steps the background noise High → Medium → Low → Off → High. The bars show the current strength
// (three for High, none for Off).
const NOISE_BARS = 3;

function NoiseButton({ level, onChange }) {
  const index = Math.max(0, NOISE_LEVELS.findIndex((item) => item.key === level));
  const next = NOISE_LEVELS[(index + 1) % NOISE_LEVELS.length];
  const strength = NOISE_BARS - index;

  return (
    <button
      type="button"
      className="hub-noise"
      onClick={() => onChange(next.key)}
      aria-label={`Background noise: ${NOISE_LEVELS[index].label}. Change to ${next.label}`}
      title={`Noise: ${NOISE_LEVELS[index].label}`}
    >
      Noise
      <span className="hub-noise__bars" aria-hidden="true">
        {Array.from({ length: NOISE_BARS }, (_, bar) => (
          <i key={bar} className={bar < strength ? "is-on" : ""} />
        ))}
      </span>
    </button>
  );
}

export default function HubHeader({ noise, onNoiseChange }) {
  const { pathname } = useLocation();
  const { count } = useBasket();
  const tickerItems = useTickerItems();
  const showBasket = checkoutEnabled && count > 0;
  // Phones: the tabs, buttons and Noise move into one drop-down menu.
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="hub-header">
      <div className="hub-header__top">
        <Link to="/" className="hub-logo" aria-label="UpsetXociety, home">
          <span className="hub-logo__stamp" aria-hidden="true">
            <span>U</span>
            <span>X</span>
          </span>
          <span className="hub-logo__words">
            <strong>UpsetXociety</strong>
            <span>Art Haus</span>
          </span>
        </Link>

        <div className="hub-phonebar">
          {showBasket && (
            <Link to="/basket" className="hub-phonebar__basket nav-basket">
              Basket ({count})
            </Link>
          )}
          <button
            type="button"
            className="hub-phonebar__menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="hub-menu"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <ArtistStrip />

        <div className="hub-utility">
          <Link to="/newsletter" className="hub-utility__button">
            Join us
          </Link>
          <Link to="/contact" className="hub-utility__button">
            Contact
          </Link>
          {showBasket ? (
            <Link to="/basket" className="hub-utility__button hub-utility__button--bright nav-basket">
              Basket ({count})
            </Link>
          ) : (
            <Link to="/commissions" className="hub-utility__button">
              Book us
            </Link>
          )}
        </div>
      </div>

      <nav className="hub-tabs" aria-label="Primary">
        <ul>
          {SECTIONS.map((section) => {
            const active = section.match(pathname);
            return (
              <li key={section.key}>
                <Link
                  to={section.to}
                  className={`hub-tab${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <HubIcon name={section.icon} />
                  <span>{section.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hub-bulletin">
        <span className="hub-bulletin__label">On now</span>
        {tickerItems.length > 0 ? (
          <div className="hub-bulletin__window">
            {/* Rendered twice so the scroll loops seamlessly; the copy is hidden from screen readers. */}
            <ul className="hub-bulletin__track">
              {[0, 1].map((copy) =>
                tickerItems.map((item) => (
                  <li key={`${copy}:${item.key}`} aria-hidden={copy === 1 ? "true" : undefined}>
                    <span className="hub-bulletin__kind">{item.kind}</span>
                    <Link to={item.to} tabIndex={copy === 1 ? -1 : undefined}>
                      {item.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : (
          <p className="hub-bulletin__static">An independent haus for image, sound and thought.</p>
        )}
        {onNoiseChange && <NoiseButton level={noise} onChange={onNoiseChange} />}
      </div>

      {menuOpen && (
        // Following any link closes the menu.
        <div
          id="hub-menu"
          className="hub-menu"
          onClick={(event) => {
            if (event.target.closest("a")) setMenuOpen(false);
          }}
        >
          <ul className="hub-menu__sections">
            {SECTIONS.map((section) => {
              const active = section.match(pathname);
              return (
                <li key={section.key}>
                  <Link to={section.to} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
                    <HubIcon name={section.icon} />
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="hub-menu__links">
            <Link to="/newsletter">Join us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/commissions">Book us</Link>
          </p>
          {onNoiseChange && <NoiseButton level={noise} onChange={onNoiseChange} />}
        </div>
      )}
    </header>
  );
}
