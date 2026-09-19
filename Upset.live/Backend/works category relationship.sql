-- Run in Supabase/PostgreSQL after taking a database backup.
-- This makes works.category_id a real relationship to work_categories.
-- Invalid existing category IDs are cleared instead of deleting works.

BEGIN;

-- Preserve works whose category value does not match an existing category.
UPDATE works
SET category_id = NULL
WHERE category_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM work_categories
    WHERE work_categories.id = works.category_id
  );

-- Add the relationship only when it is not already present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'works_category_id_fkey'
      AND conrelid = 'works'::regclass
  ) THEN
    ALTER TABLE works
      ADD CONSTRAINT works_category_id_fkey
      FOREIGN KEY (category_id)
      REFERENCES work_categories(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS works_category_id_idx
  ON works (category_id);

COMMIT;

-- After running this migration, refresh Directus.
-- Configure category_id as a relational field with:
--   works.category_id -> work_categories.id
-- Use a Related Dropdown interface so users select a category instead of typing a UUID.
