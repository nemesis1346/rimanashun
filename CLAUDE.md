# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rimanashun** is a Kichwa (Otavalo) language learning app — a Turborepo monorepo with three apps and one shared package. Uses Node.js 20 LTS.

## Commands

```bash
# Install all dependencies
npm install

# Run all apps in parallel (turbo)
npm run dev

# Run individual apps
npm run backend       # REST API on http://localhost:4000
npm run web           # Next.js on http://localhost:3000
npm run native        # Expo (press i=iOS, a=Android in CLI)

# Build
npm run build         # all workspaces via turbo
cd apps/web && npm run build   # web only

# Lint
npm run lint          # all workspaces via turbo
cd apps/web && npm run lint    # web only

# Tests
npm run test          # all workspaces via turbo
cd apps/web && npx vitest run        # web unit tests only
cd apps/web && npx vitest --watch    # watch mode during development
```

## Architecture

### Monorepo Structure

```
apps/
  backend/   – Express (ESM), backed by Postgres
  web/       – Next.js 15 (App Router, Turbopack) + React 19
  native/    – Expo / React Native (React Navigation)
packages/
  shared/    – Database export (JSON data) + shared UI strings
```

### Data Flow

The backend is the runtime source of truth: it queries Postgres (`apps/backend/src/db.js`) and exposes a REST API. Both apps fetch from the backend at runtime:

- **Web**: `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`) via axios in `apps/web/src/lib/data.ts`
- **Native**: `EXPO_PUBLIC_API_URL` (default `http://localhost:4000`) via axios in `apps/native/src/utils/dataLoader.ts`; every loader (`loadVocabularyData`, `loadCategoriesData`) tries the API first and falls back to a direct `require()` of `packages/shared/data/*.json` if it's unreachable. Category-based filtering (`getWordsByCategory`, `getCategoryStats`) takes the loaded categories as a parameter — screens load categories and vocabulary side by side, then pass both in.

**Postgres is the source of truth for content** (since 2026-11-15, the first step towards an admin console where Kichwa speakers edit words and puzzles). `packages/shared/data/*.json` are its *export* (`npm run db:export`): a backup in git, native's offline copy, and what `db:bootstrap` loads into an empty database. Don't hand-edit them to change content — change the database (a migration for now) and re-export.

### Backend API (`apps/backend`)

Express app, `pg`-backed. Endpoints:
- `GET /health`
- `GET /v1/me` — protected (Auth0 bearer token, verified in `src/auth.js`); returns `{ sub }` from the token. Returns 503 if `AUTH0_DOMAIN`/`AUTH0_AUDIENCE` aren't set (same for the progress routes).
- `GET /v1/progress` / `POST /v1/progress` — protected, per-user progress `{ learnedWords, learnedPuzzles, completedLessons, activeDays }` (id lists; `activeDays` are local `YYYY-MM-DD` dates), always for the token's `sub` (never a client-supplied id). `POST` only *adds* (union, idempotent) and returns the full progress, so one call both uploads and syncs back; unknown keys / non-string items / >5000 items → 400. Store + validation in `src/progress.js`; `createApp({ requireAuth, progressStore })` takes both as parameters so tests can swap them.
- All other routes are public.
- `GET /v1/vocabulary?lang=es|en` — all words (each row is one *sense* of a Kichwa word — the same spelling can legitimately appear more than once with a different meaning/category, e.g. `chaki` → "pie" in body, "patas" in animals). Response includes both `spanish` (always literal Spanish — native depends on this and never passes `lang`) and `translation` (whichever language was requested; falls back to Spanish for the 2 words with no English gloss). Default `lang=es` if omitted, matching the pre-selector behavior exactly.
- `GET /v1/vocabulary/by-category?category=<id>&lang=es|en` — filtered by category
- `GET /v1/puzzles?lang=es|en` — `translation` field follows `lang`. Default `lang=en` if omitted (native doesn't call this endpoint at all — it imports `sentencePuzzles` directly from `@rimanashun/shared` instead, so it's unaffected either way).
- `GET /v1/categories?lang=es|en` — `name`/`description` follow `lang`. Default `lang=en` if omitted, matching the pre-selector behavior.

An unrecognized `lang` value falls back to that endpoint's default rather than erroring (validated in `server.js`'s `parseLang`) — `getCategories`/`getPuzzles` use an inner join on `language_code` that would otherwise silently drop every row.

### Database (Postgres)

Schema and scripts live in `apps/backend/db/`:
- `migrations/0006_word_ids_in_progress.sql` — rewrote stored `learnedWords` items from `kichwa|spanish` to `words.id`. Learned words are identified by id now (`getWordKey` = `String(word.id)`), so a corrected gloss doesn't lose users' progress; the backend rejects non-id `learnedWords` items with 400, and web's `getLearned` skips old keys still in localStorage.
- `migrations/0005_word_types.sql` — nullable `words.word_type` (CHECK-constrained list: noun, verb, verb_form, adjective, adverb, pronoun, question, number, connector, interjection, phrase, unclear), returned by `/v1/vocabulary` as `type`. Exported as `type` in `vocabulary.json`. Adding a type needs the CHECK widened too. The types were drafted then hand-checked — `docs/word-types-draft.md` is the review copy as of 2026-11-15 (the database is the source).
- `migrations/0004_word_images.sql` — nullable `words.image` (a path like `/images/words/allku.svg`, served by the web app; not a full URL so a CDN later only changes a base URL). Set by `npm run db:apply-images` from `packages/shared/data/word-images.json` (`{ "<word id>": path }`, written by the icon build).
- `migrations/0002_user_progress.sql` — `user_progress (auth0_sub, kind, item_id)`, one row per learned item, PK on all three. User data: `bootstrap.js`/`export.js` never touch it. `0003_active_days.sql` widens its `kind` check to add `activeDays`. Adding a kind needs a migration *and* `PROGRESS_KINDS` in `src/progress.js` *and* `PROGRESS_KEYS` in web's `lib/progress.ts`; deploy the backend first, since it rejects unknown kinds with 400 (which fails the web's whole sync).
- `migrations/0001_init.sql` — `languages`, `categories`, `category_translations`, `words`, `word_translations`, `sentence_puzzles`, `puzzle_translations`. A word/puzzle's fixed Kichwa content and its per-base-language translations are split into separate tables on purpose — adding a new base language is a data insert, not a schema change.
- `migrate.js` — applies pending migration files, tracked in a `schema_migrations` table. Run with `npm run db:migrate` (from `apps/backend`).
- `bootstrap.js` (`npm run db:bootstrap`) — loads `packages/shared/data/*.json` into an **empty** database (new dev machine, first production deploy), inserting word ids as-is so every database numbers words the same; refuses to run once any content exists (reloading would wipe edits). Setup: `db:migrate` then `db:bootstrap`. Replaced the old `seed.js`, which truncated and reloaded everything on each run and renumbered words.
- `export.js` (`npm run db:export`) — writes `vocabulary.json` (`{ id, kichwa, spanish, english, categoryId, type, image }`), `categories.json` (+ `es: { name, description }`) and `sentence_puzzles.json` (+ `translation_es`) from the database, one object per line so edits diff cleanly. Run after content changes and before each native release. Verified round-trip: bootstrap of an export, re-exported, is byte-identical.
- `apply-images.js` (`npm run db:apply-images`) — sets `words.image` for the ids in `word-images.json`.

Coverage: 703/703 words have both `es`/`en`, all 11 categories have both, all 30 puzzles have both. Two words (ids 175, 353) have no Spanish gloss at all, so no English either — left absent rather than faked. New words continue after id 703 (the sequence is advanced by bootstrap).

Local dev needs `DATABASE_URL` in `apps/backend/.env` (git-ignored; see `.env.example`) pointing at a local Postgres database. `npm run start` / `npm run dev` load it automatically via `--env-file-if-exists`. On Heroku, `DATABASE_URL` is a real env var from the Postgres addon — no `.env` file involved.

### Web App (`apps/web`)

Next.js App Router. Routes map to learning features:
- `/flashcards`, `/quiz`, `/sentence-puzzle`, `/categories`, `/progress`

**Home = learning path** (`app/page.tsx` → `components/LearningPath.tsx`, logic in `lib/path.ts`): each category is a unit of `LESSONS_PER_UNIT` (5) nodes, the last one a checkpoint, on a winding SVG path animated with `motion`. Nodes unlock strictly in order. Activities alternate along the whole path (even `globalIndex` = quiz, odd = puzzle, so never two of a kind in a row, even across units); `lessonHref()` builds the link. Quiz nodes open `/quiz?category=<id>&lesson=<unitId:index>` and pick not-yet-learned words first (`generateQuizQuestions`' `seen` param). Puzzle nodes open `/sentence-puzzle?lesson=<id>&slot=<k>` and play `puzzlesForSlot()`: their own run of `PUZZLES_PER_LESSON` (3) puzzles, so consecutive puzzle lessons never repeat a sentence (wraps after 10 slots with the current 30 puzzles). Finishing either with ≥ 60% (`hasPassed`) adds the lesson id to `completedLessons` in localStorage (`lib/progress.ts`) and sets `sessionStorage.justCompletedLesson` so the path plays a celebration on that node. Labels come from `uiStrings[lang].path`.

**Progress** lives in localStorage (`lib/progress.ts`) — always what the UI reads. **Progress only counts toward an account while logged in** (a product decision): logged out, the app works and records progress in localStorage only, and that progress is discarded on login — never uploaded. `components/ProgressSync.tsx` (mounted in `Providers`) runs `lib/progressSync.ts`. `progressOwner` in localStorage records whose progress it holds (account `sub`, or none = logged out); whenever it doesn't match who's logged in, local progress is cleared (login discards logged-out or another account's progress; logout removes the account's). Then, when logged in, it POSTs local progress (only this account's by then; doubles as a retry for failed pushes) and merges the account's back in; each new `markLearned` is also pushed. Pages re-read via `onProgressChanged()` after a sync. `markLearned` also records today (`localDay()`) in `activeDays`, even for an already-learned item. The `/progress` page is computed entirely from stored progress via the pure functions in `lib/stats.ts` (streak, last 7 days, per-category learned/total); nothing on it is mocked.

**Quiz wrong answers** come from `pickDistractors`/`rankByLikeness` in `lib/data.ts`: same word type and category first, then same type from any category, then same category, then anything (untyped or `unclear` words go by category only). Options never repeat a translation or a Kichwa word, so a synonym (ranti/rantina, both "comprar") is never offered as a wrong answer. The quiz page passes the whole vocabulary as `pool` so category lessons can borrow same-type words; this matters most for the mixed `general` category (434 of 746 entries).

**Quiz pictures**: words with an `image` can become picture questions (`generateQuizQuestions` option `pictureRate`; the quiz page uses `PICTURE_RATE = 0.5`). Both directions show 4 picture cards in a 2×2 grid: base-first → prompt is the Spanish/English word, each card shows its picture **and its Kichwa word** (choosing the Kichwa word is the exercise); kichwa-first → prompt is the Kichwa word, card labels (translations) stay hidden until answered so they don't give the answer away. Cards never repeat a picture, translation or Kichwa word; ranked like text distractors. Falls back to a text question when there aren't 3 picture distractors. The pictures are hand-written SVGs, one file per category in `packages/shared/scripts/word-icons/icons/` (combined by `icons.mjs`; palette, helpers and style guide in `palette.mjs`); 107 pictures for 111 words as of 2026-11-14; Icons name their words as readable `kichwa|spanish` keys; `npm run icons --workspace packages/shared` resolves them to ids through the exported `vocabulary.json` (fails on a key matching no word or several), writes the SVGs to `apps/web/public/images/words/` plus the `word-images.json` mapping, then run `npm run db:apply-images` (apps/backend). After editing a gloss in the database, `db:export` first. Add `--sheet out.png` (via `node packages/shared/scripts/word-icons/build.mjs`) for a review contact sheet. Words with doubtful glosses are deliberately left without pictures — see `docs/vocabulary-data-issues.md`.

Data fetching happens at the page/component level using `fetchVocabulary()` / `fetchPuzzles()` / `fetchCategories()` from `apps/web/src/lib/data.ts`, each taking an optional `BaseLanguage` (`"es" | "en"`) argument.

**Quiz mode selector**: 4 explicit modes, not a language toggle with a randomized direction — `Español → Kichwa`, `Kichwa → Español`, `English → Kichwa`, `Kichwa → English`. Each mode is a fixed (language, direction) pair, defined in `QUIZ_MODES` in `apps/web/src/lib/language.tsx` (`LanguageProvider` + `useLanguage()` returning `{ mode, setMode, language, direction }`; localStorage-persisted, default `"es-to-kichwa"`). Wired in at the root via `apps/web/src/components/Providers.tsx` (kept separate from `app/layout.tsx` so that file can stay a Server Component and keep its `metadata` export). The dropdown itself lives in `Layout.tsx`'s header — every page already renders through `Layout`, so it's available everywhere.

- `language` (`"es" | "en"`) drives which translation content pages fetch — same as before.
- `direction` (`"kichwa-first" | "base-first"`) is new: `generateQuizQuestions()` takes it as a third argument and no longer randomizes per question — every question in a quiz session asks in the same fixed direction. Flashcards derive which side is the card's front/back from it too (`frontIsKichwa` in `flashcards/page.tsx`).
- `uiStrings` keys are language-neutral by name (`promptKichwaToBase`, not `promptKichwaToSpanish`) specifically so an `en`-language string can never literally say "Spanish" — that was a real bug caught when this was built (the `en` variant said "What does this mean in Spanish?" until fixed).

Native doesn't have this yet — it's still fixed to Kichwa↔Spanish (see Native App section).

### Native App (`apps/native`)

React Navigation with two layers:
- **Bottom Tab Navigator**: Home, Categories, Progress
- **Native Stack Navigator** (on top): Flashcard, Quiz, SentencePuzzle screens

Navigation types are defined in `App.tsx` (`RootStackParamList`, `TabParamList`). Custom Andean-themed SVG icons live in `src/components/icons/AndeanIcons`.

No base language selector here yet (web has one — see Web App section). Quiz/flashcards are still fixed Kichwa↔Spanish: `KichwaWord` only has `kichwa`/`spanish` (no `translation` field), and `generateQuizQuestions` in `dataLoader.ts` still hardcodes `word.spanish`.

**Dependencies**: `apps/native/package.json` pins `react: 19.0.0`, so `@types/react` must stay on `^19` too — it was previously pinned at `~18.3.12`, which alone caused ~300 spurious `TS2786 'X' cannot be used as a JSX component'` errors across every screen (a React 19/18 type mismatch, not real bugs). Also explicitly depends on `@react-native/virtualized-lists` pinned to the same version as `react-native` — `apps/native/metro.config.js` sets `resolver.disableHierarchicalLookup = true` (the standard Expo-monorepo setting to avoid duplicate-package bugs like two copies of React), which means any transitive dependency that only exists nested inside another package's own `node_modules` (rather than hoisted to the workspace root) becomes unresolvable at bundle time — `@react-native/virtualized-lists` hit exactly that. If a similar "Unable to resolve X" Metro error shows up for some other package, the fix is the same: add it as an explicit dependency here (pinned to whatever version the package that actually needs it requires) so npm hoists a single shared copy, rather than disabling `disableHierarchicalLookup`.

### Shared Package (`packages/shared`)

- `src/index.ts` — re-exports `sentencePuzzles` and `uiStrings`. No shared TS types anymore (`src/types.ts` was deleted — nothing imported any of its interfaces from the package; web and native each keep their own local `KichwaWord`/`Category`/etc. instead), and no `vocabularyData`/`categories` exports either (nothing imported those from the package — web fetches over HTTP, native `require()`s the JSON directly).
- `data/vocabulary.json`, `data/categories.json`, `data/sentence_puzzles.json` — the **export** of the database (see Database section): native's offline fallback, the shared package's `sentencePuzzles`, and the bootstrap source for an empty database. Written by `db:export`; not hand-edited. Categories: 11 (10 original + "General", the catch-all for words a keyword-based categorizer couldn't place — `scripts/generate_vocabulary_v2.py`, which predates the database and rewrites `vocabulary.json`; don't run it any more).
- `data/word-images.json` — icon build output (`{ "<word id>": path }`), applied with `db:apply-images`.
- `src/strings.ts` — `uiStrings`, centralized UI copy keyed by base language (`uiStrings.es`/`uiStrings.en`), so screens don't mix languages into their own instruction text.

Categories are fetched from `/v1/categories` by both apps (web via `fetchCategories()` in `apps/web/src/lib/data.ts`; native via `loadCategoriesData()` in `apps/native/src/utils/dataLoader.ts`, which falls back to the bundled `data/categories.json` when offline, same two-tier pattern as vocabulary/puzzles). There is exactly one categories source now — no duplicate files to keep in sync.

## Task Tracking

Pending tasks and session notes are tracked in `TODO.md` at the repo root. Check it at the start of each session.

## Testing

### Current coverage (`apps/web/src/lib/__tests__/data.test.ts`)

Vitest is set up in `apps/web`. 14 unit tests covering the three pure utility functions in `apps/web/src/lib/data.ts`:

| Function | What is tested |
|---|---|
| `getWordsByCategory` | Filters by categoryId, returns all when no category, empty for unknown |
| `getRandomWords` | Returns correct count, no duplicates, handles count=0 |
| `generateQuizQuestions` | Correct count, 4 options per question, correct answer in options, direction is fixed for the whole batch (not randomized per question — see Web App section), defaults to `kichwa-first`, question/answer sides match the given direction, picture questions, distractors of the same word type (fallback for rare types, no synonyms as wrong answers) |

`apps/web/src/lib/__tests__/path.test.ts` covers `buildPath` (unit/checkpoint shape, in-order unlocking, quiz/puzzle alternation), `nodeOffset`, `hasPassed`, `puzzlesForSlot`. `progressSync.test.ts` covers the login/logout/user-switch ownership rules, merge on sync, per-item push, and offline failures (fake `ProgressApi`). `apps/web/vitest.config.ts` mirrors tsconfig's `@/` alias.

Backend (`cd apps/backend && npm test` — `node --test`, loads `.env`): `auth.test.js` (token verification), `progress.test.js` (progress routes: auth, isolation between users, validation; in-memory store), `progress-pg.test.js` (the real SQL against `DATABASE_URL`; random test user ids, deleted afterwards; skipped without `DATABASE_URL`). The `-pg` tests below each create a **throwaway database** (`__tests__/helpers/testDb.js`: `CREATE DATABASE rimanashun_test_<random>` on the `DATABASE_URL` server, migrated and optionally bootstrapped, dropped `WITH (FORCE)` afterwards), so they never touch dev data: `content-pg.test.js` (every content endpoint in both languages, unknown-`lang` fallback, by-category, word ids, gzip — expected values come from the data files), `db-scripts-pg.test.js` (`migrate`: order, idempotent, `upTo`, rollback of a failing file; `bootstrap`: loads every field incl. ids, sequence continues after the max id, refuses a non-empty database without changes, rolls back bad data; `exportContent`: byte-identical round-trip, an edit is a one-line diff; migration 0006 on prepared old-key progress; `applyImages`). The db scripts export their logic (`migrate(client, { dir, upTo })`, `bootstrap(client, dataDir)`, `exportContent(client, outDir)`, `applyImages(client, mapping)`) and only run their CLI when executed directly. 79 backend tests, ~3 s. `__tests__/helpers/issuer.js` is a local Auth0 stand-in that signs test tokens.

### Not yet covered

- **`ProgressSync.tsx` with a real Auth0 login** — the sync logic is unit-tested, but the browser → `getAccessToken()` → backend path is only checked by hand
- **Native app** — `dataLoader.ts` utilities (`loadVocabularyData`, `getWordsByCategory`, `getCategoryStats`)
- **Web pages** — component rendering tests (React Testing Library)

## Key Conventions

- **TypeScript** across all packages; native still uses `require()` for JSON imports due to Metro bundler constraints
- **`.env` files**: `apps/backend/.env` (git-ignored, see `.env.example`) holds `DATABASE_URL` for local Postgres and `AUTH0_DOMAIN`/`AUTH0_AUDIENCE` for token verification. `apps/web/.env.local` (git-ignored) holds the Auth0 web login values (v4 SDK names: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL`, `AUTH0_AUDIENCE`; see `docs/auth0-migration-plan.md` step 4). Native has none — its API URL is configured via environment variables at runtime.
- The shared package does **not** need to be built during development; both apps consume its TypeScript source directly
- Native data loading has a two-tier fallback: network → bundled JSON (avoids hard failure in offline/dev scenarios)
- **Web pages with multiple conditional-return branches** (`isLoading` / empty-state / main content, e.g. `quiz`, `flashcards`, `sentence-puzzle`, `categories`, `progress`) give each branch's root `<div>` a distinct `key` (e.g. `key="quiz-loading"`). Without one, React reconciles unrelated branches as "the same element" by tree position alone, which previously caused real "removing a style property during rerender" warnings when one branch's inline style used a shorthand CSS property (e.g. `margin`) and another used the longhand (e.g. `marginBottom`) at the same position. Keep this in mind when adding a new branch to these pages.
