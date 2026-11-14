/**
 * Tests for syncing localStorage progress with the logged-in user's account.
 * The backend is replaced by a fake ProgressApi that behaves like
 * POST /v1/progress (adds items, returns the account's full progress).
 *
 * The rule under test: progress only counts toward an account while logged
 * in. Logged-out progress stays in the browser and is discarded on login.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLearned,
  markLearned,
  onProgressChanged,
  Progress,
  PROGRESS_KEYS,
  setRemoteProgress,
} from "../progress";
import {
  claimLocalProgress,
  OWNER_KEY,
  ProgressApi,
  startProgressSync,
  syncProgress,
} from "../progressSync";

let store: Map<string, string>;

function fakeAccount(initial: Partial<Progress> = {}) {
  const account = Object.fromEntries(
    PROGRESS_KEYS.map((k) => [k, [...(initial[k] ?? [])]])
  ) as Progress;
  const api: ProgressApi & { calls: Partial<Progress>[] } = {
    calls: [],
    add: vi.fn(async (progress: Partial<Progress>) => {
      api.calls.push(progress);
      for (const k of PROGRESS_KEYS) {
        for (const id of progress[k] ?? []) if (!account[k].includes(id)) account[k].push(id);
      }
      return structuredClone(account);
    }),
  };
  return { account, api };
}

const offline = (): ProgressApi => ({ add: vi.fn().mockRejectedValue(new Error("offline")) });
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
  vi.stubGlobal("window", new EventTarget());
  vi.spyOn(console, "warn").mockImplementation(() => {});
  setRemoteProgress(null);
});

describe("claimLocalProgress", () => {
  it("discards logged-out progress when someone logs in", () => {
    markLearned("learnedWords", "allku|perro");
    claimLocalProgress("auth0|alice");
    expect(getLearned("learnedWords")).toEqual([]);
    expect(store.get(OWNER_KEY)).toBe("auth0|alice");
  });

  it("discards another account's progress when a different user logs in", () => {
    claimLocalProgress("auth0|alice");
    markLearned("learnedWords", "alice-word");
    claimLocalProgress("auth0|bob");
    expect(getLearned("learnedWords")).toEqual([]);
    expect(store.get(OWNER_KEY)).toBe("auth0|bob");
  });

  it("keeps progress when the same user comes back (e.g. a page reload)", () => {
    claimLocalProgress("auth0|alice");
    markLearned("learnedPuzzles", "sp1");
    claimLocalProgress("auth0|alice");
    expect(getLearned("learnedPuzzles")).toEqual(["sp1"]);
  });

  it("clears the account's progress from the browser on logout", () => {
    claimLocalProgress("auth0|alice");
    markLearned("completedLessons", "numbers:0");
    claimLocalProgress(null);
    expect(getLearned("completedLessons")).toEqual([]);
    expect(store.has(OWNER_KEY)).toBe(false);
  });

  it("keeps logged-out progress while staying logged out", () => {
    markLearned("learnedWords", "x");
    claimLocalProgress(null);
    claimLocalProgress(null);
    expect(getLearned("learnedWords")).toEqual(["x"]);
  });
});

describe("syncProgress", () => {
  it("sends local progress and merges the account's progress back in", async () => {
    claimLocalProgress("auth0|alice");
    markLearned("learnedWords", "local-word");
    const { api, account } = fakeAccount({ learnedWords: ["other-device-word"], completedLessons: ["numbers:0"] });

    await syncProgress(api);

    expect(account.learnedWords).toEqual(["other-device-word", "local-word"]);
    expect(getLearned("learnedWords")).toEqual(["local-word", "other-device-word"]);
    expect(getLearned("completedLessons")).toEqual(["numbers:0"]);
  });

  it("tells open pages to re-read progress", async () => {
    const listener = vi.fn();
    onProgressChanged(listener);
    await syncProgress(fakeAccount().api);
    expect(listener).toHaveBeenCalled();
  });

  it("leaves local progress untouched if the backend fails", async () => {
    markLearned("learnedWords", "w");
    await expect(syncProgress(offline())).rejects.toThrow("offline");
    expect(getLearned("learnedWords")).toEqual(["w"]);
  });
});

describe("startProgressSync", () => {
  it("never sends logged-out progress to the account", async () => {
    markLearned("learnedPuzzles", "sp1");
    markLearned("learnedWords", "anon-word");
    const { api, account } = fakeAccount({ learnedWords: ["account-word"] });

    startProgressSync("auth0|alice", api);
    await flush();

    expect(account.learnedPuzzles).toEqual([]);
    expect(account.learnedWords).toEqual(["account-word"]);
    // ...and the browser now shows the account's progress instead
    expect(getLearned("learnedPuzzles")).toEqual([]);
    expect(getLearned("learnedWords")).toEqual(["account-word"]);
  });

  it("doesn't send anything while logged out", () => {
    const { api } = fakeAccount();
    startProgressSync(null, null);
    markLearned("learnedWords", "w");
    expect(api.add).not.toHaveBeenCalled();
    expect(getLearned("learnedWords")).toEqual(["w"]);
  });

  it("sends each newly learned item to the account while logged in", async () => {
    const { api, account } = fakeAccount();
    startProgressSync("auth0|alice", api);
    await flush();

    markLearned("learnedWords", "new-word");
    markLearned("learnedWords", "new-word"); // already learned: not sent again
    await flush();

    expect(account.learnedWords).toEqual(["new-word"]);
    expect(api.calls.filter((c) => c.learnedWords?.includes("new-word"))).toHaveLength(1);
  });

  it("stops sending items once logged out", async () => {
    const { api } = fakeAccount();
    const stop = startProgressSync("auth0|alice", api);
    await flush();
    stop();
    startProgressSync(null, null);

    const before = api.calls.length;
    markLearned("learnedWords", "after-logout");
    await flush();
    expect(api.calls.length).toBe(before);
  });

  it("doesn't carry one account's progress into another's", async () => {
    const alice = fakeAccount();
    const stop = startProgressSync("auth0|alice", alice.api);
    await flush();
    markLearned("learnedWords", "alice-word");
    stop();

    const bob = fakeAccount();
    startProgressSync("auth0|bob", bob.api);
    await flush();
    expect(bob.account.learnedWords).toEqual([]);
    expect(getLearned("learnedWords")).toEqual([]);
  });

  it("resends progress from a failed push on the next sync in the same session", async () => {
    const stop = startProgressSync("auth0|alice", offline());
    markLearned("learnedPuzzles", "sp1"); // push fails: backend down
    await flush();
    stop();

    // page reload, same user, backend back up
    const { api, account } = fakeAccount();
    startProgressSync("auth0|alice", api);
    await flush();
    expect(account.learnedPuzzles).toEqual(["sp1"]);
  });

  it("keeps working offline: a failed push doesn't throw", async () => {
    startProgressSync("auth0|alice", offline());
    expect(() => markLearned("learnedWords", "w")).not.toThrow();
    await flush();
    expect(getLearned("learnedWords")).toEqual(["w"]);
  });
});
