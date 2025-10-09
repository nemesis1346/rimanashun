import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadJson(relPath) {
  const full = path.join(__dirname, relPath);
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}

export const vocabularyData = loadJson("data/vocabulary.json");
export const sentencePuzzles = loadJson("data/sentence_puzzles.json");
export const categories = loadJson("data/categories.json");



