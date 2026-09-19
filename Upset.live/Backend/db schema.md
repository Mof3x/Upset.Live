## Table `files`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `filename` | `text` |  |
| `mime_type` | `text` |  Nullable |
| `size` | `int8` |  Nullable |
| `url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `artists`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `bio` | `text` |  Nullable |
| `portrait_file_id` | `uuid` |  Nullable |
| `year_of_birth` | `int4` |  Nullable |
| `location` | `text` |  Nullable |
| `website` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `is_collective_member` | `bool` |  Nullable |
| `featured` | `bool` |  Nullable |
| `order` | `int4` |  Nullable |
| `owner_user_id` | `uuid` | Nullable; references `directus_users.id` |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `work_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `parent_category_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `works`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `year` | `text` |  Nullable |
| `medium` | `text` |  Nullable |
| `dimensions` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `thumbnail_file_id` | `uuid` |  Nullable |
| `category_id` | `uuid` |  Nullable |
| `status` | `works_status_t` |  Nullable |
| `price` | `numeric` |  Nullable |
| `featured` | `bool` |  Nullable |
| `order` | `int4` |  Nullable |
| `owner_user_id` | `uuid` | Nullable; references `directus_users.id` |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `year_start` | `int4` |  Nullable |
| `year_end` | `int4` |  Nullable |

## Table `work_files`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `work_id` | `uuid` |  |
| `file_id` | `uuid` |  |
| `order` | `int4` |  Nullable |
| `caption` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `work_artists`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `work_id` | `uuid` |  |
| `artist_id` | `uuid` |  |
| `role` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `works_related`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `work_id` | `uuid` |  |
| `related_work_id` | `uuid` |  |
| `relation_type` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `text_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `created_at` | `timestamptz` |  Nullable |

## Table `texts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `category_id` | `uuid` |  Nullable |
| `body` | `text` |  Nullable |
| `cover_file_id` | `uuid` |  Nullable |
| `published_date` | `date` |  Nullable |
| `featured` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `text_authors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `text_id` | `uuid` |  |
| `artist_id` | `uuid` |  |
| `role` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `text_related_works`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `text_id` | `uuid` |  |
| `work_id` | `uuid` |  |
| `note` | `text` |  Nullable |

## Table `journal_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |

## Table `journal`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `category_id` | `uuid` |  Nullable |
| `body` | `text` |  Nullable |
| `cover_file_id` | `uuid` |  Nullable |
| `published_date` | `date` |  Nullable |
| `legacy_tags` | `_text` |  Nullable |
| `featured` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `razz_issues`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `issue_number` | `text` |  Nullable |
| `cover_file_id` | `uuid` |  Nullable |
| `release_date` | `date` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `razz_contributors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `bio` | `text` |  Nullable |
| `portrait_file_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `razz_features`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `body` | `text` |  Nullable |
| `issue_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `razz_feature_files`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `feature_id` | `uuid` |  |
| `file_id` | `uuid` |  |
| `order` | `int4` |  Nullable |

## Table `razz_feature_contributors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `feature_id` | `uuid` |  |
| `contributor_id` | `uuid` |  |
| `role` | `text` |  Nullable |

## Table `vault_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `parent_category_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `vault_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `category_id` | `uuid` |  Nullable |
| `vault_classification` | `vault_classification_t` |  |
| `description` | `text` |  Nullable |
| `status` | `vault_status_t` |  Nullable |
| `price` | `numeric` |  Nullable |
| `inventory` | `int4` |  Nullable |
| `edition_number` | `text` |  Nullable |
| `edition_size` | `int4` |  Nullable |
| `location` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `vault_item_files`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `vault_item_id` | `uuid` |  |
| `file_id` | `uuid` |  |
| `order` | `int4` |  Nullable |
| `caption` | `text` |  Nullable |

## Table `vault_item_artists`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `vault_item_id` | `uuid` |  |
| `artist_id` | `uuid` |  |
| `role` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `vault_provenance`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `vault_item_id` | `uuid` |  |
| `acquired_date` | `date` |  Nullable |
| `acquired_from` | `text` |  Nullable |
| `previous_owners` | `_text` |  Nullable |
| `exhibition_history` | `text` |  Nullable |
| `condition_report` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `commission_types`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |

## Table `commission_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `email` | `text` |  |
| `message` | `text` |  Nullable |
| `type_id` | `uuid` |  Nullable |
| `status` | `commission_status_t` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `commission_request_artists`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `commission_request_id` | `uuid` |  |
| `artist_id` | `uuid` |  |

## Table `commission_request_works`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `commission_request_id` | `uuid` |  |
| `work_id` | `uuid` |  |

## Table `contact_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `type` | `contact_type_t` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `newsletter_signups`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  Unique |
| `created_at` | `timestamptz` |  Nullable |

## Table `site_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `site_title` | `text` |  Nullable |
| `tagline` | `text` |  Nullable |
| `footer_statement` | `text` |  Nullable |
| `social_instagram` | `text` |  Nullable |
| `social_youtube` | `text` |  Nullable |
| `social_bandcamp` | `text` |  Nullable |
| `social_email` | `text` |  Nullable |
| `homepage_featured_works` | `_uuid` |  Nullable |
| `homepage_featured_texts` | `_uuid` |  Nullable |
| `homepage_featured_artists` | `_uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `navigation_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `label` | `text` |  |
| `slug` | `text` |  Nullable |
| `url` | `text` |  Nullable |
| `parent_id` | `uuid` |  Nullable |
| `location` | `text` |  Nullable |
| `order` | `int4` |  Nullable |

## Table `directus_collections`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `collection` | `varchar` | Primary |
| `icon` | `varchar` |  Nullable |
| `note` | `text` |  Nullable |
| `display_template` | `varchar` |  Nullable |
| `hidden` | `bool` |  |
| `singleton` | `bool` |  |
| `translations` | `json` |  Nullable |
| `archive_field` | `varchar` |  Nullable |
| `archive_app_filter` | `bool` |  |
| `archive_value` | `varchar` |  Nullable |
| `unarchive_value` | `varchar` |  Nullable |
| `sort_field` | `varchar` |  Nullable |
| `accountability` | `varchar` |  Nullable |
| `color` | `varchar` |  Nullable |
| `item_duplication_fields` | `json` |  Nullable |
| `sort` | `int4` |  Nullable |
| `group` | `varchar` |  Nullable |
| `collapse` | `varchar` |  |
| `preview_url` | `varchar` |  Nullable |
| `versioning` | `bool` |  |
| `status` | `varchar` |  |
| `autosave_revision_interval` | `float4` |  Nullable |

## Table `directus_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `icon` | `varchar` |  |
| `description` | `text` |  Nullable |
| `parent` | `uuid` |  Nullable |

## Table `directus_users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `first_name` | `varchar` |  Nullable |
| `last_name` | `varchar` |  Nullable |
| `email` | `varchar` |  Nullable Unique |
| `password` | `varchar` |  Nullable |
| `location` | `varchar` |  Nullable |
| `title` | `varchar` |  Nullable |
| `description` | `text` |  Nullable |
| `tags` | `json` |  Nullable |
| `avatar` | `uuid` |  Nullable |
| `language` | `varchar` |  Nullable |
| `tfa_secret` | `varchar` |  Nullable |
| `status` | `varchar` |  |
| `role` | `uuid` |  Nullable |
| `token` | `varchar` |  Nullable Unique |
| `last_access` | `timestamptz` |  Nullable |
| `last_page` | `varchar` |  Nullable |
| `provider` | `varchar` |  |
| `external_identifier` | `varchar` |  Nullable Unique |
| `auth_data` | `json` |  Nullable |
| `email_notifications` | `bool` |  Nullable |
| `appearance` | `varchar` |  Nullable |
| `theme_dark` | `varchar` |  Nullable |
| `theme_light` | `varchar` |  Nullable |
| `theme_light_overrides` | `json` |  Nullable |
| `theme_dark_overrides` | `json` |  Nullable |
| `text_direction` | `varchar` |  |

## Table `directus_fields`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `collection` | `varchar` |  |
| `field` | `varchar` |  |
| `special` | `varchar` |  Nullable |
| `interface` | `varchar` |  Nullable |
| `options` | `json` |  Nullable |
| `display` | `varchar` |  Nullable |
| `display_options` | `json` |  Nullable |
| `readonly` | `bool` |  |
| `hidden` | `bool` |  |
| `sort` | `int4` |  Nullable |
| `width` | `varchar` |  Nullable |
| `translations` | `json` |  Nullable |
| `note` | `text` |  Nullable |
| `conditions` | `json` |  Nullable |
| `required` | `bool` |  Nullable |
| `group` | `varchar` |  Nullable |
| `validation` | `json` |  Nullable |
| `validation_message` | `text` |  Nullable |
| `searchable` | `bool` |  |

## Table `directus_activity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `action` | `varchar` |  |
| `user` | `uuid` |  Nullable |
| `timestamp` | `timestamptz` |  |
| `ip` | `varchar` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `collection` | `varchar` |  |
| `item` | `varchar` |  |
| `origin` | `varchar` |  Nullable |

## Table `directus_folders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `parent` | `uuid` |  Nullable |

## Table `directus_files`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `storage` | `varchar` |  |
| `filename_disk` | `varchar` |  Nullable |
| `filename_download` | `varchar` |  |
| `title` | `varchar` |  Nullable |
| `type` | `varchar` |  Nullable |
| `folder` | `uuid` |  Nullable |
| `uploaded_by` | `uuid` |  Nullable |
| `created_on` | `timestamptz` |  |
| `modified_by` | `uuid` |  Nullable |
| `modified_on` | `timestamptz` |  |
| `charset` | `varchar` |  Nullable |
| `filesize` | `int8` |  Nullable |
| `width` | `int4` |  Nullable |
| `height` | `int4` |  Nullable |
| `duration` | `int4` |  Nullable |
| `embed` | `varchar` |  Nullable |
| `description` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `tags` | `text` |  Nullable |
| `metadata` | `json` |  Nullable |
| `focal_point_x` | `int4` |  Nullable |
| `focal_point_y` | `int4` |  Nullable |
| `tus_id` | `varchar` |  Nullable |
| `tus_data` | `json` |  Nullable |
| `uploaded_on` | `timestamptz` |  Nullable |

## Table `directus_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `collection` | `varchar` |  |
| `action` | `varchar` |  |
| `permissions` | `json` |  Nullable |
| `validation` | `json` |  Nullable |
| `presets` | `json` |  Nullable |
| `fields` | `text` |  Nullable |
| `policy` | `uuid` |  |

## Table `directus_presets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `bookmark` | `varchar` |  Nullable |
| `user` | `uuid` |  Nullable |
| `role` | `uuid` |  Nullable |
| `collection` | `varchar` |  Nullable |
| `search` | `varchar` |  Nullable |
| `layout` | `varchar` |  Nullable |
| `layout_query` | `json` |  Nullable |
| `layout_options` | `json` |  Nullable |
| `refresh_interval` | `int4` |  Nullable |
| `filter` | `json` |  Nullable |
| `icon` | `varchar` |  Nullable |
| `color` | `varchar` |  Nullable |

## Table `directus_relations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `many_collection` | `varchar` |  |
| `many_field` | `varchar` |  |
| `one_collection` | `varchar` |  Nullable |
| `one_field` | `varchar` |  Nullable |
| `one_collection_field` | `varchar` |  Nullable |
| `one_allowed_collections` | `text` |  Nullable |
| `junction_field` | `varchar` |  Nullable |
| `sort_field` | `varchar` |  Nullable |
| `one_deselect_action` | `varchar` |  |

## Table `directus_revisions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `activity` | `int4` |  |
| `collection` | `varchar` |  |
| `item` | `varchar` |  |
| `data` | `json` |  Nullable |
| `delta` | `json` |  Nullable |
| `parent` | `int4` |  Nullable |
| `version` | `uuid` |  Nullable |

## Table `directus_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `token` | `varchar` | Primary |
| `user` | `uuid` |  Nullable |
| `expires` | `timestamptz` |  |
| `ip` | `varchar` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `share` | `uuid` |  Nullable |
| `origin` | `varchar` |  Nullable |
| `next_token` | `varchar` |  Nullable |
| `oauth_client` | `varchar` |  Nullable |

## Table `directus_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `project_name` | `varchar` |  |
| `project_url` | `varchar` |  Nullable |
| `project_color` | `varchar` |  |
| `project_logo` | `uuid` |  Nullable |
| `public_foreground` | `uuid` |  Nullable |
| `public_background` | `uuid` |  Nullable |
| `public_note` | `text` |  Nullable |
| `auth_login_attempts` | `int4` |  Nullable |
| `auth_password_policy` | `varchar` |  Nullable |
| `storage_asset_transform` | `varchar` |  Nullable |
| `storage_asset_presets` | `json` |  Nullable |
| `custom_css` | `text` |  Nullable |
| `storage_default_folder` | `uuid` |  Nullable |
| `basemaps` | `json` |  Nullable |
| `mapbox_key` | `varchar` |  Nullable |
| `module_bar` | `json` |  Nullable |
| `project_descriptor` | `varchar` |  Nullable |
| `default_language` | `varchar` |  |
| `custom_aspect_ratios` | `json` |  Nullable |
| `public_favicon` | `uuid` |  Nullable |
| `default_appearance` | `varchar` |  |
| `default_theme_light` | `varchar` |  Nullable |
| `theme_light_overrides` | `json` |  Nullable |
| `default_theme_dark` | `varchar` |  Nullable |
| `theme_dark_overrides` | `json` |  Nullable |
| `report_error_url` | `varchar` |  Nullable |
| `report_bug_url` | `varchar` |  Nullable |
| `report_feature_url` | `varchar` |  Nullable |
| `public_registration` | `bool` |  |
| `public_registration_verify_email` | `bool` |  |
| `public_registration_role` | `uuid` |  Nullable |
| `public_registration_email_filter` | `json` |  Nullable |
| `visual_editor_urls` | `json` |  Nullable |
| `project_id` | `uuid` |  Nullable |
| `mcp_enabled` | `bool` |  |
| `mcp_allow_deletes` | `bool` |  |
| `mcp_prompts_collection` | `varchar` |  Nullable |
| `mcp_system_prompt_enabled` | `bool` |  |
| `mcp_system_prompt` | `text` |  Nullable |
| `project_owner` | `varchar` |  Nullable |
| `project_usage` | `varchar` |  Nullable |
| `org_name` | `varchar` |  Nullable |
| `product_updates` | `bool` |  Nullable |
| `project_status` | `varchar` |  Nullable |
| `ai_openai_api_key` | `text` |  Nullable |
| `ai_anthropic_api_key` | `text` |  Nullable |
| `ai_system_prompt` | `text` |  Nullable |
| `ai_google_api_key` | `text` |  Nullable |
| `ai_openai_compatible_api_key` | `text` |  Nullable |
| `ai_openai_compatible_base_url` | `text` |  Nullable |
| `ai_openai_compatible_name` | `text` |  Nullable |
| `ai_openai_compatible_models` | `json` |  Nullable |
| `ai_openai_compatible_headers` | `json` |  Nullable |
| `ai_openai_allowed_models` | `json` |  Nullable |
| `ai_anthropic_allowed_models` | `json` |  Nullable |
| `ai_google_allowed_models` | `json` |  Nullable |
| `collaborative_editing_enabled` | `bool` |  |
| `ai_translation_default_model` | `text` |  Nullable |
| `ai_translation_glossary` | `json` |  Nullable |
| `ai_translation_style_guide` | `text` |  Nullable |
| `license_key` | `varchar` |  Nullable |
| `license_token` | `text` |  Nullable |
| `mcp_oauth_enabled` | `bool` |  |
| `mcp_oauth_dcr_enabled` | `bool` |  |
| `mcp_oauth_cimd_enabled` | `bool` |  |

## Table `directus_migrations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `version` | `varchar` | Primary |
| `name` | `varchar` |  |
| `timestamp` | `timestamptz` |  Nullable |

## Table `directus_dashboards`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `icon` | `varchar` |  |
| `note` | `text` |  Nullable |
| `date_created` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |
| `color` | `varchar` |  Nullable |

## Table `directus_panels`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `dashboard` | `uuid` |  |
| `name` | `varchar` |  Nullable |
| `icon` | `varchar` |  Nullable |
| `color` | `varchar` |  Nullable |
| `show_header` | `bool` |  |
| `note` | `text` |  Nullable |
| `type` | `varchar` |  |
| `position_x` | `int4` |  |
| `position_y` | `int4` |  |
| `width` | `int4` |  |
| `height` | `int4` |  |
| `options` | `json` |  Nullable |
| `date_created` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |

## Table `directus_notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `timestamp` | `timestamptz` |  Nullable |
| `status` | `varchar` |  Nullable |
| `recipient` | `uuid` |  |
| `sender` | `uuid` |  Nullable |
| `subject` | `varchar` |  |
| `message` | `text` |  Nullable |
| `collection` | `varchar` |  Nullable |
| `item` | `varchar` |  Nullable |

## Table `directus_shares`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  Nullable |
| `collection` | `varchar` |  |
| `item` | `varchar` |  |
| `role` | `uuid` |  Nullable |
| `password` | `varchar` |  Nullable |
| `user_created` | `uuid` |  Nullable |
| `date_created` | `timestamptz` |  Nullable |
| `date_start` | `timestamptz` |  Nullable |
| `date_end` | `timestamptz` |  Nullable |
| `times_used` | `int4` |  Nullable |
| `max_uses` | `int4` |  Nullable |

## Table `directus_flows`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `icon` | `varchar` |  Nullable |
| `color` | `varchar` |  Nullable |
| `description` | `text` |  Nullable |
| `status` | `varchar` |  |
| `trigger` | `varchar` |  Nullable |
| `accountability` | `varchar` |  Nullable |
| `options` | `json` |  Nullable |
| `operation` | `uuid` |  Nullable Unique |
| `date_created` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |

## Table `directus_operations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  Nullable |
| `key` | `varchar` |  |
| `type` | `varchar` |  |
| `position_x` | `int4` |  |
| `position_y` | `int4` |  |
| `options` | `json` |  Nullable |
| `resolve` | `uuid` |  Nullable Unique |
| `reject` | `uuid` |  Nullable Unique |
| `flow` | `uuid` |  |
| `date_created` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |

## Table `directus_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `language` | `varchar` |  |
| `key` | `varchar` |  |
| `value` | `text` |  |

## Table `directus_versions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `key` | `varchar` |  |
| `name` | `varchar` |  Nullable |
| `collection` | `varchar` |  |
| `item` | `varchar` |  Nullable |
| `hash` | `varchar` |  Nullable |
| `date_created` | `timestamptz` |  Nullable |
| `date_updated` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |
| `user_updated` | `uuid` |  Nullable |
| `delta` | `json` |  Nullable |

## Table `directus_extensions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `enabled` | `bool` |  |
| `id` | `uuid` | Primary |
| `folder` | `varchar` |  |
| `source` | `varchar` |  |
| `bundle` | `uuid` |  Nullable |

## Table `directus_policies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `icon` | `varchar` |  |
| `description` | `text` |  Nullable |
| `ip_access` | `text` |  Nullable |
| `enforce_tfa` | `bool` |  |
| `admin_access` | `bool` |  |
| `app_access` | `bool` |  |

## Table `directus_access`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `role` | `uuid` |  Nullable |
| `user` | `uuid` |  Nullable |
| `policy` | `uuid` |  |
| `sort` | `int4` |  Nullable |

## Table `directus_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `collection` | `varchar` |  |
| `item` | `varchar` |  |
| `comment` | `text` |  |
| `date_created` | `timestamptz` |  Nullable |
| `date_updated` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |
| `user_updated` | `uuid` |  Nullable |

## Table `directus_deployments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `provider` | `varchar` |  Unique |
| `credentials` | `text` |  Nullable |
| `options` | `text` |  Nullable |
| `date_created` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |
| `webhook_ids` | `json` |  Nullable |
| `webhook_secret` | `varchar` |  Nullable |
| `last_synced_at` | `timestamptz` |  Nullable |

## Table `directus_deployment_projects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `deployment` | `uuid` |  |
| `external_id` | `varchar` |  |
| `name` | `varchar` |  |
| `date_created` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |
| `url` | `varchar` |  Nullable |
| `framework` | `varchar` |  Nullable |
| `deployable` | `bool` |  |

## Table `directus_deployment_runs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `project` | `uuid` |  |
| `external_id` | `varchar` |  |
| `target` | `varchar` |  |
| `date_created` | `timestamptz` |  Nullable |
| `user_created` | `uuid` |  Nullable |
| `status` | `varchar` |  Nullable |
| `url` | `varchar` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |

## Table `directus_oauth_clients`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `client_id` | `varchar` | Primary |
| `client_name` | `varchar` |  |
| `redirect_uris` | `json` |  |
| `grant_types` | `json` |  |
| `token_endpoint_auth_method` | `varchar` |  |
| `client_secret_hash` | `varchar` |  Nullable |
| `registration_type` | `varchar` |  |
| `client_uri` | `text` |  Nullable |
| `logo_uri` | `text` |  Nullable |
| `tos_uri` | `text` |  Nullable |
| `policy_uri` | `text` |  Nullable |
| `metadata_fetched_at` | `timestamptz` |  Nullable |
| `metadata_expires_at` | `timestamptz` |  Nullable |
| `metadata_etag` | `varchar` |  Nullable |
| `date_created` | `timestamptz` |  |

## Table `directus_oauth_consents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user` | `uuid` |  |
| `client` | `varchar` |  |
| `redirect_uri` | `varchar` |  |
| `scope` | `varchar` |  Nullable |
| `date_created` | `timestamptz` |  |
| `date_updated` | `timestamptz` |  |

## Table `directus_oauth_codes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `code_hash` | `varchar` |  Unique |
| `client` | `varchar` |  |
| `user` | `uuid` |  |
| `redirect_uri` | `varchar` |  |
| `resource` | `varchar` |  |
| `code_challenge` | `varchar` |  |
| `code_challenge_method` | `varchar` |  |
| `scope` | `varchar` |  Nullable |
| `expires_at` | `timestamptz` |  |
| `used_at` | `timestamptz` |  Nullable |

## Table `directus_oauth_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `client` | `varchar` |  |
| `user` | `uuid` |  |
| `session` | `varchar` |  |
| `previous_session` | `varchar` |  Nullable |
| `resource` | `varchar` |  |
| `code_hash` | `varchar` |  |
| `scope` | `varchar` |  Nullable |
| `expires_at` | `timestamptz` |  |
| `date_created` | `timestamptz` |  |

## Table `tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `tag_group` | `text` |  |
| `description` | `text` |  Nullable |
| `parent_tag_id` | `uuid` |  Nullable |
| `visibility` | `text` |  |
| `approved` | `bool` |  |
| `sort` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `worktags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `workid` | `uuid` |  |
| `tagid` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `texttags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `textid` | `uuid` |  |
| `tagid` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `journaltags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `journalid` | `uuid` |  |
| `tagid` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `artisttags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `artistid` | `uuid` |  |
| `tagid` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `razz_feature_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `feature_id` | `uuid` |  |
| `tagid` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `homepage_blocks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `block_type` | `homepage_block_type` |  |
| `heading` | `text` |  Nullable |
| `eyebrow` | `text` |  Nullable |
| `body` | `text` |  Nullable |
| `quote_text` | `text` |  Nullable |
| `quote_attribution` | `text` |  Nullable |
| `image_file_id` | `uuid` |  Nullable |
| `work_id` | `uuid` |  Nullable |
| `artist_id` | `uuid` |  Nullable |
| `text_id` | `uuid` |  Nullable |
| `journal_id` | `uuid` |  Nullable |
| `vault_item_id` | `uuid` |  Nullable |
| `cta_label` | `text` |  Nullable |
| `cta_url` | `text` |  Nullable |
| `sort_order` | `int4` |  |
| `is_published` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `homepage_block_works`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `homepage_block_id` | `uuid` |  |
| `work_id` | `uuid` |  |
| `sort_order` | `int4` |  |

## Custom Types / Enums

### `works_status_t`

`available` | `reserved` | `sold` | `archived`

### `vault_classification_t`

`closed_collective` | `open_public`

### `vault_status_t`

`private` | `archived` | `available`

### `commission_status_t`

`new` | `in_progress` | `completed`

### `contact_type_t`

`general` | `collaboration` | `social`

### `homepage_block_type`

`hero` | `quote` | `featured_work` | `artist` | `related_works` | `newsletter` | `text` | `vault_teaser`

