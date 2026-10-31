import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HubIcon from "./HubIcon";
import { GoLink, HubMedia, PlayButton } from "./HubParts";
import "./Scene.css";

// The scene's backdrop. Empty leaves the site's own background (noise and CRT glow) showing; set it
// to the URL of a wide render (for example the Blender street, placed in /public) to stand the boards in it.
const SCENE_BACKDROP = "";

// Seconds between slides on the main board when nobody is using it.
const SLIDE_SECONDS = 7;

// The main board's slides advance on their own until a visitor points at, focuses or picks one.
function useSlides(count) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || count < 2) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % count), SLIDE_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [held, count]);

  return { index: count ? index % count : 0, setIndex, setHeld };
}

// One billboard: a small plate on top, the face, a caption, and two posts down to the ground line.
// `drop` lowers the board so the row has a skyline instead of one straight edge.
function Board({ size = "sm", drop = 0, plate, icon, className = "", children, ...props }) {
  return (
    <div className={`board board--${size} ${className}`.trim()} style={{ "--drop": `${drop}rem` }} {...props}>
      <p className="board__plate">
        {icon && <HubIcon name={icon} />}
        {plate}
      </p>
      {children}
      <span className="board__posts" aria-hidden="true" />
    </div>
  );
}

function MainBoard({ slides }) {
  const { index, setIndex, setHeld } = useSlides(slides.length);
  const slide = slides[index];
  if (!slide) return null;

  return (
    <Board
      size="lg"
      plate="What's new"
      icon="razz"
      role="region"
      aria-roledescription="carousel"
      aria-label="What's new"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <Link to={slide.to} className="board__face" aria-label={`${slide.kind}: ${slide.title}`}>
        <HubMedia image={slide.image} alt={slide.imageAlt} icon={slide.icon} label={slide.kind} />
      </Link>
      <div className="board__caption">
        <p className="board__kind">{slide.kind}</p>
        <h3 className="board__title board__title--big">
          <Link to={slide.to}>{slide.title}</Link>
        </h3>
        {slide.meta && <p className="board__meta">{slide.meta}</p>}
        <div className="board__actions">
          <GoLink to={slide.to}>{slide.go || "Go"}</GoLink>
          {slides.length > 1 && (
            <div className="board__pager">
              {slides.map((item, position) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={position === index}
                  aria-label={`Show ${item.title}`}
                  onClick={() => setIndex(position)}
                >
                  {position + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Board>
  );
}

function ItemBoard({ size, drop, plate, icon, item, action }) {
  return (
    <Board size={size} drop={drop} plate={plate} icon={icon} role="region" aria-label={plate}>
      <Link to={item.to} className="board__face" tabIndex={-1} aria-hidden="true">
        <HubMedia image={item.image} alt="" icon={icon} />
      </Link>
      <div className="board__caption">
        <h3 className="board__title">
          <Link to={item.to}>{item.title}</Link>
        </h3>
        {item.meta && <p className="board__meta">{item.meta}</p>}
        <div className="board__actions">{action}</div>
      </div>
    </Board>
  );
}

// Further along the street, boards take these sizes and heights in turn, so the skyline varies.
const STREET_RHYTHM = [
  { size: "md", drop: 4 },
  { size: "sm", drop: 1 },
  { size: "sm", drop: 6 },
  { size: "md", drop: 2.5 },
];

// Whether the street is scrolled to either end (each arrow is disabled at its end).
function edgesOf(street) {
  return {
    start: street.scrollLeft <= 2,
    end: street.scrollLeft + street.clientWidth >= street.scrollWidth - 2,
  };
}

/*
  The homepage scene: a street of billboards at different heights along one ground line, scrolled
  sideways (arrows, swipe, trackpad or shift + wheel). Open space around every board so the background
  shows through. It starts with "On now" (a list), the main board (a carousel), Listen (or Bookings)
  and the Shop (or the Vault); `more` boards follow further along.
*/
export default function Scene({ slides, onNow, listen, shop, more = [] }) {
  const streetRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // The observer also reports once on start, which sets the arrows for the first layout.
  useEffect(() => {
    const street = streetRef.current;
    if (!street) return undefined;
    const observer = new ResizeObserver(() => setEdges(edgesOf(street)));
    observer.observe(street);
    return () => observer.disconnect();
  }, [more.length]);

  const walk = (direction) => {
    const street = streetRef.current;
    street?.scrollBy({ left: direction * street.clientWidth * 0.6, behavior: "smooth" });
  };

  return (
    <section className="scene" aria-label="Today at the haus">
      {SCENE_BACKDROP && <img className="scene__backdrop" src={SCENE_BACKDROP} alt="" />}

      <div className="scene__controls">
        <span className="scene__hint">Walk the street</span>
        <button type="button" onClick={() => walk(-1)} disabled={edges.start} aria-label="Scroll the street back">
          ‹
        </button>
        <button type="button" onClick={() => walk(1)} disabled={edges.end} aria-label="Scroll the street on">
          ›
        </button>
      </div>

      <div className="scene__street" ref={streetRef} onScroll={(event) => setEdges(edgesOf(event.currentTarget))}>
        <div className="scene__boards">
          <Board size="sm" drop={5} plate="On now" icon="journal" role="region" aria-label="On now">
            <ul className="board__list">
              {onNow.map((item) => (
                <li key={item.key}>
                  <span>{item.kind}</span>
                  <Link to={item.to}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </Board>

          <MainBoard slides={slides} />

          {listen ? (
            <ItemBoard size="sm" drop={3} plate="Listen" icon="music" item={listen} action={<PlayButton track={listen.audio} />} />
          ) : (
            <ItemBoard
              size="sm"
              drop={3}
              plate="Bookings"
              icon="commissions"
              item={{ to: "/commissions", title: "Work with the haus", meta: "Commissions and bookings" }}
              action={<GoLink to="/commissions">Book</GoLink>}
            />
          )}

          {shop ? (
            <ItemBoard size="md" drop={1.5} plate="Shop" icon="shop" item={shop} action={<GoLink to={shop.to}>View</GoLink>} />
          ) : (
            <ItemBoard
              size="md"
              drop={1.5}
              plate="Vault"
              icon="vault"
              item={{ to: "/vault", title: "Open the Vault", meta: "Originals, editions and archive objects" }}
              action={<GoLink to="/vault">Enter</GoLink>}
            />
          )}

          {more.map((item, index) => (
            <ItemBoard
              key={item.key}
              {...STREET_RHYTHM[index % STREET_RHYTHM.length]}
              plate={item.kind}
              icon={item.icon}
              item={item}
              action={<GoLink to={item.to}>{item.go || "Go"}</GoLink>}
            />
          ))}
        </div>
      </div>

      <div className="scene__ground" aria-hidden="true" />
    </section>
  );
}
