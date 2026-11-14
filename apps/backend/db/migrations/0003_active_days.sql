-- Adds the 'activeDays' progress kind: one row per local calendar day
-- (item_id 'YYYY-MM-DD') on which the user answered something correctly.
-- Powers the streak and recent-activity on the web Progress page, and syncs
-- across devices the same way as the other kinds.
ALTER TABLE user_progress
  DROP CONSTRAINT user_progress_kind_check,
  ADD CONSTRAINT user_progress_kind_check
    CHECK (kind IN ('learnedWords', 'learnedPuzzles', 'completedLessons', 'activeDays'));
