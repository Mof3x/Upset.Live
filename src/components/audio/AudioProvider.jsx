import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayerContext } from "./player";

// One <audio> element for the whole site. It lives in SiteShell, which stays
// mounted across <Link> navigation, so a recording keeps playing while a
// visitor browses. Pages only describe a track ({ src, title, artist, href });
// playback starts from a visitor's click, never on its own.
export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const trackRef = useRef(null);
  const [track, setTrack] = useState(null);
  // idle | loading | playing | paused | error
  const [status, setStatus] = useState("idle");
  const [time, setTime] = useState({ current: 0, duration: 0 });

  const play = useCallback((next) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (next && next.src !== trackRef.current?.src) {
      trackRef.current = next;
      setTrack(next);
      setTime({ current: 0, duration: 0 });
      audio.src = next.src;
    }
    if (!trackRef.current) return;
    setStatus("loading");
    audio.play().catch((error) => {
      // AbortError: a newer load replaced this one. NotAllowedError: the
      // browser wants a click first. Neither means the file is broken.
      if (error?.name === "AbortError") return;
      setStatus(error?.name === "NotAllowedError" ? "paused" : "error");
    });
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);

  const seek = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.max(0, seconds);
    setTime((value) => ({ ...value, current: audio.currentTime }));
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    trackRef.current = null;
    setTrack(null);
    setStatus("idle");
    setTime({ current: 0, duration: 0 });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const readTime = () =>
      setTime({
        current: audio.currentTime || 0,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    const handlers = {
      playing: () => setStatus("playing"),
      pause: () => setStatus((value) => (value === "error" ? value : "paused")),
      waiting: () => setStatus("loading"),
      ended: () => setStatus("paused"),
      // Only errors while a track is loaded count; close() empties src on purpose.
      error: () => trackRef.current && setStatus("error"),
      timeupdate: readTime,
      durationchange: readTime,
      loadedmetadata: readTime,
    };
    Object.entries(handlers).forEach(([name, handler]) => audio.addEventListener(name, handler));
    return () => Object.entries(handlers).forEach(([name, handler]) => audio.removeEventListener(name, handler));
  }, []);

  // Lock-screen and hardware media keys, where the browser supports them.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    if (track && typeof window.MediaMetadata === "function") {
      session.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist || "UpsetXociety",
        album: "UpsetXociety",
      });
    } else {
      session.metadata = null;
    }
    const actions = {
      play: track ? () => play() : null,
      pause: track ? () => pause() : null,
      seekto: track ? (details) => seek(details.seekTime) : null,
    };
    Object.entries(actions).forEach(([name, handler]) => {
      try {
        session.setActionHandler(name, handler);
      } catch {
        // Unsupported action in this browser.
      }
    });
  }, [track, play, pause, seek]);

  const value = useMemo(
    () => ({ track, status, time, play, pause, seek, close }),
    [track, status, time, play, pause, seek, close]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" />
    </PlayerContext.Provider>
  );
}
