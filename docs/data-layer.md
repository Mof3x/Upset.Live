# Data layer

All content comes from the Directus REST API at `VITE_DIRECTUS_URL`. The browser reads it anonymously, with the
permissions of Directus's **Public** role. There is no login on the site, no admin token in the bundle, and the browser
never writes to Directus.

The pipeline lives in `src/lib/`:

```text
directus.js            fetch wrapper: URLs, errors, the 403 field fallback
    ↓
queries.js             one function per resource; publication filters; reads junction tables
    ↓
normalise.js           raw records → flat UI objects; HTML → plain paragraphs
    ↓
useDirectusResource()  React hook: { data, status, error }, refetch on key change
    ↓
resourceState.js       gateStatus() → loading | closed | error | success
    ↓
pages and components
```

## `directus.js`: the client

A small wrapper over `fetch`. There's no Directus SDK.

- **Base URL.** In `npm run dev` the base is `<origin>/cms`, which `vite.config.js` proxies to `VITE_DIRECTUS_URL`.
  Set `VITE_DIRECTUS_DEV_PROXY=false` to call Directus directly. Production builds always call `VITE_DIRECTUS_URL`.
- **Query parameters** use Directus's bracket syntax, e.g. `filter[slug][_eq]=…`, `filter[id][_in]=a,b`, `sort=-published_date`,
  `fields=title,category_id.name`, `limit=-1` (no limit).
- **Errors** become `DirectusRequestError` with `status`, `code`, `url` and the raw `details`. `isForbiddenError()` is
  true for a 403.
- **Field fallback.** Directus rejects the whole request if one requested field isn't readable. When that happens on a
  GET with an explicit field list, `directusRequest()` retries once with `fields=*` and no `sort`. `*` returns only the
  fields the Public role may read, and the filters are kept, so unpublished records still never appear. In
  development it logs a warning. This is a safety net for permission changes, not something to rely on: if you see the
  warning, the Public role is missing a field the site asks for.
- Helpers: `getCollection`, `getItem`, `getItemBySlug` (filter on slug, `limit=1`) and `getSingleton`. `site_settings`
  isn't a real singleton in Directus, so `getSingleton` takes the first row.

## `queries.js`: what the site asks for

One exported function per resource, e.g. `getPublishedWorks`, `getPublishedWorkBySlug`, `getPublishedTextsByAuthorSlug`.
Each one names its fields explicitly (`artistFields`, `workFields`, …) and applies its publication rule.

### Publication rules

| Collection | Rule applied by the site |
|---|---|
| `artists`, `works`, `texts`, `journal`, `razz_issues`, `razz_features` | `is_published = true` |
| `vault_items` | `vault_classification = open_public` and `status != private` |
| `razz_contributors` | No flag. Only contributors credited on a published feature are listed |
| categories, `commission_types`, `site_settings`, `navigation_items` | None (reference data) |

The Public role in Directus enforces the same rules. The frontend filter is a second layer, not the protection: if a
rule is ever missing in Directus, anyone can query the API directly. See [Directus](directus.md#what-the-public-can-read).

### Relations come from the junction tables

Works, texts, features and Vault items have **no one-to-many alias fields** in Directus (adding them through the API
would rebuild foreign keys; see [Directus](directus.md#known-directus-1211-problems)). So the site never asks for
`works.artists`. Instead, after loading the parent records it queries the junction collection, filtered by the parent
ids, and attaches the rows to each parent under the junction's name:

| Parent | Junction (attached as) | Expands |
|---|---|---|
| `works` | `work_artists` | `artist_id.name`, `artist_id.slug`, `role` |
| `works` (detail only) | `work_files` | the legacy `files` row (`file_id.url`), `caption`, `order` (see the note below) |
| `works` (detail only) | `text_related_works` | `text_id.slug`, `text_id.title`, `note` |
| `texts` | `text_authors` | `artist_id.name`, `artist_id.slug`, `role` |
| `texts` | `text_related_works` | `work_id.slug`, `work_id.title`, `note` |
| `razz_features` | `razz_feature_contributors` | `contributor_id.name`, `contributor_id.slug`, `role` |
| `razz_features` | `razz_feature_files` | legacy `files` row, `order` |
| `vault_items` | `vault_item_artists` | `artist_id.name`, `artist_id.slug`, `role` |

Reverse lookups work the same way. An artist's works are found by reading `work_artists` filtered on
`artist_id.slug`, then loading those work ids with the usual publication filter.

Every junction query goes through `optional()`. If it fails (most often a 403), it resolves to `[]` and logs a warning
in development. A missing gallery or credit list never takes a page down.

### Music fields

The work page reads `audio_file_id` and `listen_links` in a request of their own (`attachWorkMusic()`), also through
`optional()`. Listing them in the main request would be fragile: if either field or its Public permission were
missing, Directus would refuse the whole request, and the `fields=*` fallback drops the category name. Instead the page
simply shows no player. Lists don't request them.

### Two kinds of files

| Field | Points at | URL |
|---|---|---|
| `*_file_id` on `works`, `artists`, `texts`, `journal`, `razz_issues`, `razz_contributors`, `vault_items` (thumbnail, portrait, cover; a work's `audio_file_id` recording; a vault item's `image_file_id` photo) | `directus_files` (the Directus file library) | `<VITE_DIRECTUS_URL>/assets/<id>` |
| `file_id` on `work_files`, `razz_feature_files`, `vault_item_files` | the legacy `files` table | that row's `url` column |

**The legacy `files` table is empty of addresses.** On the live database (checked 07/10/2026) it has only an `id`
column: no `url`, no `filename`. Galleries built on `work_files` and `razz_feature_files` therefore stay empty, and
Vault items no longer read `vault_item_files` at all: their photo is `image_file_id`. A future gallery should use the
Directus file library too.

`media.js` builds both. `getMediaUrl()` accepts a file id, an expanded file object or a legacy `{ url }`, and supports
Directus transform parameters (`width`, `quality`, …). **Don't pass transforms** until Directus asset transforms are
confirmed to work on this instance. `getMediaAlt()` uses the file's description or title, then a fallback.

## `normalise.js`: records → UI objects

Each `normalizeX(record)` returns a flat object the components expect (`title`, `slug`, `image`, `imageAlt`,
`paragraphs`, `artists`, …), with defaults for every missing field. Pages and components only ever see normalised
objects.

- **Junction rows** are read by their key (`artist_id`, `work_id`, `text_id`, `contributor_id`, `file_id`). A row whose
  relation didn't expand (a bare id or `null`, usually because the other side is unpublished) is skipped.
- **Body and description fields** go through `bodyToParagraphs()`. The Directus editor may store HTML. It's parsed
  with `DOMParser` (which never runs scripts) and reduced to the text of each paragraph, heading, list item and quote.
  Plain text is split on blank lines. Pages render the result with `components/ui/Prose`, so editor markup is never
  injected into the page. A side effect is that bold, italics and links typed in the editor don't appear on the site.
- **Dates** are formatted in `en-GB` ("2 October 2026"). Work years become `2019` or `2019–2021` from `year_start` and
  `year_end`.
- **Excerpts** are the first paragraph, cut at a word boundary (280 characters by default).
- **Music.** `normalizeWork()` adds `audio` (`{ src, title, artist }` built from `audio_file_id`, or `null`) and
  `listenLinks` (`[{ url, label }]` from the `listen_links` repeater of `{ platform, url }`). Only `http`/`https`
  addresses are kept, so a stored `javascript:` link never becomes a link. The label is the platform's name, or the
  site's host name for "Other".
- **Price and stock.** `normalizeVaultItem()` adds `price` (a number, or `null` when empty, zero or not a number;
  Directus sends numerics as strings such as `"45.00"`), `priceLabel` (`£45.00`), `inventory` (empty counts as 0),
  `buyable` (status `available`, a price and at least one in stock) and `soldOut` (status `available`, a price, no
  stock). The same rule applies in the Shop and the Vault. The query must request both fields, and the Public role
  must be able to read them: a refused field makes the request fall back to `fields=*`, which drops the category and
  empties the Shop.

## `useDirectusResource`: loading in components

```js
const work = useDirectusResource(
  ({ signal }) => getPublishedWorkBySlug(slug, { signal }), // loader
  null,                                                      // initial data
  normalizeWork,                                             // normaliser
  slug                                                       // resource key
);
// work = { data, status: "loading" | "success" | "error", error }
```

- The loader receives an `AbortSignal`. The request is cancelled when the component unmounts or the key changes.
- An array result is normalised item by item; a single record (or `null`) is normalised once.
- **The key controls refetching.** The effect only reruns when `resourceKey` changes, not when the loader function
  changes. Pass the slug for detail pages. For a loader that depends on another resource, combine them:
  `` `${slug}:${categorySlug}` ``. List pages that never change can leave the default key.
- On error, `data` falls back to the initial value, so a list page can still render an empty grid.

## `resourceState.js`: page states

- `gateStatus(...resources)` combines the resources a page can't render without: `loading` if any is loading, then
  `closed` if one failed with a 403, `error` for any other failure, otherwise `success`.
- Render non-success states with `<PageState status={gate} />`. For a detail page whose record came back `null`, use
  `status="notFound"` with a link back to the list.
- `usePageTitle(title)` sets `document.title` to `<title> · UpsetXociety`.

## Links: `paths.js`

Build every link to a record with `recordPath(base, slug)`, never `` `/works/${slug}` ``. It URL-encodes the slug.
Editors can type slugs with spaces or a trailing space, and browsers strip trailing whitespace from a raw `href`, so
an unencoded link can point at the wrong record.

## Forms: `forms.js`

Forms never write to Directus from the browser.

- If `VITE_FORMS_ENDPOINT` is set, `submitForm(kind, values)` POSTs JSON to `<endpoint>/<kind>`. The kinds are
  `contact`, `commission`, `newsletter` and `vault-request`. That endpoint, which doesn't exist yet, should validate,
  rate-limit and store submissions with its own server-side credential.
- If it isn't set, the form builds a `mailto:` link to `VITE_CONTACT_EMAIL` (default `hello@upset.live`) with the
  answers filled in, and the visitor sends it from their own mail app.
- Every form has a hidden honeypot field, `company`. A submission that fills it is silently dropped.

## Basket: `basket.js`

- The basket is kept in the visitor's browser (localStorage key `upset-basket-v1`) by `BasketProvider`, which lives in
  `SiteShell`. `useBasket()` gives `lines`, `count`, `add`, `setQuantity`, `remove` and `clear`. A change in another tab
  is followed through the `storage` event. If storage is blocked, the basket works for the visit but isn't saved.
- A line stores only `slug`, `quantity`, and a `title`, `image` and `section` to show straight away. `cleanLines()`
  drops anything malformed. Limits: `MAX_LINES` 10 and `MAX_QUANTITY` 10, the same as the Worker.
- Prices and stock are never taken from the basket: `/basket` loads the open items again and checks each line
  (unavailable, sold out, fewer left, or fine). The Worker checks a third time.

## Checkout: `checkout.js`

The browser never talks to Stripe's API or writes to Directus.

- `checkoutEnabled` is true when `VITE_CHECKOUT_ENDPOINT` is set. Without it, no basket buttons are shown.
- `startCheckout(lines)` POSTs `{ items: [{ slug, quantity }] }` to `<endpoint>/checkout`. The Worker answers
  `{ url, session, expires_at }`; the browser goes to `url`, but only if it starts with `https://checkout.stripe.com/`.
- The open checkout is remembered (`upset-checkout-pending-v1`) until it expires or the order completes. On `/basket`,
  an unchanged basket goes back to that payment page; a changed basket first calls `releaseCheckout(session)`
  (`POST <endpoint>/release`, which asks Stripe to expire it), so the visitor doesn't compete with their own hold.
- Errors throw a `CheckoutError` with the Worker's code: `sold_out` (409, with `available: { slug: units left }`),
  `not_available` (404, with `unavailable: [slug]`), `too_many_holds` (429), `payment_unavailable` (502),
  `server_error` (500), or `network`. The basket page names the items and updates their quantities.

## Recipe: adding a new content type

For example, to show a new Directus collection `events` on `/events`:

1. **Check the schema.** Confirm the collection and columns in Directus or `Upset.live/Backend/db schema.md`, and decide
   the publication rule (normally an `is_published` boolean, default `false`).
2. **Open it to the public.** The Public role needs read access to exactly the fields the site will request, with the
   same publication filter. This is a change to the live CMS, so it's prepared as a script and run by an admin. See
   [Directus → How CMS changes are made](directus.md#how-cms-changes-are-made). Until then the page will show "not open
   yet", which is fine to develop against.
3. **Query.** In `queries.js`, add a field list and `getPublishedEvents()` / `getPublishedEventBySlug()` using
   `collectionOptions(fields, { ...published, sort: … }, options)`. Read any relations from their junction table with
   `junctionRows()`, as in `attachWorkRelations()`.
4. **Normalise.** Add `normalizeEvent()` to `normalise.js`. Pass body text through `bodyToParagraphs()` and images
   through `getMediaUrl()`/`getMediaAlt()`.
5. **Page.** Add the list and detail components (a new `EventPages.jsx`, or an existing section file). Use
   `useDirectusResource`, `gateStatus`, `PageState`, `usePageTitle`, and the existing cards and `CardGrid`.
6. **Route.** Register both routes in `App.jsx`, and add navigation links in `Navbar.jsx`/`Footer.jsx` if needed.
7. **Links.** Use `recordPath("/events", slug)` everywhere.
8. **Check.** Run `npm run lint` and `npm run build`, then open the pages with `npm run dev` against the live CMS:
   published, unpublished, unknown slug, and a slug with a space.
9. **Document.** Add the route to [Architecture](architecture.md), the collection to [Directus](directus.md), and
   editor instructions to the CMS guide in the vault.
