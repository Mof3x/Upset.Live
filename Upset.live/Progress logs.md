14/07/26
- migrated from digital ocean to directus
- implemented css grid for layout purposes
- cms is working just need to finalise workflows for everyone
- need to make artist pages for everyone
- need to learn directus cms will watch youtube
15/07/2026
- optimized and cleaned table removed duplicates
- confirmed directus supabase connection
- formaluted better plan for the rest of the site
- god forbid one must code fifty (50) pages i have narrowed it down to 8! thank the universe for reusable content god bless react
- 

19/09/2026 - functional site audit

Detailed implementation guide: [Functional site build plan](Functional%20site%20build%20plan.md)

## Current state

> Superseded on 01/10/2026 by [Progress report](Progress%20report.md). Kept below as the 19/09 record.

- The Vite/React frontend builds successfully with `npm run build`.
- The app is still a frontend prototype: content comes from local mock objects, not Directus.
- Only `/` and `/artists/:slug` are registered in `src/App.jsx`.
- The navbar and homepage link to unregistered pages including Works, Texts, Updates, About, Print, Vault, and individual content pages.
- Only the `gor` artist exists in mock data; the remaining collective artist profiles are not populated.
- `Footer.jsx` is empty, so the planned footer navigation, social links, support links, and contact paths are missing.
- The newsletter form prevents its default submit but does not save or send an email address.
- `ArtistCard.jsx` is incomplete and currently fails `npm run lint` because its props and UI imports are undefined.
- Several mock records use inconsistent media paths such as `/public/gor.jpeg`; public assets should be referenced from `/gor.jpeg`.
- The Directus client, API queries, media URL helper, loading states, error states, and environment configuration are not implemented in the frontend.
- The backend notes describe production credentials in documentation. Rotate any credentials that have been committed and move all secrets to deployment environment variables before launch.
- Route decision: `/shop` is the canonical public commerce route; print editions will live at `/shop/prints`. The navbar remains balanced with Works, Texts, Journal on the left and About, Shop, Vault on the right of the logo.

## Definition of functional first release

Visitors can browse the core archive, open an artist/work/text detail page, use the navigation without dead links, submit a newsletter or contact enquiry to a real endpoint, and receive useful loading, empty, not-found, and error states. Editors can publish content in Directus without a frontend code change.

## Ordered TODO

> Superseded on 01/10/2026 by [Master TODO](Master%20TODO.md). Kept below as the 19/09 record.

### P0 - make the existing prototype coherent

- [ ] Repair `ArtistCard.jsx`; add its props and imports, then make `npm run lint` pass.
- [ ] Normalize all asset paths and confirm every referenced image exists.
- [x] Decide the public route name: `/shop` is canonical, with print editions under `/shop/prints`.
- [x] Add a real `NotFoundPage` and route fallback so unknown URLs are handled intentionally.
- [x] Register the core routes: `/about`, `/artists`, `/works`, `/works/:slug`, `/texts`, `/texts/:slug`, `/journal`, `/journal/:slug`, `/vault`, and `/contact`.
- [x] Build the empty `Footer` with working internal and external links.

### P1 - finish the content experience with local data first

- [ ] Create reusable listing/detail templates for artists, works, texts, and journal entries.
- [ ] Populate the collective artist records and replace placeholder titles, excerpts, and images with approved content.
- [x] Add filters or category navigation for Works and Texts.
- [x] Add related-content links so the planned Work -> Artist -> Text -> Journal flow is real.
- [x] Add accessible loading, empty, error, and not-found states to every data-driven page.
- [x] Add responsive/mobile safeguards and a verification matrix for navigation, media frames, forms, and long editorial content.

### P1 - connect Directus safely

- [x] Create `src/lib/directus.js`, query helpers, media URL handling, and a small content normalization layer.
- [x] Add `VITE_DIRECTUS_URL` through environment files and deployment configuration; never commit tokens or database credentials.
- [ ] Apply the Directus public permissions policy to the live instance; the policy, SQL field migration, and verification matrix are documented in `Backend/Directus public permissions.md`.
- [ ] Seed and verify the minimum collections: artists, works, work files, texts, journal, categories, site settings, and navigation.
- [ ] Replace mock imports page by page, keeping a deliberate fallback only for local development if needed.
- [ ] Test publishing, image delivery, relationship fields, drafts, and unpublished content visibility.

### P1 - make public actions real

- [ ] Connect newsletter signup to `newsletter_signups` with validation, duplicate handling, success feedback, and failure feedback.
- [ ] Build the Contact and Commissions forms with server-side validation, spam protection, confirmation states, and email notification handling.
- [ ] Decide the commerce boundary for the first release: enquiry/reservation only, or Stripe checkout; do not present a purchase button until inventory and order handling exist.

### P2 - add the larger publishing areas

- [ ] Add Razz issue, feature, and contributor templates.
- [ ] Add Vault item detail, provenance, availability, and request-info flow.
- [ ] Add Shop/Print catalogue and item pages after inventory and payment rules are settled.
- [ ] Add music players and release/performance pages where audio assets and licensing are ready.

### P2 - production readiness

- [ ] Add automated tests for routes, not-found behavior, forms, and content normalization.
- [ ] Add a production build/deploy workflow and environment-specific Directus configuration.
- [ ] Verify SEO metadata, social previews, sitemap, robots rules, analytics/privacy requirements, and accessible keyboard navigation.
- [ ] Run a final content audit: alt text, credits, permissions, dates, artist names, and external social URLs.

## Recommended next milestone

Complete P0, then ship one complete vertical slice: Directus-backed Works listing -> Work detail -> Artist page -> related Text -> newsletter signup. This proves the content model, routing, media delivery, and primary discovery flow before expanding to Razz, Vault, Shop, and commissions.

30/09/2026 - public site sections + Directus wiring (branch `directus-pages`)

- Added pages from the plan: Ethos, Journal (Directus), Razz issues/features/contributors, Vault + Shop (`/shop/prints` categories), Commissions + discipline briefs, Contact, Newsletter.
- Data layer reads relations from the junction collections (no alias fields needed) and degrades gracefully while Public permissions are incomplete ("not open yet" instead of errors).
- Forms validate and open a pre-filled email until a server-side endpoint exists (`VITE_FORMS_ENDPOINT`); nothing writes to Directus from the browser.
- Found: the live Directus sends no CORS headers, so browsers cannot read it. Dev uses a Vite proxy; production needs `CORS_ENABLED`/`CORS_ORIGIN` on Heroku (not changed).
- Prepared, not run: `public-site-fields.ps1` (artists.discipline, razz is_published) and `public-site-permissions.ps1` (Public read on published content + images), both manifest-first with undo; offline simulation 40/40.
- Still to do: run the Directus package, enable CORS, publish real content, forms endpoint, Vault/Razz/legacy-files permissions.

01/10/2026 - Directus public access applied; go-live plan

- Fields script run live: APPLIED - PASS (`artists.discipline` added).
- Permissions script run live: APPLIED - PASS - PARTIALLY VERIFIED (8 writes; manifest matched the offline prediction). Anonymous visitors can read published records, their links and their images only.
- Decided: live address upset.live; works.price, artists.year_of_birth and artists.is_collective_member are public on published records; first proof is one mock test record, then unpublish.
- Found: GitHub Pages serves the raw repo (blank page); the deploy workflow fails without the `VITE_DIRECTUS_URL` variable; upset.live is not attached to the repo; CORS still off; `work_artists` has no rows yet.
- Added the deep-link fallback to the deploy workflow and a GET-only `-Operation Verify` to the permissions script.
- Full status: [Progress report](Progress%20report.md) · [Master TODO](Master%20TODO.md)
