// Data utilities for the web app
// Unified: re-export data from the shared package
import { vocabularyData as sharedVocabularyData, sentencePuzzles as sharedSentencePuzzles } from "@rimanashun/shared";

export interface KichwaWord {
  kichwa: string;
  spanish: string;
  category?: string;
}

export interface SentencePuzzleItem {
  id: string;
  language: string;
  type: string;
  surface: string;
  translation_en: string;
  pieces: string[];
  correct_order: number[];
  distractors?: string[];
}

export const vocabularyData: KichwaWord[] = sharedVocabularyData as unknown as KichwaWord[];

export const sentencePuzzleData: SentencePuzzleItem[] = sharedSentencePuzzles as unknown as SentencePuzzleItem[];

// Utility functions
export const getWordsByCategory = (
  words: KichwaWord[],
  categoryId?: string
): KichwaWord[] => {
  if (!categoryId) return words;
  return words.filter((word) => (word.category || "general") === categoryId);
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
  count: number = 10
) => {
  const selectedWords = getRandomWords(words, count);

  return selectedWords.map((word) => {
    const isKichwaToSpanish = Math.random() > 0.5;
    const question = isKichwaToSpanish ? word.kichwa : word.spanish;
    const correctAnswer = isKichwaToSpanish ? word.spanish : word.kichwa;

    // Get 3 random wrong answers
    const otherWords = words.filter((w) => w !== word);
    const wrongAnswers = getRandomWords(otherWords, 3).map((w) =>
      isKichwaToSpanish ? w.spanish : w.kichwa
    );

    const options = [correctAnswer, ...wrongAnswers];
    // Shuffle options
    const shuffledOptions = options.sort(() => 0.5 - Math.random());

    return {
      question,
      correctAnswer,
      options: shuffledOptions,
      type: isKichwaToSpanish
        ? ("kichwa-to-spanish" as const)
        : ("spanish-to-kichwa" as const),
    };
  });
};

