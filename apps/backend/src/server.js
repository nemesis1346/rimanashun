import express from "express";
import { getVocabulary, getCategories, getPuzzles } from "./db.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const SUPPORTED_LANGUAGES = ["es", "en"];

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Only used by getCategories/getPuzzles (inner join on language_code —
// an unrecognized value would silently drop every row). getVocabulary
// degrades gracefully on its own via a LEFT JOIN + fallback, so it
// doesn't need this, but validating consistently is simpler to reason
// about than two different failure modes.
function parseLang(req, fallback) {
  const lang = req.query.lang;
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : fallback;
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/v1/vocabulary", async (req, res) => {
  const vocabulary = await getVocabulary({ lang: parseLang(req, "es") });
  console.log(`[${new Date().toISOString()}] Returning ${vocabulary.length} vocabulary items`);
  res.json(vocabulary);
});

app.get("/v1/puzzles", async (req, res) => {
  const puzzles = await getPuzzles({ lang: parseLang(req, "en") });
  console.log(`[${new Date().toISOString()}] Returning ${puzzles.length} puzzle items`);
  res.json(puzzles);
});

app.get("/v1/categories", async (req, res) => {
  const categories = await getCategories({ lang: parseLang(req, "en") });
  console.log(`[${new Date().toISOString()}] Returning ${categories.length} category items`);
  res.json(categories);
});

app.get("/v1/vocabulary/by-category", async (req, res) => {
  const category = (req.query.category || "").toString();
  const lang = parseLang(req, "es");
  if (!category) {
    return res.json(await getVocabulary({ lang }));
  }
  const filtered = await getVocabulary({ categoryId: category, lang });
  console.log(`[${new Date().toISOString()}] Filter by "${category}", returning ${filtered.length} items`);
  res.json(filtered);
});

app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] 404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
