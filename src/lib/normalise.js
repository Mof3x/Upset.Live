import { getMediaAlt, getMediaUrl } from "./media";

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function asParagraphs(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function relationRecord(relation) {
  if (!relation) return null;
  return relation.artist || relation.work || relation.file || relation;
}

function relationRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.map(relationRecord).filter(Boolean);
}

function artistSummary(record) {
  if (!record) return null;

  return {
    name: record.name || "Unknown artist",
    slug: record.slug || "",
  };
}

export function normalizeArtist(record = {}) {
  const portrait = firstValue(
    record.portrait,
    record.portrait_file,
    record.portrait_file_id,
    record.image
  );
  const bio = asParagraphs(record.bio);
  const normalizedWorks = relationRecords(record.works).map(normalizeWork);

  return {
    id: record.id,
    slug: record.slug || "",
    name: record.name || "Untitled artist",
    discipline: record.discipline || record.medium || "Artist",
    location: record.location || "",
    image: getMediaUrl(portrait),
    imageAlt: getMediaAlt(portrait, `Portrait of ${record.name || "artist"}`),
    bio,
    excerpt: bio[0] || "",
    tags: Array.isArray(record.tags) ? record.tags : [],
    links: {
      instagram: record.instagram || "",
      website: record.website || "",
    },
    works: normalizedWorks,
  };
}

export function normalizeWork(record = {}) {
  const thumbnail = firstValue(
    record.thumbnail,
    record.thumbnail_file,
    record.thumbnail_file_id,
    record.image
  );
  const artists = relationRecords(
    record.artists || record.work_artists || record.artist
  ).map(artistSummary);
  const primaryArtist = artists[0] || artistSummary(record.artist);
  const gallery = relationRecords(record.files || record.work_files).map(
    (file) => ({
      url: getMediaUrl(file),
      alt: getMediaAlt(file, record.title || "Work image"),
      caption: file.caption || "",
    })
  );
  const type =
    record.type ||
    record.category?.name ||
    record.category_id?.name ||
    "Work";

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled work",
    image: getMediaUrl(thumbnail),
    imageAlt: getMediaAlt(thumbnail, record.title || "Work image"),
    gallery,
    artist: primaryArtist,
    artists,
    type,
    year: record.year || record.year_start || "",
    medium: record.medium || "",
    dimensions: record.dimensions || "",
    excerpt: record.excerpt || record.description || "",
    description: record.description || "",
    tags: Array.isArray(record.tags) ? record.tags : [],
    status: record.status || "",
    featured: Boolean(record.featured),
    order: record.order ?? null,
    relatedTextSlugs: record.relatedTextSlugs || [],
    relatedJournalSlug: record.relatedJournalSlug || "",
  };
}

export function normalizeText(record = {}) {
  const cover = firstValue(
    record.cover,
    record.cover_file,
    record.cover_file_id,
    record.image
  );
  const authors = relationRecords(
    record.authors || record.text_authors || record.author
  ).map(artistSummary);
  const primaryAuthor = authors[0] || artistSummary(record.author);
  const category =
    record.category?.name || record.category_id?.name || record.category || "";
  const relatedWorks = relationRecords(
    record.relatedWorks || record.text_related_works
  );

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled text",
    type: record.type || category || "Text",
    category,
    year: record.year || record.published_date || "",
    body: record.body || "",
    excerpt: record.excerpt || record.description || "",
    image: getMediaUrl(cover),
    imageAlt: getMediaAlt(cover, record.title || "Text cover"),
    author: primaryAuthor,
    authors,
    tags: Array.isArray(record.tags) ? record.tags : [],
    relatedWorkSlugs: relatedWorks.map((work) => work.slug).filter(Boolean),
    relatedJournalSlug: record.relatedJournalSlug || "",
    featured: Boolean(record.featured),
  };
}

export function normalizeJournalEntry(record = {}) {
  const cover = firstValue(
    record.cover,
    record.cover_file,
    record.cover_file_id,
    record.image
  );

  return {
    id: record.id,
    slug: record.slug || "",
    title: record.title || "Untitled journal entry",
    category: record.category?.name || record.category_id?.name || record.category || "",
    year: record.year || record.published_date || "",
    body: record.body || "",
    excerpt: record.excerpt || record.description || "",
    image: getMediaUrl(cover),
    imageAlt: getMediaAlt(cover, record.title || "Journal cover"),
    tags: record.legacy_tags || record.tags || [],
    featured: Boolean(record.featured),
    relatedTextSlug: record.relatedTextSlug || "",
    relatedWorkSlug: record.relatedWorkSlug || "",
  };
}

export const normaliseArtist = normalizeArtist;
export const normaliseWork = normalizeWork;
export const normaliseText = normalizeText;
export const normaliseJournalEntry = normalizeJournalEntry;
