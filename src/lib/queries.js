import {
  getCollection,
  getItemBySlug,
  getSingleton,
} from "./directus";

// Field names follow the Directus schema (Upset.live/Backend/db schema.md):
// junction tables expose their foreign keys as `artist_id`, `work_id`, `file_id`.
// Every field listed here must be readable by the Public role, otherwise Directus
// rejects the whole request with a 403.
const publishedFilter = { "filter[is_published][_eq]": "true" };

const artistFields = [
  "id",
  "name",
  "slug",
  "bio",
  "portrait_file_id",
  "location",
  "website",
  "instagram",
  "featured",
  "order",
];

const workFields = [
  "id",
  "slug",
  "title",
  "year_start",
  "medium",
  "dimensions",
  "description",
  "thumbnail_file_id",
  "status",
  "category_id.name",
  "category_id.slug",
  "work_artists.role",
  "work_artists.artist_id.name",
  "work_artists.artist_id.slug",
  "work_files.caption",
  "work_files.order",
  "work_files.file_id.id",
  "work_files.file_id.title",
  "work_files.file_id.description",
  "featured",
  "order",
];

const textFields = [
  "id",
  "slug",
  "title",
  "category_id.name",
  "category_id.slug",
  "body",
  "cover_file_id",
  "published_date",
  "featured",
  "text_authors.role",
  "text_authors.artist_id.name",
  "text_authors.artist_id.slug",
  "text_related_works.work_id.slug",
  "text_related_works.work_id.title",
];

const journalFields = [
  "id",
  "slug",
  "title",
  "category_id.name",
  "category_id.slug",
  "body",
  "cover_file_id",
  "published_date",
  "legacy_tags",
  "featured",
];

function collectionOptions(fields, params = {}, requestOptions = {}) {
  return {
    ...requestOptions,
    params: {
      ...requestOptions.params,
      fields: fields.join(","),
      ...params,
    },
  };
}

export function getPublishedArtists(options = {}) {
  return getCollection(
    "artists",
    collectionOptions(
      artistFields,
      { ...publishedFilter, sort: "order,name" },
      options
    )
  );
}

export function getPublishedArtistBySlug(slug, options = {}) {
  return getItemBySlug(
    "artists",
    slug,
    collectionOptions(artistFields, publishedFilter, options)
  );
}

export function getPublishedWorks(options = {}) {
  return getCollection(
    "works",
    collectionOptions(
      workFields,
      { ...publishedFilter, sort: "order,-year_start,title" },
      options
    )
  );
}

export function getPublishedWorksByArtistSlug(artistSlug, options = {}) {
  return getCollection(
    "works",
    collectionOptions(
      workFields,
      {
        ...publishedFilter,
        "filter[work_artists][artist_id][slug][_eq]": artistSlug,
        sort: "order,-year_start,title",
      },
      options
    )
  );
}

export function getPublishedWorkBySlug(slug, options = {}) {
  return getItemBySlug(
    "works",
    slug,
    collectionOptions(workFields, publishedFilter, options)
  );
}

export function getPublishedTexts(options = {}) {
  return getCollection(
    "texts",
    collectionOptions(
      textFields,
      { ...publishedFilter, sort: "-published_date,title" },
      options
    )
  );
}

export function getPublishedTextBySlug(slug, options = {}) {
  return getItemBySlug(
    "texts",
    slug,
    collectionOptions(textFields, publishedFilter, options)
  );
}

export function getPublishedJournalEntries(options = {}) {
  return getCollection(
    "journal",
    collectionOptions(
      journalFields,
      { ...publishedFilter, sort: "-published_date,title" },
      options
    )
  );
}

export function getPublishedJournalEntryBySlug(slug, options = {}) {
  return getItemBySlug(
    "journal",
    slug,
    collectionOptions(journalFields, publishedFilter, options)
  );
}

export function getSiteSettings(options = {}) {
  return getSingleton("site_settings", options);
}

export function getNavigation(options = {}) {
  return getCollection(
    "navigation_items",
    collectionOptions(
      ["id", "label", "slug", "url", "parent_id", "location", "order"],
      { sort: "order,label" },
      options
    )
  );
}
