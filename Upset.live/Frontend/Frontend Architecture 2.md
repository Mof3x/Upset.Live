You have made the right start: the **atmosphere**, shared **layout**, and initial `HomePage.jsx` are already separated. From here, do not create a separate file for every artist, painting, issue, or product—create a small number of **page templates**, reusable **cards/rails**, and dynamic routes that Directus fills with content. Your planned data model is relationship-heavy, so this approach lets new works, contributors, texts and editions appear without new frontend page files.

## First tidy-up

Your current structure is headed in the right direction:

```
components/
├── atmosphere/
├── cards/
├── layout/
├── media/
└── rails/

data/
lib/
pages/
```

Make these two naming decisions now:

- Use **PascalCase** for React component filenames: `MusicPlayerY2k.jsx`, `DitherCanvas.jsx`, `GlowCanvas.jsx`.
    
- Keep CSS beside the component it styles where practical, such as `WorkCard.jsx` + `WorkCard.css`; global theme, fonts and variables remain in `index.css`.
    

Use **`/shop`** as the public route and label it **Shop** in the top nav. Print editions live at **`/shop/prints`** as the first Shop category, alongside publications, posters, apparel and music. The Vault remains the archival/collective section, preserving the distinction between the private/collective archive and public purchasable editions.

## Target structure

This is the structure I would grow your project into. It looks like a lot, but you build it gradually—not tonight.

```
src/
├── assets/
│   └── fonts/
│
├── components/
│   ├── atmosphere/
│   │   ├── DitherCanvas.jsx
│   │   ├── DitherCanvas.css
│   │   ├── EdgeDiffuse.js
│   │   ├── Galaxy.jsx
│   │   ├── Galaxy.css
│   │   ├── GlowCanvas.jsx
│   │   ├── Noise.jsx
│   │   ├── Noise.css
│   │   ├── Particles.jsx
│   │   ├── Particles.css
│   │   └── Scanlines.css
│   │
│   ├── cards/
│   │   ├── WorkCard.jsx
│   │   ├── WorkCard.css
│   │   ├── ArtistCard.jsx
│   │   ├── ArtistCard.css
│   │   ├── ContributorCard.jsx
│   │   ├── ContributorCard.css
│   │   ├── TextCard.jsx
│   │   ├── TextCard.css
│   │   ├── JournalCard.jsx
│   │   ├── JournalCard.css
│   │   ├── RazzFeatureCard.jsx
│   │   ├── RazzFeatureCard.css
│   │   ├── VaultItemCard.jsx
│   │   ├── VaultItemCard.css
│   │   ├── ShopItemCard.jsx
│   │   └── ShopItemCard.css
│   │
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── Footer.jsx
│   │   ├── Footer.css
│   │   ├── SiteShell.jsx
│   │   ├── PageHero.jsx
│   │   ├── PageHero.css
│   │   ├── PageIntro.jsx
│   │   └── PageIntro.css
│   │
│   ├── media/
│   │   ├── MediaGallery.jsx
│   │   ├── MediaGallery.css
│   │   ├── HeroMedia.jsx
│   │   ├── AudioPlayer.jsx
│   │   ├── MusicPlayerY2k.jsx
│   │   └── MusicPlayerY2k.css
│   │
│   ├── rails/
│   │   ├── RelatedWorksRail.jsx
│   │   ├── RelatedTextsRail.jsx
│   │   ├── RelatedJournalRail.jsx
│   │   ├── RelatedArtistsRail.jsx
│   │   ├── ContributorRail.jsx
│   │   ├── FeaturedRail.jsx
│   │   └── Rail.css
│   │
│   ├── forms/
│   │   ├── NewsletterForm.jsx
│   │   ├── ContactForm.jsx
│   │   ├── CommissionForm.jsx
│   │   └── EnquiryForm.jsx
│   │
│   └── ui/
│       ├── Button.jsx
│       ├── EditorialLink.jsx
│       ├── QuoteBlock.jsx
│       ├── TagList.jsx
│       ├── FilterBar.jsx
│       ├── EmptyState.jsx
│       ├── LoadingState.jsx
│       └── SectionHeading.jsx
│
├── data/
│   └── mockContent.js
│
├── lib/
│   ├── directus.js
│   ├── queries.js
│   ├── media.js
│   ├── normalise.js
│   └── relatedContent.js
│
├── pages/
│   ├── HomePage.jsx
│   ├── HomePage.css
│   ├── AboutPage.jsx
│   ├── EthosPage.jsx
│   ├── ArtistsPage.jsx
│   ├── ArtistPage.jsx
│   │
│   ├── WorksPage.jsx
│   ├── WorkPage.jsx
│   │
│   ├── TextsPage.jsx
│   ├── TextPage.jsx
│   │
│   ├── JournalPage.jsx
│   ├── JournalPostPage.jsx
│   │
│   ├── RazzPage.jsx
│   ├── RazzIssuePage.jsx
│   ├── RazzFeaturePage.jsx
│   ├── ContributorsPage.jsx
│   ├── ContributorPage.jsx
│   │
│   ├── VaultPage.jsx
│   ├── VaultItemPage.jsx
│   │
│   ├── ShopPage.jsx
│   ├── ShopItemPage.jsx
│   │
│   ├── CommissionsPage.jsx
│   ├── CommissionDisciplinePage.jsx
│   ├── NewsletterPage.jsx
│   ├── ContactPage.jsx
│   └── NotFoundPage.jsx
│
├── App.jsx
├── index.css
└── main.jsx
```

## Page templates

You need **about 18 page templates**, not hundreds of pages. The individual people, artworks, essays, updates and products all use a repeatable template populated from Directus.

|Template file|URL pattern|Reused for|
|---|---|---|
|`HomePage.jsx`|`/`|One homepage|
|`AboutPage.jsx`|`/about`|About landing page|
|`EthosPage.jsx`|`/about/ethos`|One editorial/ethos page|
|`ArtistsPage.jsx`|`/artists`|All artists grid|
|`ArtistPage.jsx`|`/artists/:slug`|Gor, Kanyin, Mofe, Q, Mbana, Rae, Demi and guests|
|`WorksPage.jsx`|`/works`|Works archive, category/tag filters|
|`WorkPage.jsx`|`/works/:slug`|Every painting, model, release or performance|
|`TextsPage.jsx`|`/texts`|Poetry, essays, manifestos, journalism archive|
|`TextPage.jsx`|`/texts/:slug`|Every text, poem, essay or manifesto|
|`JournalPage.jsx`|`/journal`|Process, reflections, notes and updates|
|`JournalPostPage.jsx`|`/journal/:slug`|Every journal entry|
|`RazzPage.jsx`|`/razz`|Razz issue/archive landing page|
|`RazzIssuePage.jsx`|`/razz/issues/:slug`|Each issue|
|`RazzFeaturePage.jsx`|`/razz/features/:slug`|Each feature, interview or visual essay|
|`ContributorPage.jsx`|`/contributors/:slug`|Each writer, photographer, curator, editor etc.|
|`VaultPage.jsx`|`/vault`|Collective archive / closed or restricted items|
|`VaultItemPage.jsx`|`/vault/:slug`|Every original, limited edition or archive object|
|`ShopPage.jsx`|`/shop`|Public catalogue: prints, publications, posters, apparel etc.|
|`ShopItemPage.jsx`|`/shop/:slug`|Each public purchasable object|
|`CommissionsPage.jsx`|`/commissions`|Commission landing page|
|`CommissionDisciplinePage.jsx`|`/commissions/:discipline`|Painting, 3D, music, writing etc.|
|`ContactPage.jsx`|`/contact`|Enquiries, collaborations and socials|

Your existing schema already supports most of these templates through collections for artists, works, texts, journal entries, Razz issues/features/contributors, Vault objects, commissions and navigation/site settings.

## Routes in `App.jsx`

Once you install React Router, your routes can look like this:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SiteShell from "./components/layout/SiteShell";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EthosPage from "./pages/EthosPage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistPage from "./pages/ArtistPage";

import WorksPage from "./pages/WorksPage";
import WorkPage from "./pages/WorkPage";

import TextsPage from "./pages/TextsPage";
import TextPage from "./pages/TextPage";

import JournalPage from "./pages/JournalPage";
import JournalPostPage from "./pages/JournalPostPage";

import RazzPage from "./pages/RazzPage";
import RazzIssuePage from "./pages/RazzIssuePage";
import RazzFeaturePage from "./pages/RazzFeaturePage";
import ContributorsPage from "./pages/ContributorsPage";
import ContributorPage from "./pages/ContributorPage";

import VaultPage from "./pages/VaultPage";
import VaultItemPage from "./pages/VaultItemPage";

import ShopPage from "./pages/ShopPage";
import ShopItemPage from "./pages/ShopItemPage";

import CommissionsPage from "./pages/CommissionsPage";
import CommissionDisciplinePage from "./pages/CommissionDisciplinePage";

import NewsletterPage from "./pages/NewsletterPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/ethos" element={<EthosPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:slug" element={<ArtistPage />} />

          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:slug" element={<WorkPage />} />

          <Route path="/texts" element={<TextsPage />} />
          <Route path="/texts/:slug" element={<TextPage />} />

          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalPostPage />} />

          <Route path="/razz" element={<RazzPage />} />
          <Route path="/razz/issues/:slug" element={<RazzIssuePage />} />
          <Route path="/razz/features/:slug" element={<RazzFeaturePage />} />
          <Route path="/contributors" element={<ContributorsPage />} />
          <Route path="/contributors/:slug" element={<ContributorPage />} />

          <Route path="/vault" element={<VaultPage />} />
          <Route path="/vault/:slug" element={<VaultItemPage />} />

          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ShopItemPage />} />

          <Route path="/commissions" element={<CommissionsPage />} />
          <Route
            path="/commissions/:discipline"
            element={<CommissionDisciplinePage />}
          />

          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}
```

The `:slug` part is crucial. `ArtistPage.jsx` becomes all seven artist pages: it reads whether the URL is `/artists/gor` or `/artists/rae`, asks Directus for that record, then renders the same template. This follows your existing artist/work/text relationship model.

## Cards you need

Cards are the things repeated in grids, horizontal rails and search/filter results. You do **not** need a custom card for every page.

## Essential cards

|Card|Used on|
|---|---|
|`WorkCard`|Home, Works archive, Artist page, related works rail|
|`ArtistCard`|Artists page, About page, related artist rail|
|`ContributorCard`|Razz features, Razz issue, contributor archive, text credits|
|`TextCard`|Texts archive, Artist page, work-related text rail|
|`JournalCard`|Journal archive, artist page, work-related journal rail|
|`RazzFeatureCard`|Razz issue page, Razz archive, related magazine rail|
|`VaultItemCard`|Vault archive and related edition strip|
|`ShopItemCard`|Shop grid and public purchase pages|

## Do not make these yet

You probably do **not** need separate components such as:

```
PaintingCard
3DModelCard
MusicReleaseCard
PerformanceCard
PoemCard
EssayCard
ManifestoCard
PrintCard
PosterCard
ApparelCard
```

Instead, make `WorkCard`, `TextCard`, and `ShopItemCard` flexible using variants.

jsx

```jsx
<WorkCard work={work} variant="grid" />
<WorkCard work={work} variant="featured" />
<WorkCard work={work} variant="rail" />
```

That keeps the site visually consistent and stops the codebase from becoming unmanageable.

## Rails you need

Rails give the archive its connected feeling. Your previous plan already makes contextual relations central: each important page should lead outward to artists, works, texts, journals, issues or editions.

Build these once:

```
RelatedWorksRail.jsx
RelatedTextsRail.jsx
RelatedJournalRail.jsx
RelatedArtistsRail.jsx
ContributorRail.jsx
FeaturedRail.jsx
```

## Use them like this

|Page|Rails|
|---|---|
|Artist page|Selected Works, Related Texts, Journal Reflections|
|Work page|Artist, Related Works, Related Texts, Journal Thread, Edition/Vault item|
|Text page|Author/Contributor, Related Artwork, Related Journal, Razz feature|
|Journal post|Related Artist, Related Work, Recent Threads|
|Razz feature|Contributor(s), Related Works, More from this Issue|
|Vault object|Artist, Related Work, Related Text, Journal context|
|Shop item|Related Work, Artist, Related Publication/Edition|

The direct links selected in Directus should take priority; shared categories and tags can then fill any empty slots as a fallback. Your schema has explicit junction tables for artists-to-works, texts-to-works, features-to-contributors, files and related works, so the content can be intentionally connected rather than randomly suggested.

## Shared UI components

These small components will make pages much faster to build:

```
Button.jsx
EditorialLink.jsx
SectionHeading.jsx
QuoteBlock.jsx
TagList.jsx
FilterBar.jsx
PageIntro.jsx
PageHero.jsx
HeroMedia.jsx
MediaGallery.jsx
NewsletterForm.jsx
ContactForm.jsx
CommissionForm.jsx
LoadingState.jsx
EmptyState.jsx
```

## Most important ones first

Build in this order:

1. `PageIntro`
2. `WorkCard`
3. `ArtistCard`
4. `TextCard`
5. `SectionHeading`
6. `RelatedWorksRail`
7. `TagList`
8. `FilterBar`
9. `ContributorCard`
10. Forms


## What each major page contains

## Home

Your `HomePage.jsx` can contain:

```
HomeHero
QuoteBlock
FeaturedWork → WorkCard variant="featured"
Artist rail
Related text / Journal rail
NewsletterForm
Footer
```

## Artists + artist profile

```
ArtistsPage:
PageIntro
ArtistCard grid
Filter by collective member / guest / practice tag

ArtistPage:
PageHero / portrait
Biography
Mediums / artist tags
Selected WorkCard rail
TextCard rail
JournalCard rail
Commission CTA
```

## Works + work detail

```
WorksPage:
PageIntro
FilterBar
WorkCard grid
Pagination or Load More

WorkPage:
HeroMedia
Title / artist / year
Credits
Curator note
TagList
RelatedTextsRail
RelatedJournalRail
RelatedWorksRail
Edition strip / Vault link if relevant
```
## Texts + text detail

```
TextsPage:
PageIntro
Category tabs
FilterBar
TextCard list/grid

TextPage:
Title
Author / ContributorCard
Lead image or typographic hero
Rich text body
Pull quotes
TagList
RelatedWorksRail
Razz link if relevant
Vault publication link if relevant
```

## Journal

```
JournalPage:
PageIntro
Category tabs: Process + Reflections / Notes / Updates
JournalCard list
Tag / artist filters

JournalPostPage:
Title / date / author
Body and embedded media
Related work or artist
RecentThreadsRail
Contextual newsletter or RSVP block
```

## Razz

```
RazzPage:
Current issue hero
Issue archive
Featured feature rail
Contributors rail

RazzIssuePage:
Cover
Editorial note
Table of contents
RazzFeatureCard list
Contributors rail

RazzFeaturePage:
Feature hero
Body
ContributorCard / contributor credits
Related works
More from this issue
```

## Vault vs Shop

Keep their templates visually related, but their user intention is different:

```
Vault:
Archive-led
Provenance-led
May include restricted / internal material
Original works, collective editions, archive objects

Shop:
Public and purchase-ready
Prints, publications, posters, apparel, music, guest works
```

Your schema already separates closed collective Vault material from open public objects, but your revised site plan makes the public purchasing experience a Shop; that is a sensible, clearer implementation.
## Build order

Do **not** generate all those empty files now. Add files when a page is actually being built.

## Build now

```
HomePage.jsx
WorksPage.jsx
WorkPage.jsx
ArtistsPage.jsx
ArtistPage.jsx

WorkCard.jsx
ArtistCard.jsx
PageIntro.jsx
PageHero.jsx
SectionHeading.jsx
RelatedWorksRail.jsx
TagList.jsx
```

## Build next

```
TextsPage.jsx
TextPage.jsx
JournalPage.jsx
JournalPostPage.jsx

TextCard.jsx
JournalCard.jsx
RelatedTextsRail.jsx
RelatedJournalRail.jsx
FilterBar.jsx
NewsletterForm.jsx
```

## Build after the core works

```
RazzPage.jsx
RazzIssuePage.jsx
RazzFeaturePage.jsx
ContributorCard.jsx
ContributorPage.jsx

VaultPage.jsx
VaultItemPage.jsx
ShopPage.jsx
ShopItemPage.jsx
```

## Build last

```
CommissionsPage.jsx
CommissionDisciplinePage.jsx
ContactPage.jsx
NewsletterPage.jsx

CommissionForm.jsx
ContactForm.jsx
EnquiryForm.jsx
```

## Your immediate next move

Since `HomePage.jsx`, `Navbar.jsx`, `Footer.jsx` and `SiteShell.jsx` now exist, make these files next:

```
src/pages/WorksPage.jsx
src/pages/WorkPage.jsx
src/pages/ArtistsPage.jsx
src/pages/ArtistPage.jsx

src/components/cards/WorkCard.jsx
src/components/cards/ArtistCard.jsx

src/components/layout/PageIntro.jsx
src/components/rails/RelatedWorksRail.jsx
src/components/ui/SectionHeading.jsx
```

Use mock data first. Once one work page and one artist page render convincingly, connect those two templates to Directus. Everything else—texts, journal, Razz, Vault and Shop—then reuses the same content/card/rail pattern rather than requiring a new frontend architecture.