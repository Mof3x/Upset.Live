# UpsetXociety

UpsetXociety is a React-based art-house archive interface. It presents artists,
visual work, editorial material, and archive-style navigation through a CRT-inspired
visual language. The current implementation is a frontend prototype: content is
stored in local JavaScript objects and there is no backend, CMS, authentication, or
newsletter service connected yet.

## Contents

- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Current routes](#current-routes)
- [Application architecture](#application-architecture)
- [Content model](#content-model)
- [Visual systems](#visual-systems)
- [Assets and media](#assets-and-media)
- [Adding content](#adding-content)
- [Project conventions](#project-conventions)
- [Known limitations](#known-limitations)

## Getting started

### Requirements

- Node.js and npm compatible with the installed Vite version
- A modern browser with Canvas support

### Install and run

From the project root:

```bash
npm install
npm run dev
```

Vite prints the local development URL, normally `http://localhost:5173`.

To create and preview a production build:

```bash
npm run build
npm run preview
```

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Build the application for production in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the project. |

There are currently no automated unit, integration, or end-to-end tests.

## Directus environment

The browser only needs the public Directus API origin:

```bash
copy .env.example .env.local
```

Set `VITE_DIRECTUS_URL` in `.env.local` to the public CMS URL. Files ending in
`.local` are ignored by Git. Never put Directus admin tokens, database
connection strings, Supabase service keys, or payment secrets in a `VITE_`
variable because Vite exposes those values to the browser bundle.

The GitHub Pages workflow in `.github/workflows/deploy-pages.yml` reads the same
value from the repository variable `VITE_DIRECTUS_URL`. Configure it under
**Repository Settings -> Secrets and variables -> Actions -> Variables**, then
enable GitHub Pages with **GitHub Actions** as the source. The workflow fails
before building if the public URL variable is missing.

## Current routes

The core routes registered in `src/App.jsx` are:

| Route | Component | Behavior |
| --- | --- | --- |
| `/` | `HomePage` | Hero, quote, featured work, related works, and newsletter UI. |
| `/about` | `AboutPage` | Collective introduction and archive context. |
| `/artists` | `ArtistsPage` | Artist index from local mock data. |
| `/artists/:slug` | `ArtistPage` | Artist profile resolved from the local `artists` object. |
| `/works` | `WorksPage` | Works index from local mock data. |
| `/works/:slug` | `WorkPage` | Work detail resolved by slug. |
| `/texts` | `TextsPage` | Text index from local mock data. |
| `/texts/:slug` | `TextPage` | Text detail resolved by slug. |
| `/journal` | `JournalPage` | Journal index with starter local content. |
| `/journal/:slug` | `JournalPostPage` | Journal detail resolved by slug. |
| `/vault` | `VaultPage` | Vault introduction and future archive entry point. |
| `/contact` | `ContactPage` | Contact form with local success state. |
| `*` | `NotFoundPage` | Intentional recovery page for unknown URLs. |

The artist profile currently available in mock data is `/artists/gor`.
Unknown artist slugs render an `Artist not found` state. Unknown routes render
the shared `NotFoundPage` with links back to Home and Works.

The Shop routes remain the next commerce milestone: `/shop` and
`/shop/prints` are documented navigation targets but are not registered yet.

`/shop` is the canonical public commerce route. Print editions are a Shop
category at `/shop/prints`, alongside publications, posters, apparel, and music.

## Application architecture

The startup path is:

1. `src/main.jsx` mounts React in `StrictMode` and imports global styles.
2. `src/App.jsx` creates the `BrowserRouter`, declares routes, and wraps them in
   `SiteShell`.
3. `src/components/layout/SiteShell.jsx` adds the shared navbar, animated noise,
   CRT effect, and page content container.
4. Page components compose reusable cards and UI primitives with local mock data.

The Directus integration boundary lives in `src/lib/`. Copy `.env.example` to
`.env.local` and set `VITE_DIRECTUS_URL` when the public Directus API is ready.
The query helpers are intentionally separate from the pages so mock data can be
replaced with CMS data one collection at a time.

### Directory guide

```text
src/
  App.jsx                 Router and application composition
  main.jsx                React entry point
  index.css               Global layout, typography, and theme styles
  components/
    atmosphere/           Canvas, WebGL, CRT, noise, and image treatments
    cards/                Work, artist, and text presentation components
    layout/               Navbar, shell, footer, and card grid components
    ui/                   Media frames, metadata, tags, headings, and links
  mock/                   Local homepage, artist, work, and text content
  lib/                    Directus client, queries, media URLs, and normalizers
  pages/                  Routed page components and page-specific CSS
  assets/                 Source assets such as fonts
public/                   Root-served static assets
```

The `components` folders are organized by responsibility. New routed screens
belong in `src/pages`; reusable presentation belongs in `src/components`; and
content should remain separate from rendering code in `src/mock` until a data
service is introduced.

## Content model

### Homepage

`src/mock/homepage.js` exports one `homepage` object containing:

- `hero`: `title`, `subtitle`, `image`, `imageAlt`, `href`, and `ctaLabel`
- `quote`: `text` and `attribution`
- `featuredWork`: title, image, excerpt, destination, and an embedded artist summary
- `relatedWorks`: cards with `id`, `title`, `type`, image data, and `href`
- `newsletter`: title, body, placeholder, and button label

`HomePage.jsx` destructures this object and passes each section into small local
card components. To change homepage copy or imagery, edit the mock object rather
than the JSX structure.

### Artists

`src/mock/artists.js` exports `artists`, an object keyed by URL slug. Each artist
record contains:

```js
{
  slug,
  name,
  discipline,
  location,
  image,
  imageAlt,
  bio: ["paragraph", "paragraph"],
  tags: ["Tag"],
  links: { instagram },
  works: [/* work records */]
}
```

`ArtistPage` uses `useParams()` to look up `artists[slug]`. A new artist becomes
reachable automatically once its slug is added to this object, provided its image
and work data are valid.

### Works and texts

`src/mock/works.js` and `src/mock/texts.js` define the intended archive records.
Work records use `slug`, `title`, `image`, `imageAlt`, `artist`, `type`, `year`,
`excerpt`, and `tags`. Text records use `slug`, `title`, `type`, `category`,
`year`, `excerpt`, `author`, `tags`, and `relatedWorkSlugs`.

These arrays are not currently consumed by a listing or detail route. They are the
starting point for implementing the missing works and texts sections.

## Visual systems

- `Noise` continuously paints a canvas texture behind the application.
- `vault66-crt-effect` supplies scanlines, sweep, glow, and edge glow through
  `SiteShell`.
- `GlowCanvas` applies image glow, grayscale treatment, scanlines, edge diffusion,
  and selective color restoration.
- `DitherCanvas` applies a green monochrome Bayer-style dither treatment with
  scanlines and edge diffusion.
- `Galaxy` and `Particles` provide OGL/WebGL atmosphere components, but they are
  not mounted by the current application shell.
- `edgeDiffuse.js` contains the shared canvas edge-diffusion helper.

These effects are presentation layers. Keep content meaning and routing in page
components rather than coupling them to canvas code.

The `musicPlayerY2k` component contains playlist controls, but it is not mounted
and currently expects audio files under `/music/` that are not present in `public/`.

## Assets and media

Files in `public/` are served from the site root. Reference them like this:

```jsx
<img src="/gor.jpeg" alt="Description" />
```

Do not include `/public` in the browser URL. Existing data contains both valid
root-relative paths such as `/gor.jpeg` and stale paths such as `/public/gor.jpeg`.
When adding or correcting content, use the root-relative form.

Source assets that require bundling belong in `src/assets`. Public, directly
addressable images, audio, and icons belong in `public/`. Every image should have
meaningful `alt` text; decorative canvas effects should remain separate from the
semantic content image.

## Adding content

### Add an artist

1. Add a slug-keyed record to `src/mock/artists.js`.
2. Place the image in `public/` and reference it as `/<filename>`.
3. Add complete `imageAlt`, biography, tags, and external links.
4. Add work records under the artist's `works` array.
5. Visit `/artists/<slug>` and run the lint and build checks.

### Add a new page

1. Create a page component in `src/pages` with its page-specific stylesheet.
2. Import the component in `src/App.jsx`.
3. Add a `Route` entry inside the existing `Routes` block.
4. Update navigation or card links only after the route exists.
5. Keep data in `src/mock` and use existing primitives such as `WorkCard`,
   `SectionHeading`, `MediaFrame`, `MetaLine`, and `TagList` where appropriate.

### Connect the newsletter

`HomePage.jsx` currently prevents the newsletter form's default submission and
contains a placeholder comment for a future `newsletter_signups` endpoint. A real
implementation should add loading, success, and error states, validate the API
response, and avoid logging submitted email addresses.

## Project conventions

- Use React function components and hooks.
- Use React Router `Link` for internal navigation and regular anchors for external
  destinations.
- Keep reusable UI behavior in `src/components` and page composition in `src/pages`.
- Preserve accessible labels and `aria-expanded`/`aria-controls` behavior in the
  responsive navbar.
- Keep asset paths root-relative when the asset is in `public/`.
- Run `npm run lint` and `npm run build` before considering a change complete.

## Known limitations

- The works, texts, updates, about, print, vault, and journal pages are not routed.
- Several mock records use placeholder copy and repeated imagery.
- `works.js` references `/images/night-study.jpg`, but that file is not currently
  present in `public/`.
- Some artist image paths still incorrectly include `/public`.
- Newsletter submission has no persistence or backend request.
- `Footer.jsx` is empty and is not part of the visible shell.
- `ArtistCard.jsx` is an older unused implementation; homepage artist rendering is
  currently local to `HomePage.jsx`.
- The font files under `src/assets/fonts` are not explicitly registered with
  `@font-face`.
- Canvas effects can be expensive on low-powered devices, especially the animated
  noise layer.
- No automated test suite is configured.

