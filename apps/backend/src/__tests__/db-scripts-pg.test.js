/**
 * The database scripts in apps/backend/db: migrate, bootstrap, export,
 * apply-images, and migration 0006 (word keys -> ids in user_progress).
 * Each test gets a throwaway database (helpers/testDb.js); the dev database
 * is never touched. Skipped without DATABASE_URL.
 */

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { migrate, MIGRATIONS_DIR } from "../../db/migrate.js";
import { bootstrap, ContentExistsError, SHARED_DATA } from "../../db/bootstrap.js";
import { exportContent } from "../../db/export.js";
import { applyImages } from "../../db/apply-images.js";
import { createTestDatabase, hasDatabase } from "./helpers/testDb.js";

const skip = !hasDatabase && "DATABASE_URL not set";
const DATA_FILES = ["vocabulary.json", "categories.json", "sentence_puzzles.json"];
const readData = (dir, name) => readFileSync(path.join(dir, name), "utf-8");
const sourceWords = JSON.parse(readData(SHARED_DATA, "vocabulary.json"));
const sourceCategories = JSON.parse(readData(SHARED_DATA, "categories.json"));
const sourcePuzzles = JSON.parse(readData(SHARED_DATA, "sentence_puzzles.json"));

const tempDirs = [];
function tempDir() {
  const dir = mkdtempSync(path.join(tmpdir(), "rimanashun-test-"));
  tempDirs.push(dir);
  return dir;
}
after(() => tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

const count = async (client, table) =>
  Number((await client.query(`SELECT count(*) AS n FROM ${table}`)).rows[0].n);

describe("migrate", { skip }, () => {
  let db;
  before(async () => (db = await createTestDatabase({ migrateUpTo: false })));
  after(() => db?.drop());

  it("applies every migration in order and records it", async () => {
    const applied = await migrate(db.client);
    const files = (await import("node:fs")).readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
    assert.deepEqual(applied, files);
    const { rows } = await db.client.query("SELECT filename FROM schema_migrations ORDER BY filename");
    assert.deepEqual(rows.map((r) => r.filename), files);
  });

  it("applies nothing the second time", async () => {
    assert.deepEqual(await migrate(db.client), []);
  });

  it("stops at upTo, and applies the rest later", async () => {
    const dir = tempDir();
    writeFileSync(path.join(dir, "0001_a.sql"), "CREATE TABLE t_a (x int);");
    writeFileSync(path.join(dir, "0002_b.sql"), "CREATE TABLE t_b (x int);");
    assert.deepEqual(await migrate(db.client, { dir, upTo: "0001_a.sql" }), ["0001_a.sql"]);
    assert.deepEqual(await migrate(db.client, { dir }), ["0002_b.sql"]);
  });

  it("rolls back a failing migration and doesn't record it", async () => {
    const dir = tempDir();
    writeFileSync(path.join(dir, "0003_bad.sql"), "CREATE TABLE t_bad (x int); SELECT 1/0;");
    await assert.rejects(migrate(db.client, { dir }), /0003_bad\.sql failed/);
    const { rows } = await db.client.query("SELECT to_regclass('t_bad') AS t");
    assert.equal(rows[0].t, null);
    const recorded = await db.client.query("SELECT 1 FROM schema_migrations WHERE filename = '0003_bad.sql'");
    assert.equal(recorded.rowCount, 0);
  });
});

describe("bootstrap", { skip }, () => {
  let db;
  before(async () => (db = await createTestDatabase()));
  after(() => db?.drop());

  it("loads every word, category and puzzle from the data files", async () => {
    const n = await bootstrap(db.client);
    assert.deepEqual(n, { words: sourceWords.length, categories: sourceCategories.length, puzzles: sourcePuzzles.length });
    assert.equal(await count(db.client, "words"), sourceWords.length);
    assert.equal(await count(db.client, "sentence_puzzles"), sourcePuzzles.length);
  });

  it("keeps each word's id, translations, type and picture", async () => {
    const { rows } = await db.client.query(
      `SELECT w.id::int AS id, w.kichwa, es.value AS spanish, en.value AS english,
              w.category_id AS "categoryId", w.word_type AS type, w.image
       FROM words w
       JOIN word_translations es ON es.word_id = w.id AND es.language_code = 'es'
       LEFT JOIN word_translations en ON en.word_id = w.id AND en.language_code = 'en'
       ORDER BY w.id`
    );
    assert.deepEqual(rows, sourceWords);
  });

  it("makes new words continue after the highest id", async () => {
    const maxId = Math.max(...sourceWords.map((w) => w.id));
    const { rows } = await db.client.query(
      `INSERT INTO words (kichwa, category_id) VALUES ('test', 'general') RETURNING id::int AS id`
    );
    assert.equal(rows[0].id, maxId + 1);
    await db.client.query("DELETE FROM words WHERE id = $1", [rows[0].id]);
  });

  it("refuses a database that already has content, changing nothing", async () => {
    await db.client.query("UPDATE word_translations SET value = 'edited' WHERE word_id = 14 AND language_code = 'es'");
    await assert.rejects(bootstrap(db.client), ContentExistsError);
    assert.equal(await count(db.client, "words"), sourceWords.length);
    const { rows } = await db.client.query("SELECT value FROM word_translations WHERE word_id = 14 AND language_code = 'es'");
    assert.equal(rows[0].value, "edited");
  });
});

describe("bootstrap with bad data", { skip }, () => {
  let db;
  before(async () => (db = await createTestDatabase()));
  after(() => db?.drop());

  it("rolls back entirely, so it can be fixed and retried", async () => {
    const dir = tempDir();
    for (const f of DATA_FILES) writeFileSync(path.join(dir, f), readData(SHARED_DATA, f));
    const broken = [...sourceWords, { ...sourceWords[0], id: 99999, categoryId: "no-such-category" }];
    writeFileSync(path.join(dir, "vocabulary.json"), JSON.stringify(broken));
    await assert.rejects(bootstrap(db.client, dir), /foreign key/);
    assert.equal(await count(db.client, "words"), 0);
    assert.equal(await count(db.client, "categories"), 0);
    await bootstrap(db.client); // the real files still load afterwards
  });
});

describe("export", { skip }, () => {
  let db;
  before(async () => (db = await createTestDatabase({ bootstrap: true })));
  after(() => db?.drop());

  it("round-trips: exporting a bootstrapped database gives the same files byte for byte", async () => {
    const dir = tempDir();
    await exportContent(db.client, dir);
    for (const f of DATA_FILES) assert.equal(readData(dir, f), readData(SHARED_DATA, f), `${f} differs`);
  });

  it("shows an edited word as a one-line change", async () => {
    await db.client.query("UPDATE word_translations SET value = 'casa' WHERE word_id = 574 AND language_code = 'es'");
    const dir = tempDir();
    await exportContent(db.client, dir);
    const before = readData(SHARED_DATA, "vocabulary.json").split("\n");
    const after = readData(dir, "vocabulary.json").split("\n");
    const changed = after.filter((line, i) => line !== before[i]);
    assert.equal(before.length, after.length);
    assert.equal(changed.length, 1);
    assert.match(changed[0], /"id":574,"kichwa":"wasi","spanish":"casa"/);
  });
});

describe("migration 0006: learned words by id", { skip }, () => {
  let db;
  const sub = "test|0006";
  before(async () => {
    db = await createTestDatabase({ migrateUpTo: "0005_word_types.sql", bootstrap: true });
    await db.client.query(
      `INSERT INTO user_progress (auth0_sub, kind, item_id) VALUES
         ($1, 'learnedWords', 'allku|perro'),
         ($1, 'learnedWords', 'allpa|tierra, terreno'),
         ($1, 'learnedWords', 'gone|no such word'),
         ($1, 'learnedPuzzles', 'sp1'),
         ($1, 'completedLessons', 'animals:0'),
         ($1, 'activeDays', '2026-11-14')`,
      [sub]
    );
    await migrate(db.client);
  });
  after(() => db?.drop());

  const items = async (kind) =>
    (await db.client.query(
      "SELECT item_id FROM user_progress WHERE auth0_sub = $1 AND kind = $2 ORDER BY item_id",
      [sub, kind]
    )).rows.map((r) => r.item_id);

  it("rewrites kichwa|spanish keys to word ids", async () => {
    assert.deepEqual(await items("learnedWords"), ["14", "16"]);
  });

  it("deletes keys that match no word", async () => {
    const { rowCount } = await db.client.query("SELECT 1 FROM user_progress WHERE item_id LIKE 'gone|%'");
    assert.equal(rowCount, 0);
  });

  it("leaves the other kinds alone", async () => {
    assert.deepEqual(await items("learnedPuzzles"), ["sp1"]);
    assert.deepEqual(await items("completedLessons"), ["animals:0"]);
    assert.deepEqual(await items("activeDays"), ["2026-11-14"]);
  });
});

describe("applyImages", { skip }, () => {
  let db;
  before(async () => (db = await createTestDatabase({ bootstrap: true })));
  after(() => db?.drop());

  const imageOf = async (id) => (await db.client.query("SELECT image FROM words WHERE id = $1", [id])).rows[0].image;

  it("sets listed words' pictures and reports which changed", async () => {
    // 14 already has allku.svg (unchanged); 574 has none (changed).
    const { updated, missing } = await applyImages(db.client, {
      14: "/images/words/allku.svg",
      574: "/images/words/wasi.svg",
    });
    assert.deepEqual(updated, [574]);
    assert.deepEqual(missing, []);
    assert.equal(await imageOf(574), "/images/words/wasi.svg");
  });

  it("leaves words that aren't listed alone", async () => {
    assert.equal(await imageOf(16), "/images/words/allpa.svg");
  });

  it("reports ids with no word", async () => {
    const { updated, missing } = await applyImages(db.client, { 99999: "/images/words/x.svg" });
    assert.deepEqual(updated, []);
    assert.deepEqual(missing, [99999]);
  });
});
