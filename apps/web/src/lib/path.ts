import type { Category } from "@/lib/data";

// Learning path: each category is a unit, each unit is a short run of
// lessons ending in a checkpoint. Lessons unlock strictly in order across
// the whole path — the first not-yet-completed node is "current", every
// node after it is locked.

export const LESSONS_PER_UNIT = 5;
// Each puzzle lesson takes its own run of this many sentences from the
// puzzle list, so consecutive puzzle lessons never repeat a sentence.
export const PUZZLES_PER_LESSON = 3;
// Share of correct answers a lesson quiz needs to count as completed.
export const PASS_THRESHOLD = 0.6;

export type NodeState = "completed" | "current" | "locked";
export type Activity = "quiz" | "puzzle";

export interface PathNode {
  id: string;
  unitId: string;
  index: number; // position inside its unit
  globalIndex: number; // position along the whole path (drives the zig-zag)
  kind: "lesson" | "checkpoint";
  // Activities alternate along the whole path (even = quiz, odd = puzzle),
  // so the same type never comes up twice in a row, even across units.
  activity: Activity;
  // For puzzle nodes: which puzzle lesson this is along the path (0, 1, ...),
  // used to pick its puzzles with puzzlesForSlot().
  puzzleSlot?: number;
  state: NodeState;
}

export interface PathUnit {
  category: Category;
  nodes: PathNode[];
}

export const lessonId = (unitId: string, index: number) => `${unitId}:${index}`;

export function buildPath(categories: Category[], completed: string[]): PathUnit[] {
  const done = new Set(completed);
  let foundCurrent = false;
  let globalIndex = 0;
  let puzzleSlot = 0;

  return categories.map((category) => ({
    category,
    nodes: Array.from({ length: LESSONS_PER_UNIT }, (_, index) => {
      const id = lessonId(category.id, index);
      let state: NodeState;
      if (!foundCurrent && done.has(id)) {
        state = "completed";
      } else if (!foundCurrent) {
        state = "current";
        foundCurrent = true;
      } else {
        state = "locked";
      }
      const activity: Activity = globalIndex % 2 === 0 ? "quiz" : "puzzle";
      return {
        id,
        unitId: category.id,
        index,
        globalIndex: globalIndex++,
        kind: index === LESSONS_PER_UNIT - 1 ? "checkpoint" : "lesson",
        activity,
        ...(activity === "puzzle" ? { puzzleSlot: puzzleSlot++ } : {}),
        state,
      };
    }),
  }));
}

// Horizontal offset in [-1, 1] for a node: a smooth wave so the path
// winds left and right (0, .7, 1, .7, 0, -.7, -1, -.7, ...).
export const nodeOffset = (globalIndex: number) =>
  Math.round(Math.sin((globalIndex * Math.PI) / 4) * 100) / 100;

export const hasPassed = (score: number, total: number) =>
  total > 0 && score / total >= PASS_THRESHOLD;

export function lessonHref(node: PathNode): string {
  const lesson = encodeURIComponent(node.id);
  return node.activity === "puzzle"
    ? `/sentence-puzzle?lesson=${lesson}&slot=${node.puzzleSlot}`
    : `/quiz?category=${encodeURIComponent(node.unitId)}&lesson=${lesson}`;
}

// The puzzles for the slot-th puzzle lesson: a run of PUZZLES_PER_LESSON
// consecutive puzzles, wrapping around the list once the path outgrows it.
export function puzzlesForSlot<T>(puzzles: T[], slot: number): T[] {
  if (puzzles.length === 0) return [];
  const count = Math.min(PUZZLES_PER_LESSON, puzzles.length);
  const start = (slot * count) % puzzles.length;
  return Array.from({ length: count }, (_, i) => puzzles[(start + i) % puzzles.length]);
}
