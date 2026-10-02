import "./audio.css";

// External listening links (Bandcamp, Spotify, ...). The addresses are already
// limited to http(s) by normalizeWork.
export default function ListenLinks({ links }) {
  if (!links?.length) return null;

  return (
    <ul className="listen-links" aria-label="Listen elsewhere">
      {links.map((link) => (
        <li key={link.url}>
          <a href={link.url} target="_blank" rel="noreferrer">
            Listen on {link.label}
            <span aria-hidden="true"> ↗</span>
            <span className="audio-hidden"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
