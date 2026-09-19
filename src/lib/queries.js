import {
  getCollection,
  getItemBySlug,
  getSingleton,
} from "./directus";

const commonFields = ["id", "slug", "title", "year", "created_at", "updated_at"];
const publishedFilter = { "filter[is_published][_eq]": "true" };

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
      [
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
        "works.*",
      ],
      { ...publishedFilter, sort: "order,name" },
      options
    )
  );
}

export function getPublishedArtistBySlug(slug, options = {}) {
  return getItemBySlug(
    "artists",
    slug,
    collectionOptions(
      [
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
        "works.*",
      ],
      publishedFilter,
      options
    )
  );
}

export function getPublishedWorks(options = {}) {
  return getCollection(
    "works",
    collectionOptions(
      [
        ...commonFields,
        "medium",
        "dimensions",
        "description",
        "thumbnail_file_id",
        "category_id.*",
        "work_artists.artist.*",
        "work_artists.role",
        "work_files.*",
        "featured",
        "order",
      ],
      { ...publishedFilter, sort: "order,-year,title" },
      options
    )
  );
}

export function getPublishedWorkBySlug(slug, options = {}) {
  return getItemBySlug(
    "works",
    slug,
    collectionOptions(
      [
        ...commonFields,
        "medium",
        "dimensions",
        "description",
        "thumbnail_file_id",
        "category_id.*",
        "work_artists.artist.*",
        "work_artists.role",
        "work_files.*",
        "featured",
        "order",
      ],
      publishedFilter,
      options
    )
  );
}

export function getPublishedTexts(options = {}) {
  return getCollection(
    "texts",
    collectionOptions(
      [
        ...commonFields,
        "type",
        "category_id.*",
        "body",
        "cover_file_id",
        "published_date",
        "featured",
        "text_authors.artist.*",
        "text_authors.role",
        "text_related_works.work.*",
      ],
      { ...publishedFilter, sort: "-published_date,title" },
      options
    )
  );
}

export function getPublishedTextBySlug(slug, options = {}) {
  return getItemBySlug(
    "texts",
    slug,
    collectionOptions(
      [
        ...commonFields,
        "type",
        "category_id.*",
        "body",
        "cover_file_id",
        "published_date",
        "featured",
        "text_authors.artist.*",
        "text_authors.role",
        "text_related_works.work.*",
      ],
      publishedFilter,
      options
    )
  );
}

export function getPublishedJournalEntries(options = {}) {
  return getCollection(
    "journal",
    collectionOptions(
      [
        ...commonFields,
        "category_id.*",
        "body",
        "cover_file_id",
        "published_date",
        "legacy_tags",
        "featured",
      ],
      { sort: "-published_date,title" },
      options
    )
  );
}

export function getPublishedJournalEntryBySlug(slug, options = {}) {
  return getItemBySlug(
    "journal",
    slug,
    collectionOptions(
      [
        ...commonFields,
        "category_id.*",
        "body",
        "cover_file_id",
        "published_date",
        "legacy_tags",
        "featured",
      ],
      {},
      options
    )
  );
}

export function getSiteSettings(options = {}) {
  return getSingleton("site_settings", options);
}

export function getNavigation(options = {}) {
  return getCollection(
    "navigation_items",
    collectionOptions(
      ["id", "label", "slug", "url", "parent_id", "location", "sort"],
      { sort: "sort,label" },
      options
    )
  );
}
