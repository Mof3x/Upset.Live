import { useEffect } from "react";
import { isForbiddenError } from "./directus";

// Combine the primary resources of a page into one render state:
// loading | closed (Directus refused access) | error | success.
export function gateStatus(...resources) {
  if (resources.some((resource) => resource.status === "loading")) return "loading";
  const failed = resources.find((resource) => resource.status === "error");
  if (failed) return isForbiddenError(failed.error) ? "closed" : "error";
  return "success";
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · UpsetXociety` : "UpsetXociety";
  }, [title]);
}
