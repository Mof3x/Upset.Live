# UpsetXociety Functional Site Build Plan

This is the implementation companion to `Progress logs.md`. It turns the current TODO list into a sequence of small, testable milestones.

The goal is not to build every planned section at once. The goal is to make one complete content journey work, then reuse the same templates for the rest of the archive.

## Target first release

A visitor should be able to:

1. Open the homepage.
2. Navigate to Works, Texts, Artists, About, Journal, Vault, Print/Shop, and Contact without dead links.
3. Browse a list of works.
4. Open a work detail page.
5. Follow the work to its artist, related text, and related journal entry.
6. Open an artist profile and see their selected works.
7. Submit a newsletter signup or contact enquiry and receive clear success or failure feedback.
8. Use the site on a phone, keyboard, and slow connection.

An editor should be able to publish content in Directus without adding a new React page for every artist, work, text, or journal entry.

## Working rules

- Keep the current Vite + React architecture.
- Use reusable page templates and content records instead of one component per item.
- Complete one vertical slice before expanding the sitemap.
- Keep mock data working until the equivalent Directus query is verified.
- Run `npm run lint` after React changes.
- Run `npm run build` before calling a milestone complete.
- Do not commit API keys, database passwords, Directus secrets, or private URLs.
- Do not show a purchase action until stock, payment, order, and notification handling exist.

## Current baseline

Verified on 19/09/2026:

- `npm run build` passes.
- `npm run lint` fails in `src/components/cards/ArtistCard.jsx` because the component is an unfinished snippet.
- Only `/` and `/artists/:slug` are registered in `src/App.jsx`.
- `Footer.jsx` is empty.
- Homepage and navbar links point to routes that do not yet exist.
- Content is stored in `src/mock/` and is not fetched from Directus.
- Newsletter submission is prevented in the browser but is not sent anywhere.

---

# Phase 0: protect the current prototype

## 0.1 Inspect the working tree

Before changing application code, check what is already modified:

```powershell
git status --short
git diff --stat
```

Do not revert unrelated user changes. If the current worktree is dirty, work around those changes and keep the scope clear.

## 0.2 Create a recoverable checkpoint

If the current prototype is not already committed, save a checkpoint before routing and data work:

```powershell
git add src package.json package-lock.json README.md
git commit -m "Save frontend prototype before functional build"
```

If you are working on a shared branch, use the team's normal branch workflow instead of creating a branch automatically.

## 0.3 Record the route decision

Use `/shop` as the canonical public commerce route. Keep print editions as the
`/shop/prints` category rather than creating a competing `/print` section. The
navbar should contain six balanced links around the logo:

```text
Works | Texts | Journal | UpsetXociety | About | Shop | Vault
```

Use `/shop` in navigation and `/shop/prints` for print-specific links. Do not
use `/print` as a second public route.

## 0.4 Baseline checks

Run:

```powershell
npm run lint
npm run build
```

Expected result at the end of Phase 0:

- The current build result is recorded.
- Existing lint failures are known.
- No unrelated work has been overwritten.
- The route naming decision is written down.

---

# Phase 1: repair the shared frontend foundation

This phase makes the existing prototype internally consistent before new pages are added.

## 1.1 Repair `ArtistCard`

Open `src/components/cards/ArtistCard.jsx` and decide its public props. It should receive one artist object or named props, not reference undeclared variables.

Use the existing shared primitives:

- `MediaFrame`
- `MetaLine`
- `TagList`
- `TextLink`

The component should render:

- portrait and meaningful alt text
- discipline and location metadata
- artist name
- short biography or excerpt
- tags when present
- link to `/artists/:slug`

Check the data shape against `src/mock/artists.js`. If the mock artist uses `bio` as an array while the card expects an excerpt string, normalize that difference in the component or data layer. Do not make each page guess the shape.

Run immediately after the repair:

```powershell
npm run lint
npm run build
```

## 1.2 Normalize media paths

Public files in `public/` are referenced from the site root. These are correct:

```text
/gor.jpeg
/images/night-study.jpg
```

These are incorrect:

```text
/public/gor.jpeg
```

Search all mock data and components for `/public/`. Replace only paths that incorrectly include the public directory. Then verify that each file exists in `public/` or is imported from `src/assets/`.

Add a small media helper later for Directus files, but do not mix Directus URLs into local mock records.

## 1.3 Make the shell complete

Update `src/components/layout/SiteShell.jsx` so the shared shell contains:

- navbar
- page content
- footer
- atmosphere layers

The footer should appear on every route, including not-found and error states. Keep page-specific content inside the route element.

Implement `src/components/layout/Footer.jsx` with:

- internal links: Works, Texts, Journal, Razz, About, Contact
- support links: Newsletter, Bookings/Commissions, Print/Shop
- external links: Instagram, Bandcamp, YouTube, Email
- a short closing statement

Use actual URLs only when they are confirmed. Use a safe placeholder or omit a social link rather than linking to a generic profile.

## 1.4 Add the not-found route

Create `src/pages/NotFoundPage.jsx`.

It should include:

- a clear `404` or not-found heading
- a short explanation
- a link to the homepage
- a link to the main archive route

Add a catch-all route after the known routes:

```jsx
<Route path="*" element={<NotFoundPage />} />
```

The not-found screen must work inside `SiteShell` and must not throw if a user opens a random URL directly.

## 1.5 Close the mobile navigation loop

In `Navbar.jsx`:

- close the menu after a navigation link is selected
- expose the menu state with `aria-expanded`
- keep the panel usable with keyboard focus
- ensure the logo does not overlap the toggle or links on narrow screens
- use one route spelling for Print/Shop

Test at a narrow viewport manually before moving on.

### Phase 1 acceptance check

```powershell
npm run lint
npm run build
```

Manually verify:

- `/` loads
- `/artists/gor` loads
- an unknown artist shows an intentional not-found state
- an unknown URL shows the global not-found page
- footer links are visible and not empty
- mobile navigation opens, navigates, and closes

---

# Phase 2: establish the route map

Do not create a separate route for every content record. Create index and detail templates.

## 2.1 Create the first route list

Add these page files under `src/pages/`:

```text
AboutPage.jsx
ArtistsPage.jsx
WorksPage.jsx
WorkPage.jsx
TextsPage.jsx
TextPage.jsx
JournalPage.jsx
JournalPostPage.jsx
VaultPage.jsx
ShopPage.jsx
ContactPage.jsx
NotFoundPage.jsx
```

The first release can use simple real content from mock data. The page templates can become Directus-backed without changing their URL structure.

## 2.2 Register routes in `App.jsx`

Use this route contract:

```text
/                         HomePage
/about                    AboutPage
/artists                  ArtistsPage
/artists/:slug            ArtistPage
/works                    WorksPage
/works/:slug              WorkPage
/texts                    TextsPage
/texts/:slug              TextPage
/journal                  JournalPage
/journal/:slug            JournalPostPage
/vault                    VaultPage
/vault/:slug              VaultItemPage, when the item template exists
/shop                     ShopPage, or /print if that decision was made
/shop/:slug               ShopItemPage, when commerce content exists
/contact                  ContactPage
*                         NotFoundPage
```

Do not register a route that renders a blank page. If a section is not ready, either build its minimum index/detail experience or remove its link until it is ready.

## 2.3 Build a shared page structure

Each index page should use the same basic pattern:

```text
Page intro
  title
  short description
  optional category/filter controls
Content grid or editorial list
  loading state
  empty state
  error state
```

Each detail page should use:

```text
Page header
  title
  metadata
Primary media or body
Related content rails
Return/navigation link
```

Use existing primitives before creating new ones:

- `SectionHeading`
- `MetaLine`
- `MediaFrame`
- `TagList`
- `CardGrid`
- `TextLink`

## 2.4 Build the first vertical slice with mock data

Implement these pages first:

1. `WorksPage`: list the records from `src/mock/works.js`.
2. `WorkPage`: find a work by slug and show title, image, metadata, description, and artist link.
3. `ArtistPage`: reuse the existing page and repair its data assumptions.
4. `TextsPage`: list records from `src/mock/texts.js`.
5. `TextPage`: find a text by slug and show body/excerpt, author, and related work links.
6. `JournalPage` and `JournalPostPage`: start with a small local dataset if no journal mock exists.

Add an explicit loading state only when a real asynchronous source is introduced. For local data, add empty and not-found states so the future API behavior is already defined.

## 2.5 Make relationships navigable

The primary discovery chain should be testable:

```text
Home -> Work -> Artist -> Text -> Journal
```

For each relationship, confirm:

- the linked record exists
- the link uses a slug, not a display title
- missing related records do not crash the page
- the visitor can return to the previous archive

Avoid silently rendering broken related-content cards. Filter invalid records or show a deliberate empty state.

### Phase 2 acceptance check

Run:

```powershell
npm run lint
npm run build
```

Then manually open every route in the route contract. Test direct URL entry, refresh, browser back, browser forward, and an invalid slug.

---

# Phase 3: define a stable content contract

The current mock files have inconsistent shapes. Directus will make those inconsistencies more expensive, so normalize them before connecting the CMS.

## 3.1 Define normalized frontend records

Create `src/lib/normalise.js` with small functions such as:

```text
normalizeArtist(record)
normalizeWork(record)
normalizeText(record)
normalizeJournalEntry(record)
```

Each function should return the shape the UI expects, for example:

```text
Artist:
  slug
  name
  discipline
  location
  bio: array of paragraphs
  excerpt
  image
  imageAlt
  tags: array
  links
  works: array

Work:
  slug
  title
  image
  imageAlt
  gallery
  artist
  artists
  type
  year
  medium
  dimensions
  description
  excerpt
  tags
  relatedTexts
  relatedJournal
  availability
```

Do not let Directus response nesting leak throughout every component. Normalize once near the data boundary.

## 3.2 Decide null behavior

Document what happens when fields are missing:

- no image: use a neutral media placeholder with descriptive alt text
- no excerpt: hide the excerpt region
- no related records: hide the rail or show a quiet empty state
- no artist: show `Collective` only if that is an intentional content value
- no year: omit the year rather than displaying `undefined`
- unpublished record: never render it in public queries

## 3.3 Keep mock data compatible

Update mock records to pass through the same normalizers used by Directus. This lets the UI be developed without waiting for the CMS and makes API replacement a data-layer change rather than a page rewrite.

### Phase 3 acceptance check

Add a small test or executable fixture for each normalizer. At minimum test:

- complete record
- missing optional fields
- malformed or missing relationship
- media URL conversion

Run:

```powershell
npm run lint
npm run build
```

---

# Phase 4: connect Directus safely

The CMS is the content layer. The browser should receive only the public, published content needed to render the site.

## 4.1 Prepare environment variables

Create a local `.env.example` containing names, not secrets:

```text
VITE_DIRECTUS_URL=https://cms.example.com
```

Use `.env.local` for local values and keep it ignored by Git. Never put a database connection string, Directus admin token, Supabase service key, or payment secret in a `VITE_` variable. Vite exposes `VITE_` values to the browser.

If a browser request requires a privileged token, the architecture is wrong. Put that request behind a server-side endpoint or Cloudflare Worker.

## 4.2 Create the Directus client

Create `src/lib/directus.js` with:

- base URL from `import.meta.env.VITE_DIRECTUS_URL`
- a small request function
- consistent error conversion
- no hard-coded credentials
- an abort/timeout strategy if the chosen client supports it

Keep the first query surface small. Start with:

```text
getPublishedArtists()
getPublishedWorks()
getPublishedWorkBySlug(slug)
getPublishedTexts()
getPublishedTextBySlug(slug)
getPublishedJournalEntries()
getPublishedJournalEntryBySlug(slug)
getSiteSettings()
getNavigation()
```

Use Directus filters for published status and sort order. Request only the fields needed by each page.

## 4.3 Implement media URLs

Create `src/lib/media.js` to convert a Directus file ID or file object into a URL using the configured Directus base URL.

The helper should support:

- original image
- width/quality transformations if Directus image transforms are enabled
- missing file IDs
- alt text stored with the content record

Keep the media helper independent of React so it can be tested directly.

## 4.4 Configure public permissions

In Directus, create a public role that can read only:

- published artists
- published works
- published texts
- published journal entries
- published categories
- public navigation
- public site settings
- public media files required by published content

Do not grant public read access to:

- contact messages
- newsletter signups
- commission requests
- reservations
- orders
- inventory management fields that should remain private
- user/admin records

Test permissions in an unauthenticated browser request, not only while logged into the Directus dashboard.

## 4.5 Replace mock sources one page at a time

Use this order:

1. Works index.
2. Work detail.
3. Artists index and detail.
4. Texts index and detail.
5. Journal index and detail.
6. Homepage featured content.
7. Navigation and site settings.

For each page:

1. Add the Directus query.
2. Normalize the result.
3. Add loading state.
4. Add error state with retry or return link.
5. Add empty state.
6. Temporarily compare the API result with mock output.
7. Remove the page's mock import only after the API path works.
8. Run lint and build.

Do not switch every page to Directus in one large edit.

## 4.6 Verify the publishing workflow

Create one test record for each core collection and verify:

- draft records do not appear publicly
- published records appear without a code change
- relationships return the expected artist/text/work records
- deleting or unpublishing a related record does not crash the page
- new media loads from the public file URL
- sort order and featured flags work

### Phase 4 acceptance check

The vertical slice is complete when a Directus editor can publish a work, attach an artist and related text, upload its media, and see the result on the site without changing React code.

---

# Phase 5: make forms real

Forms are public write operations. They need stronger validation and privacy handling than read-only content.

## 5.1 Newsletter signup

Update the existing newsletter component to:

- validate a real email format
- disable the submit button while sending
- show a success message without clearing useful context too quickly
- show an actionable error message
- handle duplicate email responses safely
- prevent accidental repeated submissions
- include a privacy/consent statement appropriate to the mailing provider

Choose where the write request lives:

- a server-side endpoint or Cloudflare Worker
- a Directus custom endpoint/flow
- a dedicated newsletter provider

Do not write newsletter signups directly from the browser using an admin token.

## 5.2 Contact form

Create `src/components/forms/ContactForm.jsx` and `src/pages/ContactPage.jsx`.

Minimum fields:

- name
- email
- enquiry type
- message
- optional related work slug
- consent checkbox if required

Implement:

- client-side validation for immediate feedback
- server-side validation for trust
- honeypot or equivalent spam protection
- rate limiting at the endpoint
- success and failure states
- no sensitive data in client logs

Store only the information needed to respond. Document retention and access rules for the team.

## 5.3 Commissions and reservations

Do not build these as a generic contact form if the database model already distinguishes them. Use the planned structured collections:

- commission type
- interested artist
- interested work
- budget/timeline when appropriate
- message

For Vault reservations, define the state machine before UI work:

```text
available -> requested -> reserved -> paid -> fulfilled
available -> sold
requested -> expired
reserved -> released
```

Only the server-side layer should change inventory or reservation state.

### Phase 5 acceptance check

Test:

- valid submission
- invalid email
- missing required field
- duplicate submission
- slow response
- server error
- refresh after success
- keyboard-only submission
- spam trap behavior

---

# Phase 6: build Vault and commerce deliberately

The Vault is not just another listing page. It combines archival context, provenance, inventory, and requests.

## 6.1 Vault index

Build `VaultPage` with:

- category grouping
- item status
- artist/contributor context
- quiet availability language
- no aggressive purchase CTA on initial load

## 6.2 Vault detail

Build `VaultItemPage` in this order:

1. primary image/media
2. title and metadata
3. curator note
4. provenance timeline
5. related text or journal excerpt
6. edition strip
7. request/reservation action

The edition strip should show exact inventory only when the inventory source is authoritative. Never hard-code remaining stock in React.

## 6.3 Edition preview

Implement the planned non-blocking preview with:

- high-resolution media
- run size
- materials
- production notes
- provenance
- request information action

Keep the first version accessible without relying on animation. Users must be able to open, read, close, and submit the preview with a keyboard.

## 6.4 Commerce boundary

Choose one first-release behavior:

- `Request information`: simplest and safest starting point.
- `Reserve`: requires server-side reservation expiry and inventory locking.
- `Buy now`: requires Stripe checkout, webhook validation, order records, inventory updates, confirmation email, refund handling, and failure recovery.

Do not implement the visual `Buy now` button before the backend behavior exists.

---

# Phase 7: add Razz and the remaining editorial systems

Only start this after the core vertical slice and forms work.

## 7.1 Razz data flow

Use the planned relationship chain:

```text
Issue -> Feature -> Contributor
                 -> Media
```

Create templates:

```text
RazzPage
RazzIssuePage
RazzFeaturePage
ContributorsPage
ContributorPage
```

An issue page should show its features. A feature should show its contributors and media. A contributor should show their Razz work without requiring a bespoke page.

## 7.2 Music

Use the existing music player only where a real audio source, credits, and usage rights are available. Add:

- release/performance metadata
- artist and contributor credits
- related visual work
- external streaming links
- accessible play/pause and progress controls

Do not make an empty player appear on every work page.

## 7.3 About and ethos

Build:

- About landing page
- Ethos page
- Artists index

Use Directus or a site settings/content collection for long-form copy so the collective can update it without a code change.

---

# Phase 8: quality, accessibility, and production

## 8.1 Automated checks

Add tests for:

- route rendering
- valid and invalid slugs
- not-found states
- normalizers
- media URL generation
- form validation
- newsletter/contact request states

At least one browser-level test should cover:

```text
Home -> Works -> Work detail -> Artist -> related Text
```

## 8.2 Accessibility pass

Check:

- one meaningful `h1` per page
- heading order
- visible keyboard focus
- keyboard navigation for menu, links, forms, and overlays
- form labels and error associations
- image alt text
- reduced-motion behavior for atmosphere effects
- sufficient color contrast
- no information conveyed only by color or animation
- page title and focus updates after route changes

## 8.2.1 Responsive verification matrix

Run this checklist at a narrow phone width such as **375px**, a tablet width
such as **768px**, and a desktop width such as **1280px**. Also test with the
browser zoomed to 200% where practical.

### Navigation

- [ ] The menu toggle remains visible and reachable without horizontal scrolling.
- [ ] Opening the menu exposes every link with a minimum comfortable touch target.
- [ ] The logo, menu button, and links do not overlap.
- [ ] The desktop three-column navigation does not crowd or clip at tablet/desktop boundary widths.
- [ ] Keyboard focus remains visible while moving through the menu.

### Media frames

- [ ] Images and canvas effects stay inside their cards without horizontal overflow.
- [ ] Aspect ratios remain stable while media loads.
- [ ] Portrait, landscape, and gallery media remain inspectable on a phone.
- [ ] Rounded corners and CRT masks do not crop essential image content.
- [ ] Reduced-motion settings do not make media blank or unusable.

### Forms

- [ ] Newsletter, contact, and future enquiry forms fit inside the viewport.
- [ ] Inputs and textareas do not force horizontal scrolling.
- [ ] Submit controls are reachable and usable by touch and keyboard.
- [ ] Validation and success/error messages wrap without overlapping controls.
- [ ] Long messages can be entered without the textarea becoming unusably short.

### Long editorial content

- [ ] Long titles wrap without clipping or overlapping metadata.
- [ ] Long words, URLs, tags, and prose wrap inside the content column.
- [ ] Detail pages remain readable without excessively long line lengths.
- [ ] Related-content links wrap into a usable vertical stack on phones.
- [ ] Artist biographies and text bodies preserve paragraph spacing and readable line height.

## 8.3 Performance pass

Check:

- image dimensions and responsive loading
- lazy loading below-the-fold media
- canvas effects on low-power devices
- font loading behavior
- large JavaScript dependencies
- mobile network performance
- no layout shift when images or cards load

Provide a reduced-effects mode if the CRT/noise/canvas layers make the site difficult to use or expensive on mobile.

## 8.4 SEO and sharing

Add route-aware:

- document titles
- meta descriptions
- canonical URLs
- Open Graph image/title/description
- Twitter/X card metadata if required
- sitemap
- robots rules

For works and texts, use the actual title, artist/author, and media rather than generic homepage metadata.

## 8.5 Deployment

Before production:

- configure the production Directus URL
- configure CORS for the real frontend domain
- verify public Directus permissions
- verify media delivery
- configure form endpoints and email delivery
- rotate exposed credentials
- add environment variables in the hosting provider
- run a production build
- test the deployed site with direct URL refreshes
- confirm SPA fallback routing works on the host

### Production acceptance check

A release is ready only when:

- all navigation destinations work
- no known lint errors remain
- production build passes
- core pages render from published CMS content
- forms reach their intended destination
- unpublished content is private
- mobile and keyboard flows are usable
- exposed credentials have been rotated
- the deployed site survives a direct refresh on a detail route

---

# Suggested execution order

Work in this order and stop at the acceptance check after each group:

1. Repair `ArtistCard`, media paths, footer, mobile nav, and not-found behavior.
2. Add Works, Work detail, Texts, Text detail, Artists index, Journal, About, Contact, Vault, and Shop route templates.
3. Complete the local-data Work -> Artist -> Text -> Journal journey.
4. Normalize content shapes and add media helpers.
5. Connect Directus reads for the same journey.
6. Connect newsletter and contact writes through a protected endpoint.
7. Add Vault request/reservation behavior.
8. Add Razz, music, commissions, and shop details.
9. Add tests, accessibility, SEO, performance, and deployment checks.

# Definition of done for the first milestone

The first milestone is complete when:

- `npm run lint` passes.
- `npm run build` passes.
- all core navbar links resolve to real pages.
- Works, Work detail, Artists, Artist detail, Texts, Text detail, and Journal are usable with local data.
- the Work -> Artist -> Text -> Journal chain works.
- the global footer exists.
- the not-found route works.
- forms have validation and visible result states, even if their protected backend endpoint is still the next milestone.
- the site works at mobile width and with keyboard navigation.
- the progress log records what was completed and what remains.
