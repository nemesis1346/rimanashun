// A throwaway Postgres database per test file, so tests that need an empty
// or specially prepared database never touch the dev data in DATABASE_URL.
// Created on the same server as DATABASE_URL (the user needs CREATEDB, as a
// local Homebrew/Postgres.app user has) and dropped afterwards.
import { randomBytes } from "node:crypto";
import pg from "pg";
import { migrate } from "../../../db/migrate.js";
import { bootstrap } from "../../../db/bootstrap.js";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

// Options: migrateUpTo (false = no migrations, a file name = stop there,
// default all), bootstrap (load packages/shared/data, default false).
// Returns { url, client, drop }.
export async function createTestDatabase({ migrateUpTo, bootstrap: load = false } = {}) {
  const adminUrl = process.env.DATABASE_URL;
  const name = `rimanashun_test_${randomBytes(6).toString("hex")}`;
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${name}`);
  await admin.end();

  const url = new URL(adminUrl);
  url.pathname = `/${name}`;
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  if (migrateUpTo !== false) await migrate(client, { upTo: migrateUpTo });
  if (load) await bootstrap(client);

  async function drop() {
    await client.end().catch(() => {});
    const admin = new pg.Client({ connectionString: adminUrl });
    await admin.connect();
    // FORCE: also ends connections a test left open (e.g. an app pool).
    await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
    await admin.end();
  }

  return { url: url.toString(), client, drop };
}
