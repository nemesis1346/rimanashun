import express from "express";
import { UnauthorizedError } from "express-oauth2-jwt-bearer";
import { createRequireAuth } from "./auth.js";
import { getVocabulary, getCategories, getPuzzles } from "./db.js";

const SUPPORTED_LANGUAGES = ["es", "en"];

// Only used by getCategories/getPuzzles (inner join on language_code —
// an unrecognized value would silently drop every row). getVocabulary
// degrades gracefully on its own via a LEFT JOIN + fallback, so it
// doesn't need this, but validating consistently is simpler to reason
// about than two different failure modes.
function parseLang(req, fallback) {
  const lang = req.query.lang;
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : fallback;
}

export function createApp({ requireAuth = createRequireAuth() } = {}) {
  const app = express();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    // Sending an Authorization header makes browsers ask permission first
    res.header("Access-Control-Allow-Headers", "Authorization");
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

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

  // The user always comes from the verified token, never from the request.
  app.get("/v1/me", requireAuth, (req, res) => {
    res.json({ sub: req.auth.payload.sub });
  });

  app.use((req, res) => {
    console.log(`[${new Date().toISOString()}] 404 - Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "Not Found" });
  });

  app.use((err, req, res, next) => {
    // Failed token checks carry their own status and WWW-Authenticate header
    if (err instanceof UnauthorizedError) {
      return res.status(err.status).set(err.headers).json({ error: err.code ?? "unauthorized" });
    }
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}:`, err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
