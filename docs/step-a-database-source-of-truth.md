# Step A — Postgres as the source of truth, stable word ids

Status: **done** (2026-11-15). Differences from the plan below:
- Browsers' old word keys: instead of a `progressVersion` flag, `getLearned`
  skips anything in `learnedWords` that isn't a word id (never uploaded,
  dropped on the next write). Same effect, less state.
- Icons keep readable `kichwa|spanish` keys; the icon build resolves them to
  ids through the exported `vocabulary.json`.
- Bootstrap reads the export format (ids, `english`, `type`, `image`,
  Spanish translations inline); `en-translations.json`, `es-translations.json`
  and `word-types.json` were deleted. Round-trip (bootstrap → export) is
  byte-identical.

 First step towards the admin
console (Auth0 roles → admin API → admin UI → review queue → levels).

## Why

The admin console lets a Kichwa speaker fix words and puzzles in the
database. Two things in today's design break that:

1. **`npm run db:seed` truncates every content table and reloads it from
   `packages/shared/data/*.json`.** Any fix made in the database would be
   wiped by the next seed.
2. **Words are identified by `kichwa|spanish`** (`getWordKey` in
   `apps/web/src/lib/data.ts`), and that string is what users' progress
   stores (`user_progress`, kind `learnedWords`). Correcting a gloss
   (`wasi|casado` → `wasi|casa`) changes the key, and every user who learned
   the word loses it. `words.id` exists but is useless as an identity today:
   the seed restarts it on every run.

Puzzles (`sp1`, `sp2`, …), categories (`animals`, …) and lessons
(`<categoryId>:<index>`) already have stable ids and are not affected.

## Target state

- Postgres holds the content. Edits happen there (by migration now, by the
  admin console later). Nothing truncates content tables any more.
- `words.id` is permanent and is the word's identity everywhere: API,
  quiz, progress.
- `packages/shared/data/*.json` become an **export** of the database, made
  by a script: a backup in git and the native app's offline copy. Same
  fields as today (so native keeps working), plus `id`, `english`, `type`,
  `image`.
- The picture and type mappings (`word-images.json`, `word-types.json`) and
  the order-dependent `en-translations.json` / `es-translations.json` stop
  being inputs; their data already lives in columns.

## Changes

### 1. Bootstrap instead of seed (`apps/backend/db/`)

- Rename `seed.js` → `bootstrap.js` (`npm run db:bootstrap`). Same loading
  logic, but it **refuses to run if `words` already has rows** (prints a
  message and exits non-zero). It's only for an empty database: a new dev
  machine or the first production deploy.
- Remove `db:seed`, so nobody runs the destructive version by habit.
- From then on, content changes are SQL migrations (`0006_…sql`) or, later,
  admin edits.

### 2. Word ids in the API and the web app

- `GET /v1/vocabulary` returns `id` (additive; native ignores it).
- `KichwaWord.id: number`; `getWordKey(word)` returns `String(word.id)`.
  Everything that uses word keys (quiz `seen`, `markLearned`, `stats.ts`) goes
  through `getWordKey`, so this is a one-line change plus types and tests.

### 3. Migrate stored progress (`0006_word_ids_in_progress.sql`)

- Rewrite `user_progress` rows of kind `learnedWords` from `kichwa|spanish`
  to the word's id, by joining `words` with its Spanish translation. Today
  the mapping is 1:1 (703 keys for 703 words, checked).
- Rows that match no word (a gloss already changed) are deleted. The
  migration reports how many.
- Local DB today: 54 learned words, 1 user. Production has no database yet,
  so there's nothing to migrate there.

### 4. Old keys in browsers (`apps/web/src/lib/progress.ts`)

Browsers still hold `kichwa|spanish` keys in localStorage, and the sync would
upload them again (POST only adds). So:

- Add a `progressVersion` key in localStorage. If it's older than 2, drop
  the local `learnedWords` list and set the version. When logged in, the next
  sync brings the account's migrated list back from the server.
- Logged-out users lose their local learned-word list once. That matches the
  rule that logged-out progress isn't kept.
- The backend also rejects `learnedWords` items that aren't numeric ids
  (400), so a stale client can't write old keys.

### 5. Export script (`npm run db:export`)

- Writes `packages/shared/data/vocabulary.json`, `categories.json` and
  `sentence_puzzles.json` from the database, sorted by id, with stable
  formatting so git diffs show exactly what an editor changed.
- Run it before each native release (offline copy) and whenever you want
  a backup in git.
- Exact duplicates in today's `vocabulary.json` (43) disappear in the first
  export: the database already collapsed them.

### 6. Pictures and types from now on

- `word-types.json` and `word-images.json` are no longer read by anything
  after bootstrap. Types are edited in the database (admin console later).
- The icon build (`packages/shared/scripts/word-icons`) keeps writing the
  SVG files, but each icon's `keys` become word ids, and a small
  `db:apply-images` script sets `words.image` for them. Until the admin
  console can attach pictures, that's how new pictures get in.

### 7. Response compression

- Add `compression` middleware to the Express app. `/v1/vocabulary` is
  86 KB today, about 8 KB compressed. It isn't related to stable ids, but
  it's small and the export makes it visible.

## Order and checks

1. Compression (independent; quick win).
2. API returns `id`; web uses ids (`getWordKey`), with localStorage version
   bump and backend validation. Tests updated.
3. Migration `0006` for `user_progress`; run locally, check the 54 rows
   became ids and the progress page shows the same counts.
4. Bootstrap replaces seed; export script; first export committed.
5. Icons keyed by id + `db:apply-images`.
6. Update CLAUDE.md, `docs/vocabulary-data-issues.md` (its editing caveats
   about insertion order and keys go away), memory.

Deploy order when production exists: backend + migrations first (they
accept only ids), then web.

## Tests

- Backend: `/v1/vocabulary` returns ids; progress POST rejects non-id
  `learnedWords`; migration mapping (pg test against `DATABASE_URL`, with a
  fixture user); bootstrap refuses a non-empty database.
- Web: `getWordKey` uses the id; progress version upgrade drops old word
  keys and keeps the other kinds; existing quiz and stats tests on ids.

## Not in step A

Auth0 roles, admin API and UI, review queue, edit history, splitting
`general`, levels. Lesson ids (`<categoryId>:<index>`) stay as they are
until levels change the path.
