import { Link } from "react-router-dom";
import { useAudioPlayer } from "../audio/player";
import HubIcon from "./HubIcon";
import "./hub.css";

// A big section title with its icon in a box ("[icon] EXPLORE").
export function HubHeading({ icon, children }) {
  return (
    <h2 className="hub-heading">
      <span className="hub-heading__icon">
        <HubIcon name={icon} />
      </span>
      {children}
    </h2>
  );
}

// The chunky "Go ▸" button.
export function GoLink({ to, children = "Go", className = "" }) {
  return (
    <Link to={to} className={`hub-go ${className}`.trim()}>
      {children} <span aria-hidden="true">▸</span>
    </Link>
  );
}

// An image, or the section's icon standing in for it (the slot a Blender render can fill later).
export function HubMedia({ image, alt = "", icon, label }) {
  if (image) return <img className="hub-media" src={image} alt={alt} loading="lazy" />;
  return (
    <span className="hub-media hub-media--empty" aria-hidden="true">
      <HubIcon name={icon} />
      {label && <span>{label}</span>}
    </span>
  );
}

// Plays or pauses a work's recording on the site-wide player (it keeps going between pages).
export function PlayButton({ track, className = "" }) {
  const player = useAudioPlayer();
  const playing = player.track?.src === track.src && player.status === "playing";
  return (
    <button
      type="button"
      className={`hub-play ${className}`.trim()}
      onClick={() => (playing ? player.pause() : player.play(track))}
      aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
    >
      <HubIcon name={playing ? "pause" : "play"} />
      {playing ? "Pause" : "Play"}
    </button>
  );
}

// A numbered list ("1 Title, 2 Title …") that splits into two columns when it is long.
export function RankedList({ items, empty }) {
  if (!items.length) return <p className="hub-ranked__empty">{empty}</p>;
  return (
    <ol className={`hub-ranked${items.length > 5 ? " hub-ranked--two" : ""}`}>
      {items.map((item) => (
        <li key={item.key}>
          <Link to={item.to}>{item.title}</Link>
          {item.kind && <span className="hub-ranked__kind">{item.kind}</span>}
        </li>
      ))}
    </ol>
  );
}
