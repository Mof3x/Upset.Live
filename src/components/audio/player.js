import { createContext, useContext } from "react";

// Shared by AudioProvider (which fills it) and the players (which read it).
export const PlayerContext = createContext(null);

export function useAudioPlayer() {
  const player = useContext(PlayerContext);
  if (!player) throw new Error("useAudioPlayer must be used inside <AudioProvider>.");
  return player;
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}
