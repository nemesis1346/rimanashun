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
  backend/   – Plain Node.js HTTP server (ESM, no framework)
  web/       – Next.js 15 (App Router, Turbopack) + React 19
  native/    – Expo / React Native (React Navigation)
packages/
  shared/    – Source of truth: all data + shared TypeScript types
```

### Data Flow

All Kichwa content lives in `packages/shared/data/` (JSON files). The backend reads from `@rimanashun/shared` and exposes a REST API. Both apps fetch from the backend at runtime:

- **Web**: `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`) via axios in `apps/web/src/lib/data.ts`
- **Native**: `EXPO_PUBLIC_API_URL` (default `http://localhost:4000`) via axios in `apps/native/src/utils/dataLoader.ts`; falls back to direct `require()` of the JSON files if the API is unreachable

### Backend API (`apps/backend`)

Minimal Node.js `http` server (no Express). Endpoints:
- `GET /health`
- `GET /v1/vocabulary` — all words; filter with `?category=<name>`
- `GET /v1/puzzles`
- `GET /v1/categories`

### Web App (`apps/web`)

Next.js App Router. Routes map to learning features:
- `/flashcards`, `/quiz`, `/sentence-puzzle`, `/categories`, `/progress`

Data fetching happens at the page/component level using `fetchVocabulary()` / `fetchPuzzles()` from `apps/web/src/lib/data.ts`.

### Native App (`apps/native`)

React Navigation with two layers:
- **Bottom Tab Navigator**: Home, Categories, Progress
- **Native Stack Navigator** (on top): Flashcard, Quiz, SentencePuzzle screens

Navigation types are defined in `App.tsx` (`RootStackParamList`, `TabParamList`). Custom Andean-themed SVG icons live in `src/components/icons/AndeanIcons`.

### Shared Package (`packages/shared`)

- `src/index.ts` — re-exports `vocabularyData`, `sentencePuzzles`, `categories`
- `data/vocabulary.json` — array of `{ kichwa, spanish, category, difficulty }`
- `data/sentence_puzzles.json` — array of `{ id, language, type, surface, translation_en, pieces, correct_order, distractors? }`
- `src/data/categories.ts` — category definitions with `keywords` used for client-side filtering in native

The backend imports from the shared package using a direct relative path (`../../../packages/shared/index.js`) since it's an ESM module that doesn't run through a bundler.

## Task Tracking

Pending tasks and session notes are tracked in `TODO.md` at the repo root. Check it at the start of each session.

## Testing

### Current coverage (`apps/web/src/lib/__tests__/data.test.ts`)

Vitest is set up in `apps/web`. 12 unit tests covering the three pure utility functions in `apps/web/src/lib/data.ts`:

| Function | What is tested |
|---|---|
| `getWordsByCategory` | Filters by categoryId, returns all when no category, empty for unknown |
| `getRandomWords` | Returns correct count, no duplicates, handles count=0 |
| `generateQuizQuestions` | Correct count, 4 options per question, correct answer in options, valid type, question matches direction |

### Not yet covered

- **Backend endpoints** — integration tests for `/v1/vocabulary`, `/v1/categories`, `/v1/puzzles`, `/v1/vocabulary/by-category`
- **Native app** — `dataLoader.ts` utilities (`loadVocabularyData`, `getWordsByCategory`, `getCategoryStats`)
- **Web pages** — component rendering tests (React Testing Library)

## Key Conventions

- **TypeScript** across all packages; native still uses `require()` for JSON imports due to Metro bundler constraints
- **No `.env` files** exist in the repo — API URLs are configured via environment variables at runtime
- The shared package does **not** need to be built during development; both apps consume its TypeScript source directly
- Native data loading has a two-tier fallback: network → bundled JSON (avoids hard failure in offline/dev scenarios)
