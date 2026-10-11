# Content reference

Every field the website uses, collection by collection. Field names are shown as Directus displays them, with the
underlying name in brackets where it differs. Fields not listed here aren't shown on the site.

**Public?** says whether the field can be read by anyone once the record is published, through the website or its
API.

*Last updated: 7 October 2026 (artist set-up, music).* Back to the [CMS guide](CMS%20guide.md).

---

## Artists

An artist's record is created automatically when they get the Artist role, and kept in sync from **their own user
profile** (see [Artist user profile](#artist-user-profile)). Artists can't edit the record itself. The **From the
profile** column shows which profile field fills each one.

| Field | On the site | From the profile | How to fill it in | Public? |
|---|---|---|---|---|
| Name | Everywhere the artist appears | First + last name | Display name | Yes |
| Slug | `/artists/<slug>` | Made from the name the first time it's saved | lowercase-hyphen, unique, never changed after publishing | Yes |
| Discipline | Under the name, on the profile and cards | Title | Short, e.g. *Painter, 3D artist* | Yes |
| Tags | Shown as tags on the profile and cards | Tags | A few words | Yes |
| Bio | Profile; first paragraph on cards | Description | Paragraphs separated by blank lines | Yes |
| Portrait (`portrait_file_id`) | Profile and cards | Avatar | Image from the File Library | Yes |
| Location | Profile and cards | Location | City, country | Yes |
| Website | Link on profile | | Editors. Full `https://` address | Yes |
| Instagram | Link on profile | | Editors. Full `https://instagram.com/…` address | Yes |
| Order | Sort order on the Artists page | | Number, lowest first | Yes |
| Featured | Not used yet | | | Yes |
| Year of birth | Not shown | | Editors. Leave empty unless the artist agrees it may be public | **Yes, via the API** |
| Is collective member | Not shown; controls the closed Vault | | Admin only | **Yes, via the API** |
| Owner (`owner_user_id`) | Not shown; links the profile to a login | Set automatically | Admin only | No |
| Is Published | Makes the profile public | | Editors | Yes |

Only filled-in profile values are copied, so clearing a profile field leaves the record as it was.

## Artist user profile

The artist's own Directus user (their avatar, bottom left). Never public.

| Field | What it does |
|---|---|
| First name, Last name, Avatar, Location, Title, Description, Tags | Copied onto the artist record on every save (see the table above) |
| Profile completed (`profile_completed`) | Switched on by the artist's own first save that includes a first and last name. While on, the artist can only change their avatar. An admin switches it off to let them edit again |

## Works

| Field | On the site | How to fill it in | Public? |
|---|---|---|---|
| Title | Everywhere | | Yes |
| Slug | `/works/<slug>` | lowercase-hyphen, unique. Filled from the title if left empty on a new work; tidied on save | Yes |
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

## Vault Items

| Field | On the site | Notes |
|---|---|---|
| Title, Slug | `/vault/<slug>` or `/shop/<slug>` | Slug: lowercase words with dashes |
| Photo | Card, item page, basket, Stripe payment page | Visitors can load it only while the item is Open and not Private |
| Category (dropdown) | Vault filter; shop categories put it in the Shop | Prints, Publications, Posters, Apparel, Music and digital releases, Guest works |
| Classification (dropdown) | Open can be shown; Closed never | Closed items may only credit collective members |
| Status (dropdown) | Available → for sale or "Sold out", Archived → "Archived", Private → hidden | |
| Price | Shown, and what buyers pay | In pounds. Empty = enquiry only. **Public on Open items** |
| Inventory | "Only 3 left", "Sold out" | Goes down by itself on checkout. **Public on Open items** |
| Edition number / Edition size | "No. 4 · Edition of 50" | |
| Description | Item page | Paragraphs |
| Location, Notes | Not shown | Internal |

Links: **Vault Item Artists** (credits). **Vault Provenance** is internal. **Vault Item Files** isn't used: it points at
an old file table that holds no images, so use the Photo field.

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
