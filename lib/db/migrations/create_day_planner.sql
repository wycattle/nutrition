-- Migration: create day_planner table
-- No timestamp columns (not needed for this feature)

CREATE TABLE day_planner (
  id         SERIAL   PRIMARY KEY,
  user_id    UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT     NOT NULL,
  details    JSONB    NOT NULL DEFAULT '[]',
  notes      TEXT,
  CONSTRAINT uq_day_planner_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_day_planner_user_id ON day_planner(user_id);
