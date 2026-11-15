// Writes the quiz pictures and the word -> picture mapping:
//   apps/web/public/images/words/<file>.svg
//   packages/shared/data/word-images.json   ({ "kichwa|spanish": "/images/words/<file>.svg" })
// The seed (apps/backend/db/seed.js) loads the mapping into words.image.
//
//   node packages/shared/scripts/word-icons/build.mjs [--sheet out.png]
//
// --sheet renders a contact sheet of every picture for review (needs sharp,
// which is installed at the repo root).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { icons } from "./icons.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const IMAGES_DIR = path.join(ROOT, "apps/web/public/images/words");
const MAPPING = path.join(ROOT, "packages/shared/data/word-images.json");
const VOCAB = path.join(ROOT, "packages/shared/data/vocabulary.json");

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${body}\n</svg>\n`;

// Every key must name a real word, or the picture silently never shows.
const wordKeys = new Set(JSON.parse(readFileSync(VOCAB, "utf-8")).map((w) => `${w.kichwa}|${w.spanish}`));
const missing = icons.flatMap((i) => i.keys).filter((k) => !wordKeys.has(k));
if (missing.length) {
  console.error(`No such word for: ${missing.join(", ")}`);
  process.exit(1);
}

mkdirSync(IMAGES_DIR, { recursive: true });
const mapping = {};
for (const icon of icons) {
  writeFileSync(path.join(IMAGES_DIR, `${icon.file}.svg`), svg(icon.body));
  for (const key of icon.keys) mapping[key] = `/images/words/${icon.file}.svg`;
}
const sorted = Object.fromEntries(Object.entries(mapping).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(MAPPING, JSON.stringify(sorted, null, 2) + "\n");
console.log(`wrote ${icons.length} pictures for ${Object.keys(mapping).length} words`);

const sheetArg = process.argv.indexOf("--sheet");
if (sheetArg !== -1) {
  const out = path.resolve(process.argv[sheetArg + 1]);
  const sharp = createRequire(path.join(ROOT, "package.json"))("sharp");
  const COLS = 6, CW = 180, CH = 210, PAD = 20;
  const rows = Math.ceil(icons.length / COLS);
  const W = COLS * CW + PAD * 2, H = rows * CH + PAD * 2;
  const cells = icons.map((icon, i) => {
    const x = PAD + (i % COLS) * CW, y = PAD + Math.floor(i / COLS) * CH;
    const [kichwa, spanish] = icon.keys[0].split("|");
    return `
    <g transform="translate(${x + 8} ${y + 8})">
      <rect width="${CW - 16}" height="${CH - 16}" rx="16" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>
      <svg x="${(CW - 16 - 112) / 2}" y="14" width="112" height="112" viewBox="0 0 64 64">${icon.body}</svg>
      <text x="${(CW - 16) / 2}" y="150" text-anchor="middle" font-family="Helvetica, Arial" font-size="19" font-weight="700" fill="#1E293B">${kichwa}</text>
      <text x="${(CW - 16) / 2}" y="174" text-anchor="middle" font-family="Helvetica, Arial" font-size="14" fill="#64748B">${spanish}</text>
    </g>`;
  });
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#F8FAFC"/>${cells.join("")}</svg>`;
  await sharp(Buffer.from(sheet), { density: 120 }).png().toFile(out);
  console.log(`contact sheet: ${out}`);
}
