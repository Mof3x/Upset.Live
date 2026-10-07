# CMS guide for artists

How to set up your profile and add your works and writing. Read the [CMS guide](CMS%20guide.md) first: it covers
logging in, publishing, slugs, images and links.

*Last checked: 2 October 2026. Some steps will get simpler soon; see [Coming soon](#coming-soon).*

---

## How it works for you

1. You add or edit your things in Directus. They stay as **drafts**.
2. You tell an editor they're ready.
3. The editor checks them, links them up (for example, credits you on a work) and **publishes** them.

You can't publish yourself, and you can only see and edit **your own** drafts. Everyone's published content is
visible to you.

## Your artist profile

Your public profile is a record in the **Artists** collection that belongs to your login. An admin creates it and
links it to you when you join.

To edit it: **Content → Artists**, then open your profile.

| Field | What to put |
|---|---|
| Name | Your name as you want it shown |
| Slug | Your name in lowercase with hyphens, e.g. `kanyin`, or `first-last` for a full name. Set it once; don't change it later |
| Bio | A few short paragraphs, with a blank line between them. The first paragraph is used as the short summary on the Artists page |
| Portrait | A clear image of you or your work, square or portrait shaped |
| Location | City and country, if you want them shown |
| Website | Your full web address, starting with `https://` |
| Instagram | Your **full** Instagram address, e.g. `https://instagram.com/yourname`. A bare `@yourname` doesn't work as a link |

You may also see **Year of birth**. Leave it empty unless you're happy for it to be public: once your profile is
published, anyone can read it through the site's API, even though the website doesn't display it.

## Adding a work

**Content → Works → +**

| Field | What to put |
|---|---|
| Title | The work's title |
| Slug | Title in lowercase with hyphens: `god-of-the-land` |
| Year start / Year end | The year it was made. Use both only for work made over several years (shown as 2019–2021) |
| Medium | e.g. *Oil on canvas*, *Digital render*, *Live performance* |
| Dimensions | e.g. *120 × 90 cm*. Leave empty if it doesn't apply |
| Description | About the work, in short paragraphs. The first paragraph is the excerpt on cards |
| Thumbnail | The main image. Upload a new one or choose one you uploaded before |
| Category | e.g. Paintings, 3D Modelling, Performances. This decides which filter and commission page it appears under |
| Audio | Music and sound only: a recording of the work (MP3 or M4A). A short preview is fine. Optional |
| Listen links | Optional. Click **Add a link**, choose the platform and paste the full `https://` address. Add a row for each platform, e.g. one for Spotify and one for Bandcamp |

Save with **✓**. The work is yours automatically: Directus records that you created it.

Leave **Status**, **Price**, **Featured** and **Order** to editors. They control availability, sales information,
the homepage, and the order of the Works page. Depending on your account, some of these fields may be locked.

**Credits.** Your name appears on the work ("By …") once an editor links you to it. Tell them if there are other
people to credit, and their role (e.g. *Sound*, *Photography*).

**More images.** The website currently shows one main image per work. Gallery images aren't available yet.

## Adding a text

Essays, poetry, articles, statements: **Content → Texts → +**

| Field | What to put |
|---|---|
| Title | The title |
| Slug | Title in lowercase with hyphens |
| Category | The kind of text, e.g. Essay, Poetry |
| Body | The full text, with a blank line between paragraphs. Formatting such as bold, italics and links won't appear on the site |
| Cover | Optional image |

After you save a new text, you won't be able to open it again until an editor has linked you to it as its author. If
you need to change it before then, ask the editor, or send them the corrected version. (This goes away with the
changes in [Coming soon](#coming-soon).)

The **Journal** is the collective's own news stream. Ask an editor if you want something posted there.

## Uploading images and recordings

You can upload from a work or text form, or in **File Library → +**. You can see the files you uploaded and the
images used on content you can see, but not other people's private uploads.

- Upload JPEG or PNG, around 2000 px on the longest side, under about 2 MB.
- Recordings: MP3 or M4A. Upload them in the work's **Audio** field, not the Thumbnail (image fields refuse audio).
  Only upload music you have the rights to share. Once the work is published, anyone can play the recording.
- Give each file a clear title, e.g. *God of the Land, 2024*.
- If an upload fails with an error, try once more. If it fails again, don't keep retrying: send the file and the error
  message to an admin.

## Commission requests

If a commission request is assigned to you, you can see it under **Commission Requests**: the message, the type of
work and the client's name. You can't see their email address, and you can't change the request. Editors handle the
reply.

## What you can't do (and who can)

| You can't | Ask |
|---|---|
| Publish or unpublish anything | An editor |
| Edit someone else's profile, works or texts | That artist, or an editor |
| Credit yourself or others on a work or text | An editor |
| Change categories, the homepage, Site Settings or the Vault | An editor |
| Delete a record | An editor (to unpublish it) or an admin (to delete it) |
| Mark yourself a collective member | An admin |

If Directus lets you type in a field but refuses to save it, that field is locked for your role. That's a Directus
quirk, not a mistake on your part.

## Coming soon

These changes have been prepared but not switched on yet. This section will be updated when they are.

- **Profile from your account.** You'll fill in your name, location, title (your discipline), a short description, tags
  and an avatar in **your own user profile** (bottom left). Your public artist record will be created and kept in
  sync from it automatically.
- **Profile lock.** After your first complete save with a first and last name, the profile locks so the public record
  stays stable. You can still change your avatar. To change anything else, ask an admin to unlock it.
- **Automatic credits.** New works and texts you create will be credited to you automatically, so you can find your
  texts straight away.
- **Automatic slugs.** Leave the slug empty and one is made from the title. Slugs you type are cleaned up into the
  lowercase-hyphen form.
- **"My works" and "My texts"** bookmarks in the sidebar.
