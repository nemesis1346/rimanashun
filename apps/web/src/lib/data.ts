// Data utilities for the web app
// Import shared data from the monorepo packages

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
  distractors: string[];
}

// Sample vocabulary data (in a real app, this would be loaded from the shared package)
export const vocabularyData: KichwaWord[] = [
  { kichwa: "ñuka", spanish: "yo", category: "pronouns" },
  { kichwa: "kan", spanish: "tú", category: "pronouns" },
  { kichwa: "pay", spanish: "él/ella", category: "pronouns" },
  { kichwa: "yaku", spanish: "agua", category: "nature" },
  { kichwa: "mikuna", spanish: "comida", category: "food" },
  { kichwa: "wasi", spanish: "casa", category: "home" },
  { kichwa: "shamu", spanish: "venir", category: "verbs" },
  { kichwa: "ri", spanish: "ir", category: "verbs" },
  { kichwa: "upina", spanish: "beber", category: "verbs" },
  { kichwa: "rikuna", spanish: "ver", category: "verbs" },
  { kichwa: "alli", spanish: "bueno", category: "adjectives" },
  { kichwa: "mana", spanish: "no", category: "adverbs" },
  { kichwa: "puncha", spanish: "día", category: "time" },
  { kichwa: "tuta", spanish: "noche", category: "time" },
  { kichwa: "inti", spanish: "sol", category: "nature" },
];

// Sample sentence puzzle data
export const sentencePuzzleData: SentencePuzzleItem[] = [
  {
    id: "sp1",
    language: "Kichwa (Otavalo)",
    type: "SOV-basic",
    surface: "Ñuka yaku upini.",
    translation_en: "I drink water.",
    pieces: ["Ñuka", "yaku", "upini"],
    correct_order: [0, 1, 2],
    distractors: ["-ta", "kay", "kan"],
  },
  {
    id: "sp2",
    language: "Kichwa (Otavalo)",
    type: "SOV-basic",
    surface: "Pay mikuta mikun.",
    translation_en: "He/She eats food.",
    pieces: ["Pay", "mikuta", "mikun"],
    correct_order: [0, 1, 2],
    distractors: ["ñuka", "ri", "shamu"],
  },
  {
    id: "sp3",
    language: "Kichwa (Otavalo)",
    type: "SOV-basic",
    surface: "Kan wasi rikuna.",
    translation_en: "You see the house.",
    pieces: ["Kan", "wasi", "rikuna"],
    correct_order: [0, 1, 2],
    distractors: ["pay", "yaku", "alli"],
  },
  {
    id: "sp4",
    language: "Kichwa (Otavalo)",
    type: "SOV-basic",
    surface: "Ñuka puncha alli.",
    translation_en: "I have a good day.",
    pieces: ["Ñuka", "puncha", "alli"],
    correct_order: [0, 1, 2],
    distractors: ["kan", "tuta", "mana"],
  },
  {
    id: "sp5",
    language: "Kichwa (Otavalo)",
    type: "SOV-basic",
    surface: "Pay inti rikuna.",
    translation_en: "He/She sees the sun.",
    pieces: ["Pay", "inti", "rikuna"],
    correct_order: [0, 1, 2],
    distractors: ["ñuka", "yaku", "wasi"],
  },
];

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

