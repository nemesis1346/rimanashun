// Learned words, learned puzzles and completed path lessons. Stored as id
// lists so an item only ever counts once, however many times it's answered.
//
// localStorage is always the copy the UI reads. Logged out, that's all there
// is: progress lives only in this browser and is discarded on login. Logged
// in, progressSync.ts mirrors it to the account (/v1/progress): it installs
// a remote hook here so each newly learned item is also sent to the account,
// and loads the account's progress into localStorage.
// activeDays holds local calendar dates ('YYYY-MM-DD', see localDay) on
// which something was answered correctly; it drives the streak.
export const PROGRESS_KEYS = ["learnedWords", "learnedPuzzles", "completedLessons", "activeDays"] as const;
export type ProgressKey = (typeof PROGRESS_KEYS)[number];
export type Progress = Record<ProgressKey, string[]>;

// Fired on window whenever progress is replaced wholesale (e.g. after a sync
// pulls items learned on another device), so open pages can re-read it.
export const PROGRESS_CHANGED_EVENT = "rimanashun:progress-changed";

type RemoteHook = (key: ProgressKey, id: string) => void;
let remote: RemoteHook | null = null;

// Set by progressSync while a user is logged in; null otherwise.
export function setRemoteProgress(hook: RemoteHook | null) {
  remote = hook;
}

export function getLearned(key: ProgressKey): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // localStorage unavailable (private mode, etc.) or corrupt value
    return [];
  }
}

export function getAllProgress(): Progress {
  return Object.fromEntries(PROGRESS_KEYS.map((k) => [k, getLearned(k)])) as Progress;
}

// The user's local calendar date, e.g. "2026-11-14" (not UTC: a late-evening
// session should count for the day the user sees on their clock).
export function localDay(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Records a correct answer: the item itself, and today as an active day.
// The day is recorded even when the item was already learned, since
// practicing known words still counts toward the streak.
export function markLearned(key: Exclude<ProgressKey, "activeDays">, id: string) {
  addItem("activeDays", localDay());
  addItem(key, id);
}

function addItem(key: ProgressKey, id: string) {
  const learned = getLearned(key);
  if (learned.includes(id)) return;
  try {
    localStorage.setItem(key, JSON.stringify([...learned, id]));
  } catch {
    // ignore
  }
  remote?.(key, id);
}

// Adds everything in `progress` that isn't stored yet (never removes), then
// notifies open pages.
export function mergeProgress(progress: Partial<Progress>) {
  try {
    for (const key of PROGRESS_KEYS) {
      const incoming = progress[key] ?? [];
      const current = getLearned(key);
      const merged = [...current, ...incoming.filter((id) => !current.includes(id))];
      if (merged.length !== current.length) localStorage.setItem(key, JSON.stringify(merged));
    }
  } catch {
    // ignore
  }
  notifyProgressChanged();
}

export function clearProgress() {
  try {
    for (const key of PROGRESS_KEYS) localStorage.removeItem(key);
  } catch {
    // ignore
  }
  notifyProgressChanged();
}

function notifyProgressChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
}

// Subscribes to PROGRESS_CHANGED_EVENT; returns the unsubscribe function
// (shaped for useEffect).
export function onProgressChanged(callback: () => void) {
  window.addEventListener(PROGRESS_CHANGED_EVENT, callback);
  return () => window.removeEventListener(PROGRESS_CHANGED_EVENT, callback);
}
