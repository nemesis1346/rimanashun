-- Per-user learning progress, keyed by the Auth0 user id (the token's `sub`).
--
-- One row per learned item rather than one JSON blob per user: progress only
-- ever grows (nothing is "unlearned"), so adding an item is an idempotent
-- insert, and merging a browser's offline progress into an account is a plain
-- union with no read-modify-write race between two open tabs or devices.
--
-- Not touched by db/seed.js, which only truncates the content tables.
CREATE TABLE user_progress (
  auth0_sub   TEXT        NOT NULL,
  -- Same names as the web app's localStorage keys (apps/web/src/lib/progress.ts).
  -- 0003_active_days.sql widens this check to add 'activeDays'.
  kind        TEXT        NOT NULL
              CHECK (kind IN ('learnedWords', 'learnedPuzzles', 'completedLessons')),
  item_id     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (auth0_sub, kind, item_id)
);
