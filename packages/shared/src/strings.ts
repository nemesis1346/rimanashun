// Centralized UI copy for apps/web and apps/native, keyed by base
// language. The app supports 4 explicit modes (es<->kichwa,
// en<->kichwa) — key names are language-neutral ("Base") so a value
// under `en` never ends up literally saying "Spanish" (and vice versa).
export const uiStrings = {
  es: {
    quiz: {
      promptKichwaToBase: "¿Qué significa esto en español?",
      promptBaseToKichwa: "¿Qué significa esto en kichwa?",
    },
    flashcards: {
      showKichwa: "Mostrar kichwa",
      showBase: "Mostrar traducción",
      clickToRevealKichwa: "Toca para revelar el kichwa",
      clickToRevealBase: "Toca para revelar la traducción",
    },
  },
  en: {
    quiz: {
      promptKichwaToBase: "What does this mean in English?",
      promptBaseToKichwa: "What does this mean in Kichwa?",
    },
    flashcards: {
      showKichwa: "Show Kichwa",
      showBase: "Show Translation",
      clickToRevealKichwa: "Click to reveal Kichwa",
      clickToRevealBase: "Click to reveal the translation",
    },
  },
} as const;
