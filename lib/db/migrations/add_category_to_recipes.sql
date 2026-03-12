-- Migration: Add category column to recipes table
ALTER TABLE recipes ADD COLUMN category VARCHAR(50);
-- Optionally, you can set NOT NULL and a default if desired:
-- ALTER TABLE recipes ALTER COLUMN category SET DEFAULT 'Uncategorized';
-- ALTER TABLE recipes ALTER COLUMN category SET NOT NULL;