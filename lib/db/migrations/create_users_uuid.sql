-- Run this in the Neon console (or via psql) to set up the users table with UUID PK.
-- If you already have a users table with a serial PK, drop it first (only if no data):
--   DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
