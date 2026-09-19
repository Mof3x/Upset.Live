

Designing a website well is mostly about **structure before visuals**.  
Do not jump straight into colours/fonts/animations before deciding:

- what the site is for
    
- who it serves
    
- what actions users should take
    
- how information is organized
    

The professional workflow usually looks like this:

# Purpose

Before touching Figma or code, answer:

- What is the site trying to achieve?
     - represent the collective
     - sell our stuff
     - get our work and ideas out there
- What should users do there?
	- learn about upset xociety identity and purpose
    - navigate a lot of pages easily
    - make a purchase commission or enquiry
    - hang out and digest content =]
	- look at and interact with out cool stuff
- Who is the audience?
	- artists and art buyers
	- culture stakeholders
	- everyone
    
- What feeling should the site create?
	- curiosity
	- wonder
	- complex emotions
	- enjoyment
    
- Portfolio → trust + personality
- Music artist site → immersion + identity
- Community site → easy participation
- Ecommerce → frictionless purchasing
    

# Site Plan / Sitemap

This is the **skeleton** of the website.

Maps every page and how pages connect.

```text
Home  
├── About  
│ ├── Ethos  
│ └── Artists  
│ ├── Gor  
│ ├── Kanyin  
│ ├── Mofe  
│ ├── Q  
│ ├── Mbana  
│ ├── Rae  
│ └── Demi  
│  
├── Works  
│ ├── Visual Arts  
│ │ ├── Paintings  
│ │ └── 3D Modelling  
│ │  
│ └── Music  
│ ├── Releases  
│ └── Performances  
│  
├── Texts  
│ ├── Poetry + Short Stories  
│ ├── Essays + Manifestos  
│ └── Journalism + Advocacy  
│  
├── Journal  
│ ├── forum(future thing)  
│ ├── Process + Reflections  
│ ├── Notes  
│ └── Updates  
│  
├── Razz Magazine  
│ ├── Issues  
│ ├── Features  
│ ├── Contributors  
│ └── Archive  
│  
├── Vault
│   ├── Original Works (collective)
│   ├── Limited Editions (collective)
│   └── Archive Objects
│
├── Shop
│   ├── Prints
│   ├── Publications
│   ├── Posters
│   ├── Apparel
│   ├── Music + Digital Releases
│   └── Works from Guest Artists
│
│ 
├── Bookings + Commissions  
│ ├── Painting  
│ ├── 3D Modelling  
│ ├── Music Performance  
│ ├── Writing  
│ ├── Creative Direction  
│ └── Editorial Collaboration  
│  
├── Newsletter  
│  
└── Contact  
├── General Enquiries  
├── Collaborations  
└── Socials

top nav
Works | Texts | Journal | Home | About | Shop | Vault

Footer
├── Navigation
│   ├── Works
│   ├── Texts
│   ├── Journal
│   ├── Razz Magazine
│   ├── About
│   └── Contact
│
├── Socials
│   ├── Instagram
│   ├── Bandcamp
│   ├── YouTube
│   └── Email
│
├── Support
│   ├── Newsletter
│   ├── Bookings + Commissions
│   └── Print Editions
│
└── Closing Statement / Motto
```


---

# CORE USER FLOWS

## 1. DISCOVERY FLOW

### Primary homepage flow

Most important flow on the site.

```text
Home
→ Featured Work
→ Artist / Contributor
→ Related Works or Texts
→ Journal Reflection or Razz Feature
→ Vault Object / Print Edition
→ Follow / Newsletter / Return Visit
```

### Purpose

- immersion, emotional attachment, worldbuilding, soft conversion,

### Improvements (keeps original language, adds rules)

- **Hero as entry**: single rotating feature (visual or audio) that invites one action (view). Avoid multiple competing CTAs in the hero.
- **Progressive reveal**: beneath the hero, present a single linear narrative rail that guides the visitor through _Featured Work → Artist → Related Text → Journal Reflection_ before any commerce hint.
- **Vault timing**: show a **Vault Teaser** only after one of these engagement signals:
    - user follows the chain _Featured Work → Artist → Journal_ in the same session
- **Soft CTA copy**: use editorial language — **Reserve**, **Learn more about this edition**, **Explore the edition**. Avoid “Buy” language at this stage.
- **Preview escalation**: clicking the soft CTA opens an **Edition Preview** (inline overlay, not a blocking modal) with provenance and a **Request Info** button. Only after explicit preview interaction surface purchase options.
- **CMS rule**: every Featured Work must have at least **Artist**, **Related Text**, and **Journal** fields linked before publishing. This enforces the narrative chain.

---

## 2. WORK → VAULT FLOW

### (Soft commerce flow)

Combines:

- visual art
- music
- texts
- collectible objects

```text
Home
→ Works or Texts
→ Specific Piece
→ Artist
→ Related Works
→ Available Edition / Publication / Release
→ Vault
→ Purchase or Enquiry
```

### Purpose

- make objects feel culturally meaningful
- connect art to collectible/archive forms

### Example

```text
Painting
├── Artist
├── Related Essay
├── Journal Reflection
├── Available Print
└── Vault Link
```

OR

```text
Music Release
├── Streaming
├── Credits
├── Related Visuals
├── Physical Cassette / Poster
└── Vault
```

### Key principle

Vault should feel:

> discovered,  
> not advertised.

### Improvements (keeps original language, adds rules)

- **Piece page order**: Visual → Credits → Curator note → Related essay excerpt → Journal reflection excerpt → Edition strip → Vault link. Edition strip must read like a micro‑story (1–2 lines of provenance).
- **Edition strip behaviour**: visible but passive on load; highlight the strip only after engagement signals:
    - **30s** on page OR scroll ≥ **50%**, OR clicking any related text.
- **Edition Preview**: immersive, non‑blocking overlay with high‑res images, edition metadata (run size, materials), production notes, and provenance timeline. Include **Reserve** and **Request Info**.
- **Purchase gating**: show **Buy Now** only after explicit intent (user clicked Reserve twice in a session, or returned to the same piece in a second session within **7 days**). This preserves discovery-first behaviour.
- **Inventory truth**: CMS must store run size and live inventory; when remaining ≤ 10 show exact remaining number and queue/reservation options.
- **Microcopy**: edition strip uses curator tone: “A limited run of 50; printed on archival rag paper; includes signed certificate.”

---

## 3. RAZZ MAGAZINE FLOW

### (Editorial identity + monetisation)

One of the strongest flows on the site.

```text
Home
→ Razz Magazine
→ Issue
→ Feature / Essay / Interview
→ Contributor
→ Related Works
→ Physical Issue / Special Edition
→ Vault
```

### Purpose

- cultural legitimacy
- recurring engagement
- print object sales

### Monetisation layer

Physical editions feel like:
- archival artefacts
- collectible culture
- extensions of the world

not products.
### Improvements (keeps original language, adds rules)

- **Issue hub**: cinematic cover, editorial note, table of contents with deep links to features. Each feature must link to contributor and related works.
- **Feature → Vault**: show **Join Waitlist** or **Reserve** for special editions only after the reader completes a feature (scroll ≥ **90%**) or visits two features in the same issue.
- **Subscription as membership**: subscription framed as cultural stewardship (early access, invites, archival extras). Avoid discount language; list benefits as access and stewardship.
- **Issue special editions**: use issue‑specific waitlists to capture intent and seed Vault drops. Waitlist signups are editorial actions (no hard sell).
- **CMS rule**: each issue must include contributor profiles and related works metadata to strengthen cross‑linking.

---

### 4. JOURNAL FLOW

### (Retention + atmosphere)

```text
Home
→ Journal
→ Process / Reflection / Update
→ Linked Work or Text
→ Related Artist
→ Upcoming Release / Print / Event
→ Newsletter
```

### Purpose
- continuity
- return visits
- platform vitality

### Monetisation layer
Journal quietly seeds:

- future drops
- releases
- performances
- print launches

without hard-selling.

### Improvements (keeps original language, adds rules)

- **Entry format**: short process posts with embedded links to works and drafts. Every post must tag related works and artists.
- **Seeding CTAs**: inline editorial CTAs — **RSVP**, **Join List**, **Preview Drop** — shown when a post references an upcoming release or event. These CTAs are visible immediately but styled as notes, not promotions.
- **Retention rail**: “Recent threads” rail that surfaces other journal posts tied to the same artist or work to encourage return visits.
- **Email capture**: contextual signups (issue‑ or drop‑specific) only; avoid global popups.
- **Trigger**: show RSVP / Join List when user scrolls past the first third of a long post or clicks a related work link.

---

## 5. COMMISSION + COLLABORATION FLOW

### (Primary revenue flow)

This should remain elegant and low-friction.

```text
Any Page
→ Bookings + Commissions
→ Select Discipline
→ Artist / Service Overview
→ Examples / Past Work
→ Enquiry Form
→ Confirmation
→ Direct Follow-Up
```

### Disciplines

```text
Painting
3D Modelling
Music Performance
Writing
Creative Direction
Editorial Collaboration
```

### Purpose
- monetisation
- partnerships
- opportunities

### Key principle
This should feel:

> personal and selective instead of transactional.

### Improvements (keeps original language, adds rules)

- **Two‑step intake**:
    1. **Select Discipline** (tiles with short examples and **starting fee ranges** to qualify leads).
    2. **Brief**: three fields — one‑line project summary, desired timeline, budget range; optional file upload.
- **Form UX**: inline slide‑in panel (keeps context), not a long modal. Submit triggers an automated confirmation with a relevant case study and expected response SLA.
- **SLA & follow‑up**: auto‑reply within **48 hours**; concierge follow‑up within **5 business days**. Offer a calendar link for a short consult after initial review.
- **Pricing transparency**: show starting fees or typical ranges to reduce unqualified enquiries; detailed pricing discussed in follow‑up.
- **Copy tone**: “Enquire” / “Book a commission” — language that implies relationship, not checkout.
- **CRM rule**: route enquiries to a curator inbox with discipline tags for prioritised follow‑up.

---

# 6. VAULT FLOW

### (Store ecosystem)

Vault is NOT a normal store.
It behaves more like:
- archive
- collection room
- release space
- cultural repository

```text
Home / Work / Text / Razz
→ Vault
→ Object / Edition / Release
→ Context + Story
→ Preview
→ Purchase / Reservation / Enquiry
→ Confirmation
```

### Vault Objects

```text
Prints
Magazines
Posters
Poetry Collections
Art Books
Apparel
Digital Releases
Limited Editions
Archive Objects
```

#### Product pages should contain

```text
Title
Artist / Contributor
Context / Description
Edition Type
Availability
Related Works
Related Texts
Purchase / Enquiry
```

#### Key principle

> curated and scarce,  
> not mass-produced.

### Improvements (keeps original language, adds rules)

- **Two Vault entry modes**:
    - **Discover**: soft editorial entry from content pages (Reserve / Learn More).
    - **Decide**: transactional entry from Vault hub (Buy Now / Reserve).
- **Object page**: hero image, curator story, provenance timeline, edition metadata (run size, materials), preview, related works, and options: **Reserve**, **Enquire**, **Buy Now**.
- **Reservation system**: allow deposits for high‑value items; show reservation expiry and queue position. Reservation confirmation is editorial: “You’ve reserved this edition. We’ll email next steps.” No charge until checkout unless deposit chosen.
- **Purchase gating**: **Buy Now** appears after explicit intent (Reserve clicked twice in session, or return visit within **7 days**), or when user navigates directly from Vault hub.
- **Scarcity signals**: show exact remaining quantity when ≤ 10; use provenance and bundled archival extras (signed certificate, essay) to add value — avoid discounts.
- **Operational rule**: edition metadata and inventory are required fields in CMS; fulfillment timelines must be visible on product pages.

---

### 7. INSTITUTIONAL / PRESS FLOW

### (Curators, collaborators, serious visitors)

```text
Home
→ About
→ Ethos
→ Artists
→ Works Overview
→ Razz Magazine
→ Journal
→ Contact / Commission
```

#### Purpose
- credibility
- trust
- artistic seriousness
- collaboration potential

#### Monetisation layer

This flow leads naturally into:

- commissions
- invitations
- partnerships
- features
- exhibitions

#### Improvements (keeps original language, adds rules)

- **Press kit hub**: downloadable assets, curator contact, past exhibitions and outcomes. Make it easy for institutions to request materials.
- **Collaboration outcomes**: page showing past partnerships, exhibitions, and commissions with short case studies.
- **Institutional enquiry**: short form that routes to a dedicated curator inbox; include a “project type” selector to triage requests.
- **Tone**: maintain editorial, not salesy — present institutional work as cultural collaboration.

---

### CROSS-LINKING SYSTEM

#### (Most important structural principle)

Every page should connect outward.

This is what creates immersion, depth, long session times, soft monetisation
#### Improvements (keeps original language, adds rules)

- **CMS enforcement**: every content type must include at least **three related links** (artist, work, journal/issue) before publishing.
- **Contextual rails**: every page shows three rails: **Artist**, **Related Works**, **Related Texts**. Rails are editorial, not product lists.
- **Auto‑suggest**: CMS suggests related items based on tags and contributor metadata to reduce editorial friction.
- **Engagement graph**: measure path depth (how many distinct contextual nodes a user visits) and use it to trigger Vault CTAs. Path depth ≥ 3 is a primary signal to surface soft commerce.
- **Microcopy rule**: commerce language must always be curator‑tone (provenance, stewardship, limited run), never retail language.

---

#### Example: Artwork Page

```text
Artwork
├── Artist
├── Related Text
├── Journal Reflection
├── Available Print
└── Vault
```

---

#### Example: Essay Page

```text
Essay
├── Author
├── Related Artwork
├── Razz Feature
├── Related Artist
└── Vault Publication
```

---

#### Example: Vault Object

```text
Vault Item
├── Artist
├── Related Work
├── Journal Entry
├── Razz Issue
└── Commission Link
```

### FINAL EXPERIENCE MODEL

The site should feel like:

A living archive + An artistic ecosystem + A publication platform + A subtle commerce layer

NOT:

Portfolio + Online store

That distinction is what will make the experience feel memorable and culturally coherent rather than commercially generic.
##### Features of A Living Archive

- **Persistent context** — works are stored with provenance, dates, essays, and related materials so each item reads as part of a history.
- **Searchable relationships** — every object links to artists, texts, issues, and events; content forms a navigable graph.
- **Curatorial framing** — items are presented with curator notes, timelines, and archival metadata rather than product blurbs.
- **Longevity focus** — emphasis on preservation, documentation, and cultural value over seasonal merchandising.
##### Features of An Artistic Ecosystem

- **Interconnected contributors** — artists, collaborators, and projects are surfaced as a living network, not isolated pages.
- **Cross‑discipline flows** — visual art, music, texts, and performances are treated as equal nodes that reference one another.
- **Community and collaboration pathways** — commissions, partnerships, and institutional routes are built into the site architecture.
- **Activity signals** — journal posts, rehearsals, and process notes keep the ecosystem active and evolving.
##### Features of A Publication Platform

- **Longform editorial structure** — issues, features, essays, and contributor pages are first‑class content.
- **Issue lifecycle** — each issue has a narrative arc, TOC, contributor context, and archival presence.
- **Membership and stewardship framing** — subscriptions are framed as cultural access and stewardship, not discounts.
- **Editorial discovery** — features link to works and Vault items so reading leads naturally to deeper engagement.
##### Features of A Subtle Commerce Layer

- **Discovery‑first monetisation** — commerce appears after context: Reserve, Waitlist, Preview, then Buy.
- **Curatorial commerce copy** — provenance, scarcity, and archival extras replace retail language.
- **Two entry modes** — Discover (soft: Reserve / Learn More) and Decide (hard: Buy Now / Checkout).
- **Operational truth** — edition metadata, inventory, reservation queues, and fulfillment timelines are built into the CMS.
#### How this differs from a Portfolio

- **Portfolio**: single‑purpose showcase; primarily about presentation and credentials.
- **Living archive + ecosystem + publication + subtle commerce**: multi‑purpose cultural platform; items are contextualised, cross‑referenced, and embedded in ongoing editorial and community activity.
- **Key differences**: depth of metadata and relationships; editorial lifecycle; return‑visit mechanics; commerce that feels earned rather than pushed.
##### How this differs from an Online Store

- **Online store**: product‑first, price‑driven, conversion‑centric; commerce is the primary experience.
- **Your model**: commerce is secondary and narrative‑driven; purchases are framed as stewardship and collecting.
- **Key differences**: CTA timing (post‑engagement vs immediate), language (curatorial vs transactional), and UX (preview/reserve flows vs direct checkout emphasis).
##### Practical implications for design and content

- **CMS rules**: require related links, edition metadata, and provenance fields for every publishable item.
- **CTA strategy**: soft CTAs (Reserve, Join Waitlist) triggered by engagement signals; hard CTAs gated by explicit intent.
- **Tone guide**: all commerce copy must read like curator notes; editorial voice across CTAs, confirmations, and product pages.
- **Analytics**: instrument path depth, time on page, scroll depth, reserve→purchase funnel to tune thresholds.

This model makes monetisation feel like a natural extension of immersion rather than an interruption. If you want, I’ll convert these distinctions into a short checklist designers and editors can use when building pages and writing copy. Which team should get the checklist first: designers or editors?

---
[[Wireframes]]

---

# 6. Content Hierarchy

Users scan — they rarely read linearly.

So prioritize:

1. Most important message
    
2. Supporting info
    
3. Secondary details
    

Good hierarchy uses:

- size
    
- spacing
    
- contrast
    
- positioning
    

A common mistake:  
everything screaming for attention equally.

---

# 7. Design System

This keeps the site consistent.

You define:

- colors
    
- typography
    
- buttons
    
- spacing
    
- border radius
    
- icon style
    
- grid system
    

Example:

```text
Primary Color: #111827
Accent: #7C3AED
Font: Inter
Spacing Scale: 8px system
Buttons: rounded-xl
```

Without this, sites become visually chaotic.

---

# 8. Responsive Design

Design mobile first or at least mobile-aware.

Most users are on phones.

You need layouts for:

- mobile
    
- tablet
    
- desktop
    

Questions:

- Does navigation collapse properly?
    
- Are buttons tappable?
    
- Is text readable?
    
- Does content stack cleanly?
    

---

# 9. Accessibility

A good site works for more humans.

Key things:

- readable contrast
    
- keyboard navigation
    
- alt text for images
    
- proper heading structure
    
- not relying only on color
    

Accessibility usually improves UX for everyone.

---

# 10. Visual Design

NOW you add:

- colors
    
- illustrations
    
- animations
    
- imagery
    
- branding
    
- texture
    

The visual layer should support structure, not compensate for weak structure.

---

# 11. Core Sections Most Websites Need

## Homepage

Explains:

- what this is
    
- why it matters
    
- where to go next
    

## About

Builds trust and identity.

## Contact

Should be frictionless.

## Footer

Usually contains:

- navigation
    
- social links
    
- legal
    
- copyright
    
- newsletter
    

## CTA (Call To Action)

Every important page should guide action:

- Buy
    
- Contact
    
- Subscribe
    
- Download
    
- Explore
    

---

# 12. Performance

People leave slow websites.

Optimize:

- image sizes
    
- animations
    
- fonts
    
- scripts
    

Fast websites feel more trustworthy.

---

# 13. SEO Basics

Search engines need structure.

Important:

- semantic HTML
    
- headings
    
- meta descriptions
    
- page titles
    
- clean URLs
    

---

# 14. Testing

Before launch:

- test on phones
    
- test on slow internet
    
- test forms
    
- test navigation
    
- ask real humans to use it
    

Watch where they get confused.

That confusion is your redesign map.

---

# Recommended Workflow

```text
Purpose
→ Sitemap
→ User flows
→ Wireframes
→ Design system
→ High-fidelity mockups
→ Prototype
→ Build
→ Test
→ Launch
→ Improve
```

---

# Tools Most Designers Use

## Wireframing / UI

- [Figma](https://www.figma.com/?utm_source=chatgpt.com)
    
- [Excalidraw](https://excalidraw.com/?utm_source=chatgpt.com)
    
- [Whimsical](https://whimsical.com/?utm_source=chatgpt.com)
    

## Inspiration

- [Dribbble](https://dribbble.com/?utm_source=chatgpt.com)
    
- [Behance](https://www.behance.net/?utm_source=chatgpt.com)
    
- [Awwwards](https://www.awwwards.com/?utm_source=chatgpt.com)
    

## Fonts

- [Google Fonts](https://fonts.google.com/?utm_source=chatgpt.com)
    

## Icons

- [Lucide Icons](https://lucide.dev/?utm_source=chatgpt.com)
    
- [Heroicons](https://heroicons.com/?utm_source=chatgpt.com)
    

---

# The Most Important Principle

A beautiful website with bad structure feels frustrating.

A simple website with excellent structure feels professional.

Good web design is mostly:

- clarity
    
- hierarchy
    
- intentionality
    
- consistency
    
- reducing cognitive friction
    

Not “making things look cool.”

Artist Bio
Statement
Mediums
Featured Works
Socials
Collaborations
Contact/Booking


# Representative authorities and references 

- Nielsen Norman Group (UX research and reading patterns)
    
- Baymard Institute (ecommerce UX heuristics)
    
- WCAG / W3C accessibility guidelines
    
- Common CMS and publishing patterns (WordPress/Headless CMS best practices)
    
- Product analytics & experimentation frameworks (GTM event naming, funnel analysis)
    
- Cultural publishing examples (indie magazines, archival projects, artist collectives)

- **How People Read Online — Nielsen Norman Group** — essential for structuring hero copy, headings, and rails; explains scanning patterns (F‑pattern, layer‑cake) and when users commit to full reading. Use this to design scannable curator notes and rails.
    
- **Baymard Institute — E‑commerce UX & Best Practices** — evidence‑backed guidance for product/checkout patterns, reservation affordances, and homepage behaviour (avoid intrusive carousels; make availability obvious). Use for Vault reservation and checkout rules.
    
- **WCAG / W3C Accessibility Guidelines (WCAG 2.2)** — the accessibility checklist you must meet for overlays, forms, and keyboard navigation (perceivable, operable, understandable, robust). Use as acceptance criteria for overlays and reservation flows.
    
- **Editorial workflow & magazine publishing best practice** — modern editorial ops, issue lifecycle, and packaging content for multi‑channel distribution; informs Razz issue model and CMS release workflows.
    
- **Headless CMS for magazines (Sanity example)** — practical patterns for structured content, referential integrity, media library, and grouped “content releases” for issue launches. Use as a model for required fields and release tooling.