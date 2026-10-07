# Developer documentation

These pages describe how the UpsetXociety site works as of October 2026. Start with the [project README](../README.md)
for setup.

| Page | Covers |
|---|---|
| [Architecture](architecture.md) | Routes, the site shell, page groups, components, styling, the visual effects, known issues |
| [Data layer](data-layer.md) | The Directus → page pipeline, publication rules, relations, page states, adding a new content type |
| [Directus](directus.md) | The CMS setup, collections and what they power, what the public can read, roles, how CMS changes are made, known Directus bugs |
| [Deployment and operations](deployment.md) | Hosting, environment variables, CORS, the deploy workflow, troubleshooting the live site |
| [Contributing](contributing.md) | Code conventions, checks before merging, branches, keeping these docs current |

Other documentation:

- **[CMS guide](../Upset.live/CMS%20guide/CMS%20guide.md)**, in the notes vault, is for artists and editors who use
  Directus. It's written for non-developers. When you change something they'll see in Directus, update it too.
- **[`Upset.live/Backend/db schema.md`](../Upset.live/Backend/db%20schema.md)** is the most reliable list of tables and
  columns. It predates the `is_published` columns (see
  [`publication fields.sql`](../Upset.live/Backend/publication%20fields.sql)) and `artists.discipline`.
- **[`CLAUDE.md`](../CLAUDE.md)** is a condensed version of these docs for AI coding assistants. Keep the two consistent.
