# Sentence Puzzle Feature - Implementation Guide

## Overview

Add Duolingo-style sentence puzzle functionality to the Kichwa learning app.

## New Data Structure

### Current Structure (Words)

```json
{
  "kichwa": "mama",
  "spanish": "madre"
}
```

### New Structure (Sentences)

```json
{
  "sentences": [
    {
      "id": "sentence_001",
      "kichwa": "Alli puncha",
      "spanish": "Buenos días",
      "english": "Good day",
      "difficulty": "beginner",
      "category": "greetings",
      "words": [
        { "kichwa": "alli", "spanish": "bueno", "position": 1 },
        { "kichwa": "puncha", "spanish": "día", "position": 2 }
      ],
      "grammar_notes": "Basic greeting structure"
    }
  ]
}
```

## 10 Example Sentences to Start With

### 1. Basic Greetings (High Confidence)

```json
{
  "id": "greeting_001",
  "kichwa": "Alli puncha",
  "spanish": "Buenos días",
  "category": "greetings",
  "difficulty": "beginner"
}
```

### 2. Family + Greeting

```json
{
  "id": "greeting_002",
  "kichwa": "Mama alli puncha",
  "spanish": "Madre buenos días",
  "category": "family_greetings",
  "difficulty": "beginner"
}
```

### 3. Simple Subject + Verb

```json
{
  "id": "action_001",
  "kichwa": "Mama rina",
  "spanish": "Madre va",
  "category": "actions",
  "difficulty": "beginner"
}
```

### 4. Adjective + Noun

```json
{
  "id": "description_001",
  "kichwa": "Hatun mama",
  "spanish": "Madre grande",
  "category": "descriptions",
  "difficulty": "beginner"
}
```

### 5. Question Pattern

```json
{
  "id": "question_001",
  "kichwa": "Imamantak?",
  "spanish": "¿Para qué?",
  "category": "questions",
  "difficulty": "beginner"
}
```

## Implementation Plan

### Phase 1: Basic Structure

1. Create `sentences.json` with 10 verified sentences
2. Add sentence types to `src/types/index.ts`
3. Create `src/utils/sentenceLoader.ts`
4. Add `SentencePuzzleScreen.tsx`

### Phase 2: Puzzle Types

1. **Word Scramble**: Drag words to correct order
2. **Fill-in-the-blank**: Select missing word
3. **Translation**: Match Kichwa ↔ Spanish

### Phase 3: Features

1. Progress tracking for sentences
2. Difficulty progression
3. Category-based practice

## File Structure

```
src/
├── screens/
│   └── SentencePuzzleScreen.tsx
├── utils/
│   └── sentenceLoader.ts
├── types/
│   └── index.ts (add sentence types)
└── data/
    └── sentences.json
```

## Next Steps

1. Create the 10 example sentences in `sentences.json`
2. Update TypeScript types
3. Implement basic sentence loading
4. Create simple puzzle interface
5. Test with existing vocabulary

## Notes

- Start with high-confidence, simple sentences
- Focus on patterns already in existing data
- Keep grammar simple (subject + verb, adjective + noun)
- Use existing vocabulary from `data.json`
