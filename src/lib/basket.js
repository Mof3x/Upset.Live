import { createContext, useContext } from "react";

// The basket.
//
// It lives in the visitor's own browser (localStorage), so it survives a reload
// or closing the tab, and nobody else can see it. It only remembers WHAT was
// added (slug, quantity, and a title and image to show straight away). Prices
// and stock are always checked again from Directus on the basket page, and a
// third time by the checkout Worker, so an old basket can never charge an old
// price.

// The same limits as the checkout Worker (workers/checkout/src/index.js):
// up to 10 different items, up to 10 of each.
export const MAX_LINES = 10;
export const MAX_QUANTITY = 10;

export const BASKET_STORAGE_KEY = "upset-basket-v1";

// Shared by BasketProvider (which fills it) and the pages that read it.
export const BasketContext = createContext(null);

export function useBasket() {
  const basket = useContext(BasketContext);
  if (!basket) throw new Error("useBasket must be used inside <BasketProvider>.");
  return basket;
}

// Keeps only well-formed lines: a text slug, a whole quantity from 1 to
// MAX_QUANTITY, and at most MAX_LINES of them. Anything else stored under our
// key (an older format, a hand-edited value) is dropped rather than trusted.
export function cleanLines(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .filter((line) => {
      const ok =
        line &&
        typeof line.slug === "string" &&
        line.slug &&
        Number.isInteger(line.quantity) &&
        line.quantity >= 1 &&
        line.quantity <= MAX_QUANTITY &&
        !seen.has(line.slug);
      if (ok) seen.add(line.slug);
      return ok;
    })
    .slice(0, MAX_LINES)
    .map((line) => ({
      slug: line.slug,
      quantity: line.quantity,
      title: typeof line.title === "string" ? line.title : "",
      image: typeof line.image === "string" ? line.image : "",
      section: line.section === "vault" ? "vault" : "shop",
    }));
}

// Browser storage can be missing or blocked (private windows, strict
// settings). The basket then still works for this visit; it just isn't saved.
export function loadBasket() {
  try {
    const raw = window.localStorage.getItem(BASKET_STORAGE_KEY);
    return cleanLines(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

export function saveBasket(lines) {
  try {
    window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Not saved; see loadBasket.
  }
}
