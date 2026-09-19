# Directus Public Permissions Policy

This policy defines what an anonymous visitor can read and what remains private.
Apply it in the Directus admin app after the schema has the publication fields
listed below. The frontend must never use an admin token.

## 1. Publication prerequisite

The current database notes do not show a publication field on `artists`,
`works`, `texts`, or `journal`. Do not grant anonymous read access to those
collections until one of these approaches is implemented consistently:

- Add an `is_published` boolean to each public content collection and set the
  public read filter to `is_published = true`.
- Or add a `published_at` timestamp and filter to records where
  `published_at` is not null and is less than or equal to the current time.

Do not reuse `works.status` for publication. That field describes work
availability such as available, sold, or archived, not editorial visibility.

Recommended fields:

```text
artists.is_published
works.is_published
texts.is_published
journal.is_published
razz_issues.is_published
razz_features.is_published
vault_items.is_public
```

The SQL migration prepared for the public editorial collections is
[publication fields.sql](publication%20fields.sql). Review it, back up the
database, and run it in Supabase before configuring the Directus permissions.

Use the same publication rule in Directus permissions and frontend queries.

## 2. Public role: read-only published content

Create or edit the Directus **Public** role. Give it `Read` permission only on
collections required by the public site.

| Collection | Public access | Required filter / field rule |
|---|---|---|
| `artists` | Read | `is_published = true`; exclude internal notes and admin-only fields |
| `work_categories` | Read | Only categories used by published works |
| `works` | Read | `is_published = true`; exclude internal notes and private pricing fields |
| `work_artists` | Read | Only relationships attached to published works |
| `work_files` | Read | Only files attached to published works |
| `files` | Read | Only files referenced by public content, or use restricted asset URLs |
| `text_categories` | Read | Public categories only |
| `texts` | Read | `is_published = true` |
| `text_authors` | Read | Only relationships attached to published texts |
| `text_related_works` | Read | Only relationships attached to published texts and works |
| `journal_categories` | Read | Public categories only |
| `journal` | Read | `is_published = true` |
| `navigation_items` | Read | Public navigation location only |
| `site_settings` | Read | Public site fields only |
| `vault_categories` | Read | Categories used by public/open items only |
| `vault_items` | Read | `vault_classification = open_public` and `status != private` |
| `vault_item_artists` | Read | Only relationships attached to public/open items |
| `vault_item_files` | Read | Only files attached to public/open items |

For every Public permission:

- Disable `Create`.
- Disable `Update`.
- Disable `Delete`.
- Restrict field read access to fields rendered by the public site.
- Do not expose unpublished drafts through broad collection reads.
- Do not expose Directus system collections.

## 3. Collections that must remain private

The Public role must have no read, create, update, or delete permission on:

```text
commission_requests
commission_request_artists
commission_request_works
contact_messages
newsletter_signups
vault_provenance
closed-vault item files and artist relationships
closed-vault items
orders
reservations
inventory records
```

Keep all Directus control-plane collections private as well:

```text
directus_users
directus_roles
directus_policies
directus_permissions
directus_files
directus_activity
directus_revisions
directus_flows
directus_operations
directus_settings
```

`directus_files` is not the same as the public `files` content access. Expose
only the asset delivery required by published records.

## 3.1 Shop and Print visibility

Shop and Print should be public-facing. In the current schema there are no
dedicated `shop_items` or `print_items` collections. Use `vault_items` for the
first release and classify public catalogue records as:

```text
vault_classification = open_public
status = available or archived
```

Use Vault categories such as `prints`, `publications`, `posters`, `apparel`,
and `music-digital-releases`. The frontend routes remain:

```text
/shop
/shop/prints
```

Public fields may include title, slug, description, category, public images,
artist credits, edition information, availability, and a deliberately public
price if commerce requires it. Keep internal notes, provenance, supplier data,
and operational inventory controls private. Expose exact remaining inventory
only after the reservation/inventory rules are implemented.

The closed Vault remains private even though the same `vault_items` collection
stores both kinds of records. Enforce this with the item filter and field-level
permissions, not only by hiding links in the React navbar.

## 4. Public submissions

Do not give the Public role direct collection access to submissions. A browser
must not be able to read, edit, delete, or enumerate messages and email
addresses.

Use a server-side endpoint, Cloudflare Worker, or Directus custom endpoint for
public form submissions. That endpoint should:

1. Validate the request body.
2. Reject unknown fields.
3. Apply rate limiting and spam protection.
4. Create only the specific submission record using a server-side credential.
5. Return a generic success response.
6. Never return the created record or other submissions.

The server-side credential must never be stored in a `VITE_` variable or sent to
the browser.

## 5. Artist and editor roles

Create separate authenticated roles rather than giving artists the Public
role.

### Artist

- Read published public content.
- Create and update only their own artist profile and works.
- Upload media into an artist-approved folder or workflow.
- Save content as draft/submitted for review.
- Cannot publish, delete other artists' records, edit categories, edit site
  settings, access submissions, or view vault provenance.

The schema includes an optional `owner_user_id` Directus user relation on artist
profiles and works. Populate it with the owning user's `directus_users.id` and
use it for Artist own-record filters. Keep the field writable only through the
appropriate authenticated workflow so artists cannot claim another user's
records.

### Editor

- Read all editorial content, including drafts.
- Create and update artists, works, texts, journal entries, categories, and
  relationships.
- Review content submitted by artists.
- Publish and unpublish content.
- Cannot manage users, roles, permissions, database settings, or secrets unless
  explicitly required.

### Administrator

- Manage schema, roles, permissions, users, flows, integrations, and private
  collections.
- Use only for trusted maintainers.

## 6. Directus admin setup sequence

1. Add and populate the publication fields before enabling public reads.
2. Create the `Artist`, `Editor`, and `Public` roles.
3. Create the corresponding policies and permissions.
4. Configure Public `Read` filters on each published collection.
5. Restrict Public field access to the fields listed in the frontend query
   helpers.
6. Remove all Public permissions from submissions, vault internals, orders,
   reservations, inventory, and Directus system collections.
7. Populate the `owner_user_id` relations and add own-record filters for Artist
  users.
8. Test while signed out of Directus.
9. Test a draft, a published record, an unpublished related record, and a
   private file.
10. Record the final permission export or screenshots in the deployment notes.

The React query helpers already apply `is_published = true` to public artist,
work, text, and journal requests. They will return no records until the
corresponding Directus fields exist and approved content is explicitly marked
published.

## 7. Verification matrix

| Test | Expected result |
|---|---|
| Anonymous request for published artist | `200`, public fields only |
| Anonymous request for draft artist | Not returned |
| Anonymous request for unpublished work | Not returned |
| Anonymous request for `contact_messages` | `403` or no route access |
| Anonymous request for `newsletter_signups` | `403` or no route access |
| Anonymous request for `vault_provenance` | `403` or no route access |
| Anonymous request for Directus users/roles | `403` or no route access |
| Artist edits another artist's work | Denied |
| Artist publishes a record directly | Denied; editor review required |
| Editor publishes approved content | Allowed |
| Public asset for unpublished content | Not deliverable through public content paths |

Do not mark the permission milestone complete until these tests pass against
the actual Directus instance.
