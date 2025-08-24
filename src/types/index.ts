export interface KichwaWord {
  kichwa: string;
  spanish: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  keywords: string[];
}

export interface Progress {
  totalWords: number;
  learnedWords: number;
  currentStreak: number;
  longestStreak: number;
  categoriesCompleted: string[];
  lastStudyDate: string;
}

export interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  type: "kichwa-to-spanish" | "spanish-to-kichwa";
}

export interface FlashcardData {
  word: KichwaWord;
  isFlipped: boolean;
  isKnown: boolean;
}
