You already have a good **Vite + React prototype**, and you should integrate it rather than restart it in Next.js. Your current code is the visual/interactive layer; Directus becomes the content layer behind it.

The key shift is: **keep your components, but replace hard-coded titles, images and lists with data fetched from Directus.** Your existing Directus plan is designed for this—artists, works, texts, journal entries, Vault items and site settings all have their own collections and relationships.

## What you already have

Your structure is roughly:

text

```

src/   
component/    
Galaxy.jsx    
Galaxy.css    
Navbar.jsx    
Navbar.css    
Noise.jsx    
Noise.css    
Particles.jsx    
Scanlines.css    
musicPlayerY2k.jsx    
musicPlayerY2k.css   

App.jsx  
dithercanvas.jsx  
edgeDiffuse.js  
glowcanvas.jsx  
index.css  
main.jsx
```

That is a strong base for the reference aesthetic:

- `Galaxy`, `Particles`, `Noise`, `Scanlines`, `dithercanvas` and `glowcanvas` are your **global atmosphere layer**.
    
- `Navbar` is already a reusable global component.
    
- `musicPlayerY2k` can become a reusable feature for music works/releases.
    
- `App.jsx` should stop being “the whole homepage” and become the site shell plus routing.
    
- New components should focus on reusable content: `WorkCard`, `ArtistCard`, `TextCard`, `RelatedRail`, `Footer`, and page templates.
    

## Do not move to Next.js yet

My previous response assumed you were starting fresh. You are not: you have a working Vite frontend with custom visuals already underway.

For a solo developer, the sensible path now is:

text

```
Your existing Vite React app
          ↓
React Router for pages
          ↓
Directus SDK for content
          ↓
Supabase/Directus backend you already planned
          ↓
Vercel, Netlify or Cloudflare Pages deployment
```

A Vite React frontend can fetch Directus REST/GraphQL content perfectly well. Directus is headless: it exposes APIs from your collections, and React decides how that content looks.

Before restructuring anything:

bash

```bash
git add .
git commit -m "Save current visual prototype"
git branch cms-integration
git checkout cms-integration
```

This gives you a safe visual-prototype checkpoint. If routing or CMS work breaks the effects, you can return to the current version instantly.

Also make a simple `README` note listing what each visual component does. Future you will thank you.

text
```
Galaxy = ambient visual background
Noise = grain overlay
Scanlines = CRT/archive texture
Particles = animated foreground/background details
dithercanvas = image/visual effect
glowcanvas = glow effect
musicPlayerY2k = optional player for releases
```
## Restructure lightly

You do **not** need to rewrite all files. Just introduce folders around what you already have.

text

```
src/
  components/
    atmosphere/
      Galaxy.jsx
      Galaxy.css
      Noise.jsx
      Noise.css
      Particles.jsx
      Scanlines.jsx
      Scanlines.css
      DitherCanvas.jsx
      GlowCanvas.jsx

    layout/
      Navbar.jsx
      Navbar.css
      Footer.jsx
      SiteShell.jsx

    cards/
      WorkCard.jsx
      ArtistCard.jsx
      TextCard.jsx

    rails/
      RelatedWorksRail.jsx
      RelatedTextsRail.jsx
      ArtistRail.jsx

    media/
      MusicPlayerY2k.jsx
      MusicPlayerY2k.css

  pages/
    HomePage.jsx
    WorksPage.jsx
    WorkPage.jsx
    ArtistPage.jsx
    TextsPage.jsx
    TextPage.jsx
    AboutPage.jsx
    NotFoundPage.jsx

  lib/
    directus.js
    queries.js
    media.js

  data/
    mockContent.js

  App.jsx
  main.jsx
  index.css
```

You can do this gradually. Move one file, update its import, verify the page still works, then move the next. Do **not** make all changes in one huge commit.

## Make a site shell

Your background effects should not be copied into every page. Put them in a site-level wrapper once.

Create `src/components/layout/SiteShell.jsx`:

jsx

```jsx
import Navbar from "./Navbar";
import Galaxy from "../atmosphere/Galaxy";
import Noise from "../atmosphere/Noise";
import Particles from "../atmosphere/Particles";
import "../atmosphere/Scanlines.css";

export default function SiteShell({ children }) {
  return (
    <div className="site-shell">
      <Galaxy />
      <Particles />
      <Noise />
      <div className="scanlines" />

      <Navbar />

      <main className="site-content">
        {children}
      </main>
    </div>
  );
}
```

Then, in `App.jsx`, use it around all pages:


```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiteShell from "./components/layout/SiteShell";
import HomePage from "./pages/HomePage";
import WorksPage from "./pages/WorksPage";
import WorkPage from "./pages/WorkPage";
import ArtistPage from "./pages/ArtistPage";
import TextsPage from "./pages/TextsPage";
import TextPage from "./pages/TextPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:slug" element={<WorkPage />} />
          <Route path="/artists/:slug" element={<ArtistPage />} />
          <Route path="/texts" element={<TextsPage />} />
          <Route path="/texts/:slug" element={<TextPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}
```

Install React Router if it is not already in `package.json`:

bash

`npm install react-router-dom`

This is the first important integration point: your design effects stay persistent, but the central content changes from route to route.

## Fix navigation next

Your `Navbar.jsx` should use `Link`, not normal `<a href="">` tags. A normal anchor refreshes the browser and can restart your canvas effects; React Router navigation changes pages without a full reload.

jsx

```jsx
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="site-header">
      <Link to="/" className="site-mark">
        UPSETXOCIETY
      </Link>

      <nav aria-label="Primary navigation">
        <NavLink to="/works">Works</NavLink>
        <NavLink to="/texts">Texts</NavLink>
        <NavLink to="/journal">Journal</NavLink>
        <NavLink to="/print">Print</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
    </header>
  );
}
```

At first, it is fine if some routes go to a small “in progress” page. The priority is establishing the routing architecture before making all the content.

## Start with mock content

Do not connect Directus until the layout and routes work.

Create `src/data/mockContent.js`:

```jsx
export const featuredWork = {
  id: "work-001",
  title: "Untitled Study I",
  slug: "untitled-study-i",
  year: "2026",
  medium: "Mixed media",
  image: "/gor.jpeg",
  artist: {
    name: "Gor",
    slug: "gor",
  },
  curatorNote:
    "A study in fragmentation, presence and the texture of a remembered place.",
};

export const works = [
  featuredWork,
  {
    id: "work-002",
    title: "Signal Loss",
    slug: "signal-loss",
    year: "2026",
    medium: "3D modelling",
    image: "/gor.jpeg",
    artist: { name: "Mofe", slug: "mofe" },
  },
];
```

Then create `src/components/cards/WorkCard.jsx`:


```jsx
import { Link } from "react-router-dom";

export default function WorkCard({ work }) {
  return (
    <article className="work-card">
      <Link to={`/works/${work.slug}`} className="work-card__link">
        <div className="work-card__image-wrap">
          <img
            className="work-card__image"
            src={work.image}
            alt={`${work.title} by ${work.artist.name}`}
          />
        </div>

        <p className="eyebrow">{work.medium}</p>
        <h2>{work.title}</h2>
        <p className="work-card__meta">
          {work.artist.name} — {work.year}
        </p>
      </Link>
    </article>
  );
}
```

Now you have one component that can appear in:

- Homepage featured work
    
- Works grid
    
- Artist’s selected works
    
- Related works rail
    
- Later: related Vault object links
    

That is the reusable template system in practice.

## Turn your current `App.jsx` into `HomePage.jsx`

If your current `App.jsx` already resembles the screenshot, move most of it into:

text

`src/pages/HomePage.jsx`

Then turn it into a content-driven version. For example:

```jsx
import { Link } from "react-router-dom";
import WorkCard from "../components/cards/WorkCard";
import { featuredWork } from "../data/mockContent";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">Art House</p>
          <h1>UpsetXociety</h1>
          <p>A living archive for works, texts, sound and shared inquiry.</p>

          <Link className="editorial-link" to={`/works/${featuredWork.slug}`}>
            View art
          </Link>
        </div>

        <img
          className="home-hero__image"
          src={featuredWork.image}
          alt={`${featuredWork.title} by ${featuredWork.artist.name}`}
        />
      </section>

      <blockquote className="home-quote">
        “Blackness is lit, don't let anybody tell you it's not.”
      </blockquote>

      <section className="section">
        <p className="eyebrow">Featured work</p>
        <WorkCard work={featuredWork} />
      </section>
    </>
  );
}
```


At this stage, your current visual work remains intact, but you have started separating:

```
Visual design → CSS and components
Page composition → page files
Content → mock objects, then Directus
Navigation → React Router
```

## Add Directus after the mock site works

Once the above is stable, install the Directus SDK:

bash

`npm install @directus/sdk`

Create a root `.env` file:

bash

`VITE_DIRECTUS_URL=https://cms.yourdomain.com`

Vite exposes client-side environment variables only when they begin with `VITE_`. Do **not** put Directus admin tokens, Supabase service keys, Stripe keys or database passwords in this file.

Create `src/lib/directus.js`:

jsx

```jsx
import { createDirectus, rest } from "@directus/sdk";

export const directus = createDirectus(
  import.meta.env.VITE_DIRECTUS_URL
).with(rest());
```

Then make CMS functions in `src/lib/queries.js`:

jsx

```jsx
import { readItems, readItem } from "@directus/sdk";
import { directus } from "./directus";

export async function getFeaturedWorks() {
  return directus.request(
    readItems("works", {
      filter: {
        status: { _eq: "available" },
        featured: { _eq: true },
      },
      fields: [
        "id",
        "title",
        "slug",
        "year",
        "medium",
        "thumbnail_file_id",
        "artists.artist_id.name",
        "artists.artist_id.slug",
      ],
      limit: 6,
      sort: ["sort"],
    })
  );
}

export async function getWorkBySlug(slug) {
  const works = await directus.request(
    readItems("works", {
      filter: { slug: { _eq: slug } },
      limit: 1,
      fields: [
        "*",
        "artists.artist_id.*",
        "files.file_id.*",
        "related_works.related_work_id.*",
        "related_texts.text_id.*",
      ],
    })
  );

  return works[0] ?? null;
}
```


The exact relationship field names may differ slightly depending on how your Directus relationships are created, but your planned schema includes `works`, artists linked through `workartists`, media through `workfiles`, and related-work/text join tables.

## Replace mock data one page at a time

Do not connect every screen simultaneously.

## First CMS page: Works index

```jsx
import { useEffect, useState } from "react";
import WorkCard from "../components/cards/WorkCard";
import { getFeaturedWorks } from "../lib/queries";

export default function WorksPage() {
  const [works, setWorks] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getFeaturedWorks()
      .then((data) => {
        setWorks(data);
        setStatus("ready");
      })
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });
  }, []);

  if (status === "loading") return <p>Loading archive…</p>;
  if (status === "error") return <p>The archive is temporarily unavailable.</p>;

  return (
    <section className="archive-page">
      <header className="page-intro">
        <p className="eyebrow">Archive</p>
        <h1>Works</h1>
      </header>

      <div className="works-grid">
        {works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
    </section>
  );
}
```


You will likely want a `normaliseWork()` function later, because Directus returns nested relationship objects whereas your components should receive a predictable clean object. That is good architecture, not needless complexity.

## Handle Directus image URLs properly

Directus files normally render at:

text

`https://cms.yourdomain.com/assets/FILE_ID`

Create one helper rather than constructing image URLs everywhere:

jsx

```jsx
export function directusAsset(fileId, options = {}) {   if (!fileId) return null;   const params = new URLSearchParams(options).toString();  const base = `${import.meta.env.VITE_DIRECTUS_URL}/assets/${fileId}`;   return params ? `${base}?${params}` : base; }
```

Use it like:

jsx

```jsx
const imageUrl = directusAsset(work.thumbnail_file_id, {
  width: "1200",
  format: "webp",
  quality: "82",
});
```

That keeps your art-heavy site performant. Image-heavy pages should use appropriately sized, optimised images rather than serving full-resolution originals to every visitor.[[nextjs](https://nextjs.org/docs/14/pages/building-your-application/optimizing/images)]

## Preserve your effects responsibly

Your texture layer is part of the identity, but it should never impair access to content.

Use these safeguards:

- Add `pointer-events: none` to `Noise`, scanlines, particles and canvas decoration layers.
    
- Use `position: fixed` with a carefully managed `z-index` so they do not cover menus or forms.
    
- Ensure text and buttons always remain above them.
    
- Reduce opacity on mobile.
    
- Turn off intense animation under `prefers-reduced-motion`.
    
- Keep hero images and artwork available without heavy effects.
    
- Do not put scanline overlays over long essays; they will make longform reading tiring.
    

Example:

css

```css
.scanlines,
.noise-layer,
.particles-layer {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 10;
}

.site-header,
.site-content {
  position: relative;
  z-index: 20;
}

@media (prefers-reduced-motion: reduce) {
  .particles-layer,
  .galaxy-animation {
    animation: none !important;
  }
}
```

## What to do this week

1. **Commit the prototype** exactly as it is.
    
2. **Install React Router** and make `/`, `/works`, `/works/example-work`, `/artists/gor`, and `/texts/example-text` work with mock data.
    
3. **Create `SiteShell`** and move Galaxy/Noise/Particles/Scanlines into it.
    
4. **Create `WorkCard`** and use it on both Home and Works pages.
    
5. **Move current hero into `HomePage.jsx`**.
    
6. **Build one `WorkPage.jsx`** that has hero, title, credits, curator note and related rail.
    
7. **Only then** connect the `works` collection in Directus.
    
8. Publish one real work and make it load from Directus.
    
9. Repeat the same pattern for artists, then texts.
    

You are not behind or starting from zero. You already built the part that generic templates cannot give you: the atmosphere. Now the job is to turn that atmosphere into a small, repeatable page system and let Directus feed it real content.