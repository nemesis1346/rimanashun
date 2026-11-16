// Writes the database's content to packages/shared/data/*.json:
//   vocabulary.json        [{ id, kichwa, spanish, english, categoryId, type, image }]
//   categories.json        [{ id, name, description, icon, color, keywords, es: { name, description } }]
//   sentence_puzzles.json  [{ id, language, type, surface, translation_en, translation_es, pieces, correct_order, distractors }]
//
// Postgres is the source of truth; these files are its export: a backup in
// git (diffs show exactly what an editor changed), the native app's offline
// copy, and what db/bootstrap.js loads into an empty database. Field names
// are a superset of the older hand-written files, so existing readers keep
// working. Run before each native release and to snapshot edits:
//
//   npm run db:export   (from apps/backend)
import { writeFileSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import pg from "pg";
import { SHARED_DATA } from "./bootstrap.js";

// One object per line inside the array: readable, and a one-word edit is a
// one-line diff.
function writeJsonLines(file, items) {
  const body = items.map((item) => "  " + JSON.stringify(item)).join(",\n");
  writeFileSync(file, `[\n${body}\n]\n`);
}

const naturalOrder = (a, b) => a.localeCompare(b, "en", { numeric: true });

// Writes the three files into `outDir`; returns the counts.
export async function exportContent(client, outDir = SHARED_DATA) {
  const { rows: words } = await client.query(
    `SELECT w.id::int AS id, w.kichwa, es.value AS spanish, en.value AS english,
            w.category_id AS "categoryId", w.word_type AS type, w.image
     FROM words w
     JOIN word_translations es ON es.word_id = w.id AND es.language_code = 'es'
     LEFT JOIN word_translations en ON en.word_id = w.id AND en.language_code = 'en'
     ORDER BY w.id`
  );

  const { rows: categories } = await client.query(
    `SELECT c.id, en.name, en.description, c.icon, c.color, c.keywords,
            es.name AS es_name, es.description AS es_description
     FROM categories c
     JOIN category_translations en ON en.category_id = c.id AND en.language_code = 'en'
     LEFT JOIN category_translations es ON es.category_id = c.id AND es.language_code = 'es'`
  );
  categories.sort((a, b) => naturalOrder(a.id, b.id));

  const { rows: puzzles } = await client.query(
    `SELECT sp.id, 'Kichwa (Otavalo)' AS language, sp.type, sp.kichwa_surface AS surface,
            en.translation AS translation_en, es.translation AS translation_es,
            sp.pieces, sp.correct_order, sp.distractors
     FROM sentence_puzzles sp
     JOIN puzzle_translations en ON en.puzzle_id = sp.id AND en.language_code = 'en'
     LEFT JOIN puzzle_translations es ON es.puzzle_id = sp.id AND es.language_code = 'es'`
  );
  puzzles.sort((a, b) => naturalOrder(a.id, b.id));

  writeJsonLines(path.join(outDir, "vocabulary.json"), words);
  writeJsonLines(
    path.join(outDir, "categories.json"),
    categories.map(({ es_name, es_description, ...c }) => ({
      ...c,
      es: es_name ? { name: es_name, description: es_description } : null,
    }))
  );
  writeJsonLines(
    path.join(outDir, "sentence_puzzles.json"),
    puzzles.map(({ distractors, ...p }) => (distractors ? { ...p, distractors } : p))
  );
  return { words: words.length, categories: categories.length, puzzles: puzzles.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const n = await exportContent(client);
    console.log(`[export] vocabulary=${n.words} categories=${n.categories} puzzles=${n.puzzles} → ${SHARED_DATA}`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
