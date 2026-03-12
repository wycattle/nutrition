-- Step 1: Create the table
CREATE TABLE user_recipes (
  id         SERIAL          PRIMARY KEY,
  user_id    UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT            NOT NULL,
  details    JSONB           NOT NULL,
  category   TEXT,
  created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_recipes_user_name UNIQUE (user_id, name)
);

-- Step 2: Index for fast per-user lookups
CREATE INDEX idx_user_recipes_user_id ON user_recipes(user_id);

-- Step 3: Seed every existing user with the current shared recipes
INSERT INTO user_recipes (user_id, name, details, category)
SELECT
  u.id          AS user_id,
  r.name        AS name,
  r.details     AS details,
  r.category    AS category
FROM users u
CROSS JOIN recipes r;
