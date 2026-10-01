# UpsetXociety progress report: 01/10/2026 (updated late evening)

Replaces the "Current state" section of the 19/09/2026 audit in [Progress logs](Progress%20logs.md).
To-do items live in [Master TODO](Master%20TODO.md). The step-by-step method is in [Functional site build plan](Functional%20site%20build%20plan.md).

## Summary

The frontend is a complete, Directus-backed site covering the whole sitemap. It lives on the branch `directus-pages`
(7 commits ahead of `main`, not pushed).

**On the Directus side the content pipeline is now open.** Both prepared scripts have been run live:
- the fields script: APPLIED - PASS;
- the Public read permissions: APPLIED - PASS - PARTIALLY VERIFIED.

Anonymous visitors can now read published records, their links and their images, and nothing unpublished.

Three things still stop live content appearing on upset.live:
1. **CORS is off on Directus**, so a browser on the real site cannot read the CMS.
2. **The site is not deployed.** GitHub Pages serves the raw repository files (a blank page), the deploy workflow fails for a
   missing setting, and upset.live is not attached to the repo.
3. **Nothing is published**, and no work is linked to an artist yet (`work_artists` is empty).

The approved go-live plan covers all three. The remaining steps are yours (settings and CMS), plus a merge to `main`
when you say so.

## At a glance

| Area | Status | Notes |
|---|---|---|
| Routes and pages | Done | 24 routes. Home, About, Ethos, Artists, Works, Texts, Journal, Razz, Contributors, Vault, Shop (incl. `/shop/prints`), Commissions, Contact, Newsletter, 404 |
| Data layer (Directus) | Done | Reads published records. Relations come from the junction tables. Shows "not open yet" instead of crashing while access is missing |
| Lint / build | Passing | `npm run lint` and `npm run build`, 01/10/2026 |
| Directus fields | **Applied** | `artists.discipline` created; the Razz `is_published` columns already existed (APPLIED - PASS, 11:17) |
| Directus Public read | **Applied** | 8 writes, APPLIED - PASS - PARTIALLY VERIFIED (21:15). The live manifest matched the offline prediction (`94293BA4…`) |
| Live content on the site | Blocked | CORS off · site not deployed · nothing published (the Public role is now fixed) |
| Deployment | Broken | Pages source is "branch" (serves raw files); the "Deploy site" workflow fails on the missing `VITE_DIRECTUS_URL`; upset.live shows "Site not found". The deep-link fallback is ready (`0e2d40a`) |
| Forms | Partly done | Validation, spam trap and success/failure states work. They open a pre-filled email until a server endpoint exists |
| Commerce | Request-info only | No buy button anywhere. Vault and Shop items offer "Request information" |
| Artist role (Directus) | Mostly done | As last recorded 30/09: S1–S6 passed, S8a report ready, cleanup not authorised |
| Tests | Script simulation only | `sim\run-sim.ps1` 90/90 for the Directus scripts; no frontend test runner |
| Security | Resolved | Credentials in public git history were already rotated (confirmed 01/10/2026) |

## Decisions made (01/10/2026)

- **Live address:** `https://upset.live` (custom domain on GitHub Pages; base path `/`).
- **Public fields:** `works.price`, `artists.year_of_birth` and `artists.is_collective_member` are intentionally public on
  published records. The permissions script keeps exactly those three on their own published-only rules and still blocks
  any other sensitive grant. The site does not request or display them today.
- **First proof:** one mock test record, published briefly to prove the pipeline end to end, then unpublished.
- **Commerce:** request-info only for now (still to confirm for the first release).

## Frontend: what was done

- **Pages.** Every sitemap section has a template that Directus fills. Detail pages cross-link outward (artist ↔ work ↔
  text, more in the same category, commissions).
- **Data.** `src/lib/` reads only published records. Now that the Public role allows the site's fields, its normal
  requests succeed, and the `fields=*` fallback no longer kicks in.
- **Safety.** CMS text is shown as plain paragraphs, so no editor HTML is injected. Forms have a honeypot.
- **Fixes along the way:**
  - filename casing bugs that would have broken a Linux build;
  - a homepage crash when a featured work had no artist;
  - the mobile menu now closes after a tap;
  - the GitHub Pages deep-link fallback (`404.html`).
- **Dev setup.** `npm run dev` proxies `/cms` to Directus, so local work does not need CORS.

## Directus / backend

- **Public read now (run 20261001-211516):**
  - rules #2 works, #1 artists, #7 texts and #9 journal got only the missing site fields. Their `_and` publish filters and
    existing fields are unchanged;
  - new rules #93 `work_artists`, #94 `text_authors` and #95 `text_related_works` let anonymous visitors read only links whose both sides are published;
  - new rule #96 `directus_files` lets them read only images used by published works, artists, texts or journal entries.
- **Verified live in that run:**
  - every site request is permitted;
  - anonymous visitors see exactly the published records (0 today), 0 of 2 `text_authors` rows and 0 of 8 files;
  - an unused file is refused at `/assets`;
  - every other rule and the Public attachment are unchanged.

  Published visibility is BLOCKED until something is published (D11).
- **Data facts from that run:** `work_artists` has 0 rows, `text_related_works` has 0, `text_authors` has 2 and there are 8 files.
  Credits and related-text links only appear once those link rows exist.
- **Prepared, not run:** `public-site-permissions.ps1 -Operation Verify`. It is GET-only and never writes: it checks the rules are still as applied, then
  reruns the anonymous checks. Use it after publishing (expect VERIFIED - PASS) and after unpublishing. The package lives in the session
  scratchpad folder `public-site`, with hashes in its README.
- **Artist role package** (as last recorded 30/09/2026; confirm before acting): S1–S6 passed, I-75 is verified, the S8a report is ready,
  `CorrectNotes` is prepared but not run, S8b cleanup is disabled, and the mock Artist account stays until testing ends.

## Risks found

1. **Exposed credentials: resolved.** The old Supabase and Resend credentials in public git history were already rotated (confirmed 01/10/2026).
2. **Pushing `main` deploys.** Once Pages is switched to "GitHub Actions", every push to `main` publishes the site.
3. **Published means public, including the API.** While the test record is published, its price, year of birth and
   collective-member flag can be read through the API. That is the intended rule, but it is worth remembering for mock data.
4. **Image effects.** The glow and dither canvas effects cannot process cross-origin Directus images. The images still show,
   just without the effect. This can be fixed after CORS is on.

## How this was verified

- lint and build pass (01/10/2026). Every route was opened in a browser against the live CMS through the dev proxy, on desktop and mobile.
- Directus changes come from your live run records:
  - fields run `20261001-111759` (APPLIED - PASS);
  - permissions run `20261001-211516` (APPLIED - PASS - PARTIALLY VERIFIED, every check PASS, nothing failed).
- Read-only checks today:
  - `cms.upset.live` returns no `Access-Control-Allow-Origin`;
  - `mof3x.github.io/Upset.Live/` serves `/src/main.jsx`;
  - `upset.live` returns GitHub's "Site not found";
  - the last "Deploy site" run failed at "Require public Directus URL";
  - anonymous `works?fields=id` is now allowed.
- The Directus scripts pass 90/90 offline checks against a fake Directus.

## Next milestone

Make the test record appear on upset.live, then hide it again:

1. GitHub settings:
   - add the repo variable `VITE_DIRECTUS_URL`;
   - set the Pages source to **GitHub Actions**;
   - set the custom domain to `upset.live` and point its DNS at GitHub Pages.
2. Turn on CORS on Heroku for `https://upset.live`.
3. Merge `directus-pages` into `main`, which deploys the site.
4. Publish one mock work (with thumbnail) and its artist, **create** the work↔artist link, and add one linked text. Run `-Operation Verify`
   (expect VERIFIED - PASS) and check the pages.
5. Unpublish, then run `-Operation Verify` again.
