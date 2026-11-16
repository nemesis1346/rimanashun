// Data utilities for the web app
// Unified: fetch from backend API (served by packages/backend)
import axios from "axios";
import { BaseLanguage } from "@/lib/language";
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface KichwaWord {
  // words.id: permanent, so a corrected gloss keeps users' progress.
  id: number;
  kichwa: string;
  spanish: string;
  translation: string;
  categoryId: string;
  // Path of the word's quiz picture (e.g. "/images/words/allku.svg"), or
  // null for words without a clear picture.
  image?: string | null;
  // Word type ("noun", "verb", "adjective", ...; the full list is in
  // apps/backend/db/migrations/0005_word_types.sql), or null if untyped. The quiz picks
  // wrong answers of the same type.
  type?: string | null;
}

export interface SentencePuzzleItem {
  id: string;
  language: string;
  type: string;
  surface: string;
  translation: string;
  pieces: string[];
  correct_order: number[];
  distractors?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  keywords: string[];
}

// Static fallbacks kept empty; use fetchers below at runtime
export const vocabularyData: KichwaWord[] = [];
export const sentencePuzzleData: SentencePuzzleItem[] = [];

export async function fetchVocabulary(lang: BaseLanguage = "es"): Promise<KichwaWord[]> {
  try {
    const res = await axios.get(`${API_BASE}/v1/vocabulary`, {
      params: { lang },
      withCredentials: false,
    });
    return res.data as KichwaWord[];
  } catch {
    return [];
  }
}

export async function fetchPuzzles(lang: BaseLanguage = "en"): Promise<SentencePuzzleItem[]> {
  try {
    const res = await axios.get(`${API_BASE}/v1/puzzles`, {
      params: { lang },
      withCredentials: false,
    });
    return res.data as SentencePuzzleItem[];
  } catch {
    return [];
  }
}

export async function fetchCategories(lang: BaseLanguage = "en"): Promise<Category[]> {
  try {
    const res = await axios.get(`${API_BASE}/v1/categories`, {
      params: { lang },
      withCredentials: false,
    });
    return res.data as Category[];
  } catch {
    return [];
  }
}

// Utility functions

// How progress identifies a word: its id, as a string (progress items are
// strings). Not "kichwa|spanish" any more: that changed whenever a gloss was
// corrected, losing the word for everyone who had learned it.
export const getWordKey = (word: KichwaWord): string => String(word.id);

export const getWordsByCategory = (
  words: KichwaWord[],
  categoryId?: string
): KichwaWord[] => {
  if (!categoryId) return words;
  return words.filter((word) => word.categoryId === categoryId);
};

export const getRandomWords = (
  words: KichwaWord[],
  count: number
): KichwaWord[] => {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export interface QuizQuestion {
  wordKey: string;
  // The prompt: a Kichwa word or a translation, as text.
  question: string;
  correctAnswer: string;
  options: string[];
  type: "kichwa-to-base" | "base-to-kichwa";
  // Picture questions (see generateQuizQuestions): optionImages[i] is the
  // picture shown on the card for options[i].
  optionImages?: string[];
}

export interface QuizOptions {
  // Share of eligible questions that become picture questions (0..1).
  pictureRate?: number;
  // Where wrong answers may come from besides `words` (e.g. the whole
  // vocabulary when `words` is one category); see rankByLikeness for which
  // go first.
  pool?: KichwaWord[];
  random?: () => number;
}

const shuffle = <T,>(items: T[], random: () => number) =>
  items
    .map((item) => ({ item, key: random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);

// A type the quiz can match on: "unclear" is a placeholder for words whose
// gloss is broken, not a real class.
const matchableType = (w: KichwaWord) => (w.type && w.type !== "unclear" ? w.type : null);

// Orders candidate wrong answers for `word`, most alike first, random within
// each tier:
//   1. same type and same category  (perro → gato, pato)
//   2. same type, any category      (perro → olla, mercado)
//   3. same category, other type    (only when a type is too rare)
//   4. anything
// Same type comes before same category so a noun is never offered next to a
// verb or a whole sentence (the mixed "general" category has all kinds).
// Untyped words just go by category.
function rankByLikeness(word: KichwaWord, candidates: KichwaWord[], random: () => number) {
  const type = matchableType(word);
  const tier = (w: KichwaWord) => {
    const sameType = type !== null && matchableType(w) === type;
    const sameCategory = w.categoryId === word.categoryId;
    return sameType ? (sameCategory ? 0 : 1) : sameCategory ? 2 : 3;
  };
  return shuffle(candidates, random).sort((a, b) => tier(a) - tier(b));
}

// Three wrong answers for `word`, most alike first (rankByLikeness), with
// distinct translations and Kichwa words, so no two options read the same
// and none is secretly also right (e.g. ranti and rantina both "comprar").
// With `pictures`, only pictured words, also with distinct pictures, so no
// two cards look the same. Fewer than three when the pool runs out.
function pickDistractors(
  word: KichwaWord,
  pool: KichwaWord[],
  random: () => number,
  pictures = false
) {
  const picked: KichwaWord[] = [];
  const images = new Set([word.image]);
  const labels = new Set([word.translation]);
  const kichwa = new Set([word.kichwa]);
  const candidates = pool.filter((w) => w !== word && (!pictures || w.image));
  for (const w of rankByLikeness(word, candidates, random)) {
    if (picked.length === 3) break;
    if (labels.has(w.translation) || kichwa.has(w.kichwa)) continue;
    if (pictures && images.has(w.image)) continue;
    picked.push(w);
    images.add(w.image);
    labels.add(w.translation);
    kichwa.add(w.kichwa);
  }
  return picked;
}

// Builds a quiz in one fixed direction. A word with a picture may become a
// picture question (`pictureRate` of the time): the four answers are picture
// cards (shown 2x2), each labelled with its answer:
// - base-first: prompt "perro", cards labelled in Kichwa (allku, misi, ...),
//   labels visible, since picking the Kichwa word is the exercise
// - kichwa-first: prompt "allku", cards labelled with translations, hidden
//   until answered (a visible "perro" would give the answer away)
// Picture questions only happen when all four cards can have a picture (3
// picture distractors exist); otherwise the word gets a normal text question.
export const generateQuizQuestions = (
  words: KichwaWord[],
  count: number = 10,
  direction: "kichwa-first" | "base-first" = "kichwa-first",
  // Word keys (getWordKey) already answered correctly. When given, quiz
  // words are drawn from the rest first, and seen ones only fill the gap,
  // so repeated quizzes on the same category keep bringing new words.
  seen?: Set<string>,
  { pictureRate = 0, pool: extraPool = [], random = Math.random }: QuizOptions = {}
): QuizQuestion[] => {
  const selectedWords = seen
    ? [
        ...getRandomWords(words.filter((w) => !seen.has(getWordKey(w))), count),
        ...getRandomWords(words.filter((w) => seen.has(getWordKey(w))), count),
      ].slice(0, count)
    : getRandomWords(words, count);
  const isKichwaToBase = direction === "kichwa-first";
  const type = isKichwaToBase ? ("kichwa-to-base" as const) : ("base-to-kichwa" as const);
  const pool = [...words, ...extraPool.filter((w) => !words.includes(w))];

  return selectedWords.map((word) => {
    const wordKey = getWordKey(word);

    if (word.image && pictureRate > 0 && random() < pictureRate) {
      const distractors = pickDistractors(word, pool, random, true);
      if (distractors.length === 3) {
        const cards = shuffle([word, ...distractors], random);
        return {
          wordKey,
          question: isKichwaToBase ? word.kichwa : word.translation,
          correctAnswer: isKichwaToBase ? word.translation : word.kichwa,
          options: cards.map((w) => (isKichwaToBase ? w.translation : w.kichwa)),
          optionImages: cards.map((w) => w.image!),
          type,
        };
      }
    }

    // Text question. A tiny word list may not have 3 distinct wrong
    // answers; then it shows fewer options rather than a repeated one.
    const distractors = pickDistractors(word, pool, random);
    const cards = shuffle([word, ...distractors], random);
    return {
      wordKey,
      question: isKichwaToBase ? word.kichwa : word.translation,
      correctAnswer: isKichwaToBase ? word.translation : word.kichwa,
      options: cards.map((w) => (isKichwaToBase ? w.translation : w.kichwa)),
      type,
    };
  });
};
