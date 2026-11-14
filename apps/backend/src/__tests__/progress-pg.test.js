/**
 * Tests the Postgres progress store against a real database: the SQL itself
 * (unnest insert, ON CONFLICT, per-user filtering) can't be checked with the
 * in-memory store. Needs DATABASE_URL with migrations applied
 * (`npm run db:migrate`); skipped otherwise. `npm test` loads apps/backend/.env.
 *
 * Every run uses fresh random user ids and deletes them afterwards, so it is
 * safe against a dev database that holds real progress.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import pg from "pg";
import { createPgProgressStore, emptyProgress } from "../progress.js";

const url = process.env.DATABASE_URL;
const pool = url ? new pg.Pool({ connectionString: url }) : null;
const store = pool ? createPgProgressStore(pool) : null;
const runId = randomUUID();
const user = (name) => `test|${runId}|${name}`;

after(async () => {
  if (!pool) return;
  await pool.query("DELETE FROM user_progress WHERE auth0_sub LIKE $1", [`test|${runId}|%`]);
  await pool.end();
});

describe("Postgres progress store", { skip: !url && "DATABASE_URL not set" }, () => {
  it("returns every kind, empty, for a new user", async () => {
    assert.deepEqual(await store.get(user("new")), emptyProgress());
  });

  it("adds items and reads them back", async () => {
    const result = await store.add(user("a"), {
      ...emptyProgress(),
      learnedWords: ["allku|perro", "misi|gato"],
      completedLessons: ["numbers:0"],
    });
    assert.deepEqual(result.learnedWords.sort(), ["allku|perro", "misi|gato"]);
    assert.deepEqual(result.completedLessons, ["numbers:0"]);
    assert.deepEqual(await store.get(user("a")), result);
  });

  it("ignores items that are already stored", async () => {
    await store.add(user("b"), { ...emptyProgress(), learnedPuzzles: ["sp1"] });
    const result = await store.add(user("b"), { ...emptyProgress(), learnedPuzzles: ["sp1", "sp2"] });
    assert.deepEqual(result.learnedPuzzles.sort(), ["sp1", "sp2"]);
  });

  it("keeps the same item id separate across kinds", async () => {
    const result = await store.add(user("c"), {
      ...emptyProgress(),
      learnedWords: ["x"],
      learnedPuzzles: ["x"],
    });
    assert.deepEqual(result.learnedWords, ["x"]);
    assert.deepEqual(result.learnedPuzzles, ["x"]);
  });

  it("accepts the activeDays kind (migration 0003)", async () => {
    const result = await store.add(user("days"), { ...emptyProgress(), activeDays: ["2026-11-14"] });
    assert.deepEqual(result.activeDays, ["2026-11-14"]);
  });

  it("keeps users separate", async () => {
    await store.add(user("d"), { ...emptyProgress(), learnedWords: ["only-d"] });
    assert.deepEqual((await store.get(user("e"))).learnedWords, []);
  });

  it("handles an add with nothing in it", async () => {
    assert.deepEqual(await store.add(user("f"), emptyProgress()), emptyProgress());
  });

  it("handles concurrent adds of overlapping items", async () => {
    const items = ["w1", "w2", "w3"];
    await Promise.all(
      items.map(() => store.add(user("g"), { ...emptyProgress(), learnedWords: items }))
    );
    assert.deepEqual((await store.get(user("g"))).learnedWords.sort(), items);
  });
});
