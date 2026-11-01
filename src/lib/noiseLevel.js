// How strong the background noise is. A visitor steps through these with the Noise button in the
// header; the choice is kept in their own browser (localStorage) so it survives a reload.
export const NOISE_LEVELS = [
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
  { key: "off", label: "Off" },
];

export const NOISE_STORAGE_KEY = "upset-noise-v1";

export function readNoiseLevel() {
  try {
    const saved = window.localStorage.getItem(NOISE_STORAGE_KEY);
    return NOISE_LEVELS.some((level) => level.key === saved) ? saved : NOISE_LEVELS[0].key;
  } catch {
    // Storage can be blocked (private windows, cleared site data): fall back to the default.
    return NOISE_LEVELS[0].key;
  }
}

export function saveNoiseLevel(level) {
  try {
    window.localStorage.setItem(NOISE_STORAGE_KEY, level);
  } catch {
    // Not saved; the level still applies for this visit.
  }
}
