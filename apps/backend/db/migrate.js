// Applies pending migrations (db/migrations/*.sql, in file-name order), each
// in its own transaction, recording applied ones in schema_migrations.
//
//   npm run db:migrate   (from apps/backend)
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_DIR = path.join(__dirname, "migrations");

// `upTo` (a file name) stops after that migration; tests use it to set up a
// database as it was before a later migration. Returns the files applied.
export async function migrate(client, { dir = MIGRATIONS_DIR, upTo, log = () => {} } = {}) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => !upTo || f <= upTo);

  const applied = [];
  for (const file of files) {
    const { rows } = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [file]);
    if (rows.length > 0) {
      log(`[migrate] skip ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(path.join(dir, file), "utf-8");
    log(`[migrate] applying ${file}`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${file} failed: ${err.message}`, { cause: err });
    }
    applied.push(file);
  }
  return applied;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await migrate(client, { log: console.log });
    console.log("[migrate] done");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
