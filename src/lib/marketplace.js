// The Marketplace (formerly the Shop): the public catalogue of things for sale.
// Old /shop addresses forward here (see LegacyShopRedirect in pages/VaultPages.jsx).
export const MARKETPLACE_PATH = "/marketplace";

// Vault categories that make up the Marketplace. Only open_public items that are not private are ever
// requested (see queries.js); the Marketplace lists the open items in these categories.
export const MARKETPLACE_CATEGORY_SLUGS = [
  "prints",
  "publications",
  "posters",
  "apparel",
  "music-digital-releases",
  "guest-works",
];
