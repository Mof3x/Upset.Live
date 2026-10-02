import { formatTime, useAudioPlayer } from "./player";
import { PauseIcon, PlayIcon } from "./icons";
import "./audio.css";

const statusText = {
  idle: "Ready",
  loading: "Loading…",
  playing: "Playing",
  paused: "Paused",
  error: "This recording could not be loaded.",
};

// The handheld player shown on a work page. It controls the site-wide player,
// so starting it here keeps the recording going on other pages.
export default function AudioPlayer({ track }) {
  const player = useAudioPlayer();
  const isCurrent = player.track?.src === track.src;
  const status = isCurrent ? player.status : "idle";
  const playing = status === "playing";
  const duration = isCurrent ? player.time.duration : 0;
  const current = isCurrent ? Math.min(player.time.current, duration || player.time.current) : 0;
  const canSeek = isCurrent && duration > 0;

  return (
    <section className="y2k-device" aria-label={`Listen to ${track.title}`}>
      <div className="y2k-device__screen">
        <p className="y2k-device__title">{track.title}</p>
        {track.artist && <p className="y2k-device__artist">{track.artist}</p>}
        <p className="y2k-device__status" role="status">
          {statusText[status]}
        </p>
        <p className="y2k-device__time" aria-hidden="true">
          {formatTime(current)} / {duration ? formatTime(duration) : "--:--"}
        </p>
      </div>

      <input
        className="y2k-device__seek"
        type="range"
        min="0"
        max={canSeek ? duration : 0}
        step="any"
        value={canSeek ? current : 0}
        disabled={!canSeek}
        aria-label="Position"
        aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
        onChange={(event) => player.seek(Number(event.target.value))}
      />

      <div className="y2k-device__controls">
        <button
          type="button"
          onClick={() => player.seek(current - 10)}
          disabled={!canSeek}
          aria-label="Back 10 seconds"
        >
          −10
        </button>
        <button
          type="button"
          className="y2k-device__play"
          onClick={() => (playing ? player.pause() : player.play(track))}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          onClick={() => player.seek(current + 10)}
          disabled={!canSeek}
          aria-label="Forward 10 seconds"
        >
          +10
        </button>
      </div>
    </section>
  );
}
