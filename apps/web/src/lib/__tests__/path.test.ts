import { describe, expect, it } from "vitest";
import {
  buildPath,
  hasPassed,
  lessonHref,
  lessonId,
  LESSONS_PER_UNIT,
  nodeOffset,
  PUZZLES_PER_LESSON,
  puzzlesForSlot,
} from "../path";
import type { Category } from "../data";

const cat = (id: string): Category => ({
  id,
  name: id,
  description: "",
  icon: "",
  color: "#3B82F6",
  keywords: [],
});
const cats = [cat("numbers"), cat("colors")];

describe("buildPath", () => {
  it("makes one unit per category with a checkpoint at the end", () => {
    const units = buildPath(cats, []);
    expect(units).toHaveLength(2);
    expect(units[0].nodes).toHaveLength(LESSONS_PER_UNIT);
    expect(units[0].nodes.at(-1)!.kind).toBe("checkpoint");
    expect(units[0].nodes[0].kind).toBe("lesson");
  });

  it("starts with only the first lesson unlocked", () => {
    const states = buildPath(cats, []).flatMap((u) => u.nodes.map((n) => n.state));
    expect(states[0]).toBe("current");
    expect(states.slice(1).every((s) => s === "locked")).toBe(true);
  });

  it("advances current past completed lessons, across units", () => {
    const done = Array.from({ length: LESSONS_PER_UNIT }, (_, i) => lessonId("numbers", i));
    const [first, second] = buildPath(cats, done);
    expect(first.nodes.every((n) => n.state === "completed")).toBe(true);
    expect(second.nodes[0].state).toBe("current");
  });

  it("does not unlock lessons completed out of order beyond the current one", () => {
    const nodes = buildPath(cats, [lessonId("numbers", 2)]).flatMap((u) => u.nodes);
    expect(nodes[0].state).toBe("current");
    expect(nodes[2].state).toBe("locked");
  });

  it("numbers nodes continuously along the whole path", () => {
    const idx = buildPath(cats, []).flatMap((u) => u.nodes.map((n) => n.globalIndex));
    expect(idx).toEqual([...Array(cats.length * LESSONS_PER_UNIT).keys()]);
  });
});

describe("activities", () => {
  const nodes = buildPath(cats, []).flatMap((u) => u.nodes);

  it("alternates quiz and puzzle along the whole path, across units", () => {
    nodes.slice(1).forEach((n, i) => expect(n.activity).not.toBe(nodes[i].activity));
  });

  it("numbers puzzle slots consecutively", () => {
    const slots = nodes.filter((n) => n.activity === "puzzle").map((n) => n.puzzleSlot);
    expect(slots).toEqual([...slots.keys()]);
    expect(nodes.filter((n) => n.activity === "quiz").every((n) => n.puzzleSlot === undefined)).toBe(true);
  });

  it("links each node to its activity", () => {
    expect(lessonHref(nodes[0])).toBe("/quiz?category=numbers&lesson=numbers%3A0");
    expect(lessonHref(nodes[1])).toBe("/sentence-puzzle?lesson=numbers%3A1&slot=0");
  });
});

describe("puzzlesForSlot", () => {
  const puzzles = [...Array(30).keys()];

  it("gives consecutive slots disjoint puzzles", () => {
    const a = puzzlesForSlot(puzzles, 0);
    const b = puzzlesForSlot(puzzles, 1);
    expect(a).toHaveLength(PUZZLES_PER_LESSON);
    expect(a.some((p) => b.includes(p))).toBe(false);
  });

  it("wraps around once the slots outgrow the list", () => {
    expect(puzzlesForSlot(puzzles, 10)).toEqual(puzzlesForSlot(puzzles, 0));
    expect(puzzlesForSlot([1, 2], 0)).toEqual([1, 2]);
    expect(puzzlesForSlot([], 3)).toEqual([]);
  });
});

describe("nodeOffset", () => {
  it("winds between -1 and 1 starting at center", () => {
    expect(nodeOffset(0)).toBe(0);
    expect(nodeOffset(2)).toBe(1);
    expect(nodeOffset(6)).toBe(-1);
  });
});

describe("hasPassed", () => {
  it("requires 60% correct", () => {
    expect(hasPassed(6, 10)).toBe(true);
    expect(hasPassed(5, 10)).toBe(false);
    expect(hasPassed(0, 0)).toBe(false);
  });
});
