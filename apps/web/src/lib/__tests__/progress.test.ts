/**
 * Unit tests for apps/web/src/lib/progress.ts. Vitest runs in Node here, so
 * localStorage is replaced with a small in-memory stand-in.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLearned, markLearned } from "../progress";

let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
});

describe("progress", () => {
  it("starts empty", () => {
    expect(getLearned("learnedPuzzles")).toEqual([]);
  });

  it("records a learned id", () => {
    markLearned("learnedPuzzles", "sp1");
    expect(getLearned("learnedPuzzles")).toEqual(["sp1"]);
  });

  it("counts an id only once", () => {
    markLearned("learnedPuzzles", "sp1");
    markLearned("learnedPuzzles", "sp1");
    expect(getLearned("learnedPuzzles")).toEqual(["sp1"]);
  });

  it("records today as an active day, even for an already-learned item", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 13, 12));
    markLearned("learnedWords", "w");
    vi.setSystemTime(new Date(2026, 10, 14, 9));
    markLearned("learnedWords", "w");
    vi.useRealTimers();
    expect(getLearned("activeDays")).toEqual(["2026-11-13", "2026-11-14"]);
    expect(getLearned("learnedWords")).toEqual(["w"]);
  });

  it("keeps words and puzzles separate", () => {
    markLearned("learnedPuzzles", "sp1");
    expect(getLearned("learnedWords")).toEqual([]);
  });

  it("treats corrupt or non-list values as empty", () => {
    store.set("learnedPuzzles", "{not json");
    store.set("learnedWords", "5");
    expect(getLearned("learnedPuzzles")).toEqual([]);
    expect(getLearned("learnedWords")).toEqual([]);
  });

  it("doesn't throw when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(getLearned("learnedWords")).toEqual([]);
    expect(() => markLearned("learnedWords", "x")).not.toThrow();
  });
});
