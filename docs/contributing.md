# Contributing

## Before you start

Read the [project README](../README.md) for setup, then [Architecture](architecture.md) and
[Data layer](data-layer.md). For anything that touches the CMS, read [Directus](directus.md) first.

## Conventions

**Code**

- JavaScript and JSX only, function components and hooks. ESLint (flat config) is the style authority.
- New pages go in `src/pages/`, in the file for their site section. Reusable pieces go in `src/components/<group>/`
  with a co-located `.css` file.
- Match the code around you: naming, comment density, and the existing helpers (`CardGrid`, `PageIntro`, `Prose`,
  `TextLink`, `MediaFrame`, ...).

**Navigation and links**

- Internal navigation uses `<Link>` or `TextLink`, never `<a href>`. A full reload restarts the canvas effects.
- Build every record link with `recordPath(base, slug)`.

**Data**

- Every public query applies its publication rule (see [Data layer](data-layer.md#publication-rules)).
- Read relations from the junction collections. Don't add alias fields in Directus.
- Wrap secondary lookups in `optional()`, so they can't take a page down.
- Never render CMS HTML. Use `bodyToParagraphs()` and `Prose`.
- Never write to Directus from the browser, and never put a token in a `VITE_*` variable.
- Don't add image transform parameters until Directus transforms are confirmed working.

**Effects**

- Keep visual effects in `components/atmosphere/` and out of data and routing code.
- Anything that reads image pixels must load the image with `crossOrigin = "anonymous"` and cope with a tainted canvas.

**Accessibility**

- Give every content image meaningful `alt` text, and keep decorative canvases separate from the content image.
- Keep the navbar's `aria-expanded`/`aria-controls` behaviour working.
- Keep visible focus states.

## Checks before merging

1. `npm run lint` passes.
2. `npm run build` passes.
3. With `npm run dev`, against the live CMS, open every page you changed. Check desktop and mobile widths, and the
   loading, empty, not-found and "not open yet" states where they apply.
4. If you changed how a page links to records, try a slug with a space in it.
5. Update the docs (see below).

## Branches and releases

- `main` is what's live. **Every push to `main` deploys to upset.live.**
- Work on a branch, open a pull request into `main`, and merge when the checks above pass.
- Changes to the live Directus are separate from code releases. They follow
  [How CMS changes are made](directus.md#how-cms-changes-are-made). When code depends on a CMS change (for example a
  new field the Public role must read), apply the CMS change first, or make the code cope with a 403 until it's done.

## Keeping the docs current

A change isn't finished until the docs match it. Update:

- [Architecture](architecture.md) for routes, components and known issues;
- [Data layer](data-layer.md) for queries, normalisers and conventions;
- [Directus](directus.md) for collections, public access, roles and newly found Directus bugs;
- [Deployment](deployment.md) for hosting, variables and troubleshooting;
- the [CMS guide](../Upset.live/CMS%20guide/CMS%20guide.md) for anything artists or editors see or do differently;
- `CLAUDE.md`, the condensed version for AI assistants;
- the vault's Progress report and Master TODO for status.
