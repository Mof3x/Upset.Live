
## Build before cards

Build these first:

- `SectionHeading` — title plus optional link like “View all”
    
- `PageIntro` — eyebrow, h1, lede
    
- `ButtonLink` or `TextLink` — one consistent interactive link style
    
- `CardLink` base class or pattern — whole card clickable
    
- `MetaLine` — small line for discipline, date, category, role, medium
    
- `MediaFrame` — shared image/canvas wrapper with ratio, overflow, fade/mask
    
- `TagList` — even if simple at first, because tags already matter in your content model
    
- `CardGrid` or shared grid utility classes
    

These are the parts cards keep reusing, and your planned site structure depends on repeated transitions between works, artists, texts, journal entries, and related rails.

## What not to build yet

Do **not** start with a huge button system containing primary, secondary, destructive, icon, pill, ghost, and loading variants. Your site is more editorial than app-like, so early on you mainly need link-like actions such as “Read,” “View artist,” “Explore,” “Reserve,” and “Enquire,” not a dashboard-scale control library.
## Best starter set

A good minimum starter set would be:

|Element|Why it matters|
|---|---|
|`SectionHeading`|Used on Home, About, Artists, Works, Texts, rails. [[perplexity](https://www.perplexity.ai/search/f1acf100-88cd-4488-a6a9-789bb6ec8818)]|
|`TextLink`|Keeps editorial links consistent across cards and sections.|
|`MetaLine`|Lets cards show discipline, type, medium, or date consistently.|
|`MediaFrame`|Prevents every card from handling image ratio and overflow differently.|
|`CardGrid`|Makes Artists/Works/Texts layouts consistent and responsive.|
|`TagList`|Supports the tag-based relationships you already introduced. [[perplexity](https://www.perplexity.ai/search/b0ba6ed5-276b-49cb-be3d-64ff7954396f)]|

That is enough to start building `ArtistCard`, `WorkCard`, and `TextCard` without inventing their internal structure from scratch.[[perplexity](https://www.perplexity.ai/search/f1acf100-88cd-4488-a6a9-789bb6ec8818)]

## Suggested file order

Create them in this order:

1. `src/components/ui/TextLink.jsx`
    
2. `src/components/ui/SectionHeading.jsx` 
    
3. `src/components/ui/MetaLine.jsx`
    
4. `src/components/ui/MediaFrame.jsx`
    
5. `src/components/layout/CardGrid.jsx`
    
6. `src/components/ui/TagList.jsx`
    

Then build:

- `src/components/cards/ArtistCard.jsx`
    
- `src/components/cards/WorkCard.jsx`
    
- `src/components/cards/TextCard.jsx`
    

That sequence works because your page system is supposed to be composed from reusable cards, rails, and shared layout elements rather than one-off page markup.

## Practical pattern

For example, your `ArtistCard` should not decide its own link styling, metadata styling, and image frame logic. It should mostly compose smaller pieces:

```jsx
<CardLink to={`/artists/${slug}`} className="artist-card">
  <MediaFrame ratio="4 / 5">
    <img src={image} alt={name} />
  </MediaFrame>

  <div className="artist-card__body">
    <MetaLine>{discipline}</MetaLine>
    <h3>{name}</h3>
    <p>{excerpt}</p>
    <TextLink>View artist</TextLink>
  </div>
</CardLink>
```

That way, when you later build `WorkCard` and `TextCard`, they inherit the same visual grammar without becoming copies of each other.

## My recommendation

So yes: build a few reusable **UI primitives first**, but keep them tightly scoped to the card system. The exact first three I would make tomorrow are `TextLink`, `MetaLine`, and `MediaFrame`, because once those exist, your first real card becomes much easier and much more consistent.