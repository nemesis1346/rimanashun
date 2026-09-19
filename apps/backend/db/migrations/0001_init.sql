-- Lookup of selectable base languages. Adding a new base language later
-- is a row insert here, not a schema change.
CREATE TABLE languages (
  code        TEXT PRIMARY KEY,   -- 'en', 'es'
  name        TEXT NOT NULL       -- 'English', 'Español'
);

-- Categories: language-neutral identity + display metadata. Keeps the
-- existing string ids ('numbers', 'greetings', ...) as the PK so the
-- frontend's ?category=<id> routing doesn't need to change.
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  icon        TEXT NOT NULL,
  color       TEXT NOT NULL,
  -- Kichwa/Spanish terms used by native's client-side keyword matching
  -- (apps/native/src/utils/dataLoader.ts). Language-neutral, so it lives
  -- here rather than in category_translations.
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE category_translations (
  category_id     TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  language_code   TEXT NOT NULL REFERENCES languages(code),
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  PRIMARY KEY (category_id, language_code)
);

-- One row per SENSE of a Kichwa term, not one row per unique spelling:
-- the same spelling can legitimately carry more than one meaning
-- (e.g. "chaki" -> "pie" in body, "patas" in animals), so kichwa is
-- intentionally NOT unique. Kichwa is always the target language, so
-- it lives on the row directly rather than in the translations table.
CREATE TABLE words (
  id          BIGSERIAL PRIMARY KEY,
  kichwa      TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  difficulty  TEXT,               -- nullable; not populated in current data
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_words_category ON words(category_id);
CREATE INDEX idx_words_kichwa ON words(kichwa);

-- One row per (word, base language). Adding English support to the
-- vocabulary is inserts here, not a new table or a schema change.
CREATE TABLE word_translations (
  word_id         BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  language_code   TEXT NOT NULL REFERENCES languages(code),
  value           TEXT NOT NULL,
  PRIMARY KEY (word_id, language_code)
);

-- Sentence puzzles. Pieces/order/distractors stay as native Postgres
-- arrays rather than a child table: they're always fetched with their
-- parent puzzle and never queried independently.
CREATE TABLE sentence_puzzles (
  id              TEXT PRIMARY KEY,      -- existing ids: 'sp1', 'sp2', ...
  kichwa_surface  TEXT NOT NULL,         -- "Ñuka yaku upini."
  type            TEXT NOT NULL,         -- "SOV-basic"
  pieces          TEXT[] NOT NULL,
  correct_order   INT[] NOT NULL,
  distractors     TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE puzzle_translations (
  puzzle_id       TEXT NOT NULL REFERENCES sentence_puzzles(id) ON DELETE CASCADE,
  language_code   TEXT NOT NULL REFERENCES languages(code),
  translation     TEXT NOT NULL,        -- "I drink water." / "Bebo agua."
  PRIMARY KEY (puzzle_id, language_code)
);
