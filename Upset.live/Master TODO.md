# UpsetXociety master TODO: updated 01/10/2026 (late evening)

Replaces the "Ordered TODO" of the 19/09/2026 audit in [Progress logs](Progress%20logs.md).
Current state: [Progress report](Progress%20report.md). Method: [Functional site build plan](Functional%20site%20build%20plan.md).

Legend: `[x]` done · `[~]` partly done (the note says what is left) · `[ ]` open · **Decision** = needs your call, not code.
Directus, Heroku, GitHub-settings and DNS steps are yours to run. Directus scripts are manifest-first; nothing writes automatically.

---

## P0: get live content onto upset.live (approved go-live plan)

Directus:
- [x] `public-site-fields.ps1`: APPLIED - PASS (run 20261001-111759). `artists.discipline` added.
- [x] `public-site-permissions.ps1`: APPLIED - PASS - PARTIALLY VERIFIED (run 20261001-211516, manifest `94293BA4…`).
      8 writes: rules #2, #1, #7 and #9 got the missing site fields; #93–96 were created for the links and published images.
- [ ] **CORS on the Directus Heroku app:**
      `heroku config:set CORS_ENABLED=true CORS_ORIGIN=https://upset.live,https://www.upset.live --app upset-directus-cms`.
      Localhost is not needed because dev uses the proxy.

Deployment:
- [x] **Decision:** live address `https://upset.live` (custom domain; base path stays `/`).
- [x] SPA fallback for deep links: the deploy workflow copies `index.html` to `404.html` (commit `0e2d40a`).
- [ ] GitHub → Settings → Secrets and variables → Actions → Variables: `VITE_DIRECTUS_URL` = `https://cms.upset.live`.
      The last "Deploy site" run failed without it.
- [ ] GitHub → Settings → Pages → Source: **GitHub Actions**. It is currently "Deploy from a branch", which serves the raw repo
      files, so the page is blank.
- [ ] GitHub → Settings → Pages → Custom domain: `upset.live`, then **Enforce HTTPS** once the certificate is issued.
- [ ] Cloudflare DNS for `upset.live`:
  - A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; optionally a `www` CNAME to `mof3x.github.io`;
  - use "DNS only" if GitHub cannot issue the certificate;
  - use SSL/TLS mode "Full" if you proxy afterwards.
- [ ] Merge `directus-pages` into `main` and push. This deploys the site. Needs your go-ahead.

Test record (decision: publish briefly, then unpublish):
- [ ] In Directus, publish one mock **work** with a thumbnail and its **artist**, and **create** the `work_artists` link between
      them (there are no `work_artists` rows yet). Optionally publish one **text** and link it to the artist (`text_authors`) and the work (`text_related_works`, also empty today).
- [ ] Run `.\public-site-permissions.ps1 -Operation Verify` (GET-only). Expect **VERIFIED - PASS**.
- [ ] Check upset.live: Home shows the work; `/works/<slug>` shows the image, credit and related text; `/artists/<slug>` lists the work; no CORS errors.
- [ ] Unpublish the test records and run `-Operation Verify` again. Expect PARTIALLY VERIFIED, with anonymous visitors seeing 0.

## P0 (from 19/09): make the prototype coherent. All done

- [x] Repair `ArtistCard.jsx`.
- [x] Normalise asset paths; mock data is no longer imported.
- [x] Route decision: `/shop` is canonical, with print editions at `/shop/prints`.
- [x] `NotFoundPage` and a catch-all route.
- [x] Core routes registered (24, covering the whole sitemap).
- [x] Footer with working links (reads `site_settings`, with fallbacks).

## P1: content experience

- [x] Reusable listing and detail templates for artists, works, texts, journal, Razz, vault, shop and commissions.
- [ ] Populate the collective's artist records (Gor, Kanyin, Mofe, Q, Mbana, Rae, Demi) with approved text and images, link
      works to artists (`work_artists`) and texts to works, then publish. All current CMS content is mock data.
- [x] Filters and category navigation (works and texts keep the filter in the URL).
- [x] Related-content links (they come from the junction tables, so they need link rows and published records).
- [x] Loading, empty, error, not-found and "not open yet" states on every data page.
- [x] Responsive safeguards (new pages checked at mobile width).
- [ ] Copy that needs the collective's words:
  - the commission discipline descriptions;
  - the Ethos statement (publish a text with the slug `ethos`);
  - the homepage quote and newsletter text.
- [ ] Optional: show `price` (works) or the artist fields on pages. They are public through the API but not displayed. This is a frontend change.

## P1: connect Directus safely

- [x] Directus client, queries, media URLs and normalisation layer (`src/lib/`).
- [x] `VITE_DIRECTUS_URL` via env files; a dev proxy for local work.
- [x] Public permissions policy applied (see P0). Drafts stay hidden; images are only readable for published records.
- [ ] Seed and verify the minimum collections: artists, works, work files, texts, journal, categories, site settings and navigation.
- [x] Replace mock imports (nothing imports `src/mock/`).
- [ ] Test publishing end to end (covered by the P0 test record).

## P1: public actions

- [~] Newsletter. Client-side validation and states are done; it opens a pre-filled email for now.
      Left: a server-side endpoint that writes `newsletter_signups`, then set `VITE_FORMS_ENDPOINT`.
- [~] Contact and Commissions forms. Built, with validation and a honeypot.
      Left: server-side validation, rate limiting, storage and email notification.
- [~] Commerce: Stripe checkout with stock holds (decided 07/10/2026). Built on branch `shop-checkout`. Left: run the Directus package `shop-checkout` (1a, 1b), deploy the Worker, Stripe setup (live mode, receipts, webhook), set `VITE_CHECKOUT_ENDPOINT`, test with a test item, merge.

## P2: larger publishing areas

- [x] Razz templates (issues, features, contributors). They show "not open yet" until Razz permissions and publish flags are set.
- [~] Vault item detail with request-info and Buy (when priced and in stock). Left: going live (see Commerce). Provenance stays private.
- [~] Shop catalogue and item pages with price, "Sold out" and Buy. Left: going live; later a basket and order records in Directus.
- [ ] Music players and release/performance pages, once audio and licensing are ready.
- [~] Public access for `vault_items`: decided 07/10/2026 (open items, incl. price and stock, and their images); script `shop-public-permissions.ps1` prepared, not run.
- [ ] **Decision:** Public access for the legacy `files` table for work galleries,
      Razz and `razz_contributors`, `commission_types` and `homepage_blocks`. Each would get its own reviewed script.

## P2: production readiness

- [ ] Automated tests for the frontend (routes, not-found, normalisers, media URLs, forms). No test runner yet.
- [~] Deploy workflow builds and publishes on push to `main`. Left: the P0 GitHub and DNS items.
- [~] SEO. Per-page titles are done. Left: meta descriptions, Open Graph, sitemap and robots rules.
- [ ] Accessibility pass (heading order, focus, reduced motion for the CRT/noise layers, contrast).
- [ ] Performance pass (image sizes, lazy loading, canvas effects on low-power devices).
- [ ] After CORS is on: let the glow and dither effects process Directus images (`img.crossOrigin = "anonymous"`).
- [ ] Final content audit: alt text, credits, dates, artist names, social URLs.

## Directus backend: Artist role package

As last recorded on 30/09/2026. Confirm the latest checkpoint before acting.

- [x] S0 inventory; S1–S3 passed; S4 and S5 PASS - PARTIALLY VERIFIED; S6 passed.
- [x] I-75 upload-forgery fix applied and verified.
- [x] S8a report refreshed (REPORT READY).
- [ ] Run `artist-s8a-report.ps1 -Operation CorrectNotes` (GET-only; prepared, not run).
- [ ] **Decision:** cleanup of the mock fixtures (S8b stays disabled; two separately approved lists; two file rows under audit hold).
- [ ] **Decision:** Heroku `FILES_MIME_TYPE_ALLOW_LIST` (Fix 2). Not approved.
- [ ] Revoke the mock Artist account and token once testing ends.

## Housekeeping

- [x] Credentials in the public repo history rotated (confirmed 01/10/2026).
- [ ] Commit your local move of the `Upset.live/Backend` notes (`Backend.md` and two notes show as deleted; `Backend/directus/` is untracked). Your call.
- [ ] Optional: delete `src/mock/` (unused) and the commented-out old homepage at the top of `HomePage.jsx`.

## Later (from the future notes)

- [ ] Isolated 3D / React Three Fiber rooms, only after the content pipeline and deployment are stable.
- [ ] Community or member features, if ever. These need a real backend, beyond static hosting.
