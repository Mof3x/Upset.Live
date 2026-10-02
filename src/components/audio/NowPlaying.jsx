import { Link, useLocation } from "react-router-dom";
import { formatTime, useAudioPlayer } from "./player";
import { CloseIcon, PauseIcon, PlayIcon } from "./icons";
import "./audio.css";

function samePath(a, b) {
  try {
    return decodeURIComponent(a) === decodeURIComponent(b);
  } catch {
    return a === b;
  }
}

// Small bar that keeps the current recording in reach on every other page.
// Hidden on the recording's own work page, where the full player is shown.
export default function NowPlaying() {
  const { track, status, time, play, pause, close } = useAudioPlayer();
  const { pathname } = useLocation();
  if (!track || (track.href && samePath(pathname, track.href))) return null;
  const playing = status === "playing";

  return (
    <>
      <div className="now-playing__spacer" aria-hidden="true" />
      <section className="now-playing" aria-label="Now playing">
        <button
          type="button"
          className="now-playing__button"
          onClick={() => (playing ? pause() : play())}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <p className="now-playing__text">
          {track.href ? <Link to={track.href}>{track.title}</Link> : track.title}
          {track.artist && <span className="now-playing__artist">{track.artist}</span>}
        </p>
        <p className="now-playing__time">
          {/* Only state changes are announced; the running time is not read out every second. */}
          <span role="status">{status === "error" ? "Could not load" : status === "loading" ? "Loading…" : ""}</span>
          {status !== "error" && status !== "loading" && <span aria-hidden="true">{formatTime(time.current)}</span>}
        </p>
        <button type="button" className="now-playing__button" onClick={close} aria-label="Stop and close the player">
          <CloseIcon />
        </button>
      </section>
    </>
  );
}
