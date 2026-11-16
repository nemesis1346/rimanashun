// Sets words.image from packages/shared/data/word-images.json
// ({ "<word id>": "/images/words/<file>.svg" }), written by the icon build
// (`npm run icons --workspace packages/shared`). Only the listed words are
// touched; pictures set another way (later: the admin console) stay.
//
//   npm run db:apply-images   (from apps/backend)
import { readFileSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import pg from "pg";
import { SHARED_DATA } from "./bootstrap.js";

// Returns { updated: ids whose image changed, missing: ids with no word }.
export async function applyImages(client, mapping) {
  const ids = Object.keys(mapping).map(Number);
  const images = ids.map((id) => mapping[id]);
  const { rows } = await client.query(
    `UPDATE words w SET image = t.image
     FROM unnest($1::bigint[], $2::text[]) AS t(id, image)
     WHERE w.id = t.id AND w.image IS DISTINCT FROM t.image
     RETURNING w.id::int AS id`,
    [ids, images]
  );
  const { rows: missing } = await client.query(
    `SELECT t.id::int AS id FROM unnest($1::bigint[]) AS t(id)
     LEFT JOIN words w ON w.id = t.id WHERE w.id IS NULL`,
    [ids]
  );
  return {
    updated: rows.map((r) => r.id).sort((a, b) => a - b),
    missing: missing.map((r) => r.id).sort((a, b) => a - b),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mapping = JSON.parse(readFileSync(path.join(SHARED_DATA, "word-images.json"), "utf-8"));
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const { updated, missing } = await applyImages(client, mapping);
    if (missing.length > 0) console.warn(`[apply-images] no word with id: ${missing.join(", ")}`);
    console.log(`[apply-images] ${Object.keys(mapping).length} pictures in the mapping, ${updated.length} words updated`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
