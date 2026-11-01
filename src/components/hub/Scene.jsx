import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HubIcon from "./HubIcon";
import { GoLink, HubMedia, PlayButton } from "./HubParts";
import "./Scene.css";

// The scene's backdrop. Empty leaves the site's own background (noise and CRT glow) showing; set it
// to the URL of a wide render (for example the Blender street, placed in /public) to stand the boards in it.
const SCENE_BACKDROP = "";

// The first work gets the big board; the rest take these sizes and heights in turn, so the skyline varies.
const STREET_RHYTHM = [
  { size: "md", drop: 3 },
  { size: "sm", drop: 6 },
  { size: "md", drop: 1.5 },
  { size: "sm", drop: 4.5 },
];

// Whether the street is scrolled to either end (each arrow is disabled at its end).
function edgesOf(street) {
  return {
    start: street.scrollLeft <= 2,
    end: street.scrollLeft + street.clientWidth >= street.scrollWidth - 2,
  };
}

// One billboard for one work: a plate with its type on top, the picture, a caption with View (and Play
// when the work has a recording), and two posts down to the ground line. `drop` lowers the board.
function WorkBoard({ work, size, drop, big = false }) {
  return (
    <article className={`board board--${size}`} style={{ "--drop": `${drop}rem` }}>
      <p className="board__plate">
        <HubIcon name={work.audio ? "music" : "works"} />
        {work.kind}
      </p>
      <Link to={work.to} className="board__face" tabIndex={-1} aria-hidden="true">
        <HubMedia image={work.image} alt="" icon="works" />
      </Link>
      <div className="board__caption">
        <h3 className={`board__title${big ? " board__title--big" : ""}`}>
          <Link to={work.to}>{work.title}</Link>
        </h3>
        {work.meta && <p className="board__meta">{work.meta}</p>}
        <div className="board__actions">
          <GoLink to={work.to}>View</GoLink>
          {work.audio && <PlayButton track={work.audio} />}
        </div>
      </div>
      <span className="board__posts" aria-hidden="true" />
    </article>
  );
}

/*
  The homepage scene: a street of billboards, one per work, at different heights along one ground line.
  It scrolls sideways (arrows, swipe, trackpad or shift + wheel). Open space around every board so the
  background shows through.
*/
export default function Scene({ works }) {
  const streetRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  // The observer also reports once on start, which sets the arrows for the first layout.
  useEffect(() => {
    const street = streetRef.current;
    if (!street) return undefined;
    const observer = new ResizeObserver(() => setEdges(edgesOf(street)));
    observer.observe(street);
    return () => observer.disconnect();
  }, [works.length]);

  if (!works.length) return null;

  const walk = (direction) => {
    const street = streetRef.current;
    street?.scrollBy({ left: direction * street.clientWidth * 0.6, behavior: "smooth" });
  };
  // The arrows only appear when there is more street than fits on the screen.
  const scrolls = !(edges.start && edges.end);

  return (
    <section className="scene" aria-label="Works">
      {SCENE_BACKDROP && <img className="scene__backdrop" src={SCENE_BACKDROP} alt="" />}

      <div className="scene__controls">
        <Link to="/works" className="scene__all">
          All works ›
        </Link>
        {scrolls && (
          <>
            <button type="button" onClick={() => walk(-1)} disabled={edges.start} aria-label="Scroll the works back">
              ‹
            </button>
            <button type="button" onClick={() => walk(1)} disabled={edges.end} aria-label="Scroll the works on">
              ›
            </button>
          </>
        )}
      </div>

      <div className="scene__street" ref={streetRef} onScroll={(event) => setEdges(edgesOf(event.currentTarget))}>
        <div className="scene__boards">
          {works.map((work, index) =>
            index === 0 ? (
              <WorkBoard key={work.key} work={work} size="lg" drop={0} big />
            ) : (
              <WorkBoard key={work.key} work={work} {...STREET_RHYTHM[(index - 1) % STREET_RHYTHM.length]} />
            )
          )}
        </div>
      </div>

      <div className="scene__ground" aria-hidden="true" />
    </section>
  );
}
