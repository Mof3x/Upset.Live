import { getDirectusUrl } from "./directus";

export function getMediaUrl(file, options = {}) {
  if (!file) return "";

  const fileUrl = typeof file === "object" ? file.url : null;
  if (fileUrl) {
    return fileUrl.startsWith("http")
      ? fileUrl
      : `${getDirectusUrl()}/${fileUrl.replace(/^\//, "")}`;
  }

  const fileId = typeof file === "object" ? file.id : file;
  if (!fileId || !getDirectusUrl()) return "";

  const url = new URL(
    `/assets/${encodeURIComponent(fileId)}`,
    `${getDirectusUrl()}/`
  );

  const transformations = ["width", "height", "quality", "fit", "format"];
  transformations.forEach((key) => {
    if (options[key] !== undefined && options[key] !== null) {
      url.searchParams.set(key, options[key]);
    }
  });

  return url.toString();
}

export function getMediaAlt(file, fallback = "") {
  if (typeof file === "object" && file?.description) {
    return file.description;
  }

  if (typeof file === "object" && file?.title) {
    return file.title;
  }

  return fallback;
}
