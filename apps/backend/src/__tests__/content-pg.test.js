/**
 * Content endpoints (/v1/vocabulary, /by-category, /v1/categories,
 * /v1/puzzles) against a throwaway database bootstrapped from
 * packages/shared/data (helpers/testDb.js), so expected values come from the
 * data files and the dev database is never read. Skipped without
 * DATABASE_URL.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { SHARED_DATA } from "../../db/bootstrap.js";
import { createTestDatabase, hasDatabase } from "./helpers/testDb.js";

const skip = !hasDatabase && "DATABASE_URL not set";
const load = (name) => JSON.parse(readFileSync(path.join(SHARED_DATA, name), "utf-8"));
const words = load("vocabulary.json");
const categories = load("categories.json");
const puzzles = load("sentence_puzzles.json");

let db, server, base, pool;

before(async () => {
  if (!hasDatabase) return;
  db = await createTestDatabase({ bootstrap: true });
  // src/db.js builds its pool from DATABASE_URL when first imported, so point
  // it at the test database before importing the app (each test file runs in
  // its own process).
  process.env.DATABASE_URL = db.url;
  const { createApp } = await import("../app.js");
  ({ pool } = await import("../db.js"));
  const unused = (req, res) => res.sendStatus(500);
  server = createApp({ requireAuth: unused, progressStore: {} }).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  server?.close();
  await pool?.end();
  await db?.drop();
});

const get = async (route) => {
  const res = await fetch(`${base}${route}`);
  assert.equal(res.status, 200);
  return res.json();
};
const byId = (items) => new Map(items.map((x) => [x.id, x]));

describe("GET /v1/vocabulary", { skip }, () => {
  it("returns every word with its permanent id, in id order", async () => {
    const result = await get("/v1/vocabulary");
    assert.deepEqual(result.map((w) => w.id), words.map((w) => w.id));
  });

  it("defaults to Spanish: translation = spanish", async () => {
    const allku = byId(await get("/v1/vocabulary")).get(14);
    assert.deepEqual(
      { kichwa: allku.kichwa, spanish: allku.spanish, translation: allku.translation, type: allku.type, image: allku.image },
      { kichwa: "allku", spanish: "perro", translation: "perro", type: "noun", image: "/images/words/allku.svg" }
    );
  });

  it("lang=en: translation is English, spanish stays Spanish", async () => {
    const allku = byId(await get("/v1/vocabulary?lang=en")).get(14);
    assert.equal(allku.translation, "dog");
    assert.equal(allku.spanish, "perro");
  });

  it("lang=en falls back to Spanish for a word with no English", async () => {
    const result = await get("/v1/vocabulary?lang=en");
    for (const w of words.filter((w) => !w.english)) {
      assert.equal(byId(result).get(w.id).translation, w.spanish);
    }
  });

  it("an unknown lang is treated as the default", async () => {
    assert.deepEqual(await get("/v1/vocabulary?lang=xx"), await get("/v1/vocabulary"));
  });

  it("is sent compressed when the client accepts it", async () => {
    const res = await fetch(`${base}/v1/vocabulary`, { headers: { "Accept-Encoding": "gzip" } });
    assert.equal(res.headers.get("content-encoding"), "gzip");
  });
});

describe("GET /v1/vocabulary/by-category", { skip }, () => {
  it("returns only that category's words", async () => {
    const result = await get("/v1/vocabulary/by-category?category=animals");
    assert.deepEqual(
      result.map((w) => w.id),
      words.filter((w) => w.categoryId === "animals").map((w) => w.id)
    );
  });

  it("follows lang", async () => {
    const result = await get("/v1/vocabulary/by-category?category=animals&lang=en");
    assert.equal(byId(result).get(14).translation, "dog");
  });

  it("returns everything without a category, and nothing for an unknown one", async () => {
    assert.equal((await get("/v1/vocabulary/by-category")).length, words.length);
    assert.deepEqual(await get("/v1/vocabulary/by-category?category=nope"), []);
  });
});

describe("GET /v1/categories", { skip }, () => {
  it("defaults to English names", async () => {
    const result = await get("/v1/categories");
    assert.equal(result.length, categories.length);
    for (const c of categories) {
      assert.equal(byId(result).get(c.id).name, c.name);
    }
  });

  it("lang=es gives the Spanish names and descriptions", async () => {
    const result = byId(await get("/v1/categories?lang=es"));
    for (const c of categories) {
      assert.deepEqual(
        { name: result.get(c.id).name, description: result.get(c.id).description },
        c.es
      );
    }
  });

  it("an unknown lang falls back to English instead of returning nothing", async () => {
    assert.deepEqual(await get("/v1/categories?lang=xx"), await get("/v1/categories"));
  });
});

describe("GET /v1/puzzles", { skip }, () => {
  it("defaults to English translations, with pieces and order", async () => {
    const result = byId(await get("/v1/puzzles"));
    assert.equal(result.size, puzzles.length);
    for (const p of puzzles) {
      const got = result.get(p.id);
      assert.equal(got.translation, p.translation_en);
      assert.deepEqual(got.pieces, p.pieces);
      assert.deepEqual(got.correct_order, p.correct_order);
    }
  });

  it("lang=es gives the Spanish translations", async () => {
    const result = byId(await get("/v1/puzzles?lang=es"));
    for (const p of puzzles) assert.equal(result.get(p.id).translation, p.translation_es);
  });

  it("an unknown lang falls back to English instead of returning nothing", async () => {
    assert.deepEqual(await get("/v1/puzzles?lang=xx"), await get("/v1/puzzles"));
  });
});
