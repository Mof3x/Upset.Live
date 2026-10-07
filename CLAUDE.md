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

## Directus changes

The CMS (Directus 12.1.1 on Heroku, Supabase Postgres) is live and holds real configuration. Never write to it from here. Changes are prepared as scripts that the user runs. They are GET-only by default and print a manifest with a SHA-256, and writes only happen with `-Mode Execute -ManifestSha`. Do not add o2m alias fields through `PATCH /relations`: in 12.1.1 that call always drops and recreates the foreign key.

## Repository layout

- `src/` is the Vite + React 19 + React Router 7 frontend (the app).
- `docs/` is the developer documentation (architecture, data layer, Directus, deployment, contributing), and `Upset.live/CMS guide/` is the guide for artists and editors. Update both when a change affects what they describe.
- `Upset.live/` is an Obsidian-style notes vault: site plans, wireframes, Directus schema docs (`Backend/`), progress logs. It is not code. Treat it as design intent, since it can lag behind `src/`. `Backend/db schema.md` is the most reliable reference for table and column names.

## Architecture

**Shell and routing.** `src/App.jsx` registers every route from the site plan and wraps them in `components/layout/SiteShell.jsx`. The shell renders a persistent `Noise` layer plus the `vault66-crt-effect` CRT overlay around `Navbar`, the routed content and `Footer`. Atmosphere effects live once in the shell. Keep navigation on `<Link>`, because full reloads restart the canvas effects. `/shop/:slug` is either a shop category (`/shop/prints`) or an item (see `SHOP_CATEGORY_SLUGS` in `pages/VaultPages.jsx`).

**Content pipeline (Directus -> UI).** The data layer lives in `src/lib/`:
1. `directus.js` is a small fetch wrapper over the Directus REST API (no SDK). Query params use bracket syntax (`filter[slug][_eq]`). When Directus refuses a requested *field* (403), a GET retries once with `fields=*` and no sort, which returns only Public-readable fields. Filters are kept, so unpublished records never leak. `isForbiddenError()` identifies 403s.
2. `queries.js` has one function per resource. Every public query applies its publication rule: `is_published = true`, or for vault items `vault_classification = open_public` and `status != private`. **Relations are read from the junction collections** (`work_artists`, `work_files`, `text_authors`, `text_related_works`, `razz_feature_contributors`, `vault_item_artists`, ...) and attached to the parent record under the junction's name, because works and texts have no o2m alias fields. Secondary lookups go through `optional()`, so a failing relation never takes a page down. `work_files`/`vault_item_files`/`razz_feature_files` point at the legacy `files` table (use its `url`). The `*_file_id` columns on works, texts, artists and issues point at `directus_files` (served via `/assets/:id`).
3. `normalise.js` maps raw records to flat UI shapes. It reads junction rows by their key (`artist_id`, `work_id`, `text_id`, `contributor_id`, `file_id`) and skips rows whose relation did not expand. Body and description fields go through `bodyToParagraphs()`, which parses HTML with `DOMParser` and keeps only text, so editor markup is never injected. Components render paragraphs via `components/ui/Prose`.
4. `useDirectusResource(loader, initialData, normalize, resourceKey)` returns `{ data, status, error }`. Refetches are keyed on `resourceKey`: pass the slug, or `slug:dependency` for loaders that depend on another resource.
5. `resourceState.js`: `gateStatus(...resources)` turns the primary resources into `loading | closed | error | success`. `closed` is a 403, shown as "not open yet". Render it with `components/layout/PageState`. `usePageTitle()` sets `document.title`.

`media.js` builds asset URLs. Don't add transform params unless Directus asset transforms are confirmed enabled.

`paths.js`: build every record link with `recordPath(base, slug)`, never `` `/works/${slug}` ``. It URL-encodes the slug, because editors can enter slugs with spaces or a trailing space, and browsers strip trailing whitespace from raw hrefs.

**Pages** are grouped by section: `CorePages.jsx` (About, Ethos, Artists, Works, Texts), `JournalPages.jsx`, `RazzPages.jsx` (issues, features, contributors), `VaultPages.jsx` (Vault and Shop), `CommissionPages.jsx`, `FormPages.jsx` (Contact, Newsletter), plus `HomePage.jsx` and `ArtistPage.jsx`. The Ethos page renders the published text with slug `ethos` when one exists. Commission disciplines fall back to the site-plan list when `commission_types` is not readable. No page shows a purchase action: Vault and Shop items offer "Request information" only, per the build plan.

**Components.** `atmosphere/` (visual layer), `cards/` (`WorkCard`, `ArtistCard` with `basePath`, `TextCard`, `EntryCard` for editorial lists, `VaultItemCard`), `rails/RelatedRail` (cross-links), `forms/` (`EnquiryForm` is config-driven with validation and a honeypot; `NewsletterForm`), `layout/` and `ui/`. Each component has a co-located `.css` with global BEM-style class names. Shared page styles live in `pages/CorePages.css`. Note that `HomePage.css` sets `form { justify-self: center }` globally.

**Mock data.** `src/mock/*.js` holds leftover mock content. Nothing imports it.

## Notes

- `HomePage.jsx` starts with a large commented-out previous version. The live implementation begins at the first `import`.
- `glowcanvas`/`dithercanvas` load images with `crossOrigin = "anonymous"`. Directus sends `Access-Control-Allow-Origin` for `https://upset.live` (Heroku `CORS_ORIGIN`), so `getImageData` can read them. They skip drawing until the image has loaded and the canvas has a size, and keep the plain image if a canvas is tainted. A new production origin must be added to `CORS_ORIGIN`, or its images will not load in these canvases.
