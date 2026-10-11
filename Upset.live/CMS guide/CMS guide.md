# UpsetXociety CMS guide

How to put things on [upset.live](https://upset.live). Read this page first, then the guide for your role:

- **[For artists](For%20artists.md):** your profile, your works and your writing.
- **[For editors](For%20editors.md):** reviewing, linking and publishing everything.
- **[Content reference](Content%20reference.md):** every field, what it does on the site, and how to fill it in.

*Last checked against the live site: 2 October 2026. Updated 7 October 2026 for the artist set-up and music.*

---

## What the CMS is

The website doesn't store any content itself. Everything you see on upset.live (artists, works, texts, journal
entries, magazine issues, Vault objects) lives in a content management system called **Directus**, at:

**https://cms.upset.live/admin**

When something is added in Directus *and published*, it appears on the website straight away. Reload the page to see
it. There is nothing to "deploy".

## Getting access

You can't sign yourself up. Ask an admin to invite you. They'll give you one of these roles:

| Role | For | You can |
|---|---|---|
| **Artist** | Collective members and invited artists | Fill in your profile, add your works (with music if you make it) and texts, upload images and recordings. You can't publish; an editor does that |
| **Editor** | People who run the site's content | Edit and publish everything editorial, and link records together |
| **Administrator** | One or two trusted maintainers | Everything, including accounts and settings |

Use a strong password that you don't use anywhere else, and never share your login. If you think someone else has used
your account, tell an admin.

## Finding your way around

After logging in you'll see a narrow bar of icons down the left. The ones you'll use:

- **Content** (the box icon): all the collections, such as Artists, Works and Texts. Click one to see its records.
- **File Library** (the folder icon): every image that has been uploaded.
- **Your avatar** (bottom left): your own profile, password and language.

Inside a collection:

- the **+** button (top right) creates a new record;
- clicking a row opens it;
- the **✓** button (top right) saves. Nothing is saved until you click it;
- the **⋯** menu next to it has "Save as copy" and other options.

## Five things to understand

### 1. Nothing is public until it's published

Every artist, work, text, journal entry and magazine piece has an **Is Published** switch (field name
`is_published`). It starts **off**. While it's off, the record is a draft: only people logged into Directus can see it.

Turning it on makes the record public, both on the website and through the API that the website uses. Treat "publish"
like posting: don't publish test content, and check the page afterwards.

Artists can't publish. Editors publish when a record is ready.

Vault objects work differently. See [For editors → Vault and Shop](For%20editors.md#vault-and-shop).

### 2. Every record needs a slug

The **slug** is the record's web address. A work with the slug `fruits-and-goddess` lives at
`upset.live/works/fruits-and-goddess`.

Good slugs:

- use lowercase letters, numbers and hyphens only: `night-study-ii`, not `Night Study II`;
- have no spaces, especially not a space at the end;
- are unique within their collection;
- **don't change after publishing**, because any link someone has shared would break.

You rarely have to type one: leave the slug empty on a new record and Directus makes it from the title (or the name).
A slug you do type is tidied into this form when you save.

### 3. Text is plain paragraphs

Descriptions, bios and text bodies appear on the site as plain paragraphs. Leave a blank line between paragraphs.
**Bold, italics, links and headings typed in the editor don't show on the site.** Each heading appears as an ordinary
paragraph. Write so the text reads well without them.

### 4. Images are uploaded once and reused

Images go into the File Library, and a record points at one of them. For example, a work's **thumbnail** or an
artist's **portrait**. Upload JPEG or PNG files, around 2000 px on the longest side, ideally under 2 MB. Huge
photos straight from a phone make the site slow.

Only upload images you have the right to publish, and get permission before uploading photos of other people.

### 5. Links between records are separate records

The site shows "By ___" on a work, the authors of a text, and related works. These links aren't fields on the work
or text. They're small records of their own, in collections such as **Work Artists** and **Text Authors**. A work with
no Work Artists record shows no artist. Works and texts that artists create are credited to them automatically; other
credits are added by editors. [For editors](For%20editors.md#linking-records) explains how.

Links only appear when **both** sides are published. A published work linked to an unpublished artist shows no credit
until the artist is published too.

## What appears where

| On the website | Comes from (Directus collection) |
|---|---|
| Homepage hero and featured work | The first published work marked **Featured** (otherwise the first work in order) |
| Homepage "Related works" | The next four published works |
| Artists, artist pages | Artists |
| Works, work pages | Works (+ Work Artists for credits) |
| Texts, text pages | Texts (+ Text Authors, Text Related Works) |
| About → Ethos | The published text with the slug `ethos` |
| Journal | Journal |
| Razz magazine | Razz Issues, Razz Features, Razz Contributors *(not open to the public yet)* |
| Vault and Shop | Vault Items (and Vault Item Artists for credits); selling is explained in [For editors → Vault and Shop](For%20editors.md#vault-and-shop) |
| Commissions | A built-in list of disciplines, with example works from matching work categories |
| Footer statement and social links | Site Settings |
| About page text, homepage quote, menus | Built into the website; ask a developer to change them |

"Not open to the public yet" means those pages currently show *"This room is not open yet"* on the website, even if
records are published. An admin opens each section when it's ready.

## Messages from the website

The contact, commission, newsletter and "Request information" forms currently open an email to
**hello@upset.live**, pre-filled with the visitor's answers. Nothing from the forms is stored in Directus yet, so
someone needs to check that inbox.

Shop orders don't use these forms: Stripe emails each sale, and the Stripe Dashboard lists them under **Payments**.

## Getting help

- If something is refused with a "permission" error, that field or action isn't allowed for your role. It isn't a fault
  on your side. Ask an editor or admin.
- If the website shows *"The archive is unavailable"*, tell an admin. The CMS may be down.
- If you're not sure whether to publish something, don't. Leave it as a draft and ask.
