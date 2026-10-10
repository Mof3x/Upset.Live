# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (proxies /cms/* to Directus)
npm run build     # production build -> dist/
npm run preview   # serve the built dist/
npm run lint      # eslint . (flat config; dist/ ignored)
```

There is no test runner configured. JavaScript/JSX only, no TypeScript. The build plan (`Upset.live/Functional site build plan.md`) expects `npm run lint` and `npm run build` to pass before a milestone is called done.

## Environment

Copy `.env.example` to `.env.local` and set `VITE_DIRECTUS_URL` (public Directus origin, `https://cms.upset.live`). Vite exposes `VITE_*` vars to the browser, so never put admin tokens or service keys there.

- **Dev proxy.** In `npm run dev`, `src/lib/directus.js` sends requests to `/cms/*`, which `vite.config.js` proxies to `VITE_DIRECTUS_URL`. This exists because the live Directus sends no CORS headers. Set `VITE_DIRECTUS_DEV_PROXY=false` to call Directus directly. Production builds always call `VITE_DIRECTUS_URL` directly, so production needs Directus CORS (`CORS_ENABLED`/`CORS_ORIGIN` on the Heroku app) or a same-origin rewrite at the host.
- **Forms.** `VITE_FORMS_ENDPOINT` (optional) is a server-side endpoint that forms POST JSON to (`<endpoint>/<kind>`). Without it, forms open a pre-filled email to `VITE_CONTACT_EMAIL` (default `hello@upset.live`). Forms must never write to Directus from the browser.
- **Checkout.** `VITE_CHECKOUT_ENDPOINT` (optional) is the checkout Worker in `workers/checkout` (Cloudflare Worker, no dependencies, see its README). Without it, no "Add to basket" buttons and no basket link are shown. The Worker holds the Stripe keys and a Directus token limited to the "Checkout Worker" policy (read open vault items, update `inventory` only); never move those into a `VITE_*` variable. After changing the Worker, run its offline simulation: `node workers/checkout/test/checkout.sim.mjs` (fakes Directus, Stripe and KV; must end "0 failed").

## Directus changes

The CMS (Directus 12.1.1 on Heroku, Supabase Postgres) is live and holds real configuration. Never write to it from here. Changes are prepared as scripts that the user runs. They are GET-only by default and print a manifest with a SHA-256, and writes only happen with `-Mode Execute -ManifestSha`. Do not add o2m alias fields through `PATCH /relations`: in 12.1.1 that call always drops and recreates the foreign key.

## Repository layout

- `src/` is the Vite + React 19 + React Router 7 frontend (the app).
- `workers/checkout/` is the Stripe checkout Worker (deployed separately with `npx wrangler deploy`, not by the Pages workflow). `npm run lint` covers it.
- `docs/` is the developer documentation (architecture, data layer, Directus, deployment, contributing), and `Upset.live/CMS guide/` is the guide for artists and editors. Update both when a change affects what they describe.
- `Upset.live/` is an Obsidian-style notes vault: site plans, wireframes, Directus schema docs (`Backend/`), progress logs. It is not code. Treat it as design intent, since it can lag behind `src/`. `Backend/db schema.md` is the most reliable reference for table and column names.

## Architecture

**Shell and routing.** `src/App.jsx` registers every route from the site plan and wraps them in `components/layout/SiteShell.jsx`. The shell renders a persistent `Noise` layer plus the `vault66-crt-effect` CRT overlay around `Navbar`, the routed content and `Footer`. Atmosphere effects live once in the shell. Keep navigation on `<Link>`, because full reloads restart the canvas effects. `/shop/:slug` is either a shop category (`/shop/prints`) or an item (see `SHOP_CATEGORY_SLUGS` in `pages/VaultPages.jsx`).

**Content pipeline (Directus -> UI).** The data layer lives in `src/lib/`:
1. `directus.js` is a small fetch wrapper over the Directus REST API (no SDK). Query params use bracket syntax (`filter[slug][_eq]`). When Directus refuses a requested *field* (403), a GET retries once with `fields=*` and no sort, which returns only Public-readable fields. Filters are kept, so unpublished records never leak. `isForbiddenError()` identifies 403s.
2. `queries.js` has one function per resource. Every public query applies its publication rule: `is_published = true`, or for vault items `vault_classification = open_public` and `status != private`. **Relations are read from the junction collections** (`work_artists`, `work_files`, `text_authors`, `text_related_works`, `razz_feature_contributors`, `vault_item_artists`, ...) and attached to the parent record under the junction's name, because works and texts have no o2m alias fields. Secondary lookups go through `optional()`, so a failing relation never takes a page down. `work_files`/`vault_item_files`/`razz_feature_files` point at the legacy `files` table, which on the live database has only an `id` column (found 07/10/2026), so those galleries can't show anything; don't build on them. The `*_file_id` columns on works, texts, artists, issues and vault items (`image_file_id`, the item's photo) point at `directus_files` (served via `/assets/:id`).
3. `normalise.js` maps raw records to flat UI shapes. It reads junction rows by their key (`artist_id`, `work_id`, `text_id`, `contributor_id`, `file_id`) and skips rows whose relation did not expand. Body and description fields go through `bodyToParagraphs()`, which parses HTML with `DOMParser` and keeps only text, so editor markup is never injected. Components render paragraphs via `components/ui/Prose`.
4. `useDirectusResource(loader, initialData, normalize, resourceKey)` returns `{ data, status, error }`. Refetches are keyed on `resourceKey`: pass the slug, or `slug:dependency` for loaders that depend on another resource.
5. `resourceState.js`: `gateStatus(...resources)` turns the primary resources into `loading | closed | error | success`. `closed` is a 403, shown as "not open yet". Render it with `components/layout/PageState`. `usePageTitle()` sets `document.title`.

`media.js` builds asset URLs. Don't add transform params unless Directus asset transforms are confirmed enabled.

`paths.js`: build every record link with `recordPath(base, slug)`, never `` `/works/${slug}` ``. It URL-encodes the slug, because editors can enter slugs with spaces or a trailing space, and browsers strip trailing whitespace from raw hrefs.

**Pages** are grouped by section: `CorePages.jsx` (About, Ethos, Artists, Works, Texts), `JournalPages.jsx`, `RazzPages.jsx` (issues, features, contributors), `VaultPages.jsx` (Vault and Shop), `BasketPage.jsx`, `CommissionPages.jsx`, `FormPages.jsx` (Contact, Newsletter), plus `HomePage.jsx` and `ArtistPage.jsx`. The Ethos page renders the published text with slug `ethos` when one exists. Commission disciplines fall back to the site-plan list when `commission_types` is not readable.

**Buying.** Shop and Vault items follow one rule (`normalizeVaultItem`): `buyable` = status `available` + a price + `inventory` > 0; `soldOut` = priced but no stock; no price = enquiry only. `VaultObject` shows `AddToBasket` only when `buyable && checkoutEnabled`, and keeps the enquiry form on every open item. The basket (`lib/basket.js`, `components/basket/BasketProvider` in `SiteShell`) lives in localStorage and stores only slug, quantity, title, image and section; `/basket` (`pages/BasketPage.jsx`) re-checks every line against live Directus data. Limits: 10 lines, 10 per line, the same in the Worker. `lib/checkout.js` POSTs `{ items: [{ slug, quantity }] }` to the Worker and only follows a `https://checkout.stripe.com/` URL. It remembers the open checkout (`upset-checkout-pending-v1`): an unchanged basket goes back to it; a changed one first calls the Worker's `/release`, which asks Stripe to expire it, so a buyer never competes with their own hold. The Worker reads price and stock itself (the browser's price is never trusted), holds each line with a compare-and-set update (all or nothing), and releases holds only from Stripe's `checkout.session.expired` webhook, once per line. Stripe returns buyers to `/order/complete` (not under `/shop/`, which would treat it as a slug), which empties the basket.

**Components.** `atmosphere/` (visual layer), `cards/` (`WorkCard`, `ArtistCard` with `basePath`, `TextCard`, `EntryCard` for editorial lists, `VaultItemCard`), `rails/RelatedRail` (cross-links), `forms/` (`EnquiryForm` is config-driven with validation and a honeypot; `NewsletterForm`), `basket/` (`BasketProvider`, `AddToBasket`), `layout/` and `ui/`. Each component has a co-located `.css` with global BEM-style class names. Shared page styles live in `pages/CorePages.css`. Note that `HomePage.css` sets `form { justify-self: center }` globally.

**Mock data.** `src/mock/*.js` holds leftover mock content. Nothing imports it.

## Notes

- `HomePage.jsx` starts with a large commented-out previous version. The live implementation begins at the first `import`.
- `glowcanvas`/`dithercanvas` load images with `crossOrigin = "anonymous"`. Directus sends `Access-Control-Allow-Origin` for `https://upset.live` (Heroku `CORS_ORIGIN`), so `getImageData` can read them. They skip drawing until the image has loaded and the canvas has a size, and keep the plain image if a canvas is tainted. A new production origin must be added to `CORS_ORIGIN`, or its images will not load in these canvases.
- Every effect canvas needs a CSS size (`width: 100%` + `aspect-ratio`). Redraws set the pixel size to box × `devicePixelRatio`, so an unsized canvas grew on every redraw on phones and froze the page. The components keep their base class when given a `className`, skip unchanged redraws, and pin an unsized canvas, but style new ones explicitly (see `.related-works-grid .work-card__image` in `HomePage.css`). Note that `HomePage.css` is commented out from the `/*` after `.hero-card__content` to the end of the file: put live rules above it, and never add a `/* */` comment inside that region, because its `*/` ends the big comment early and breaks the build.
