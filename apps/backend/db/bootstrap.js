// Loads packages/shared/data/*.json (written by db/export.js) into an EMPTY
// database: a new dev machine, or the first production deploy.
//
// Postgres is the source of truth after that: content changes through
// migrations or the admin console, and `npm run db:export` writes the files
// back out. So this refuses to run once content exists; reloading would wipe
// edits. Word ids are inserted as-is, so every database numbers words the
// same way (users' progress refers to words.id).
//
//   npm run db:bootstrap   (from apps/backend, after db:migrate)
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SHARED_DATA = path.join(__dirname, "../../../packages/shared/data");

export class ContentExistsError extends Error {
  constructor() {
    super(
      "The database already has content; refusing to reload it.\n" +
        "Change content with a migration (or the admin console). Only an empty\n" +
        "database can be bootstrapped."
    );
    this.name = "ContentExistsError";
  }
}

async function hasContent(client) {
  const { rows } = await client.query(
    `SELECT (SELECT count(*) FROM words) + (SELECT count(*) FROM sentence_puzzles)
          + (SELECT count(*) FROM categories) AS n`
  );
  return Number(rows[0].n) > 0;
}

// Loads `dataDir`'s vocabulary.json, categories.json and
// sentence_puzzles.json in one transaction. Throws ContentExistsError (and
// changes nothing) if the database already has content. Returns the counts.
export async function bootstrap(client, dataDir = SHARED_DATA) {
  if (await hasContent(client)) throw new ContentExistsError();

  const loadJson = (name) => JSON.parse(readFileSync(path.join(dataDir, name), "utf-8"));
  const categories = loadJson("categories.json");
  const words = loadJson("vocabulary.json");
  const puzzles = loadJson("sentence_puzzles.json");

  await client.query("BEGIN");
  try {
    await client.query(
      `INSERT INTO languages (code, name) VALUES ('es', 'Español'), ('en', 'English')
       ON CONFLICT (code) DO NOTHING`
    );

    for (const c of categories) {
      await client.query(
        `INSERT INTO categories (id, icon, color, keywords) VALUES ($1, $2, $3, $4)`,
        [c.id, c.icon, c.color, c.keywords ?? []]
      );
      await client.query(
        `INSERT INTO category_translations (category_id, language_code, name, description)
         VALUES ($1, 'en', $2, $3)`,
        [c.id, c.name, c.description]
      );
      if (c.es) {
        await client.query(
          `INSERT INTO category_translations (category_id, language_code, name, description)
           VALUES ($1, 'es', $2, $3)`,
          [c.id, c.es.name, c.es.description]
        );
      }
    }

    for (const w of words) {
      await client.query(
        `INSERT INTO words (id, kichwa, category_id, word_type, image) VALUES ($1, $2, $3, $4, $5)`,
        [w.id, w.kichwa, w.categoryId, w.type ?? null, w.image ?? null]
      );
      await client.query(
        `INSERT INTO word_translations (word_id, language_code, value) VALUES ($1, 'es', $2)`,
        [w.id, w.spanish]
      );
      if (w.english) {
        await client.query(
          `INSERT INTO word_translations (word_id, language_code, value) VALUES ($1, 'en', $2)`,
          [w.id, w.english]
        );
      }
    }
    // Explicit ids don't advance the sequence; new words continue after the
    // highest one.
    await client.query(`SELECT setval('words_id_seq', GREATEST((SELECT max(id) FROM words), 1))`);

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
      if (p.translation_es) {
        await client.query(
          `INSERT INTO puzzle_translations (puzzle_id, language_code, translation) VALUES ($1, 'es', $2)`,
          [p.id, p.translation_es]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
  return { categories: categories.length, words: words.length, puzzles: puzzles.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const n = await bootstrap(client);
    console.log(`[bootstrap] categories=${n.categories} words=${n.words} puzzles=${n.puzzles}`);
  } catch (err) {
    console.error(err instanceof ContentExistsError ? `[bootstrap] ${err.message}` : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
