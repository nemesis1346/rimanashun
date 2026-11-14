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
    sound: {
      mute: "Silenciar sonidos",
    },
    path: {
      start: "EMPEZAR",
      practice: "PRACTICAR",
      unit: "UNIDAD",
      lesson: "Lección",
      review: "repaso",
      locked: "bloqueado",
      lessonHint: "Responde 10 preguntas.",
      puzzleHint: "Ordena 3 oraciones.",
      completedHint: "¡Completado! Practica otra vez.",
      backToPath: "Continuar",
    },
    auth: {
      logIn: "Iniciar sesión",
      logOut: "Cerrar sesión",
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
    sound: {
      mute: "Mute sounds",
    },
    path: {
      start: "START",
      practice: "PRACTICE",
      unit: "UNIT",
      lesson: "Lesson",
      review: "review",
      locked: "locked",
      lessonHint: "Answer 10 questions.",
      puzzleHint: "Arrange 3 sentences.",
      completedHint: "Completed! Practice again.",
      backToPath: "Continue",
    },
    auth: {
      logIn: "Log in",
      logOut: "Log out",
    },
  },
} as const;
