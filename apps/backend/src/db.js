import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Response shapes are additive over the pre-Postgres JSON API, so
// existing callers that don't pass `lang` see unchanged behavior. A
// single Kichwa spelling can carry more than one sense (see
// words.kichwa in the schema), so the same kichwa can appear more than
// once in the vocabulary array — that's expected, not a bug.

export async function getVocabulary({ categoryId, lang = "es" } = {}) {
  // `spanish` always holds the literal Spanish value (native depends on
  // this field and never passes `lang`, so it must never change).
  // `translation` holds whichever language was requested, falling back
  // to Spanish for the couple of words with no English gloss yet.
  const { rows } = await pool.query(
    `SELECT w.kichwa,
            es.value AS spanish,
            COALESCE(t.value, es.value) AS translation,
            w.category_id AS "categoryId"
     FROM words w
     JOIN word_translations es ON es.word_id = w.id AND es.language_code = 'es'
     LEFT JOIN word_translations t ON t.word_id = w.id AND t.language_code = $2
     WHERE $1::text IS NULL OR w.category_id = $1
     ORDER BY w.id`,
    [categoryId ?? null, lang]
  );
  return rows;
}

export async function getCategories({ lang = "en" } = {}) {
  const { rows } = await pool.query(
    `SELECT c.id, ct.name, ct.description, c.icon, c.color, c.keywords
     FROM categories c
     JOIN category_translations ct ON ct.category_id = c.id AND ct.language_code = $1
     ORDER BY c.id`,
    [lang]
  );
  return rows;
}

export async function getPuzzles({ lang = "en" } = {}) {
  const { rows } = await pool.query(
    `SELECT sp.id,
            'Kichwa (Otavalo)' AS language,
            sp.type,
            sp.kichwa_surface AS surface,
            pt.translation AS translation,
            sp.pieces,
            sp.correct_order AS "correct_order",
            sp.distractors
     FROM sentence_puzzles sp
     JOIN puzzle_translations pt ON pt.puzzle_id = sp.id AND pt.language_code = $1
     ORDER BY sp.id`,
    [lang]
  );
  return rows;
}
