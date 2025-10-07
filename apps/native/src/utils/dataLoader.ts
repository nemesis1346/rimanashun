import { KichwaWord } from "../types";
import { categories } from "@rimanashun/shared";

// Temporary direct imports from monorepo shared data
// Metro is configured to watch the monorepo root so these JSON files are loadable
// If you prefer package imports, switch back to @rimanashun/shared after setting up Metro/Yarn resolutions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const vocabularyData = require("../../../../packages/shared/data/vocabulary.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sentencePuzzles = require("../../../../packages/shared/data/sentence_puzzles.json");

// Load the vocabulary data
export const loadVocabularyData = async (): Promise<KichwaWord[]> => {
  try {
    return vocabularyData as KichwaWord[];
  } catch (error) {
    console.error("Error loading vocabulary data:", error);
    return [];
  }
};

// Check if a word matches any keyword in a category
const wordMatchesCategory = (word: KichwaWord, category: any): boolean => {
  return category.keywords.some((keyword: string) => {
    // Safety check: ensure word properties exist and are strings
    const kichwaText = word.kichwa?.toLowerCase() || "";
    const spanishText = word.spanish?.toLowerCase() || "";

    const kichwaMatch = kichwaText.includes(keyword.toLowerCase());
    const spanishMatch = spanishText.includes(keyword.toLowerCase());
    // console.log("Current match", kichwaMatch, spanishMatch);
    return kichwaMatch || spanishMatch;
  });
};

// Filter words by category
export const getWordsByCategory = (
  words: KichwaWord[],
  categoryId: string
): KichwaWord[] => {
  // Return all words if no category specified
  if (!categoryId) return words;

  const category = categories.find((cat) => cat.id === categoryId);
  if (!category) return words;

  // Filter words that match the category
  const result = words.filter((word) => wordMatchesCategory(word, category));

  // console.log("filtered result", result);
  return result;
};

// Get random words for quiz
export const getRandomWords = (
  words: KichwaWord[],
  count: number
): KichwaWord[] => {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate quiz questions
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

// Get category statistics
export const getCategoryStats = (words: KichwaWord[]) => {
  return categories.map((category) => {
    const categoryWords = getWordsByCategory(words, category.id);
    return {
      ...category,
      wordCount: categoryWords.length,
    };
  });
};
