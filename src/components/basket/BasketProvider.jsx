import { useCallback, useEffect, useMemo, useState } from "react";
import { BASKET_STORAGE_KEY, BasketContext, MAX_LINES, MAX_QUANTITY, cleanLines, loadBasket, saveBasket } from "../../lib/basket";

// Holds the basket for the whole site. It lives in SiteShell, which stays
// mounted while a visitor browses, so the header count and every page see the
// same basket. See lib/basket.js for what is stored and why.
export function BasketProvider({ children }) {
  const [lines, setLines] = useState(loadBasket);

  // Save after every change.
  useEffect(() => {
    saveBasket(lines);
  }, [lines]);

  // The basket was changed in another tab: follow it.
  useEffect(() => {
    function onStorage(event) {
      if (event.key === BASKET_STORAGE_KEY) setLines(loadBasket());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Adds `quantity` of an item, up to `limit` (its stock, at most MAX_QUANTITY).
  // `item` is { slug, title, image, section }. Returns { ok, reason, quantity }:
  //   reason "full"  -> the basket already has MAX_LINES different items
  //   reason "limit" -> nothing more can be added (the basket holds all there is)
  const add = useCallback(
    (item, quantity, limit) => {
      const existing = lines.find((line) => line.slug === item.slug);
      if (!existing && lines.length >= MAX_LINES) return { ok: false, reason: "full" };
      const cap = Math.min(MAX_QUANTITY, limit);
      const next = Math.min(cap, (existing?.quantity || 0) + quantity);
      if (next < 1 || next === existing?.quantity) return { ok: false, reason: "limit" };
      const line = { slug: item.slug, quantity: next, title: item.title || "", image: item.image || "", section: item.section };
      setLines((current) =>
        cleanLines(existing ? current.map((entry) => (entry.slug === item.slug ? line : entry)) : [...current, line])
      );
      return { ok: true, quantity: next };
    },
    [lines]
  );

  // Sets a line's quantity (1..MAX_QUANTITY). The basket page caps it at the stock.
  const setQuantity = useCallback((slug, quantity) => {
    const next = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity)));
    setLines((current) => current.map((line) => (line.slug === slug ? { ...line, quantity: next } : line)));
  }, []);

  const remove = useCallback((slug) => {
    setLines((current) => current.filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      // Units in the basket, for the header ("Basket (3)").
      count: lines.reduce((total, line) => total + line.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, add, setQuantity, remove, clear]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}
