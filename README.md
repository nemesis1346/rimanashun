# Kichwa Learning Monorepo

A Turborepo with a React Native (Expo) app and a shared package for data/types. Web app can be added later.

## Workspaces

```
rimanashun/
├── apps/
│   └── native/                # React Native (Expo) app
└── packages/
    └── shared/                # Shared types and datasets
```

## Quick Start

- Install all: `npm install`
- Run all dev (or just use native):
  - `npm run dev` (turborepo)
  - `cd apps/native && npm run start`

## Native App (Expo)

- iOS: press `i` in Expo CLI
- Android: press `a`
- Web (Expo Web): `npm run web` inside `apps/native`

## Shared Package

- Import types and data:

```ts
import { vocabularyData, sentencePuzzles } from "@rimanashun/shared";
```

- Build (usually not needed during dev):

```bash
cd packages/shared && npm run build
```

## Data

- Vocabulary (~3k entries) and sentence puzzles live in the shared package:
  - `packages/shared/src/data/vocabulary.json`
  - `packages/shared/src/data/sentence_puzzles.json`

## Notes

- The native app’s loaders read from `@rimanashun/shared`.
- Add a web app later at `apps/web/` and import from `@rimanashun/shared` to reuse data and types.
