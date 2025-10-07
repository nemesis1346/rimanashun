# Kichwa Learning Monorepo

A Turborepo with a React Native (Expo) app, a Next.js web app, and a shared package for data/types. Learn Kichwa (Otavalo) from Ecuador with interactive flashcards, quizzes, and sentence puzzles.

## Workspaces

```
rimanashun/
├── apps/
│   ├── native/                # React Native (Expo) app
│   └── web/                   # Next.js web app
└── packages/
    └── shared/                # Shared types and datasets
```

## Requirements

- **Node.js**: 20 LTS (>= 20.9.0). Use the latest 20.x for best compatibility.
- **npm**: >= 10

Recommended with nvm:

```bash
nvm install 20
nvm use 20
```

## Quick Start

- Install all: `npm install`
- Run all dev: `npm run dev` (turborepo)
- Run specific apps:
  - Native: `npm run native`
  - Web: `npm run web`

## Native App (Expo)

- **Development**: `npm run native` or `cd apps/native && npm run start`
- **Platforms**:
  - iOS: press `i` in Expo CLI
  - Android: press `a` in Expo CLI
  - Web (Expo Web): `npm run web` inside `apps/native`
- **Features**: Full native experience with drag-and-drop animations

## Web App (Next.js)

- **Development**: `npm run web` (runs on http://localhost:3000)
- **Production**: `cd apps/web && npm run build && npm run start`
- **Responsive Design**:
  - Mobile-first approach with breakpoint at 768px
  - Hamburger menu for mobile devices
  - Sliding sidebar with overlay
  - Touch-friendly interface
  - Optimized for all screen sizes

## Shared Package

- **Location**: `packages/shared/`
- **Import types and data**:

```ts
import { vocabularyData, sentencePuzzles } from "@rimanashun/shared";
```

- **Build** (usually not needed during dev):

```bash
cd packages/shared && npm run build
```

## Data Structure

### Vocabulary Data

- **File**: `packages/shared/src/data/vocabulary.json`
- **Format**: Array of Kichwa words with Spanish translations
- **Fields**: `kichwa`, `spanish`, `category`, `difficulty`

### Sentence Puzzles

- **File**: `packages/shared/src/data/sentence_puzzles.json`
- **Format**: Array of sentence building exercises
- **Fields**: `sentence`, `pieces`, `correct_order`, `distractors`

## Learning Features

Both apps include:

### 📚 **Flashcards**

- Study Kichwa vocabulary with spaced repetition
- Flip cards to reveal translations
- Progress tracking and navigation

### ❓ **Quiz**

- Multiple choice questions to test knowledge
- Score tracking and feedback
- Correct answer display on errors

### 🧩 **Sentence Puzzle**

- **Native**: Drag-and-drop sentence building with animations
- **Web**: Click-to-place sentence construction
- Distractor words to increase difficulty

### 📖 **Categories**

- Browse vocabulary by topic (animals, family, colors, etc.)
- Category-based learning paths
- Word count per category

### 📊 **Progress**

- Learning statistics and achievements
- Study streak tracking
- Category breakdown and recent activity

## Technical Details

### Monorepo Setup

- **Turborepo**: For efficient builds and development
- **Workspaces**: Shared dependencies and scripts
- **TypeScript**: Full type safety across all packages

### Responsive Design (Web)

- **CSS-in-JS**: Styled components with responsive breakpoints
- **Mobile Menu**: Hamburger navigation with smooth animations
- **Touch Support**: Optimized for mobile browsers
- **Cross-Platform**: Works on desktop, tablet, and mobile

### Data Sharing

- **Shared Types**: Common interfaces across apps
- **JSON Data**: Centralized vocabulary and puzzle data
- **Import Strategy**: Direct JSON imports for native, package imports for web

## Development Notes

- **Native App**: Uses direct JSON imports due to Metro bundler limitations
- **Web App**: Uses package imports from `@rimanashun/shared`
- **Responsive**: Mobile-first design with progressive enhancement
- **Performance**: Optimized for both native and web environments

## Language Information

**Kichwa (Otavalo)** is an indigenous language from Ecuador, part of the Quechuan language family. The app focuses on:

- Basic vocabulary and common phrases
- Sentence structure (Subject-Object-Verb)
- Cultural context and proper usage
