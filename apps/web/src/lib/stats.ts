// Pure calculations behind the Progress page, all from real stored progress
// (lib/progress.ts). Days are local 'YYYY-MM-DD' strings (see localDay).
import type { Category, KichwaWord } from "@/lib/data";
import { getWordKey } from "@/lib/data";
import { localDay } from "@/lib/progress";

function addDays(day: string, delta: number) {
  const [y, m, d] = day.split("-").map(Number);
  return localDay(new Date(y, m - 1, d + delta));
}

// Consecutive active days ending today. A streak isn't broken until a whole
// day is missed: if today has no activity yet, it counts back from yesterday.
export function currentStreak(activeDays: string[], today = localDay()) {
  const days = new Set(activeDays);
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function longestStreak(activeDays: string[]) {
  const sorted = [...new Set(activeDays)].sort();
  let best = 0;
  let run = 0;
  sorted.forEach((day, i) => {
    run = i > 0 && addDays(sorted[i - 1], 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

export function lastActiveDay(activeDays: string[]): string | null {
  return activeDays.length > 0 ? [...activeDays].sort().at(-1)! : null;
}

// The last `count` days, oldest first, each flagged active or not.
export function recentDays(activeDays: string[], count = 7, today = localDay()) {
  const days = new Set(activeDays);
  return Array.from({ length: count }, (_, i) => {
    const day = addDays(today, i - (count - 1));
    return { day, active: days.has(day) };
  });
}

export interface CategoryProgress {
  id: string;
  name: string;
  color: string;
  learned: number;
  total: number;
  percentage: number;
}

// Learned vs total words for each category, in the categories' order.
// Categories with no words are left out.
export function categoryProgress(
  words: KichwaWord[],
  categories: Category[],
  learnedWordKeys: string[]
): CategoryProgress[] {
  const learned = new Set(learnedWordKeys);
  return categories
    .map((c) => {
      const inCategory = words.filter((w) => w.categoryId === c.id);
      const learnedCount = inCategory.filter((w) => learned.has(getWordKey(w))).length;
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        learned: learnedCount,
        total: inCategory.length,
        percentage: inCategory.length ? Math.round((learnedCount / inCategory.length) * 100) : 0,
      };
    })
    .filter((c) => c.total > 0);
}

// Only learned keys that still match a current word count (the vocabulary
// can change under stored progress).
export function countLearnedWords(words: KichwaWord[], learnedWordKeys: string[]) {
  const learned = new Set(learnedWordKeys);
  return new Set(words.map(getWordKey).filter((k) => learned.has(k))).size;
}
