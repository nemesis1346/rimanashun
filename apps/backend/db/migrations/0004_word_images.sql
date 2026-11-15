-- Optional picture for a word sense, used by the quiz's picture questions.
-- A path served by the web app (e.g. '/images/words/allku.svg'), not a full
-- URL, so moving the files to a CDN later only changes a base URL. Loaded by
-- db/seed.js from packages/shared/data/word-images.json; NULL for words
-- without a clear picture (most verbs and abstract words).
ALTER TABLE words ADD COLUMN image TEXT;
