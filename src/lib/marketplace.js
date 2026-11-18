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

// Shops. Every product belongs to a shop: an artist's own shop, or the collective's house shop.
// A product with no shop set in Directus is a house product.
export const SHOPS_PATH = "/shops";
export const HOUSE_SHOP_SLUG = "upsetxociety";

// What the Marketplace lists: everything in the Marketplace categories, plus every product from an
// artist's shop whatever its category (artist products are always in the Marketplace; the Vault only
// shows those an editor switched on with "Show in Vault").
export function isMarketplaceItem(item) {
  return MARKETPLACE_CATEGORY_SLUGS.includes(item.categorySlug) || !item.fromHouse;
}

// The products a shop sells, from a list of normalised items. The house shop sells the house
// products in the Marketplace categories; an artist's shop sells everything that names it.
export function shopProducts(shop, items) {
  if (!shop) return [];
  if (shop.isHouse) return items.filter((item) => item.fromHouse && MARKETPLACE_CATEGORY_SLUGS.includes(item.categorySlug));
  return items.filter((item) => item.shop?.slug === shop.slug);
}
