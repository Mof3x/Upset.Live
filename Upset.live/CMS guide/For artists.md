# CMS guide for artists

How to set up your profile and add your works, music and writing. Read the [CMS guide](CMS%20guide.md) first: it
covers logging in, publishing, slugs, images and links.

*Last updated: 7 October 2026. This describes the set-up switched on on 2 October 2026. It hasn't been tried from an
artist's account yet, so if something here doesn't match what you see, tell an editor.*

---

## How it works for you

1. You add your things in Directus. They start as **drafts**.
2. You tell an editor they're ready.
3. The editor checks them and **publishes** them.

You can't publish yourself. You can see everyone's published content and your own drafts, but not other people's
drafts.

## Your profile

Your public artist page is made from **your own user profile**: click your avatar at the bottom left of Directus.
When an admin gives you the Artist role, an unpublished artist record is created for you automatically. It's called
"New artist" until you fill in your name. You don't edit that record yourself: it's kept in sync from your profile.

### Fill it in once, all at once

Open your profile and fill in:

| Profile field | Shows on your artist page as |
|---|---|
| First name, Last name | Your name. Your page's address is made from it, e.g. `upset.live/artists/kanyin-ade` |
| Avatar | Your portrait. A clear image of you or your work, square or portrait shaped |
| Location | Your location, e.g. *Lagos, Nigeria* |
| Title | Your discipline, shown under your name, e.g. *Painter, 3D artist* |
| Description | Your bio: a few short paragraphs with a blank line between them. The first paragraph is the summary on the Artists page |
| Tags | A few words about your practice |

Then save with **✓**.

**Your first save that includes a first and last name locks your profile.** After that, you can only change your
avatar. So fill in every field before you save. If you save just your name, the other fields stay empty until an admin
unlocks your profile.

Saving only a new avatar never locks anything.

### After the lock

- You can still change your **avatar**. Your portrait on the site changes with it.
- To change anything else, ask an **admin** to unlock your profile, then fill it in again and save.
- Directus may still let you type in the locked fields, but saving them is refused. That's expected.
- Clearing a field in your profile doesn't clear it on your artist page. Ask an editor to remove something.
- **Website** and **Instagram** links are added by an editor on your artist record. Send them the full addresses
  (`https://…`).
- Your artist record also has a **Year of birth** field, filled in by editors. Once your page is published, it can be
  read through the site's API even though the website doesn't show it. Only give it if you're happy for it to be
  public.

## Adding a work

**Content → Works → +**. The **My works** bookmark in the sidebar lists only your works.

| Field | What to put |
|---|---|
| Title | The work's title |
| Slug | Leave it empty: it's made from the title (`god-of-the-land`). If you type one, it's tidied into lowercase-hyphen form. You can only set it when you first create the work |
| Year start / Year end | The year it was made. Use both only for work made over several years (shown as 2019–2021) |
| Medium | e.g. *Oil on canvas*, *Digital render*, *Live performance*, *Audio* |
| Dimensions | e.g. *120 × 90 cm*. Leave empty if it doesn't apply |
| Description | About the work, in short paragraphs. The first paragraph is the excerpt on cards |
| Thumbnail | The main image. Upload a new one or choose one you uploaded before |
| Category | e.g. Paintings, 3D Modelling, Performances, Music. This decides which filter and commission page it appears under |
| Audio | Music and sound only: a recording of the work (MP3 or M4A). A short preview is fine. Optional |
| Listen links | Optional. Click **Add a link**, choose the platform and paste the full `https://` address. Add a row for each platform, e.g. one for Spotify and one for Bandcamp |

Save with **✓**. The work is yours, and it's **credited to you automatically**: once it's published, it shows
"By *your name*".

- To credit other people too, tell an editor who they are and their role (e.g. *Sound*, *Photography*).
- You can keep editing your own works, also after they're published. Changes to a published work show on the site as
  soon as you save.
- **Status**, **Price**, **Featured** and **Order** are locked for you. Editors use them for availability, sales
  information, the homepage and the order of the Works page.
- **More images:** the website shows one main image per work. Gallery images aren't available yet.

## Adding a text

Essays, poetry, articles, statements: **Content → Texts → +**. The **My texts** bookmark lists only your texts.

| Field | What to put |
|---|---|
| Title | The title |
| Slug | Leave it empty: it's made from the title. A slug you type is tidied into lowercase-hyphen form |
| Category | The kind of text, e.g. Essay, Poetry |
| Body | The full text, with a blank line between paragraphs. Formatting such as bold, italics and links won't appear on the site |
| Cover | Optional image |

Save with **✓**. The text is credited to you automatically, so you can open it again under **My texts**. You can't
change a text after saving it, so check it first. To correct it later, send the changes to an editor.

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
| Change your profile after it's locked (except your avatar) | An admin, to unlock it |
| Edit your artist record directly, or add your website, Instagram or year of birth | An editor |
| Change a slug after the first save | An editor |
| Edit a text after saving it | An editor |
| Edit someone else's profile, works or texts | That artist, or an editor |
| Credit other people on a work or text | An editor |
| Change categories, the homepage, Site Settings or the Vault | An editor |
| Delete a record | An editor (to unpublish it) or an admin (to delete it) |
| Mark yourself a collective member | An admin |

If Directus lets you type in a field but refuses to save it, that field is locked for your role. That's a Directus
quirk, not a mistake on your part.
