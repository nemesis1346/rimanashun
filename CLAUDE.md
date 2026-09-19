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
  shared/    – Seed-data source of truth + shared TypeScript types + shared UI strings
```

### Data Flow

The backend is the runtime source of truth: it queries Postgres (`apps/backend/src/db.js`) and exposes a REST API. Both apps fetch from the backend at runtime:

- **Web**: `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`) via axios in `apps/web/src/lib/data.ts`
- **Native**: `EXPO_PUBLIC_API_URL` (default `http://localhost:4000`) via axios in `apps/native/src/utils/dataLoader.ts`; every loader (`loadVocabularyData`, `loadCategoriesData`) tries the API first and falls back to a direct `require()` of `packages/shared/data/*.json` if it's unreachable. Category-based filtering (`getWordsByCategory`, `getCategoryStats`) takes the loaded categories as a parameter — screens load categories and vocabulary side by side, then pass both in.

Postgres is populated from `packages/shared/data/*.json` via `apps/backend/db/seed.js` (see Database section below) — those JSON files are the version-controlled *authoring* source, not something the backend reads at request time anymore.

### Backend API (`apps/backend`)

Express app, `pg`-backed. Endpoints:
- `GET /health`
- `GET /v1/vocabulary?lang=es|en` — all words (each row is one *sense* of a Kichwa word — the same spelling can legitimately appear more than once with a different meaning/category, e.g. `chaki` → "pie" in body, "patas" in animals). Response includes both `spanish` (always literal Spanish — native depends on this and never passes `lang`) and `translation` (whichever language was requested; falls back to Spanish for the 2 words with no English gloss). Default `lang=es` if omitted, matching the pre-selector behavior exactly.
- `GET /v1/vocabulary/by-category?category=<id>&lang=es|en` — filtered by category
- `GET /v1/puzzles?lang=es|en` — `translation` field follows `lang`. Default `lang=en` if omitted (native doesn't call this endpoint at all — it imports `sentencePuzzles` directly from `@rimanashun/shared` instead, so it's unaffected either way).
- `GET /v1/categories?lang=es|en` — `name`/`description` follow `lang`. Default `lang=en` if omitted, matching the pre-selector behavior.

An unrecognized `lang` value falls back to that endpoint's default rather than erroring (validated in `server.js`'s `parseLang`) — `getCategories`/`getPuzzles` use an inner join on `language_code` that would otherwise silently drop every row.

### Database (Postgres)

Schema and scripts live in `apps/backend/db/`:
- `migrations/0001_init.sql` — `languages`, `categories`, `category_translations`, `words`, `word_translations`, `sentence_puzzles`, `puzzle_translations`. A word/puzzle's fixed Kichwa content and its per-base-language translations are split into separate tables on purpose — adding a new base language is a data insert, not a schema change.
- `migrate.js` — applies pending migration files, tracked in a `schema_migrations` table. Run with `npm run db:migrate` (from `apps/backend`).
- `seed.js` — truncates and reloads all content tables (idempotent; these are fully derived reference tables, not user data). Run with `npm run db:seed`. Sources, all combined in this one command:
  - `packages/shared/data/*.json` — vocabulary (`es`), categories (`en`), puzzles (`en`) — the original source data
  - `en-translations.json` — backfilled English word glosses (translated from the `es` source; keyed by word insertion order, so it only lines up if the dedup logic in `seed.js` stays unchanged)
  - `es-translations.json` — backfilled Spanish category and puzzle translations (translated from the `en` source)

Coverage as of the last seed: 703/703 words have both `es`/`en`, all 11 categories have both, all 30 puzzles have both. Two words (ids 175, 353) have no source Spanish gloss at all in the original JSON, so no English translation exists for those either — left absent rather than faked.

Local dev needs `DATABASE_URL` in `apps/backend/.env` (git-ignored; see `.env.example`) pointing at a local Postgres database. `npm run start` / `npm run dev` load it automatically via `--env-file-if-exists`. On Heroku, `DATABASE_URL` is a real env var from the Postgres addon — no `.env` file involved.

### Web App (`apps/web`)

Next.js App Router. Routes map to learning features:
- `/flashcards`, `/quiz`, `/sentence-puzzle`, `/categories`, `/progress`

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

### Shared Package (`packages/shared`)

- `src/index.ts` — re-exports `sentencePuzzles` and `uiStrings`. No shared TS types anymore (`src/types.ts` was deleted — nothing imported any of its interfaces from the package; web and native each keep their own local `KichwaWord`/`Category`/etc. instead), and no `vocabularyData`/`categories` exports either (nothing imported those from the package — web fetches over HTTP, native `require()`s the JSON directly).
- `data/vocabulary.json` — **the** source of truth for vocabulary, array of `{ kichwa, spanish, categoryId }` (746 entries; 703 distinct senses after collapsing exact duplicates — see Database section). Seeded into Postgres by `apps/backend/db/seed.js`; no longer read directly by the backend at request time.
- `data/sentence_puzzles.json` — source of truth for puzzles, array of `{ id, language, type, surface, translation_en, pieces, correct_order, distractors? }`
- `data/categories.json` — **the** source of truth for categories (11 entries: 10 original + "General", the catch-all for words a keyword-based categorizer couldn't place — see `packages/shared/scripts/generate_vocabulary_v2.py`). Both the seed source for Postgres and native's offline-fallback bundle (same role as the two files above) — no separate `.ts` copy anymore.
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
| `generateQuizQuestions` | Correct count, 4 options per question, correct answer in options, direction is fixed for the whole batch (not randomized per question — see Web App section), defaults to `kichwa-first`, question/answer sides match the given direction |

### Not yet covered

- **Backend endpoints** — integration tests for `/v1/vocabulary`, `/v1/categories`, `/v1/puzzles`, `/v1/vocabulary/by-category`
- **Native app** — `dataLoader.ts` utilities (`loadVocabularyData`, `getWordsByCategory`, `getCategoryStats`)
- **Web pages** — component rendering tests (React Testing Library)

## Key Conventions

- **TypeScript** across all packages; native still uses `require()` for JSON imports due to Metro bundler constraints
- **`.env` files**: `apps/backend/.env` (git-ignored, see `.env.example`) holds `DATABASE_URL` for local Postgres. Web/native still have none — API URLs are configured via environment variables at runtime.
- The shared package does **not** need to be built during development; both apps consume its TypeScript source directly
- Native data loading has a two-tier fallback: network → bundled JSON (avoids hard failure in offline/dev scenarios)
- **Web pages with multiple conditional-return branches** (`isLoading` / empty-state / main content, e.g. `quiz`, `flashcards`, `sentence-puzzle`, `categories`, `progress`) give each branch's root `<div>` a distinct `key` (e.g. `key="quiz-loading"`). Without one, React reconciles unrelated branches as "the same element" by tree position alone, which previously caused real "removing a style property during rerender" warnings when one branch's inline style used a shorthand CSS property (e.g. `margin`) and another used the longhand (e.g. `marginBottom`) at the same position. Keep this in mind when adding a new branch to these pages.
