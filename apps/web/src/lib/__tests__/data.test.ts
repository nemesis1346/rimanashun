/**
 * Unit tests for apps/web/src/lib/data.ts utility functions.
 *
 * What we are testing:
 * - getWordsByCategory   — filters a word list by categoryId
 * - getRandomWords       — returns a random subset of the requested size
 * - generateQuizQuestions — builds quiz questions with correct structure
 *
 * These are pure functions (no network, no DOM) so no mocking is needed.
 * fetchVocabulary / fetchPuzzles are NOT tested here — they depend on the
 * backend being up and belong in integration tests.
 */

import { describe, it, expect } from "vitest";
import {
  getWordsByCategory,
  getRandomWords,
  generateQuizQuestions,
  KichwaWord,
} from "../data";

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------
// `translation` deliberately differs from `spanish` on every fixture so
// tests genuinely verify generateQuizQuestions reads `translation` (the
// language-appropriate field), not the always-Spanish `spanish` field.
const words: KichwaWord[] = [
  { kichwa: "allku", spanish: "perro", translation: "dog", categoryId: "animals" },
  { kichwa: "misi", spanish: "gato", translation: "cat", categoryId: "animals" },
  { kichwa: "tanta", spanish: "pan", translation: "bread", categoryId: "food" },
  { kichwa: "aycha", spanish: "carne", translation: "meat", categoryId: "food" },
  { kichwa: "uma", spanish: "cabeza", translation: "head", categoryId: "body" },
  { kichwa: "ñawi", spanish: "ojo", translation: "eye", categoryId: "body" },
  { kichwa: "mama", spanish: "madre", translation: "mother", categoryId: "family" },
  { kichwa: "tayta", spanish: "padre", translation: "father", categoryId: "family" },
];

// ---------------------------------------------------------------------------
// getWordsByCategory
// ---------------------------------------------------------------------------
describe("getWordsByCategory", () => {
  it("returns only words matching the given categoryId", () => {
    const result = getWordsByCategory(words, "animals");
    expect(result).toHaveLength(2);
    expect(result.every((w) => w.categoryId === "animals")).toBe(true);
  });

  it("returns all words when no categoryId is provided", () => {
    const result = getWordsByCategory(words);
    expect(result).toHaveLength(words.length);
  });

  it("returns empty array when no words match the categoryId", () => {
    const result = getWordsByCategory(words, "numbers");
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getRandomWords
// ---------------------------------------------------------------------------
describe("getRandomWords", () => {
  it("returns exactly the requested number of words", () => {
    const result = getRandomWords(words, 3);
    expect(result).toHaveLength(3);
  });

  it("returns all words when count equals the list length", () => {
    const result = getRandomWords(words, words.length);
    expect(result).toHaveLength(words.length);
  });

  it("does not return duplicate words", () => {
    const result = getRandomWords(words, 5);
    const unique = new Set(result.map((w) => w.kichwa));
    expect(unique.size).toBe(result.length);
  });

  it("returns an empty array when count is 0", () => {
    const result = getRandomWords(words, 0);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// generateQuizQuestions
// ---------------------------------------------------------------------------
describe("generateQuizQuestions", () => {
  it("returns the requested number of questions", () => {
    const result = generateQuizQuestions(words, 4);
    expect(result).toHaveLength(4);
  });

  it("each question has exactly 4 options", () => {
    const result = generateQuizQuestions(words, 4);
    result.forEach((q) => expect(q.options).toHaveLength(4));
  });

  it("correct answer is always included in the options", () => {
    const result = generateQuizQuestions(words, 4);
    result.forEach((q) =>
      expect(q.options).toContain(q.correctAnswer)
    );
  });

  it("direction is fixed for the whole batch, not randomized per question", () => {
    const kichwaFirst = generateQuizQuestions(words, 8, "kichwa-first");
    expect(kichwaFirst.every((q) => q.type === "kichwa-to-base")).toBe(true);

    const baseFirst = generateQuizQuestions(words, 8, "base-first");
    expect(baseFirst.every((q) => q.type === "base-to-kichwa")).toBe(true);
  });

  it("defaults to kichwa-first when no direction is given", () => {
    const result = generateQuizQuestions(words, 4);
    expect(result.every((q) => q.type === "kichwa-to-base")).toBe(true);
  });

  it("kichwa-first: question is the kichwa word, answer is the translation", () => {
    const result = generateQuizQuestions(words, 8, "kichwa-first");
    result.forEach((q) => {
      expect(words.map((w) => w.kichwa)).toContain(q.question);
      expect(words.map((w) => w.translation)).toContain(q.correctAnswer);
    });
  });

  it("base-first: question is the translation, answer is the kichwa word", () => {
    const result = generateQuizQuestions(words, 8, "base-first");
    result.forEach((q) => {
      expect(words.map((w) => w.translation)).toContain(q.question);
      expect(words.map((w) => w.kichwa)).toContain(q.correctAnswer);
    });
  });
});
