import { getMediaAlt, getMediaUrl } from "./media";

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// Junction rows carry the related record under a key such as `artist_id`.
// When the Public role cannot expand the relation, that key holds a bare id
// (or null for an unpublished record); those rows are skipped.
function relatedRecords(rows, key) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({ row, record: isRecord(row?.[key]) ? row[key] : null }))
    .filter(({ record }) => record);
}

function personSummary({ row, record }) {
  return {
    name: record.name || "Unknown",
    slug: record.slug || "",
    role: row.role || "",
  };
}

function linkSummary({ row, record }) {
  return {
    slug: record.slug || "",
    title: record.title || "Untitled",
    note: row.note || "",
  };
}

function galleryFrom(rows, fallbackAlt) {
  return relatedRecords(rows, "file_id")
    .map(({ row, record }) => ({
      url: getMediaUrl(record.url ? { url: record.url } : null),
      alt: getMediaAlt(record, fallbackAlt),
      caption: row.caption || "",
    }))
    .filter((item) => item.url);
}

function categoryOf(record) {
  const category = isRecord(record.category_id) ? record.category_id : record.category;
  return {
    name: isRecord(category) ? category.name || "" : typeof category === "string" ? category : "",
    slug: isRecord(category) ? category.slug || "" : "",
  };
}

function yearRange(start, end) {
  if (!start) return "";
  return end && String(end) !== String(start) ? `${start}–${end}` : String(start);
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Body fields are stored as plain text or as HTML from the Directus editor.
// HTML is parsed with DOMParser (which never runs scripts) and reduced to
// text paragraphs, so editor-supplied markup is never injected into the page.
export function bodyToParagraphs(body) {
  if (Array.isArray(body)) return body.filter(Boolean).map(String);
  if (typeof body !== "string" || !body.trim()) return [];

  if (/<[a-z][\s\S]*>/i.test(body) && typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(body, "text/html");
    const blocks = [...doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, pre")]
      .filter((node) => !node.querySelector("p, li, blockquote, pre"))
      .map((node) => node.textContent.trim())
      .filter(Boolean);
    if (blocks.length) return blocks;
    return splitParagraphs(doc.body.textContent || "");
  }

  return splitParagraphs(body);
}

function splitParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function excerptFrom(paragraphs, limit = 280) {
  const first = paragraphs[0] || "";
  if (first.length <= limit) return first;
  return `${first.slice(0, limit).replace(/\s+\S*$/, "")}…`;
}

export function normalizeArtist(record = {}) {
  const portrait = firstValue(record.portrait, record.portrait_file, record.portrait_file_id, record.image);
  const bio = bodyToParagraphs(record.bio);

  return {
    id: record.id,
    slug: record.slug || "",
    name: record.name || "Untitled artist",
    discipline: record.discipline || "",
    location: record.location || "",
    image: getMediaUrl(portrait),
    imageAlt: getMediaAlt(portrait, `Portrait of ${record.name || "artist"}`),
    bio,
    excerpt: excerptFrom(bio, 220),
    tags: Array.isArray(record.tags) ? record.tags : [],
    featured: Boolean(record.featured),
    links: {
      instagram: record.instagram || "",
      website: record.website || "",
    },
    works: [],
  };
}

export function normalizeWork(record = {}) {
  const thumbnail = firstValue(record.thumbnail, record.thumbnail_file, record.thumbnail_file_id, record.image);
  const credits = relatedRecords(record.work_artists, "artist_id").map(personSummary);
  const category = categoryOf(record);
  const description = bodyToParagraphs(record.description);

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled work",
    image: getMediaUrl(thumbnail),
    imageAlt: getMediaAlt(thumbnail, record.title || "Work image"),
    gallery: galleryFrom(record.work_files, record.title || "Work image"),
    artist: credits[0] || null,
    artists: credits,
    type: category.name || "Work",
    categorySlug: category.slug,
    year: yearRange(record.year_start, record.year_end),
    medium: record.medium || "",
    dimensions: record.dimensions || "",
    description,
    excerpt: excerptFrom(description),
    tags: Array.isArray(record.tags) ? record.tags : [],
    status: record.status || "",
    featured: Boolean(record.featured),
    order: record.order ?? null,
    relatedTexts: relatedRecords(record.text_related_works, "text_id").map(linkSummary),
  };
}

export function normalizeText(record = {}) {
  const cover = firstValue(record.cover, record.cover_file, record.cover_file_id, record.image);
  const authors = relatedRecords(record.text_authors, "artist_id").map(personSummary);
  const category = categoryOf(record);
  const paragraphs = bodyToParagraphs(record.body);

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled text",
    type: category.name || "Text",
    category: category.name,
    categorySlug: category.slug,
    date: formatDate(record.published_date),
    year: record.published_date ? String(record.published_date).slice(0, 4) : "",
    paragraphs,
    excerpt: excerptFrom(paragraphs),
    image: getMediaUrl(cover),
    imageAlt: getMediaAlt(cover, record.title || "Text cover"),
    author: authors[0] || null,
    authors,
    tags: Array.isArray(record.tags) ? record.tags : [],
    relatedWorks: relatedRecords(record.text_related_works, "work_id").map(linkSummary),
    featured: Boolean(record.featured),
  };
}

export function normalizeJournalEntry(record = {}) {
  const cover = firstValue(record.cover, record.cover_file, record.cover_file_id, record.image);
  const category = categoryOf(record);
  const paragraphs = bodyToParagraphs(record.body);

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled journal entry",
    category: category.name,
    categorySlug: category.slug,
    date: formatDate(record.published_date),
    year: record.published_date ? String(record.published_date).slice(0, 4) : "",
    paragraphs,
    excerpt: excerptFrom(paragraphs),
    image: getMediaUrl(cover),
    imageAlt: getMediaAlt(cover, record.title || "Journal cover"),
    tags: Array.isArray(record.legacy_tags) ? record.legacy_tags : [],
    featured: Boolean(record.featured),
  };
}

export function normalizeRazzIssue(record = {}) {
  const description = bodyToParagraphs(record.description);

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled issue",
    issueNumber: record.issue_number || "",
    date: formatDate(record.release_date),
    description,
    excerpt: excerptFrom(description),
    image: getMediaUrl(record.cover_file_id),
    imageAlt: getMediaAlt(record.cover_file_id, `Cover of ${record.title || "issue"}`),
  };
}

export function normalizeRazzFeature(record = {}) {
  const paragraphs = bodyToParagraphs(record.body);

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled feature",
    issueId: isRecord(record.issue_id) ? record.issue_id.id : record.issue_id || null,
    paragraphs,
    excerpt: excerptFrom(paragraphs),
    contributors: relatedRecords(record.razz_feature_contributors, "contributor_id").map(personSummary),
    gallery: galleryFrom(record.razz_feature_files, record.title || "Feature image"),
  };
}

export function normalizeContributor(record = {}) {
  const bio = bodyToParagraphs(record.bio);

  return {
    id: record.id,
    slug: record.slug || "",
    name: record.name || "Unnamed contributor",
    bio,
    excerpt: excerptFrom(bio, 220),
    image: getMediaUrl(record.portrait_file_id),
    imageAlt: getMediaAlt(record.portrait_file_id, `Portrait of ${record.name || "contributor"}`),
    features: Array.isArray(record.features) ? record.features.map(normalizeRazzFeature) : [],
  };
}

export function normalizeVaultItem(record = {}) {
  const category = categoryOf(record);
  const description = bodyToParagraphs(record.description);
  const gallery = galleryFrom(record.vault_item_files, record.title || "Object image");
  const editionSize = record.edition_size || null;

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled object",
    category: category.name,
    categorySlug: category.slug,
    description,
    excerpt: excerptFrom(description, 200),
    image: gallery[0]?.url || "",
    imageAlt: gallery[0]?.alt || record.title || "Object image",
    gallery,
    artists: relatedRecords(record.vault_item_artists, "artist_id").map(personSummary),
    status: record.status || "",
    edition: [
      record.edition_number ? `No. ${record.edition_number}` : "",
      editionSize ? `Edition of ${editionSize}` : "",
    ].filter(Boolean).join(" · "),
  };
}

export function normalizeSiteSettings(record = {}) {
  return {
    title: record?.site_title || "",
    tagline: record?.tagline || "",
    footerStatement: record?.footer_statement || "",
    socials: {
      instagram: record?.social_instagram || "",
      youtube: record?.social_youtube || "",
      bandcamp: record?.social_bandcamp || "",
      email: record?.social_email || "",
    },
  };
}

export const normaliseArtist = normalizeArtist;
export const normaliseWork = normalizeWork;
export const normaliseText = normalizeText;
export const normaliseJournalEntry = normalizeJournalEntry;
