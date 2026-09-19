-- Run this in Supabase only after reviewing the schema and taking a backup.
-- New content is private by default. Editors must explicitly publish it.

ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

ALTER TABLE works
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

ALTER TABLE texts
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

ALTER TABLE journal
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

ALTER TABLE razz_issues
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

ALTER TABLE razz_features
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS artists_is_published_idx
  ON artists (is_published);

CREATE INDEX IF NOT EXISTS works_is_published_idx
  ON works (is_published);

CREATE INDEX IF NOT EXISTS texts_is_published_idx
  ON texts (is_published);

CREATE INDEX IF NOT EXISTS journal_is_published_idx
  ON journal (is_published);

CREATE INDEX IF NOT EXISTS razz_issues_is_published_idx
  ON razz_issues (is_published);

CREATE INDEX IF NOT EXISTS razz_features_is_published_idx
  ON razz_features (is_published);
