a human-readable ER map of your schema.

Your model is a **relational content graph** built from Directus collections, where standard relationships are expressed either as direct foreign keys for many-to-one links or as junction collections for many-to-many links. Directus explicitly uses junction collections for many-to-many relationships, and your schema follows that pattern consistently.[[directus](https://directus.com/docs/guides/data-model/relationships)]

## Big picture

Think of your database as six connected zones:

- **People and art:** artists, works, categories, files.
    
- **Writing and criticism:** texts, text categories, authors, related works.
    
- **Journal / updates:** journal entries and journal categories.
    
- **Magazine / issue publishing:** razz issues, features, contributors, feature media.
    
- **Archive / vault:** vault items, vault categories, provenance, artists, files.
    
- **Site operations:** commissions, contact messages, newsletter, navigation, site settings.[[directus-directus.mintlify](https://directus-directus.mintlify.app/core-concepts/collections)]
    

That means the system is not a flat CMS. It behaves more like a museum/gallery database merged with an editorial publication system.

## ER map

Below is the schema in relationship language rather than SQL.

## Artists and works

- **artists** = people or collectives in the system.
    
- Each artist can have one portrait file via `portrait_file_id -> files.id`.

- An artist can be owned by one authenticated Directus user via
    `owner_user_id -> directus_users.id`.
    
- **works** = artworks or items for display/sale/catalogue.
    
- Each work can have one category via `category_id -> work_categories.id`.
    
- Each work can have one thumbnail file via `thumbnail_file_id -> files.id`.[[directus](https://directus.com/docs/guides/data-model/relationships)]

- Each work can be owned by one authenticated Directus user via
    `owner_user_id -> directus_users.id`.[[directus](https://directus.com/docs/guides/data-model/relationships)]
    

Relationships:

- `work_artists` links **many works <-> many artists**.
    
- `work_files` links **many works <-> many files**.
    
- `works_related` links **many works <-> many works**, which is a self-referencing many-to-many relationship. Directus supports self-referencing M2M through a junction collection, which is exactly what this is.[[directus](https://directus.com/docs/guides/data-model/relationships)]
    

So in plain English:

- One artist can be attached to many works.
    
- One work can have many artists.
    
- One work can have many images/files.
    
- One work can be related to many other works.
    

## Work categories

- **work_categories** is a hierarchical taxonomy.
    
- `parent_category_id -> work_categories.id` means categories can nest inside categories.
    

That gives you a tree like:

- Painting
    
    - Oil painting
        
    - Mixed media
        
- Sculpture
    
    - Installation
        

This is a classic self-referencing one-to-many hierarchy.[[directus](https://directus.com/docs/guides/data-model/relationships)]

## Texts and authorship

- **texts** = essays, criticism, articles, editorial pieces.
    
- Each text can belong to one text category via `category_id -> text_categories.id`.
    
- Each text can have one cover file via `cover_file_id -> files.id`.[[directus](https://directus.com/docs/guides/data-model/relationships)]
    

Relationships:

- `text_authors` links **many texts <-> many artists**.
    
- `text_related_works` links **many texts <-> many works**.
    

So:

- A text can have multiple authors.
    
- An artist can author multiple texts.
    
- A text can discuss multiple works.
    
- A work can be referenced by multiple texts.
    

This is one of the strongest parts of the model because it lets criticism and artworks be connected structurally, not just by free text.

## Journal

- **journal** looks like lighter, ongoing, or blog-like publishing.
    
- Each journal item can belong to one category via `category_id -> journal_categories.id`.
    
- Each journal item can have one cover file via `cover_file_id -> files.id`.[[directus](https://directus.com/docs/guides/data-model/relationships)]
    

Compared to `texts`, `journal` appears to be a simpler editorial stream:

- fewer relationship tables,
    
- quicker publishing,
    
- looser metadata such as tags.
    

So conceptually:

- **texts** = more formal editorial pieces.
    
- **journal** = updates, reflections, announcements, notes.
    

## Razz publication system

This is a separate magazine-like publication structure.

- **razz_issues** = publication issues.
    
- Each issue can have one cover file.
    
- **razz_features** = feature articles/items inside an issue.
    
- Each feature belongs to one issue via `issue_id -> razz_issues.id`.[[directus](https://directus.com/docs/guides/data-model/relationships)]
    

Relationships:

- `razz_feature_contributors` links **many features <-> many contributors**.
    
- `razz_feature_files` links **many features <-> many files**.
    

So:

- One issue contains many features.
    
- One feature can have many contributors.
    
- One contributor can contribute to many features.
    
- One feature can have many associated files/images.
    

This creates a clean issue -> feature -> contributor/media structure, separate from your main `texts` area.

## Vault / archive

The vault is more like a private collection, inventory, or archival holdings system.

- **vault_items** = archived/held items.
    
- Each vault item can belong to one category via `category_id -> vault_categories.id`.
    
- `vault_categories` also has `parent_category_id`, so this taxonomy is hierarchical too.[[directus](https://directus.com/docs/guides/data-model/relationships)]
    

Relationships:

- `vault_item_artists` links **many vault items <-> many artists**.
    
- `vault_item_files` links **many vault items <-> many files**.
    
- `vault_provenance` links provenance/history records to a vault item via `vault_item_id -> vault_items.id`.
    

So in plain English:

- A vault item can involve multiple artists.
    
- A vault item can have multiple files/images/documents.
    
- A vault item can have provenance/history attached to it.
    
- Vault categories can be nested.
    

This is what makes the model feel archival rather than just web-publishing-focused.

## Commissions and inbound requests

This part handles public/business interactions.

- **commission_requests** stores incoming commission enquiries.
    
- Each request can optionally have one commission type via `type_id -> commission_types.id`.[[directus](https://directus.com/docs/guides/data-model/relationships)]
    

Relationships:

- `commission_request_artists` links **many requests <-> many artists**.
    
- `commission_request_works` links **many requests <-> many works**.
    

So a request can say:

- “I’m interested in this artist,”
    
- “I’m interested in this work,”
    
- or both.
    

That is a good design because it preserves structured intent rather than burying it in one message field.

Alongside that:

- **contact_messages** stores general inbound messages.
    
- **newsletter_signups** stores mailing-list emails.
    

## Site structure

These collections control the presentation layer.

- **site_settings** = global site configuration.
    
- **navigation_items** = menus/links.
    
- `navigation_items.parent_id -> navigation_items.id` means navigation supports nesting.[[directus-directus.mintlify](https://directus-directus.mintlify.app/core-concepts/collections)]
    

So you can have:

- top-level nav items,
    
- child nav items,
    
- footer items,
    
- ordered menus.
    

In Directus terms, `site_settings` should conceptually behave as a singleton: one row representing site-wide config. Directus supports singleton collections specifically for this use case.[[directus-directus.mintlify](https://directus-directus.mintlify.app/core-concepts/collections)]

## Files

You have a domain-level `files` table used throughout the content model:

- artists reference portrait files,
    
- works reference thumbnails and attached files,
    
- texts and journal entries reference cover files,
    
- razz features and vault items reference multiple files.
    

This means `files` is functioning as a shared media layer for the public/domain model.

Separately, you also have Directus system file tables like `directus_files`, which means your architecture likely has:

- Directus internal asset management,
    
- plus your own simplified/public-facing file abstraction.
    

## Directus system layer

Everything prefixed with `directus_` is the application-control layer rather than the domain model.

That includes:

- `directus_users`, `directus_roles`, `directus_policies`, `directus_permissions` for access control.
    
- `directus_collections`, `directus_fields`, `directus_relations` for schema metadata.
    
- `directus_activity`, `directus_revisions`, `directus_versions` for audit/history.
    
- `directus_flows`, `directus_operations` for automation.
    
- `directus_files`, `directus_folders` for internal file storage.
    
- `directus_dashboards`, `directus_panels`, `directus_notifications` for admin UX.[[directus](https://directus.com/docs/guides/data-model/collections)]
    

So the schema has two layers:

- **your domain model**: artists, works, texts, vault, commissions, etc.
    
- **Directus control plane**: permissions, schema definitions, audit, flows, admin data.
    

## Short ER summary

If I compress the whole ER map into one readable description:

> Artists, works, texts, journal entries, publication features, and vault items are the main content entities; categories and files attach to them through direct foreign keys, while many-to-many junction collections connect artists to works, authors to texts, contributors to features, files to content, texts to works, and works to other works. Site-wide settings and navigation control presentation, while commission requests, contact messages, and newsletter signups handle audience interaction; all of this sits on top of Directus’s own system tables for permissions, schema metadata, files, revisions, and automation.[[directus](https://directus.com/docs/guides/data-model/collections)]

## ASCII map

Here’s a simplified mental map:

text

`artists ----< work_artists >---- works ----< work_files >---- files    |                                |   |                                +---- belongs to ---- work_categories   |                                |   |                                +----< works_related >---- works artists ----< text_authors >---- texts ---- belongs to ---- text_categories                                      |                                     +---- cover_file ---- files                                     |                                     +----< text_related_works >---- works journal ---- belongs to ---- journal_categories    |   +---- cover_file ---- files razz_issues ----< razz_features ----< razz_feature_files >---- files                           |                          +----< razz_feature_contributors >---- razz_contributors vault_items ---- belongs to ---- vault_categories     |    +----< vault_item_artists >---- artists    +----< vault_item_files >---- files    +---- vault_provenance commission_requests ---- belongs to ---- commission_types         |        +----< commission_request_artists >---- artists        +----< commission_request_works >---- works navigation_items ---- parent_id ---- navigation_items site_settings contact_messages newsletter_signups`

## Interpretation

The key thing to understand is that your schema is **relationship-rich** rather than page-rich. Directus can expose these as nested relational structures in REST or GraphQL, so the frontend can pull, for example, a work with its artists, files, category, and related works in one structured content graph. Directus supports nested relational retrieval specifically for this purpose.[[directus](https://directus.com/docs/guides/connect/relations)]

Prompt me for option 3 when you want the grant/application description.