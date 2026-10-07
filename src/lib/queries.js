import {
  getCollection,
  getItemBySlug,
  getSingleton,
} from "./directus";

// Field names follow the Directus schema (Upset.live/Backend/db schema.md).
//
// Relations are read from the junction collections (work_artists, work_files,
// text_authors, text_related_works, ...) rather than through o2m alias fields
// on works/texts: those aliases do not exist, and adding them through the
// Directus API rebuilds the foreign keys. The junction side already has m2o
// relations, so `artist_id.name` etc. expand normally.
//
// Every public query filters on its publication rule. The Public role in
// Directus must enforce the same rule; the frontend filter is a second layer.

const published = { "filter[is_published][_eq]": "true" };
const openVault = {
  "filter[vault_classification][_eq]": "open_public",
  "filter[status][_neq]": "private",
};

const artistFields = [
  "id",
  "name",
  "slug",
  "discipline",
  "tags",
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
  "year_end",
  "medium",
  "dimensions",
  "description",
  "thumbnail_file_id",
  "status",
  "category_id.name",
  "category_id.slug",
  "featured",
  "order",
];

// Music fields are read in their own request (attachWorkMusic): if they or
// their Public permission are missing, the page shows no player instead of
// losing its main request. Only the work page plays audio.
const workMusicFields = ["id", "audio_file_id", "listen_links"];

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

const razzIssueFields = [
  "id",
  "slug",
  "title",
  "issue_number",
  "cover_file_id",
  "release_date",
  "description",
];

const razzFeatureFields = ["id", "slug", "title", "body", "issue_id"];

const contributorFields = ["id", "slug", "name", "bio", "portrait_file_id"];

const vaultItemFields = [
  "id",
  "slug",
  "title",
  "description",
  "status",
  "edition_number",
  "edition_size",
  "category_id.name",
  "category_id.slug",
];

// Legacy `files` table (work_files, vault_item_files point here, not at directus_files).
const legacyFileFields = ["file_id.id", "file_id.url", "file_id.filename"];

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

function signalOnly(options = {}) {
  return options.signal ? { signal: options.signal } : {};
}

// Secondary data (credits, galleries, related records) must never take a
// page down. Failures resolve to an empty list.
async function optional(promise, label) {
  try {
    const result = await promise;
    return Array.isArray(result) ? result : [];
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    if (import.meta.env.DEV) {
      console.warn(`[directus] ${label} unavailable: ${error.message}`);
    }
    return [];
  }
}

function idsOf(records) {
  return [...new Set(records.map((record) => record?.id).filter(Boolean))];
}

function rawId(value) {
  return value && typeof value === "object" ? value.id : value;
}

function groupBy(rows, key) {
  const groups = new Map();
  rows.forEach((row) => {
    const id = rawId(row?.[key]);
    if (!id) return;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(row);
  });
  return groups;
}

function junctionRows(collection, fields, filter, options, label, sort) {
  return optional(
    getCollection(
      collection,
      collectionOptions(fields, { ...filter, limit: "-1", ...(sort ? { sort } : {}) }, signalOnly(options))
    ),
    label || collection
  );
}

// ---------------------------------------------------------------- artists

export function getPublishedArtists(options = {}) {
  return getCollection(
    "artists",
    collectionOptions(artistFields, { ...published, sort: "order,name" }, options)
  );
}

export function getPublishedArtistBySlug(slug, options = {}) {
  return getItemBySlug("artists", slug, collectionOptions(artistFields, published, options));
}

// ------------------------------------------------------------------ works

async function attachWorkRelations(works, options, { related = false } = {}) {
  const list = (Array.isArray(works) ? works : [works]).filter(Boolean);
  const ids = idsOf(list);
  if (!ids.length) return works;

  const byWork = { "filter[work_id][_in]": ids.join(",") };
  // The gallery (work_files) is only shown on the detail page, so lists don't request it.
  const [credits, files, texts] = await Promise.all([
    junctionRows(
      "work_artists",
      ["work_id", "role", "artist_id.name", "artist_id.slug"],
      byWork,
      options
    ),
    related
      ? junctionRows("work_files", ["work_id", "caption", "order", ...legacyFileFields], byWork, options, "work_files", "order")
      : Promise.resolve([]),
    related
      ? junctionRows(
          "text_related_works",
          ["work_id", "note", "text_id.slug", "text_id.title"],
          byWork,
          options
        )
      : Promise.resolve([]),
  ]);

  const creditsByWork = groupBy(credits, "work_id");
  const filesByWork = groupBy(files, "work_id");
  const textsByWork = groupBy(texts, "work_id");

  list.forEach((work) => {
    work.work_artists = creditsByWork.get(work.id) || [];
    work.work_files = filesByWork.get(work.id) || [];
    work.text_related_works = textsByWork.get(work.id) || [];
  });

  return works;
}

export async function getPublishedWorks(options = {}) {
  const { categorySlug, ids, limit, ...requestOptions } = options;
  const params = { ...published, sort: "order,-year_start,title" };
  if (categorySlug) params["filter[category_id][slug][_eq]"] = categorySlug;
  if (ids) params["filter[id][_in]"] = ids.join(",");
  if (limit) params.limit = String(limit);

  if (ids && !ids.length) return [];

  const works = await getCollection("works", collectionOptions(workFields, params, requestOptions));
  return attachWorkRelations(works || [], requestOptions);
}

export async function getPublishedWorkBySlug(slug, options = {}) {
  const work = await getItemBySlug("works", slug, collectionOptions(workFields, published, options));
  if (!work) return null;
  await Promise.all([attachWorkRelations(work, options, { related: true }), attachWorkMusic(work, options)]);
  return work;
}

async function attachWorkMusic(work, options) {
  const [music] = await optional(
    getCollection(
      "works",
      collectionOptions(workMusicFields, { ...published, "filter[id][_eq]": work.id, limit: "1" }, signalOnly(options))
    ),
    "work music"
  );
  work.audio_file_id = music?.audio_file_id ?? null;
  work.listen_links = music?.listen_links ?? null;
}

export async function getPublishedWorksByArtistSlug(artistSlug, options = {}) {
  const links = await junctionRows(
    "work_artists",
    ["work_id"],
    { "filter[artist_id][slug][_eq]": artistSlug },
    options,
    "artist works"
  );
  const ids = [...new Set(links.map((link) => rawId(link.work_id)).filter(Boolean))];
  return getPublishedWorks({ ...signalOnly(options), ids });
}

// ------------------------------------------------------------------ texts

async function attachTextRelations(texts, options) {
  const list = (Array.isArray(texts) ? texts : [texts]).filter(Boolean);
  const ids = idsOf(list);
  if (!ids.length) return texts;

  const byText = { "filter[text_id][_in]": ids.join(",") };
  const [authors, works] = await Promise.all([
    junctionRows("text_authors", ["text_id", "role", "artist_id.name", "artist_id.slug"], byText, options),
    junctionRows("text_related_works", ["text_id", "note", "work_id.slug", "work_id.title"], byText, options),
  ]);

  const authorsByText = groupBy(authors, "text_id");
  const worksByText = groupBy(works, "text_id");

  list.forEach((text) => {
    text.text_authors = authorsByText.get(text.id) || [];
    text.text_related_works = worksByText.get(text.id) || [];
  });

  return texts;
}

export async function getPublishedTexts(options = {}) {
  const { ids, slug, ...requestOptions } = options;
  const params = { ...published, sort: "-published_date,title" };
  if (ids) params["filter[id][_in]"] = ids.join(",");
  if (slug) params["filter[slug][_eq]"] = slug;
  if (ids && !ids.length) return [];

  const texts = await getCollection("texts", collectionOptions(textFields, params, requestOptions));
  return attachTextRelations(texts || [], requestOptions);
}

export async function getPublishedTextBySlug(slug, options = {}) {
  const text = await getItemBySlug("texts", slug, collectionOptions(textFields, published, options));
  if (!text) return null;
  await attachTextRelations(text, options);
  return text;
}

export async function getPublishedTextsByAuthorSlug(artistSlug, options = {}) {
  const links = await junctionRows(
    "text_authors",
    ["text_id"],
    { "filter[artist_id][slug][_eq]": artistSlug },
    options,
    "artist texts"
  );
  const ids = [...new Set(links.map((link) => rawId(link.text_id)).filter(Boolean))];
  return getPublishedTexts({ ...signalOnly(options), ids });
}

// ---------------------------------------------------------------- journal

export function getPublishedJournalEntries(options = {}) {
  return getCollection(
    "journal",
    collectionOptions(journalFields, { ...published, sort: "-published_date,title" }, options)
  );
}

export function getPublishedJournalEntryBySlug(slug, options = {}) {
  return getItemBySlug("journal", slug, collectionOptions(journalFields, published, options));
}

// ------------------------------------------------------------------- razz

export function getPublishedRazzIssues(options = {}) {
  return getCollection(
    "razz_issues",
    collectionOptions(razzIssueFields, { ...published, sort: "-release_date,title" }, options)
  );
}

export function getPublishedRazzIssueBySlug(slug, options = {}) {
  return getItemBySlug("razz_issues", slug, collectionOptions(razzIssueFields, published, options));
}

async function attachFeatureRelations(features, options) {
  const list = (Array.isArray(features) ? features : [features]).filter(Boolean);
  const ids = idsOf(list);
  if (!ids.length) return features;

  const byFeature = { "filter[feature_id][_in]": ids.join(",") };
  const [contributors, files] = await Promise.all([
    junctionRows(
      "razz_feature_contributors",
      ["feature_id", "role", "contributor_id.name", "contributor_id.slug"],
      byFeature,
      options
    ),
    junctionRows("razz_feature_files", ["feature_id", "order", ...legacyFileFields], byFeature, options, "razz_feature_files", "order"),
  ]);

  const contributorsByFeature = groupBy(contributors, "feature_id");
  const filesByFeature = groupBy(files, "feature_id");

  list.forEach((feature) => {
    feature.razz_feature_contributors = contributorsByFeature.get(feature.id) || [];
    feature.razz_feature_files = filesByFeature.get(feature.id) || [];
  });

  return features;
}

export async function getPublishedRazzFeatures(options = {}) {
  const { issueId, ids, ...requestOptions } = options;
  const params = { ...published, sort: "title" };
  if (issueId) params["filter[issue_id][_eq]"] = issueId;
  if (ids) params["filter[id][_in]"] = ids.join(",");
  if (ids && !ids.length) return [];

  const features = await getCollection(
    "razz_features",
    collectionOptions(razzFeatureFields, params, requestOptions)
  );
  return attachFeatureRelations(features || [], requestOptions);
}

export async function getPublishedRazzFeatureBySlug(slug, options = {}) {
  const feature = await getItemBySlug(
    "razz_features",
    slug,
    collectionOptions(razzFeatureFields, published, options)
  );
  if (!feature) return null;
  await attachFeatureRelations(feature, options);
  return feature;
}

// Contributors have no publication flag in the schema. They are listed only
// through the features they are credited on, so an uncredited contributor
// never appears.
export async function getCreditedContributors(options = {}) {
  const features = await getPublishedRazzFeatures(signalOnly(options));
  const seen = new Map();
  features.forEach((feature) =>
    (feature.razz_feature_contributors || []).forEach((credit) => {
      const contributor = credit.contributor_id;
      if (contributor && typeof contributor === "object" && contributor.slug) {
        seen.set(contributor.slug, contributor);
      }
    })
  );
  if (!seen.size) return [];

  return getCollection(
    "razz_contributors",
    collectionOptions(
      contributorFields,
      { "filter[slug][_in]": [...seen.keys()].join(","), sort: "name" },
      options
    )
  );
}

export async function getContributorWithFeatures(slug, options = {}) {
  const links = await junctionRows(
    "razz_feature_contributors",
    ["feature_id", "role"],
    { "filter[contributor_id][slug][_eq]": slug },
    options,
    "contributor features"
  );
  const ids = [...new Set(links.map((link) => rawId(link.feature_id)).filter(Boolean))];
  const features = await getPublishedRazzFeatures({ ...signalOnly(options), ids });
  if (!features.length) return null;

  const contributor = await getItemBySlug(
    "razz_contributors",
    slug,
    collectionOptions(contributorFields, {}, options)
  );
  if (!contributor) return null;

  return { ...contributor, features };
}

// ------------------------------------------------------------ vault / shop

async function attachVaultRelations(items, options) {
  const list = (Array.isArray(items) ? items : [items]).filter(Boolean);
  const ids = idsOf(list);
  if (!ids.length) return items;

  const byItem = { "filter[vault_item_id][_in]": ids.join(",") };
  const [artists, files] = await Promise.all([
    junctionRows("vault_item_artists", ["vault_item_id", "role", "artist_id.name", "artist_id.slug"], byItem, options),
    junctionRows("vault_item_files", ["vault_item_id", "caption", "order", ...legacyFileFields], byItem, options, "vault_item_files", "order"),
  ]);

  const artistsByItem = groupBy(artists, "vault_item_id");
  const filesByItem = groupBy(files, "vault_item_id");

  list.forEach((item) => {
    item.vault_item_artists = artistsByItem.get(item.id) || [];
    item.vault_item_files = filesByItem.get(item.id) || [];
  });

  return items;
}

export async function getOpenVaultItems(options = {}) {
  const { categorySlugs, ...requestOptions } = options;
  const params = { ...openVault, sort: "title" };
  if (categorySlugs?.length) {
    params["filter[category_id][slug][_in]"] = categorySlugs.join(",");
  }

  const items = await getCollection("vault_items", collectionOptions(vaultItemFields, params, requestOptions));
  return attachVaultRelations(items || [], requestOptions);
}

export async function getOpenVaultItemBySlug(slug, options = {}) {
  const item = await getItemBySlug("vault_items", slug, collectionOptions(vaultItemFields, openVault, options));
  if (!item) return null;
  await attachVaultRelations(item, options);
  return item;
}

export function getVaultCategories(options = {}) {
  return getCollection("vault_categories", collectionOptions(["name", "slug"], { sort: "name" }, options));
}

// ------------------------------------------------------------- commissions

export function getCommissionTypes(options = {}) {
  return getCollection("commission_types", collectionOptions(["name", "slug"], { sort: "name" }, options));
}

// ------------------------------------------------------------------- site

export function getSiteSettings(options = {}) {
  return getSingleton(
    "site_settings",
    collectionOptions(
      [
        "site_title",
        "tagline",
        "footer_statement",
        "social_instagram",
        "social_youtube",
        "social_bandcamp",
        "social_email",
      ],
      {},
      options
    )
  );
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
