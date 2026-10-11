# Directus

## The setup

| Part | Where |
|---|---|
| Directus 12.1.1 (API and admin app) | `https://cms.upset.live`, admin at `https://cms.upset.live/admin`, hosted on Heroku |
| Database | Supabase Postgres |
| Uploaded files | Supabase Storage, in a private bucket. Files are served only through Directus `/assets/<id>`, which checks permissions |
| Public site access | Directus's **Public** role (anonymous, read-only) |

The live instance holds real configuration. **Never change it from a development machine or a script you haven't had
reviewed.** See [How CMS changes are made](#how-cms-changes-are-made).

## Collections

`Upset.live/Backend/db schema.md` lists every column. This table shows what each collection is for.

| Collection | Powers | Publication rule | Notes |
|---|---|---|---|
| `artists` | `/artists`, artist pages, credits | `is_published` | `owner_user_id` links a profile to a Directus user. `discipline` and `tags` were added in Oct 2026 |
| `works` | `/works`, homepage, artist pages | `is_published` | `status` is **availability** (available, reserved, sold, archived), not visibility. `year_start`/`year_end` replace the old text `year`. Music (6 Oct 2026): `audio_file_id` (a recording; File field, relation to `directus_files` with ON DELETE SET NULL) and `listen_links` (repeater of platform + link) |
| `work_categories` | Works filter, commission examples | none | Slugs used in code: `paintings`, `3d-modelling`, `performances` |
| `work_artists` | Work credits, artist → works | follows both sides | `role` is shown as "Role: Name" |
| `work_files` | Work gallery (detail page) | follows the work | Points at the legacy `files` table |
| `works_related` | Not used by the site yet | | |
| `texts`, `text_categories` | `/texts`, Ethos page (slug `ethos`) | `is_published` | |
| `text_authors` | Text authors, artist → texts | follows both sides | |
| `text_related_works` | Text ↔ work links | follows both sides | `note` is shown with the link |
| `journal`, `journal_categories` | `/journal` | `is_published` | `legacy_tags` is shown as tags. No author or owner field |
| `razz_issues` | `/razz`, issue pages | `is_published` | |
| `razz_features` | Feature pages | `is_published` | `issue_id` puts a feature in an issue |
| `razz_contributors` | `/contributors` | none: listed only when credited on a published feature | Separate from `artists` |
| `razz_feature_contributors`, `razz_feature_files` | Feature credits and gallery | follows the feature | |
| `vault_items`, `vault_categories` | `/vault`, `/shop`, the basket and checkout | `vault_classification = open_public` and `status != private` | `price`, `inventory` and `image_file_id` (the photo) are public on open items; `notes`, `location` are internal |
| `vault_item_artists` | Vault credits | follows the item (and the artist must be published) | |
| `vault_item_files` | Not used | | Points at the legacy `files` table, which has no images (see below) |
| `vault_provenance` | Not public | | Acquisition, owners, exhibition history, condition |
| `commission_types` | `/commissions` (if readable) | none | The site has a built-in fallback list |
| `commission_requests` (+ `_artists`, `_works`) | Not public | | For a future forms endpoint |
| `contact_messages`, `newsletter_signups` | Not public | | For a future forms endpoint |
| `site_settings` | Footer statement and social links | none | Not a Directus singleton; the site reads the first row. `homepage_featured_*` arrays aren't used yet |
| `navigation_items` | Not used yet | none | Navigation is hard-coded |
| `files` | Galleries (via `work_files`, etc.) | | **Legacy** file table. On the live database it has only an `id` column (checked 7 October 2026), so these galleries can't show images. Use the Directus file library |

### Database rules

- `is_published` defaults to `false`, so new content is private until someone publishes it.
- A Vault item classified `closed_collective` may only be linked to artists with `is_collective_member = true`. Database
  triggers enforce this on `vault_items` and `vault_item_artists`. Directus shows the trigger's error when a save breaks
  the rule.
- `updated_at` is set by a trigger on every table that has it.

## What the public can read

Checked anonymously against the live API on 2 October 2026, and again by the public-site permissions run (v3) on
7 October 2026, which added the music fields, recordings and `artists.tags`:

| Open to the public | Closed (403) |
|---|---|
| `artists`, `works`, `texts`, `journal` (published only) | `razz_issues`, `razz_features`, `razz_contributors` |
| `work_artists`, `text_authors`, `text_related_works` (only rows where both sides are published) | `work_files` (galleries) |
| `directus_files` (only images and recordings used by published records, and photos of open vault items) | `vault_provenance` |
| `work_categories`, `text_categories`, `journal_categories`, `vault_categories` (`name`, `slug`) | `commission_types` |
| `site_settings` (the footer fields) | everything private listed above |
| `vault_items`, `vault_item_artists` (open items only; opened 7 October 2026) | |

The closed sections show "This room is not open yet" on the site. Opening each one is a separate decision, made with a
reviewed permissions script.

`works.price`, `artists.year_of_birth` and `artists.is_collective_member` are **intentionally** readable on published
records (owner decision, 1 October 2026). The site doesn't display them, but anyone can read them through the API.
Remember this when publishing test or placeholder content.

**Shop and checkout (7 October 2026, the shop-checkout package).** `vault_items.image_file_id` was added (Image field,
related to `directus_files`, ON DELETE SET NULL); Public rules #100 (`vault_items`) and #101 (`vault_item_artists`)
were created; #4 gained `id`; #96 gained a branch that allows a file while an open item uses it as its photo and no
private or empty-status item does. The checkout Worker logs in as the `checkout-worker` user, which holds only the
**Checkout Worker** policy (`3e4abaf5-…`): read open vault items, read category slugs, update `inventory` only on
open items (never below 0). Like every signed-in token, it also gets what the Public role can read. The Vault forms
in the Data Studio were given dropdowns and notes (presentation only). See `workers/checkout/README.md`.

To check access yourself, request a collection without logging in:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://cms.upset.live/items/razz_issues?fields=id&limit=1"
```

## Roles

| Role | Who | Can do |
|---|---|---|
| **Public** | Every website visitor | Read published content, as above. No writes |
| **Artist** | Collective members and invited artists | Create and edit their own works (including a recording and listening links) and profile, create texts, upload images and audio, see commission requests assigned to them. Cannot publish, edit other people's records, or see private collections. Rules use `owner_user_id = $CURRENT_USER` |
| **Editor** | People who run the site's content | Edit all editorial content and relationships, and publish or unpublish. Its 45 rules haven't been audited yet |
| **Administrator** | Trusted maintainers | Everything: schema, roles, users, flows, settings |

The Artist role was configured and tested in stages in September 2026. A follow-up package (profile lock after first
setup, automatic artist records, automatic work and text credits, slug cleaning, "My works"/"My texts" views) was
applied on 2 October 2026, and its flows are active. The [CMS guide](../Upset.live/CMS%20guide/CMS%20guide.md)
describes it (updated 7 October 2026), but testing it from an artist's account is still outstanding. The music package
(6–7 October 2026) added the two music fields and let artists set them on their own works (Artist rules #14–#16).

## How CMS changes are made

The rules for any change to the live Directus (schema, fields, permissions, flows, bulk data):

1. **Scripts, not clicks.** Changes are written as PowerShell scripts and reviewed before anyone runs them. An admin
   runs them in their own terminal. Tokens are typed into a hidden prompt, never pasted into chat, saved in files, or
   kept in environment variables.
2. **GET-only first.** By default a script only reads. It prints a manifest of every write it would make (method,
   endpoint, maximum count), plus the manifest's SHA-256.
3. **Explicit execute.** It writes only when run with `-Mode Execute -ManifestSha <sha>`, and refuses if the live state
   has changed since the manifest.
4. **Fail closed.** If a check fails, the script stops and reports the exact live state. It never retries a write,
   never restores broad access, and never deletes anything automatically.
5. **Records.** Each run saves a redacted record outside the repo. Failed runs are kept, never rewritten.
6. **Verify by reading.** An HTTP status alone doesn't prove a change. Confirm it with an admin read and an anonymous
   read.

The prepared packages (public-site permissions, Artist role, artist workflow, music, the access snapshot), with their run records, currently live
in Claude session scratchpad folders on the maintainer's machine. Those are temporary folders. Copy them somewhere
private and backed up (not this public repo).

## Known Directus 12.1.1 problems

These were found the hard way on this instance. Check them before writing any CMS script.

| Problem | Consequence | Workaround |
|---|---|---|
| `PATCH /relations/...` always drops and recreates the foreign key | Adding one-to-many alias fields (e.g. `works.artists`) through the API rebuilds FKs | Don't add aliases this way. Read relations from the junction tables, and use `$FOLLOW(collection, field)` in permission filters |
| In a filter, `_some`/`_none` followed directly by `_or`/`_and` is silently ignored | A permission rule can grant far more than it looks | Put the `_or`/`_and` above the `$FOLLOW(...)._some`. Check rules with an anonymous read |
| `GET /permissions` adds synthetic in-memory "app minimal" rows, also when filtered | Scripts can misread which rules exist | Decide rule existence only from the unfiltered list, matched locally |
| File upload re-saves the client's form fields after the write | A user could forge `uploaded_by` if `directus_files.create` allows `*` | The Artist create rule allows only `filename_download`, `storage`, `title`, `type` |
| Uploads labelled `application/octet-stream` are refused by Supabase Storage (415) | Directus returns 503 and leaves a file row with no file | Send the real image MIME type. Clean up the orphaned row as an admin |
| `fields=id,` (trailing comma) is rejected | The whole request fails | Build field lists with `join(",")` |
| The Directus admin can show a field as editable when the user's rules forbid saving it | The save is refused with a permissions error | Expected. Tell users which fields are locked (the CMS guide does) |
