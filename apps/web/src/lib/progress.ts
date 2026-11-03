// Learned words and puzzles for this browser. Stored as id lists so a word
// or puzzle only ever counts once, however many times it's answered.
export type ProgressKey = "learnedWords" | "learnedPuzzles";

export function getLearned(key: ProgressKey): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // localStorage unavailable (private mode, etc.) or corrupt value
    return [];
  }
}

export function markLearned(key: ProgressKey, id: string) {
  const learned = getLearned(key);
  if (learned.includes(id)) return;
  try {
    localStorage.setItem(key, JSON.stringify([...learned, id]));
  } catch {
    // ignore
  }
}
