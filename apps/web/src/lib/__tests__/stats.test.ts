import { describe, expect, it } from "vitest";
import {
  categoryProgress,
  countLearnedWords,
  currentStreak,
  lastActiveDay,
  longestStreak,
  recentDays,
} from "../stats";
import { localDay } from "../progress";
import type { Category, KichwaWord } from "../data";

const TODAY = "2026-11-14";

describe("currentStreak", () => {
  it("is 0 with no activity", () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-11-12", "2026-11-13", "2026-11-14"], TODAY)).toBe(3);
  });

  it("stays alive until a whole day is missed (counts from yesterday)", () => {
    expect(currentStreak(["2026-11-12", "2026-11-13"], TODAY)).toBe(2);
  });

  it("is broken by a missed day", () => {
    expect(currentStreak(["2026-11-11", "2026-11-12"], TODAY)).toBe(0);
    expect(currentStreak(["2026-11-10", "2026-11-12", "2026-11-13", "2026-11-14"], TODAY)).toBe(3);
  });

  it("crosses month and year boundaries", () => {
    expect(currentStreak(["2026-10-31", "2026-11-01"], "2026-11-01")).toBe(2);
    expect(currentStreak(["2025-12-31", "2026-01-01"], "2026-01-01")).toBe(2);
  });

  it("ignores duplicates and order", () => {
    expect(currentStreak(["2026-11-14", "2026-11-13", "2026-11-14"], TODAY)).toBe(2);
  });
});

describe("longestStreak", () => {
  it("finds the longest run anywhere", () => {
    expect(longestStreak(["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-10", "2026-11-11"])).toBe(3);
    expect(longestStreak([])).toBe(0);
  });
});

describe("lastActiveDay", () => {
  it("returns the latest day, or null", () => {
    expect(lastActiveDay(["2026-11-02", "2026-11-14", "2026-11-09"])).toBe("2026-11-14");
    expect(lastActiveDay([])).toBeNull();
  });
});

describe("recentDays", () => {
  it("lists the last 7 days oldest first, flagging active ones", () => {
    const week = recentDays(["2026-11-14", "2026-11-10", "2026-11-01"], 7, TODAY);
    expect(week.map((d) => d.day)).toEqual([
      "2026-11-08", "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14",
    ]);
    expect(week.filter((d) => d.active).map((d) => d.day)).toEqual(["2026-11-10", "2026-11-14"]);
  });
});

describe("localDay", () => {
  it("formats the local date with zero padding", () => {
    expect(localDay(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

const w = (kichwa: string, spanish: string, categoryId: string): KichwaWord => ({
  kichwa,
  spanish,
  translation: spanish,
  categoryId,
});
const cat = (id: string): Category => ({ id, name: id.toUpperCase(), description: "", icon: "", color: "#000", keywords: [] });

describe("categoryProgress", () => {
  const words = [w("allku", "perro", "animals"), w("misi", "gato", "animals"), w("shuk", "uno", "numbers")];

  it("counts learned vs total words per category, in category order", () => {
    const result = categoryProgress(words, [cat("numbers"), cat("animals"), cat("empty")], ["allku|perro"]);
    expect(result.map((c) => [c.id, c.learned, c.total, c.percentage])).toEqual([
      ["numbers", 0, 1, 0],
      ["animals", 1, 2, 50],
    ]);
  });
});

describe("countLearnedWords", () => {
  it("only counts keys that match a current word", () => {
    const words = [w("allku", "perro", "animals"), w("misi", "gato", "animals")];
    expect(countLearnedWords(words, ["allku|perro", "gone|word"])).toBe(1);
  });
});
