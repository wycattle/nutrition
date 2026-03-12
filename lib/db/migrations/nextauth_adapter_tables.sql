-- NextAuth pg-adapter schema migration
-- Run in Neon console BEFORE deploying the updated [...nextauth].ts

-- Step 1: Add missing columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;

-- Step 2: accounts table
-- One row per provider login (github, google, etc.)
-- Multiple rows can map to the SAME user_id UUID
CREATE TABLE IF NOT EXISTS accounts (
  id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
  "userId"            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT        NOT NULL,
  provider            TEXT        NOT NULL,
  "providerAccountId" TEXT        NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  PRIMARY KEY (id),
  UNIQUE (provider, "providerAccountId")
);

-- Step 3: sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  "sessionToken"  TEXT        NOT NULL UNIQUE,
  "userId"        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id)
);

-- Step 4: verification_tokens table (for email magic links if ever used)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier  TEXT        NOT NULL,
  token       TEXT        NOT NULL,
  expires     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);
