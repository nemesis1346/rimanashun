// Data utilities for the web app
// Unified: fetch from backend API (served by packages/backend)
import axios from "axios";
import { BaseLanguage } from "@/lib/language";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface KichwaWord {
  kichwa: string;
  spanish: string;
  translation: string;
  categoryId: string;
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

export const generateQuizQuestions = (
  words: KichwaWord[],
  count: number = 10,
  direction: "kichwa-first" | "base-first" = "kichwa-first"
) => {
  const selectedWords = getRandomWords(words, count);
  const isKichwaToBase = direction === "kichwa-first";

  return selectedWords.map((word) => {
    const question = isKichwaToBase ? word.kichwa : word.translation;
    const correctAnswer = isKichwaToBase ? word.translation : word.kichwa;

    // Get 3 random wrong answers
    const otherWords = words.filter((w) => w !== word);
    const wrongAnswers = getRandomWords(otherWords, 3).map((w) =>
      isKichwaToBase ? w.translation : w.kichwa
    );

    const options = [correctAnswer, ...wrongAnswers];
    // Shuffle options
    const shuffledOptions = options.sort(() => 0.5 - Math.random());

    return {
      question,
      correctAnswer,
      options: shuffledOptions,
      type: isKichwaToBase
        ? ("kichwa-to-base" as const)
        : ("base-to-kichwa" as const),
    };
  });
};
