"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type BaseLanguage = "es" | "en";
export type Direction = "kichwa-first" | "base-first";

// The four explicit modes the app supports. Each combines a base
// language with a fixed direction — quiz/flashcards no longer pick a
// random direction per question, the user picks the mode upfront.
export type QuizMode =
  | "es-to-kichwa"
  | "kichwa-to-es"
  | "en-to-kichwa"
  | "kichwa-to-en";

interface ModeInfo {
  language: BaseLanguage;
  direction: Direction;
  label: string;
}

export const QUIZ_MODES: Record<QuizMode, ModeInfo> = {
  "es-to-kichwa": { language: "es", direction: "base-first", label: "Español → Kichwa" },
  "kichwa-to-es": { language: "es", direction: "kichwa-first", label: "Kichwa → Español" },
  "en-to-kichwa": { language: "en", direction: "base-first", label: "English → Kichwa" },
  "kichwa-to-en": { language: "en", direction: "kichwa-first", label: "Kichwa → English" },
};

const STORAGE_KEY = "rimanashun_quiz_mode";
const DEFAULT_MODE: QuizMode = "es-to-kichwa";

interface LanguageContextValue {
  mode: QuizMode;
  setMode: (mode: QuizMode) => void;
  language: BaseLanguage;
  direction: Direction;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<QuizMode>(DEFAULT_MODE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in QUIZ_MODES) {
        setModeState(stored as QuizMode);
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — default stands
    }
  }, []);

  const setMode = (next: QuizMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const { language, direction } = QUIZ_MODES[mode];

  return (
    <LanguageContext.Provider value={{ mode, setMode, language, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
