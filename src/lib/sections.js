// The site's sections, shared by the header tabs, the homepage doors and the page banners.
// `match` lists the paths that belong to a section (and light its tab up).
export const SECTIONS = [
  { key: "home", to: "/", label: "Home", icon: "home", match: (path) => path === "/" },
  { key: "works", to: "/works", label: "Works", icon: "works", match: (path) => path.startsWith("/works") },
  { key: "texts", to: "/texts", label: "Texts", icon: "texts", match: (path) => path.startsWith("/texts") },
  { key: "journal", to: "/journal", label: "Journal", icon: "journal", match: (path) => path.startsWith("/journal") },
  {
    key: "razz",
    to: "/razz",
    label: "RazzMag",
    icon: "razz",
    match: (path) => path.startsWith("/razz") || path.startsWith("/contributors"),
  },
  { key: "vault", to: "/vault", label: "Vault", icon: "vault", match: (path) => path.startsWith("/vault") },
  {
    key: "shop",
    to: "/shop",
    label: "Shop",
    icon: "shop",
    match: (path) => ["/shop", "/basket", "/order"].some((base) => path.startsWith(base)),
  },
  {
    key: "about",
    to: "/about",
    label: "About",
    icon: "about",
    match: (path) => ["/about", "/artists", "/contact", "/commissions", "/newsletter"].some((base) => path.startsWith(base)),
  },
];

// Finer-grained icons for the pages inside About, so their banners are not all the same.
const PAGE_ICONS = [
  ["/artists", "artists"],
  ["/commissions", "commissions"],
  ["/newsletter", "newsletter"],
  ["/contact", "contact"],
  ["/contributors", "artists"],
];

export function iconForPath(pathname) {
  const page = PAGE_ICONS.find(([base]) => pathname.startsWith(base));
  if (page) return page[1];
  return SECTIONS.find((section) => section.match(pathname))?.icon || "home";
}
