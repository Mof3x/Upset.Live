# Architecture

The site is a client-rendered React app. There is no server of its own: GitHub Pages serves the built files, and the
browser reads content straight from the Directus API (see [Data layer](data-layer.md)).

## Startup

1. `src/main.jsx` mounts `<App />` in `StrictMode` and imports `index.css`.
2. `src/App.jsx` creates the `BrowserRouter`, registers every route and wraps them in `SiteShell`. A small
   `ScrollToTop` component scrolls to the top on every path change.
3. `src/components/layout/SiteShell.jsx` renders the persistent atmosphere and frame:
   - a `Noise` canvas layer behind everything;
   - the `vault66-crt-effect` CRT overlay (scanlines, sweep, glow, edge glow);
   - `Navbar`, the routed page inside `<main class="site-content">`, and `Footer`.

The shell stays mounted while you move between pages. Always navigate with React Router's `<Link>` (or `TextLink`):
a plain `<a href>` to an internal page reloads the app and restarts every canvas effect.

## Routes

Every route is registered in `src/App.jsx`.

| Route | Page component | File | Content |
|---|---|---|---|
| `/` | `HomePage` | `HomePage.jsx` | Hero and featured work (the first published work marked `featured`, otherwise the first by order), a quote, related works, newsletter signup |
| `/about` | `AboutPage` | `CorePages.jsx` | Static introduction and links |
| `/about/ethos` | `EthosPage` | `CorePages.jsx` | The published text with slug `ethos`, or a placeholder |
| `/artists` | `ArtistsPage` | `CorePages.jsx` | Published artists |
| `/artists/:slug` | `ArtistPage` | `ArtistPage.jsx` | Artist profile, their works and texts |
| `/works` | `WorksPage` | `CorePages.jsx` | Published works, filterable by category (`?category=`) |
| `/works/:slug` | `WorkPage` | `CorePages.jsx` | Work detail, credits, related texts, more in the same category |
| `/texts` | `TextsPage` | `CorePages.jsx` | Published texts, filterable by category |
| `/texts/:slug` | `TextPage` | `CorePages.jsx` | Text, authors, related works |
| `/journal` | `JournalPage` | `JournalPages.jsx` | Published journal entries |
| `/journal/:slug` | `JournalPostPage` | `JournalPages.jsx` | Journal entry |
| `/razz` | `RazzPage` | `RazzPages.jsx` | Razz magazine issues |
| `/razz/issues/:slug` | `RazzIssuePage` | `RazzPages.jsx` | Issue and its features |
| `/razz/features/:slug` | `RazzFeaturePage` | `RazzPages.jsx` | Feature, contributors, gallery |
| `/contributors` | `ContributorsPage` | `RazzPages.jsx` | Razz contributors credited on a published feature |
| `/contributors/:slug` | `ContributorPage` | `RazzPages.jsx` | Contributor and their features |
| `/vault` | `VaultPage` | `VaultPages.jsx` | Open (public) Vault items |
| `/vault/:slug` | `VaultItemPage` | `VaultPages.jsx` | Vault item, "Add to basket" when it's for sale, and a "Request information" form |
| `/shop` | `ShopPage` | `VaultPages.jsx` | Vault items in shop categories |
| `/shop/:slug` | `ShopSlugPage` | `VaultPages.jsx` | A shop category (e.g. `/shop/prints`) or a single item |
| `/basket` | `BasketPage` | `BasketPage.jsx` | The visitor's basket and Checkout |
| `/order/complete` | `OrderCompletePage` | `VaultPages.jsx` | Where Stripe returns a buyer after paying; empties the basket |
| `/commissions` | `CommissionsPage` | `CommissionPages.jsx` | Commission disciplines |
| `/commissions/:discipline` | `CommissionDisciplinePage` | `CommissionPages.jsx` | One discipline, example works, enquiry form |
| `/newsletter` | `NewsletterPage` | `FormPages.jsx` | Newsletter signup |
| `/contact` | `ContactPage` | `FormPages.jsx` | Contact form |
| `*` | `NotFoundPage` | `NotFoundPage.jsx` | 404 |

Notes on specific routes:

- **`/shop/:slug`** is either a category or an item. If the slug is in `SHOP_CATEGORY_SLUGS` (`prints`,
  `publications`, `posters`, `apparel`, `music-digital-releases`, `guest-works`, in `VaultPages.jsx`), it renders that
  category; otherwise it looks up a Vault item. The Shop is the subset of open Vault items in those categories. It is
  not a separate collection.
- **Buying** works the same in the Shop and the Vault. An item shows "Add to basket" when its status is Available, it
  has a price and its stock (`inventory`) is at least 1, and the site was built with `VITE_CHECKOUT_ENDPOINT`. A priced
  item with no stock shows "Sold out"; an item without a price is enquiry-only. The basket is kept in the visitor's
  browser and re-checked against Directus on `/basket`. Checkout sends the whole basket to the checkout Worker
  (`workers/checkout`), which holds the stock of every line while the buyer pays on Stripe's page. Stripe returns the
  buyer to `/order/complete` (it lives under `/order/` because `/shop/:slug` would read "complete" as an item). See
  [Deployment → Checkout](deployment.md#checkout).
- **Commissions** use a built-in list of disciplines (`DISCIPLINES` in `CommissionPages.jsx`). If the public can read
  the Directus `commission_types` collection, its names and slugs are used instead, and the descriptions stay local.
- **Ethos** shows the published Directus text whose slug is `ethos`. Editors change the ethos page by editing that text.
- **About** and the homepage quote are hard-coded in the page components.
- **Navigation** is hard-coded in `Navbar.jsx` and `Footer.jsx`. `getNavigation()` in `queries.js` reads
  `navigation_items`, but nothing uses it yet. The footer reads its statement and social links from `site_settings`.

## Pages and states

Pages are grouped by section, one file per section, and share `pages/CorePages.css`. A typical page:

1. calls `usePageTitle()` to set `document.title`;
2. loads its records with `useDirectusResource()`;
3. turns the main resources into one state with `gateStatus()`: `loading`, `closed` (Directus refused access),
   `error` or `success`;
4. renders `<PageState status=… />` for anything other than success, or `notFound` when a slug matches nothing;
5. renders the content with shared components.

Secondary data (credits, galleries, related records) never blocks a page: when it fails, that part is empty. The
[Data layer](data-layer.md) page covers this in detail.

`ContentState` holds the visitor-facing copy for each state. `closed` reads "This room is not open yet", which is what
visitors see on sections the public can't read yet.

## Components

| Folder | Contents |
|---|---|
| `atmosphere/` | `Noise` (animated grain, mounted in the shell), `glowcanvas` and `dithercanvas` (image treatments used on the homepage), `edgeDiffuse.js` (shared helper), and `Galaxy`/`Particles` (WebGL; not mounted) |
| `audio/` | `AudioProvider` (one `<audio>` element for the whole site, mounted in the shell), `AudioPlayer` (the handheld player on a work page), `NowPlaying` (the small bar shown on other pages while a recording plays), `ListenLinks` ("Listen on …" buttons), `player.js` (`useAudioPlayer()`, `formatTime()`) |
| `cards/` | `WorkCard`, `ArtistCard` (takes `basePath`, so it also renders contributors), `TextCard`, `EntryCard` (journal and other editorial lists), `VaultItemCard` |
| `forms/` | `EnquiryForm` (config-driven fields, validation, honeypot, sending/sent/error states) and `NewsletterForm` |
| `basket/` | `BasketProvider` (the basket for the whole site, mounted in the shell, saved in localStorage) and `AddToBasket` (price, stock note, quantity and "Add to basket" on item pages) |
| `layout/` | `SiteShell`, `Navbar`, `Footer`, `CardGrid` (responsive grid; the `min` prop sets the minimum card width), `PageIntro` and `DetailHeader`, `PageState` |
| `rails/` | `RelatedRail`, a titled list of links to related records |
| `ui/` | `Prose` (renders paragraph arrays, with a fallback), `MediaFrame` (fixed aspect ratio image frame), `MetaLine`, `TagList`, `TextLink` (internal `Link` or external `<a>` with an optional arrow), `SectionHeading`, `CategoryNav` (filter buttons), `ContentState` |

**Music.** `AudioProvider` lives in `SiteShell`, which stays mounted across `<Link>` navigation, so a recording keeps
playing while a visitor browses. Pages only describe a track (`{ src, title, artist, href }`). Playback always starts
from a visitor's click. `AudioPlayer` and `NowPlaying` read the shared state through `useAudioPlayer()`. The bar is
hidden on the recording's own work page, where the full player is shown. Controls are labelled buttons and a range
input; only state changes (loading, playing, paused, "could not be loaded") are announced, not the running time.

## Styling

- Each component has a co-located `.css` file with global, BEM-style class names (`work-card__title`). There are no
  CSS modules or CSS-in-JS.
- `index.css` holds global layout, typography and the CRT edge masks. Section pages share `pages/CorePages.css`.
- `HomePage.css` sets `form { justify-self: center }` globally. Keep that in mind when a form elsewhere looks
  off-centre.

## Visual effects

- **Noise** repaints a grain texture on a canvas at a fixed interval, behind the whole site.
- **CRT overlay** comes from `vault66-crt-effect`, configured in `SiteShell.jsx` (colours, sweep speed, glow). Since
  10/10/2026 the scanlines are at `scanlineOpacity` 0.15 (half the original) and the edge glow (the vignette) is 28px at
  30% opacity. `index.css` sets the layer order: edge glow and sweep line (99), then media (100), then scanlines (101).
  So the vignette never covers artwork, but the faint scanlines still run over everything. Don't give any wrapper
  between `.crt-inner` and an image a `z-index`, or the image is trapped under the overlays again (this is why
  `.page-content` has none).
- **GlowCanvas** and **DitherCanvas** redraw an image on a canvas with glow, grayscale, scanlines, edge diffusion and a
  green Bayer dither. They load images with `crossOrigin = "anonymous"` and read pixels with `getImageData`, which
  only works because Directus sends `Access-Control-Allow-Origin` for `https://upset.live`. They skip drawing until the
  image has loaded and the canvas has a size, and if the canvas is tainted they leave the plain image showing. A new
  production origin must be added to the Directus `CORS_ORIGIN` setting, or these effects fall back to plain images.
- **Give every effect canvas a CSS size** (`width: 100%` plus an `aspect-ratio`, or a fixed height). Each redraw sets
  the canvas's pixel size to its box × `devicePixelRatio`. A canvas with no CSS size takes its box from those pixels,
  so on phones (ratio 2–3) it grew on every redraw and froze the page (the homepage related works, fixed 10/10/2026).
  The components now keep their base class (`GlowCanvas`/`DitherCanvas`) when you pass a `className`, skip redraws when
  the size hasn't changed, and pin an unsized canvas at its first size instead of letting it grow. But style new
  canvases explicitly.

These are presentation only. Keep content, routing and data out of the effect components.

## Known issues

- **Fonts.** The Cormorant Infant and Bokor files in `src/assets/fonts/` aren't registered with `@font-face`. The CSS
  asks for `"Cormorant Infant VF"`, so most visitors get the fallback serif.
- **Old code.** `HomePage.jsx` begins with a long commented-out previous version; the live code starts at the first
  `import`. `src/mock/` isn't imported anywhere.
- **Performance and accessibility.** The noise and CRT layers run all the time and don't yet respect
  `prefers-reduced-motion`. A performance and accessibility pass is on the Master TODO.
- **SEO.** Pages set their titles, but there are no meta descriptions, Open Graph tags, sitemap or robots rules yet.
  Because the site renders in the browser, crawlers that don't run JavaScript see an empty page.
