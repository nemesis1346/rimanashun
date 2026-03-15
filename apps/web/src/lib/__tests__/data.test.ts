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
const words: KichwaWord[] = [
  { kichwa: "allku", spanish: "perro", categoryId: "animals" },
  { kichwa: "misi", spanish: "gato", categoryId: "animals" },
  { kichwa: "tanta", spanish: "pan", categoryId: "food" },
  { kichwa: "aycha", spanish: "carne", categoryId: "food" },
  { kichwa: "uma", spanish: "cabeza", categoryId: "body" },
  { kichwa: "ñawi", spanish: "ojo", categoryId: "body" },
  { kichwa: "mama", spanish: "madre", categoryId: "family" },
  { kichwa: "tayta", spanish: "padre", categoryId: "family" },
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

  it("type is either kichwa-to-spanish or spanish-to-kichwa", () => {
    const result = generateQuizQuestions(words, 4);
    const validTypes = ["kichwa-to-spanish", "spanish-to-kichwa"];
    result.forEach((q) => expect(validTypes).toContain(q.type));
  });

  it("question text matches the direction indicated by type", () => {
    const result = generateQuizQuestions(words, 8);
    result.forEach((q) => {
      const sourceValues =
        q.type === "kichwa-to-spanish"
          ? words.map((w) => w.kichwa)
          : words.map((w) => w.spanish);
      expect(sourceValues).toContain(q.question);
    });
  });
});
