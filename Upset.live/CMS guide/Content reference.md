# Content reference

Every field the website uses, collection by collection. Field names are shown as Directus displays them, with the
underlying name in brackets where it differs. Fields not listed here aren't shown on the site.

**Public?** says whether the field can be read by anyone once the record is published, through the website or its
API.

*Last checked: 2 October 2026.* Back to the [CMS guide](CMS%20guide.md).

---

## Artists

| Field | On the site | How to fill it in | Public? |
|---|---|---|---|
| Name | Everywhere the artist appears | Display name | Yes |
| Slug | `/artists/<slug>` | lowercase-hyphen, unique, never changed after publishing | Yes |
| Discipline | Under the name, on the profile and cards | Short, e.g. *Painter, 3D artist* | Yes |
| Tags | Shown as tags on the profile and cards | A few words. Filled from the artist's own profile; editors can change them | Yes |
| Bio | Profile; first paragraph on cards | Paragraphs separated by blank lines | Yes |
| Portrait (`portrait_file_id`) | Profile and cards | Image from the File Library | Yes |
| Location | Profile and cards | City, country | Yes |
| Website | Link on profile | Full `https://` address | Yes |
| Instagram | Link on profile | Full `https://instagram.com/…` address | Yes |
| Order | Sort order on the Artists page | Number, lowest first | Yes |
| Featured | Not used yet | | Yes |
| Year of birth | Not shown | Leave empty unless it may be public | **Yes, via the API** |
| Is collective member | Not shown; controls the closed Vault | Admin only | **Yes, via the API** |
| Owner (`owner_user_id`) | Not shown; links the profile to a login | Admin only | No |
| Is Published | Makes the profile public | Editors | Yes |

## Works

| Field | On the site | How to fill it in | Public? |
|---|---|---|---|
| Title | Everywhere | | Yes |
| Slug | `/works/<slug>` | lowercase-hyphen, unique | Yes |
| Year start / Year end | "2019" or "2019–2021" | Whole years. End only if different | Yes |
| Medium | Work page | e.g. *Oil on canvas* | Yes |
| Dimensions | Work page | e.g. *120 × 90 cm* | Yes |
| Description | Work page; first paragraph on cards | Paragraphs | Yes |
| Thumbnail (`thumbnail_file_id`) | Main image, cards, homepage | Image | Yes |
| Audio (`audio_file_id`) | A player on the work page; it keeps playing while visitors browse | An audio file, MP3 or M4A. A short preview is fine. Only recordings you have the rights to publish | Yes (the file too, while the work is published) |
| Listen links (`listen_links`) | "Listen on …" buttons on the work page | One row per platform, as many as you like: choose the platform (Bandcamp, Spotify, Apple Music, SoundCloud, YouTube or Other) and paste the full `https://` link | Yes |
| Category (`category_id`) | Label, Works filter, commission examples | Choose from Work Categories | Yes |
| Featured | Homepage hero and feature (first featured work) | One work at a time | Yes |
| Order | Works page order | Number, lowest first | Yes |
| Status | Availability: available, reserved, sold or archived. Not shown yet | Editors | Yes |
| Price | Not shown | Leave empty unless it may be public | **Yes, via the API** |
| Is Published | Makes the work public | Editors | Yes |
| Year (old text field) | Not used | Use Year start / end instead | |

Links: **Work Artists** (credits), **Text Related Works** (related texts). **Work Files** (gallery) isn't shown on
the site yet.

## Texts

| Field | On the site | How to fill it in | Public? |
|---|---|---|---|
| Title | Everywhere | | Yes |
| Slug | `/texts/<slug>`. The slug `ethos` is the Ethos page | lowercase-hyphen | Yes |
| Category | Label and Texts filter | Choose from Text Categories | Yes |
| Body | The text; first paragraph as the excerpt | Paragraphs. No formatting survives | Yes |
| Cover (`cover_file_id`) | Image | Optional | Yes |
| Published date | Date shown, sort order (newest first) | The date it was published | Yes |
| Featured | Not used yet | | Yes |
| Is Published | Makes the text public | Editors | Yes |

Links: **Text Authors** (authors, from Artists), **Text Related Works**.

## Journal

| Field | On the site | How to fill it in |
|---|---|---|
| Title, Slug | `/journal/<slug>` | As above |
| Category | Label | Choose from Journal Categories |
| Body | The entry | Paragraphs |
| Cover (`cover_file_id`) | Image | Optional |
| Published date | Date and sort order (newest first) | |
| Legacy tags | Shown as tags | A list of words |
| Is Published | Makes the entry public | Editors |

## Razz magazine (not open to the public yet)

**Razz Issues:** Title, Slug (`/razz/issues/<slug>`), Issue number (shown as "No. 3"), Release date (newest is the
current issue), Cover (`cover_file_id`), Description, Is Published.

**Razz Features:** Title, Slug (`/razz/features/<slug>`), Body, Issue (`issue_id`), Is Published.

**Razz Contributors:** Name, Slug (`/contributors/<slug>`), Bio, Portrait (`portrait_file_id`). No publish switch:
a contributor is public once credited on a published feature.

**Razz Feature Contributors:** Feature, Contributor, Role. **Razz Feature Files:** gallery images for a feature.

## Vault Items (not open to the public yet)

| Field | On the site | Notes |
|---|---|---|
| Title, Slug | `/vault/<slug>` or `/shop/<slug>` | |
| Category | Vault filter; shop categories put it in the Shop | `prints`, `publications`, `posters`, `apparel`, `music-digital-releases`, `guest-works` |
| Description | Item page | Paragraphs |
| Vault classification | `open_public` can be shown; `closed_collective` never | `closed_collective` items may only credit collective members |
| Status | `available` → "Open for enquiries", `archived` → "Archived", `private` → hidden | |
| Edition number / Edition size | "No. 4 · Edition of 50" | |
| Price, Inventory, Location, Notes | Not shown | Internal |

Links: **Vault Item Artists** (credits), **Vault Item Files** (images; the first is the main image). **Vault
Provenance** is internal.

## Site Settings

| Field | On the site |
|---|---|
| Footer statement | Footer text |
| Social Instagram, Social YouTube, Social Bandcamp | Footer links (full `https://` addresses) |
| Social email | Footer email link |
| Site title, Tagline, Homepage featured works/texts/artists | Not used yet |

## Collections that are never public

Commission Requests (and their artist and work links), Contact Messages, Newsletter Signups, Vault Provenance, user
accounts, roles and settings.
