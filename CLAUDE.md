# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build -> dist/
npm run preview   # serve the built dist/
npm run lint      # eslint . (flat config; dist/ ignored)
```

There is no test runner configured. JavaScript/JSX only, no TypeScript.

## Environment

Copy `.env.example` to `.env.local` and set `VITE_DIRECTUS_URL` (public Directus origin, e.g. `https://cms.upset.live`). Vite exposes `VITE_*` vars to the browser, so never put admin tokens or service keys there. The frontend only reads public content, so Directus's Public role needs read permission on each collection it queries.

## Repository layout

- `src/` is the Vite + React 19 + React Router 7 frontend (the app).
- `Upset.live/` is an Obsidian-style notes vault: site plans, wireframes, Directus schema docs (`Backend/`), progress logs. It is not code. Treat it as design intent, since it can lag behind `src/`. For example, `Frontend/Frontend Architecture - react router migration.md` proposes the `@directus/sdk` and `mockContent.js`, but the app actually uses a hand-rolled fetch client and has no mock layer.
- `Upset.live/Backend/directus/` holds Directus schema and permission notes (currently untracked in git).

## Architecture

**Shell and routing.** `src/App.jsx` wraps every route in `components/layout/Siteshell.jsx`. The shell renders a persistent `Noise` layer plus the `vault66-crt-effect` CRT overlay (scanlines, sweep, glow) around `Navbar`, the routed content and `Footer`. Atmosphere effects live once in the shell, not per page. Keep navigation on `<Link>`/`NavLink`, because full reloads restart the canvas effects. Note the file is `Siteshell.jsx` but is imported as `./SiteShell`, which only resolves on case-insensitive filesystems (Windows). Watch this on Linux CI or deploys.

**Content pipeline (Directus -> UI).** Data flows through four layers in `src/lib/`:
1. `directus.js` is a small fetch wrapper over the Directus REST API (`/items/:collection`). It provides `getCollection`, `getItem`, `getItemBySlug`, `getSingleton` and a `DirectusRequestError`. It does not use the Directus SDK. Query params use Directus bracket syntax (`filter[slug][_eq]`).
2. `queries.js` has one function per resource (`getPublishedWorks`, `getPublishedArtistBySlug`, ...). Each declares its `fields` list, the `is_published` filter and the sort. Add new fields here first.
3. `normalise.js` maps raw Directus records (with nested M2M junctions like `work_artists.artist`, `text_authors.artist`, `work_files`) to flat UI shapes (`normalizeWork`, `normalizeArtist`, `normalizeText`, `normalizeJournalEntry`). Components consume only the normalised shape, never raw records. It tolerates several alias field names per property. Both `normalize*` and `normalise*` spellings are exported.
4. `useDirectusResource(loader, initialData, normalize, resourceKey)` is the data hook. It returns `{ data, status: "loading" | "success" | "error", error }`, aborts on unmount, and normalises arrays item by item. Refetches are keyed on `resourceKey`, so pass the slug when the loader depends on a route param. Changing the `loader` alone does not refetch.

`media.js` builds `/assets/:id` URLs (with optional width/height/quality/fit/format transforms) and alt text from Directus file objects or ids. Always go through it rather than hand-building asset URLs.

**Pages.** `pages/HomePage.jsx` and `ArtistPage.jsx` are standalone. The other routes (`/about`, `/artists`, `/works[/:slug]`, `/texts[/:slug]`, `/journal[/:slug]`, `/vault`, `/contact`) are all exported from `pages/CorePages.jsx`. Render states use `components/ui/ContentState` (`loading` / `error` / `empty`). Some pages cross-reference works and texts by slug client-side, for example related works and texts.

**Components.** `components/atmosphere/` is the visual layer (Galaxy, Noise, Particles, `glowcanvas`/`dithercanvas` image effects). `cards/` and `ui/` are reusable content components. `layout/` has Navbar, Footer, SiteShell and CardGrid. Each component has a co-located `.css` file with global BEM-style class names, plus `src/index.css` for global styles and fonts.

**Mock data.** `src/mock/*.js` holds leftover mock content. Nothing imports it now that pages query Directus.

## Notes

- `HomePage.jsx` starts with a large commented-out previous version. The live implementation begins at the `import { Link }` after it.
- The Directus CMS is a separate deployment (cms.upset.live) and is not in this repo.
