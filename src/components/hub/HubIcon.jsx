// Line icons for the sections and the homepage. Stand-ins until the Blender renders replace them:
// each one is a 24 × 24 stroke drawing in currentColor, so it takes the colour of its text.
const PATHS = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-5.5h3V20h5V9.5" />,
  works: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="m3 17 5.5-5.5 4 4 3-3L21 18" />
      <circle cx="16" cy="8.5" r="1.6" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.5l11-2.5v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  texts: <path d="M6 3h9l4 4v14H6zM15 3v4h4M9 11h7M9 14.5h7M9 18h4" />,
  journal: <path d="M3 5h6.5A2.5 2.5 0 0 1 12 7.5V20a2 2 0 0 0-2-2H3zM21 5h-6.5A2.5 2.5 0 0 0 12 7.5V20a2 2 0 0 1 2-2h7z" />,
  razz: <path d="m12 2.5 2.6 6.2 6.7.6-5.1 4.4 1.6 6.6L12 16.8l-5.8 3.5 1.6-6.6-5.1-4.4 6.7-.6z" />,
  vault: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v1.5M12 14.5V16M8 12h1.5M14.5 12H16M5 20v1.5M19 20v1.5" />
    </>
  ),
  shop: <path d="M5 8h14l-1.2 13H6.2zM9 8V6.5a3 3 0 0 1 6 0V8" />,
  about: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  artists: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5" />
    </>
  ),
  commissions: (
    <>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M3 10h18M8 3v4M16 3v4M7.5 14h3M7.5 17.5h6" />
    </>
  ),
  newsletter: <path d="M3 5h18v14H3zM3 5l9 8 9-8" />,
  contact: <path d="M4 4h16v12H9l-5 4z" />,
  dice: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.1" />
      <circle cx="15.5" cy="15.5" r="1.1" />
      <circle cx="12" cy="12" r="1.1" />
      <circle cx="15.5" cy="8.5" r="1.1" />
      <circle cx="8.5" cy="15.5" r="1.1" />
    </>
  ),
  play: <path d="M7 4.5v15l12-7.5z" />,
  pause: <path d="M7 4.5v15M17 4.5v15" />,
};

export default function HubIcon({ name, className = "" }) {
  return (
    <svg
      className={`hub-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] || PATHS.home}
    </svg>
  );
}
