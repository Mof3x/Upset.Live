# UpsetXociety

The website of UpsetXociety, an independent art house and archive for visual art, music, writing and collective memory.
It's live at **[upset.live](https://upset.live)**.

The site is a React single-page app. Its content comes from a Directus CMS at `cms.upset.live`, where artists and
editors add work, texts, journal entries and more. It is hosted on GitHub Pages and deployed automatically when `main`
changes.

## Documentation

| If you are… | Read |
|---|---|
| A developer setting up or changing the site | This README, then [docs/](docs/README.md) |
| An artist adding your profile, works or texts | [CMS guide](Upset.live/CMS%20guide/CMS%20guide.md) (in the notes vault) |
| An editor publishing and managing content | [CMS guide](Upset.live/CMS%20guide/CMS%20guide.md), then the editor section |
| Deploying, or fixing the live site | [docs/deployment.md](docs/deployment.md) |

Developer docs:

- [Architecture](docs/architecture.md): routes, the site shell, components, styling and the visual effects.
- [Data layer](docs/data-layer.md): how content gets from Directus onto a page, and how to add a new content type.
- [Directus](docs/directus.md): the CMS, its collections, what the public can read, and how CMS changes are made.
- [Deployment and operations](docs/deployment.md): hosting, environment variables, CORS and troubleshooting.
- [Contributing](docs/contributing.md): conventions, checks and the branch workflow.

The `Upset.live/` folder is an Obsidian notes vault: site plans, wireframes, schema notes and progress logs. It
records design intent and history and can lag behind the code. The docs above describe what the code does now.

## Quick start

Requirements: Node.js 22 (the version CI uses) and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

In `.env.local`, set `VITE_DIRECTUS_URL=https://cms.upset.live`. Vite prints the local address, normally
`http://localhost:5173`.

In development, requests to Directus go through a proxy at `/cms`, so you don't need CORS set up for localhost. See
[Deployment and operations](docs/deployment.md#environment-variables) for every variable.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot reload and the `/cms` proxy to Directus. |
| `npm run build` | Builds the production site into `dist/`. |
| `npm run preview` | Serves the built `dist/` locally. |
| `npm run lint` | Runs ESLint over the project. |

There is no test runner. A change is done when `npm run lint` and `npm run build` both pass and you've checked the
affected pages in a browser.

## Stack

- **Frontend:** React 19, React Router 7, Vite 8. Plain JavaScript (JSX), no TypeScript.
- **Visuals:** canvas effects written for the site, `vault66-crt-effect` for the CRT overlay, and OGL/three.js for
  effects that aren't currently mounted.
- **CMS:** Directus 12.1.1 on Heroku. The database is Supabase Postgres and uploaded files are stored in Supabase Storage.
- **Hosting:** GitHub Pages, built and deployed by GitHub Actions (`.github/workflows/deploy-pages.yml`).

## Project layout

```text
src/
  App.jsx            every route, wrapped in the site shell
  main.jsx           React entry point
  index.css          global styles and fonts
  components/
    atmosphere/      noise, glow and dither canvases, WebGL effects
    cards/           WorkCard, ArtistCard, TextCard, EntryCard, VaultItemCard
    forms/           EnquiryForm (config-driven), NewsletterForm
    layout/          SiteShell, Navbar, Footer, CardGrid, PageIntro, PageState
    rails/           RelatedRail (cross-links between records)
    ui/              Prose, MediaFrame, MetaLine, TagList, TextLink, ...
  lib/               Directus client, queries, normalisers, hooks, paths, forms
  pages/             routed pages, grouped by site section
  mock/              old mock content; nothing imports it
public/              files served from the site root
docs/                developer documentation
Upset.live/          notes vault (plans, schema notes, CMS guide)
```

## Status

As of 2 October 2026:

- The site is live at upset.live, with every route from the site plan built.
- Artists, works, texts and the journal show published content from Directus.
- The Razz magazine, Vault and Shop pages are built, but Directus doesn't let the public read those collections
  yet. Until it does, they show a "not open yet" message. Work image galleries and the commission types list are also
  closed; the commissions page uses its built-in list of disciplines instead.
- Forms open a pre-filled email until a server-side form endpoint is set up.
- Nothing on the site sells anything. Vault and Shop items offer "Request information" only.

Day-to-day progress and the to-do list live in the vault: [Progress report](Upset.live/Progress%20report.md) and
[Master TODO](Upset.live/Master%20TODO.md).
