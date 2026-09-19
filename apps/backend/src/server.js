import express from "express";
// Use CommonJS-compatible entry for Node runtime to avoid JSON import assertions
import { vocabularyData, sentencePuzzles, categories } from "../../../packages/shared/index.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/v1/vocabulary", (req, res) => {
  console.log(`[${new Date().toISOString()}] Returning ${vocabularyData.length} vocabulary items`);
  res.json(vocabularyData);
});

app.get("/v1/puzzles", (req, res) => {
  console.log(`[${new Date().toISOString()}] Returning ${sentencePuzzles.length} puzzle items`);
  res.json(sentencePuzzles);
});

app.get("/v1/categories", (req, res) => {
  console.log(`[${new Date().toISOString()}] Returning ${categories.length} category items`);
  res.json(categories);
});

app.get("/v1/vocabulary/by-category", (req, res) => {
  const category = (req.query.category || "").toString();
  if (!category) {
    return res.json(vocabularyData);
  }
  const filtered = vocabularyData.filter((w) => w.categoryId === category);
  console.log(`[${new Date().toISOString()}] Filter by "${category}", returning ${filtered.length} items`);
  res.json(filtered);
});

app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] 404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
