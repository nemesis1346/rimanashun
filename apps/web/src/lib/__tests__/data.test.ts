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
  getWordKey,
  KichwaWord,
} from "../data";

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------
// `translation` deliberately differs from `spanish` on every fixture so
// tests genuinely verify generateQuizQuestions reads `translation` (the
// language-appropriate field), not the always-Spanish `spanish` field.
const words: KichwaWord[] = [
  { id: 1, kichwa: "allku", spanish: "perro", translation: "dog", categoryId: "animals" },
  { id: 2, kichwa: "misi", spanish: "gato", translation: "cat", categoryId: "animals" },
  { id: 3, kichwa: "tanta", spanish: "pan", translation: "bread", categoryId: "food" },
  { id: 4, kichwa: "aycha", spanish: "carne", translation: "meat", categoryId: "food" },
  { id: 5, kichwa: "uma", spanish: "cabeza", translation: "head", categoryId: "body" },
  { id: 6, kichwa: "ñawi", spanish: "ojo", translation: "eye", categoryId: "body" },
  { id: 7, kichwa: "mama", spanish: "madre", translation: "mother", categoryId: "family" },
  { id: 8, kichwa: "tayta", spanish: "padre", translation: "father", categoryId: "family" },
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

  it("prefers words not yet seen, filling with seen ones only when needed", () => {
    const seen = new Set(words.slice(0, words.length - 2).map(getWordKey));
    const unseen = words.slice(-2).map(getWordKey);

    const two = generateQuizQuestions(words, 2, "kichwa-first", seen);
    expect(two.map((q) => q.wordKey).sort()).toEqual([...unseen].sort());

    const four = generateQuizQuestions(words, 4, "kichwa-first", seen);
    expect(new Set(four.map((q) => q.wordKey)).size).toBe(4);
    unseen.forEach((k) => expect(four.map((q) => q.wordKey)).toContain(k));
  });
});

// ---------------------------------------------------------------------------
// generateQuizQuestions — picture questions
// ---------------------------------------------------------------------------
describe("generateQuizQuestions with pictures", () => {
  let nextId = 100;
  const pic = (kichwa: string, translation: string, categoryId: string): KichwaWord => ({
    id: nextId++,
    kichwa,
    spanish: `${translation}-es`,
    translation,
    categoryId,
    image: `/images/words/${kichwa}.svg`,
  });
  const animals = [
    pic("allku", "dog", "animals"),
    pic("misi", "cat", "animals"),
    pic("atallpa", "hen", "animals"),
    pic("wakra", "bull", "animals"),
    pic("kuchi", "pig", "animals"),
  ];
  const others = [pic("tanta", "bread", "food"), pic("lulun", "egg", "food"), pic("yaku", "water", "general")];
  const always = { pictureRate: 1 };

  it("asks with picture cards in kichwa-first direction", () => {
    const [q] = generateQuizQuestions([animals[0]], 1, "kichwa-first", undefined, {
      ...always,
      pool: animals,
    });
    expect(q.question).toBe("allku");
    expect(q.correctAnswer).toBe("dog");
    expect(q.optionImages).toHaveLength(4);
    expect(q.options).toHaveLength(4);
    // every card's label matches its picture
    q.options.forEach((label, i) => {
      const word = animals.find((w) => w.translation === label)!;
      expect(q.optionImages![i]).toBe(word.image);
    });
    expect(q.options).toContain("dog");
  });

  it("prefers picture distractors from the same category", () => {
    for (let i = 0; i < 20; i++) {
      const [q] = generateQuizQuestions([animals[0]], 1, "kichwa-first", undefined, {
        ...always,
        pool: [...others, ...animals],
      });
      expect(q.options.every((o) => animals.some((a) => a.translation === o))).toBe(true);
    }
  });

  it("falls back to other categories, then to a text question", () => {
    const [mixed] = generateQuizQuestions([others[0]], 1, "kichwa-first", undefined, {
      ...always,
      pool: [...others, animals[0], animals[1]],
    });
    expect(mixed.optionImages).toHaveLength(4);

    const [text] = generateQuizQuestions([others[0]], 1, "kichwa-first", undefined, {
      ...always,
      pool: [others[1]],
    });
    expect(text.optionImages).toBeUndefined();
    expect(text.question).toBe("tanta");
  });

  it("never shows two cards with the same picture or label", () => {
    const dupes = [...animals, { ...animals[1], kichwa: "misi2" }, { ...animals[2], image: "/x.svg", kichwa: "x" }];
    for (let i = 0; i < 20; i++) {
      const [q] = generateQuizQuestions([animals[0]], 1, "kichwa-first", undefined, { ...always, pool: dupes });
      expect(new Set(q.options).size).toBe(4);
      expect(new Set(q.optionImages).size).toBe(4);
    }
  });

  it("asks the translation with Kichwa-labelled picture cards in base-first direction", () => {
    const [q] = generateQuizQuestions([animals[0]], 1, "base-first", undefined, {
      ...always,
      pool: animals,
    });
    expect(q.question).toBe("dog");
    expect(q.correctAnswer).toBe("allku");
    expect(q.optionImages).toHaveLength(4);
    expect(q.options).toContain("allku");
    // every card is a Kichwa word, matching its picture
    q.options.forEach((label, i) => {
      const word = animals.find((w) => w.kichwa === label)!;
      expect(q.optionImages![i]).toBe(word.image);
    });
  });

  it("never repeats a Kichwa word across cards", () => {
    const sameKichwa = [...animals, { ...animals[1], translation: "kitty", image: "/k.svg" }];
    for (let i = 0; i < 20; i++) {
      const [q] = generateQuizQuestions([animals[0]], 1, "base-first", undefined, { ...always, pool: sameKichwa });
      expect(new Set(q.options).size).toBe(4);
    }
  });

  it("asks no picture questions by default or for words without a picture", () => {
    const plain = generateQuizQuestions(animals, 5, "kichwa-first");
    expect(plain.every((q) => !q.optionImages)).toBe(true);

    const noPics = generateQuizQuestions(words, 4, "kichwa-first", undefined, always);
    expect(noPics.every((q) => !q.optionImages)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// generateQuizQuestions — wrong answers of the same word type
// ---------------------------------------------------------------------------
describe("generateQuizQuestions distractors by word type", () => {
  let nextId = 200;
  const w = (kichwa: string, translation: string, categoryId: string, type: string | null): KichwaWord => ({
    id: nextId++,
    kichwa,
    spanish: `${translation}-es`,
    translation,
    categoryId,
    type,
  });
  const general = [
    w("antawa", "car", "general", "noun"),
    w("manka", "pot", "general", "noun"),
    w("mesa", "table", "general", "noun"),
    w("puku", "plate", "general", "noun"),
    w("kaypi", "here", "general", "adverb"),
    w("ari", "yes", "general", "interjection"),
    w("mana yachanichu", "I don't understand", "general", "phrase"),
    w("katuna", "to sell", "general", "verb"),
  ];
  const typeOf = (pool: KichwaWord[], label: string) => pool.find((x) => x.translation === label)!.type;

  it("offers only wrong answers of the word's type when there are enough", () => {
    for (let i = 0; i < 20; i++) {
      const [q] = generateQuizQuestions([general[0]], 1, "kichwa-first", undefined, { pool: general });
      expect(q.options.map((o) => typeOf(general, o))).toEqual(["noun", "noun", "noun", "noun"]);
    }
  });

  it("prefers the same type from another category over another type from the same category", () => {
    const pool = [...general.slice(0, 2), w("allku", "dog", "animals", "noun"), w("misi", "cat", "animals", "noun")];
    const withMixed = [...pool, ...general.slice(4)];
    for (let i = 0; i < 20; i++) {
      const [q] = generateQuizQuestions([general[0]], 1, "kichwa-first", undefined, { pool: withMixed });
      expect(q.options.every((o) => typeOf(withMixed, o) === "noun")).toBe(true);
    }
  });

  it("fills with other types when the word's type is too rare", () => {
    const [q] = generateQuizQuestions([general[5]], 1, "kichwa-first", undefined, { pool: general });
    expect(q.options).toHaveLength(4);
    expect(q.options).toContain("yes");
  });

  it("never offers a second option that is also right", () => {
    const synonyms = [
      w("ranti", "to buy", "actions", "verb"),
      w("rantina", "to buy", "actions", "verb"),
      w("katuna", "to sell", "actions", "verb"),
      w("mikuna", "to eat", "actions", "verb"),
      w("upyana", "to drink", "actions", "verb"),
    ];
    for (let i = 0; i < 20; i++) {
      const [q] = generateQuizQuestions([synonyms[0]], 1, "base-first", undefined, { pool: synonyms });
      expect(q.options).not.toContain("rantina");
      expect(q.options).toHaveLength(4);
    }
  });

  it("treats untyped and 'unclear' words as matching nothing in particular", () => {
    const untyped = { ...general[0], type: null };
    const [q] = generateQuizQuestions([untyped], 1, "kichwa-first", undefined, { pool: general.slice(1) });
    expect(q.options).toHaveLength(4);
    const unclear = { ...general[0], type: "unclear" };
    const [q2] = generateQuizQuestions([unclear], 1, "kichwa-first", undefined, { pool: general.slice(1) });
    expect(q2.options).toHaveLength(4);
  });
});
