# UpsetXociety master TODO: updated 01/10/2026

Replaces the "Ordered TODO" of the 19/09/2026 audit in [Progress logs](Progress%20logs.md).
Current state: [Progress report](Progress%20report.md). Method: [Functional site build plan](Functional%20site%20build%20plan.md).

Legend: `[x]` done · `[~]` partly done (the note says what is left) · `[ ]` open · **Decision** = needs your call, not code.
Directus changes are scripts you run yourself (manifest first, then Execute). Nothing here writes to the live CMS automatically.

---

## P0: get the first real record onto the live site

- [ ] **Enable CORS on the Directus Heroku app** (`upset-directus-cms`): `CORS_ENABLED=true`, and `CORS_ORIGIN` set to the
      production site origin plus `http://localhost:5173`. Or proxy `/cms/*` through the frontend host instead.
      Until this is done, no browser can load content from the CMS.
- [ ] Run `public-site-fields.ps1` (Manifest, then Execute). It adds `artists.discipline` and `is_published` on `razz_issues` and `razz_features`. Optional before the next step.
- [ ] Run `public-site-permissions.ps1` (Manifest, then Execute). It grants Public read on published works, artists, texts and journal
      entries, their junction tables, and their images. The expected result is APPLIED - PASS - PARTIALLY VERIFIED.
- [ ] Publish one complete record in Directus: a work with an artist, a thumbnail and a related text, all `is_published = true`.
      Then rerun the permissions verification, which should reach full PASS.
- [ ] Merge `directus-pages` into `main`. **Note:** pushing `main` deploys the site through `.github/workflows/deploy-pages.yml`.
- [ ] Set the GitHub repository variable `VITE_DIRECTUS_URL` (the deploy workflow refuses to build without it).
- [ ] GitHub Pages routing:
  - add a `404.html` fallback (a copy of `index.html`) in the build, so refreshing a detail URL works;
  - **Decision:** custom domain (`upset.live`) or `/Upset.Live/` project path. The second needs the Vite `base` and the router basename set.
- [ ] Confirm GitHub Pages is enabled for the repo (it could not be confirmed from outside).

## P0 (from 19/09): make the prototype coherent. All done

- [x] Repair `ArtistCard.jsx`. It takes props, and lint passes.
- [x] Normalise asset paths. No `/public/` paths remain, mock data is no longer imported, and `/gor.jpeg` appears only in commented-out code.
- [x] Route decision: `/shop` is canonical, with print editions at `/shop/prints` (now implemented).
- [x] `NotFoundPage` and a catch-all route.
- [x] Core routes registered. There are 24 routes now, covering the whole sitemap.
- [x] Footer with working links. It reads socials and the closing statement from `site_settings`, with fallbacks.

## P1: content experience

- [x] Reusable listing and detail templates for artists, works, texts, journal, Razz, vault, shop and commissions.
- [ ] Populate the collective's artist records (Gor, Kanyin, Mofe, Q, Mbana, Rae, Demi) and replace placeholder content
      with approved text and images, in Directus. All current CMS content is mock data.
- [x] Filters and category navigation for works, texts, journal and vault/shop. The works and texts filters are kept in the URL.
- [x] Related-content links (work → artist → text → journal, more in the same category, commission prompts).
      They come from the junction tables and appear once permissions are applied and content is published.
- [x] Loading, empty, error, not-found and "not open yet" states on every data page.
- [x] Responsive safeguards. New pages were checked at mobile width with no horizontal overflow.
- [ ] Copy that needs the collective's words:
  - the commission discipline descriptions;
  - the Ethos statement (publish a Directus text with the slug `ethos` and it replaces the placeholder line);
  - the homepage quote and newsletter text (hardcoded).

## P1: connect Directus safely

- [x] Directus client, queries, media URLs and normalisation layer (`src/lib/`).
- [x] `VITE_DIRECTUS_URL` via env files. The dev proxy avoids needing CORS locally.
- [~] Public permissions policy. The script is prepared and simulated (40/40) but **not run** (see P0).
- [ ] Seed and verify the minimum collections: artists, works, work files, texts, journal, categories, site settings and navigation.
- [x] Replace mock imports. Nothing imports `src/mock/` any more.
- [ ] Test publishing end to end: images, relations, drafts staying hidden, and unpublishing a related record not breaking pages.

## P1: public actions

- [~] Newsletter. Validation, duplicate-submit guard and success/failure states are done. It opens a pre-filled email for now.
      Left: a server-side endpoint (e.g. a Cloudflare Worker) that writes `newsletter_signups`, then set `VITE_FORMS_ENDPOINT`.
- [~] Contact and Commissions forms. Built, with validation, a honeypot and editorial confirmation copy.
      Left: server-side validation, rate limiting, storage (`contact_messages`, `commission_requests`) and email notification
      through that same endpoint.
- [~] Commerce boundary. The code currently offers **Request information only** (no buy buttons), following the build plan.
      **Decision:** confirm this for the first release, or plan reservations or Stripe.

## P2: larger publishing areas

- [x] Razz templates: issues, features, contributors. They show "not open yet" until Razz permissions and publish flags exist.
- [~] Vault item detail with a request-info form. Left: reservation flow (needs server-side inventory locking).
      Provenance stays private by design.
- [~] Shop catalogue and item pages, built on open-public vault items. Left: inventory, payments and order handling.
- [ ] Music players and release/performance pages, where audio assets and licensing are ready.
- [ ] **Decision:** Public access for `vault_items` (rule #11 was removed on purpose), the legacy `files` table (work
      galleries), Razz and `razz_contributors`, `commission_types` and `homepage_blocks`. Each would get its own script, run separately.

## P2: production readiness

- [ ] Automated tests for routes, not-found, normalisers, media URLs and form validation. No test runner exists yet.
- [~] Deploy workflow exists (GitHub Pages on push to `main`). Left: the P0 Pages items above.
- [~] SEO. Per-page document titles are done. Left: meta descriptions, Open Graph/social cards, sitemap and robots rules.
- [ ] Accessibility pass (heading order, focus, reduced motion for the CRT/noise layers, contrast).
- [ ] Performance pass (image sizes, lazy loading, canvas effects on low-power devices). Image transforms are disabled
      in the code until Directus asset transforms are confirmed on.
- [ ] Final content audit: alt text, credits, dates, artist names, social URLs.

## Directus backend: Artist role package

As last recorded on 30/09/2026. Confirm the latest checkpoint before acting.

- [x] S0 inventory; S1–S3 passed; S4 and S5 PASS - PARTIALLY VERIFIED; S6 passed.
- [x] I-75 upload-forgery fix applied and verified (ordinary and forged cases).
- [x] S8a report refreshed (REPORT READY).
- [ ] Run `artist-s8a-report.ps1 -Operation CorrectNotes` (GET-only; prepared, not run).
- [ ] **Decision:** cleanup of the mock fixtures (S8b stays disabled). It needs two separately approved lists, and two file rows are under audit hold.
- [ ] **Decision:** Heroku `FILES_MIME_TYPE_ALLOW_LIST` (Fix 2). Not approved.
- [ ] Revoke the mock Artist account and token once testing ends.

## Housekeeping

- [x] Credentials in the public repo history rotated (confirmed 01/10/2026).
- [ ] Commit your local move of the `Upset.live/Backend` notes. Git shows `Backend.md` and two other notes as deleted, and the
      `Backend/directus/` folder is untracked. This is your call, so I have left it alone.
- [ ] Optional: delete `src/mock/` (unused) and the commented-out old homepage at the top of `HomePage.jsx`.

## Later (from the future notes)

- [ ] Isolated 3D / React Three Fiber rooms, only after the content pipeline and deployment are stable.
- [ ] Community or member features, if ever. These need a real backend, beyond static hosting.
