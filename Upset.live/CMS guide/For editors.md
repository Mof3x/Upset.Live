# CMS guide for editors

How to review, link and publish content, and look after each part of the site. Read the [CMS guide](CMS%20guide.md)
first. The [Content reference](Content%20reference.md) lists every field.

*Last checked: 2 October 2026.*

---

## Your job in one list

1. Check drafts that artists have added.
2. Fix slugs, categories, availability and ordering.
3. Create the **links**: credits, authors, related works.
4. Publish, then check the page on the site.
5. Unpublish anything that should no longer be public.
6. Keep an eye on the **hello@upset.live** inbox, where the website's forms arrive.

## Publishing checklist

Before you switch **Is Published** on, check:

- [ ] **Title** is spelled correctly.
- [ ] **Slug** is lowercase-hyphen, has no spaces (check for a trailing space), and is unique. Fix it *now*; once
  published, it shouldn't change.
- [ ] **Text** reads well as plain paragraphs, with no leftover formatting.
- [ ] **Image** is set, the right way up, and not huge.
- [ ] **Links**: the artist credit (Work Artists) or author (Text Authors) exists.
- [ ] **The linked artist is published too**, or the credit won't show.
- [ ] Nothing private is in a public field. On published records, a work's **price** and an artist's **year of birth**
  and **collective member** flag can be read through the API, even though the site doesn't display them.
- [ ] It's real content, not a test.

Then switch **Is Published** on, save, open the page on upset.live and reload.

**To unpublish**, switch it off and save. The page disappears from the site at once. Prefer unpublishing to deleting:
it can be undone.

## Linking records

Works and texts don't have "artists" or "authors" fields. Each link is its own small record in a separate collection.
After creating a work or text, create its links.

### Credit an artist on a work

**Content → Work Artists → +**

| Field | Set to |
|---|---|
| Work | The work |
| Artist | The artist |
| Role | Optional, e.g. *Painter*, *Sound*, *Photography*. Shown as "Role: Name". Empty shows "By Name" |

Add one Work Artists record per person. The first credit is treated as the main artist: it's the one shown on cards
and on the homepage feature.

### Credit an author on a text

**Content → Text Authors → +**, with Text, Artist (the author's artist profile) and an optional Role (e.g.
*Translator*).

### Connect a text and a work

**Content → Text Related Works → +**, with Text, Work and an optional Note explaining the connection. The link appears
on both pages.

## The homepage

- The **hero image and featured work** are the first published work with **Featured** switched on. Keep Featured on
  only one work at a time. If none is featured, the first work in the Works order is used.
- **Related works** are the next four published works in order.
- The featured work's artist card comes from its first Work Artists credit.
- The quote and the newsletter box are built into the site.

## Ordering

The Works page lists works with an **Order** number first, lowest number first. Works without one follow, newest
first, then by title. The Artists page uses the same idea with the artist's Order, then name. Leave gaps (10, 20,
30) so you can slot things in later.

## Categories

Categories drive the filters on Works and Texts and the commission pages.

- **Work Categories**: the commission pages show example works from the categories with the slugs `paintings`,
  `3d-modelling` and `performances`. Don't rename those slugs.
- **Text Categories** and **Journal Categories**: shown as labels and filters.

Create a category before you need it. Keep the list short and consistent.

## Music

Music is a kind of work: create it in **Works** with a music category (for example *Music*, *Releases* or
*Performances*). Each work can have a recording, listening links, both or neither.

- **Audio:** upload or choose an audio file in the work's **Audio** field (MP3 or M4A plays everywhere). The work page
  shows a player, and the recording keeps playing while visitors move around the site. Use the Audio field, not the
  Thumbnail: image fields only accept images.
- **Listen links:** in **Listen links**, click **Add a link**, choose the platform and paste the full `https://`
  address. Add one row per platform: Spotify *and* Bandcamp *and* YouTube is fine. Each becomes a "Listen on …" button,
  in the order you added them.
- Visitors can play or download the recording only while the work is published. Only publish audio the artist has the
  rights to share; a 30–90 second preview is enough if the full track lives on Bandcamp or Spotify.
- Credit the musicians as usual in **Work Artists** (e.g. role *Sound*, *Vocals*). The credited names are shown in
  the player.

## The Ethos page

**About → Ethos** shows the published **text** whose slug is exactly `ethos`. To change the ethos, edit that text.
If none is published, the page shows a placeholder.

## Journal

The collective's own updates. **Content → Journal → +**, with title, slug, category, body, cover, published date and
tags. Journal entries have no author field. Publish as usual.

## Razz magazine

*The magazine pages are built, but not yet open to the public. Until an admin opens them they show "not open yet",
even for published issues. You can prepare content now.*

1. Create the issue in **Razz Issues**: title, slug, issue number, release date, cover, description.
2. Create each feature in **Razz Features**, choosing the issue.
3. Add contributors in **Razz Contributors** (name, slug, bio, portrait). Contributors are separate from artists.
4. Credit them with **Razz Feature Contributors**: feature, contributor and role (e.g. *Words*, *Photography*).
5. Publish the issue and its features.

The newest issue by release date is shown as the current issue. A contributor appears on the Contributors page only
once credited on a published feature.

## Vault and Shop

*Not yet open to the public. These pages show "not open yet" until an admin opens them.*

The Vault holds objects and editions. The **Shop** is the public part of the Vault in shop categories (`prints`,
`publications`, `posters`, `apparel`, `music-digital-releases`, `guest-works`). Vault items have no Is Published
switch. Two fields decide visibility instead:

| Classification | Status | Visible on the site? |
|---|---|---|
| `open_public` | `available` | Yes, marked "Open for enquiries" |
| `open_public` | `archived` | Yes, marked "Archived" |
| `open_public` | `private` | No |
| `closed_collective` | anything | No, never |

Rules:

- A `closed_collective` item may only be credited to artists marked as collective members. Directus refuses the save
  otherwise. That's intended.
- **Notes**, **location**, **inventory**, **price** and **provenance** are internal.
- There's no buy button anywhere. Visitors use "Request information", which arrives in hello@upset.live.

## Commission requests

The commission form currently sends an email. When a request comes in, reply from hello@upset.live. If you log
requests in **Commission Requests**, link the artists involved in **Commission Request Artists**, so those artists can
see the request (without the client's email).

## Site Settings

**Content → Site Settings** has the footer statement and the social links (Instagram, YouTube, Bandcamp, email).
Enter full addresses starting with `https://`. Edit the existing row; don't create a second one.

## Artists and accounts

- New artist: an **admin** invites them with the Artist role and links their login to their artist profile (the
  profile's owner). Until that's done, they can't edit their profile.
- **Collective member** on an artist profile is set by an admin. It matters for the closed Vault.
- When someone leaves, ask an admin to suspend their account. Their published work stays up unless you unpublish it.

## Housekeeping

- **Test content.** There's test data from setting up the CMS (titles starting "ZZ TEST" and some mock works). Don't
  publish it, and don't delete it either: an admin will clean it up.
- **Odd slugs.** If a published record has a slug with spaces or capitals, it still works, but fix it when you can.
  The old link will stop working when you do.
- **Images in the File Library** that nothing uses aren't public. You don't need to delete them.
