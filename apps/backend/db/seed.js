import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Confirmed source-of-truth files (traced via the actual import graph,
// not the stale CLAUDE.md description): packages/shared/data/*.json.
// The packages/shared/src/data/*.json stubs are unreferenced leftovers
// and are intentionally NOT read here.
const SHARED_DATA = path.join(__dirname, "../../../packages/shared/data");

function loadJson(name) {
  return JSON.parse(readFileSync(path.join(SHARED_DATA, name), "utf-8"));
}

function loadLocalJson(name) {
  return JSON.parse(readFileSync(path.join(__dirname, name), "utf-8"));
}

// These are fully derived reference/content tables owned by the source
// JSON files, not user data, so the seed truncates and reloads them
// fresh every run instead of relying on fragile upsert keys (a single
// Kichwa spelling can carry more than one sense, so kichwa alone can't
// be a natural key).
async function truncateContentTables(client) {
  await client.query(`
    TRUNCATE TABLE
      word_translations,
      words,
      puzzle_translations,
      sentence_puzzles,
      category_translations,
      categories,
      languages
    RESTART IDENTITY CASCADE
  `);
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const categories = loadJson("categories.json");
  const vocabulary = loadJson("vocabulary.json");
  const puzzles = loadJson("sentence_puzzles.json");

  // Backfilled translations absent from the original source JSON (see
  // CLAUDE.md's Database section): English word glosses, and Spanish
  // category/puzzle translations. Everything the seed writes lives in
  // this one command now — nothing else needs to run separately.
  //
  // enWordTranslations is keyed by word insertion order (1-based),
  // matching the `words.id` values assigned below via RESTART IDENTITY
  // — this only holds if the dedup logic below stays unchanged.
  const enWordTranslations = loadLocalJson("en-translations.json");
  const esExtras = loadLocalJson("es-translations.json");

  // Collapse only exact duplicates (same kichwa + spanish + category —
  // no information lost). Entries that share a kichwa spelling but
  // differ in spanish and/or category are genuinely different senses
  // and are kept as separate rows.
  const seen = new Set();
  const words = [];
  for (const w of vocabulary) {
    const key = `${w.kichwa} ${w.spanish} ${w.categoryId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    words.push(w);
  }

  await client.query("BEGIN");
  try {
    await truncateContentTables(client);

    await client.query(
      `INSERT INTO languages (code, name) VALUES ('es', 'Español'), ('en', 'English')`
    );

    // Categories + English translations (from source) and Spanish
    // translations (backfilled).
    let categoryEsCount = 0;
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, icon, color, keywords) VALUES ($1, $2, $3, $4)`,
        [cat.id, cat.icon, cat.color, cat.keywords ?? []]
      );
      await client.query(
        `INSERT INTO category_translations (category_id, language_code, name, description)
         VALUES ($1, 'en', $2, $3)`,
        [cat.id, cat.name, cat.description]
      );
      const esCat = esExtras.categories[cat.id];
      if (esCat) {
        await client.query(
          `INSERT INTO category_translations (category_id, language_code, name, description)
           VALUES ($1, 'es', $2, $3)`,
          [cat.id, esCat.name, esCat.description]
        );
        categoryEsCount++;
      }
    }

    // Words (one row per sense) + Spanish translations (from source)
    // and English translations (backfilled).
    let wordEnCount = 0;
    for (const w of words) {
      const { rows } = await client.query(
        `INSERT INTO words (kichwa, category_id) VALUES ($1, $2) RETURNING id`,
        [w.kichwa, w.categoryId]
      );
      const wordId = rows[0].id;
      await client.query(
        `INSERT INTO word_translations (word_id, language_code, value) VALUES ($1, 'es', $2)`,
        [wordId, w.spanish]
      );
      const en = enWordTranslations[String(wordId)];
      if (en) {
        await client.query(
          `INSERT INTO word_translations (word_id, language_code, value) VALUES ($1, 'en', $2)`,
          [wordId, en]
        );
        wordEnCount++;
      }
    }

    // Sentence puzzles + English translations (from source) and
    // Spanish translations (backfilled).
    let puzzleEsCount = 0;
    for (const p of puzzles) {
      await client.query(
        `INSERT INTO sentence_puzzles (id, kichwa_surface, type, pieces, correct_order, distractors)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.id, p.surface, p.type, p.pieces, p.correct_order, p.distractors ?? null]
      );
      await client.query(
        `INSERT INTO puzzle_translations (puzzle_id, language_code, translation) VALUES ($1, 'en', $2)`,
        [p.id, p.translation_en]
      );
      const esPuzzle = esExtras.puzzles[p.id];
      if (esPuzzle) {
        await client.query(
          `INSERT INTO puzzle_translations (puzzle_id, language_code, translation) VALUES ($1, 'es', $2)`,
          [p.id, esPuzzle]
        );
        puzzleEsCount++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `[seed] categories=${categories.length} (es=${categoryEsCount}) ` +
        `words=${words.length} (${vocabulary.length - words.length} exact duplicates collapsed, en=${wordEnCount}) ` +
        `puzzles=${puzzles.length} (es=${puzzleEsCount})`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
