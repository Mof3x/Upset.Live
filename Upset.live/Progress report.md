# UpsetXociety progress report: 01/10/2026

Replaces the "Current state" section of the 19/09/2026 audit in [Progress logs](Progress%20logs.md).
To-do items live in [Master TODO](Master%20TODO.md). The step-by-step method is in [Functional site build plan](Functional%20site%20build%20plan.md).

## Summary

The frontend is now a complete, Directus-backed site with every section from the sitemap. It lives on the branch
`directus-pages`, which is not merged or pushed. It cannot show real content yet, for three reasons outside the code:

1. Directus blocks browsers (no CORS).
2. The Public role cannot read most of what the site needs.
3. Nothing is published.

The fixes for 2 are written and tested offline but not run. The credentials found in the public repository's history
have already been rotated (confirmed 01/10/2026).

## At a glance

| Area | Status | Notes |
|---|---|---|
| Routes and pages | Done | 24 routes. Home, About, Ethos, Artists, Works, Texts, Journal, Razz, Contributors, Vault, Shop (incl. `/shop/prints`), Commissions, Contact, Newsletter, 404 |
| Data layer (Directus) | Done | Reads published records. Relations come from the junction tables. Shows "not open yet" instead of crashing while access is missing |
| Lint / build | Passing | `npm run lint` and `npm run build`, 01/10/2026 |
| Live content on the site | Blocked | No CORS, Public role too narrow, nothing published |
| Forms | Partly done | Validation, spam trap and success/failure states work. They open a pre-filled email until a server endpoint exists. Nothing writes to Directus from the browser |
| Commerce | Request-info only | No buy button anywhere, as the build plan requires. Vault and Shop items offer "Request information" |
| Directus field/permission changes | Prepared, not run | `public-site-fields.ps1`, `public-site-permissions.ps1`, each with undo. Offline simulation 40/40 |
| Artist role (Directus) | Mostly done | As last recorded 30/09: S1–S6 passed (S4 and S5 PARTIALLY VERIFIED), S8a report ready, cleanup not authorised |
| Deployment | Exists, unconfirmed | `.github/workflows/deploy-pages.yml` deploys GitHub Pages on every push to `main` |
| Tests | None | No test runner configured |
| Security | Resolved | Credentials in public git history were already rotated (confirmed 01/10/2026; see below) |

## Frontend: what was done

- **Pages.** Every section of the sitemap now has a template that Directus fills, with no page per record. Detail pages
  cross-link outward (artist ↔ work ↔ text, more in the same category, commissions), following the cross-linking principle.
- **Data.** `src/lib/` reads only published records. If Directus refuses a field, it retries with what is allowed
  rather than failing. Drafts are never shown, because the publish filter is never dropped.
- **Safety.** Body text from the CMS is shown as plain paragraphs, so no editor HTML is injected. Forms have a honeypot and never hold credentials.
- **Fixes along the way.**
  - Two filename casing bugs that would have broken a Linux or GitHub Actions build (`SiteShell`, `TextLink`).
  - A homepage crash when a featured work had no artist.
  - The mobile menu now closes after a tap.
- **Dev setup.** `npm run dev` proxies `/cms` to Directus, so local work does not need CORS.
- **19/09 audit items now closed:**
  - `ArtistCard` is repaired.
  - No `/public/` asset paths remain.
  - Mock data is no longer imported anywhere.
  - Listing and detail templates exist.
  - The footer reads site settings.

## Directus / backend

- **Live checks (anonymous GET requests, 30/09):**
  - The API is up, version 12.1.1.
  - Category lists and site settings are publicly readable.
  - works, artists, texts and journal return nothing, because nothing is published, and `id` and the image fields are refused.
  - The junction tables, files, Razz, Vault and commission types are all refused.
- **Schema gaps:**
  - works and texts have no alias fields for their artists, files or related works. Adding them through Directus 12.1.1
    rebuilds the foreign keys, which goes against decision D12. The site reads the junction tables instead.
  - `artists.discipline` does not exist.
  - Razz has no publish flag. The fields script adds both.
- **Prepared package (not run).** It lives outside the repo, in the session scratchpad folder `public-site`. Both scripts are
  GET-only until run with `-Mode Execute -ManifestSha`. They stop on any unexpected live state, verify every write
  from the full permission list, and check that anonymous visitors see exactly the published records. Those sets are
  computed independently of Directus's own filter, so they would catch the known silent-filter-drop bug. The expected
  live result is **APPLIED - PASS - PARTIALLY VERIFIED**: with nothing published (D11), only the "drafts stay hidden" side can be proven.
- **Artist role package** (as last recorded 30/09/2026; confirm before acting):
  - S1–S6 passed.
  - The I-75 upload-forgery fix is applied and verified.
  - The S8a report is ready, and a notes correction (`CorrectNotes`) is prepared but not run.
  - Cleanup (S8b) is disabled, with audit holds on two file rows.
  - The mock Artist account stays until testing ends.

## Risks found

1. **Exposed credentials: resolved.** Repo `Mof3x/Upset.Live` is public. `Upset.live/Backend/Backend.md` (commits `96820f1`,
   `cb5acab`) contains old Supabase database, storage and Resend email credentials. They were already rotated (confirmed
   01/10/2026). The old values stay in the git history but no longer work. No script has checked the rotation.
2. **Pushing `main` deploys.** The Pages workflow builds on every push to `main` and needs the repo variable `VITE_DIRECTUS_URL`.
3. **Deep links on GitHub Pages.** The site uses client-side routes, and Pages returns 404 when a detail URL is refreshed
   unless a `404.html` fallback is added. The asset base path also depends on whether the site is served at the custom
   domain or at `/Upset.Live/`.
4. **Image effects.** The glow and dither canvas effects cannot process Directus images from another origin without CORS.
   The images still show, just without the effect.

## How this was verified

- lint and build pass (01/10/2026).
- Every route was opened in a browser against the live CMS through the dev proxy, on desktop and mobile, with no console errors from the app and no horizontal overflow.
- Live API state was checked with anonymous and field-by-field GET requests only.
- The repository's visibility comes from the public GitHub API. The credential check printed masked shapes only, never values.
- The Directus scripts ran against a fake Directus with no network access: 40 of 40 checks pass. The simulation caught two real script bugs, both fixed.

## Next milestone

Make one record appear on the live site end to end:

1. Enable CORS.
2. Run the permissions script.
3. Publish one work with an artist, an image and a related text.
4. Confirm it renders.

That turns PARTIALLY VERIFIED into PASS and proves the whole pipeline.
