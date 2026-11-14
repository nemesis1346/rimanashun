/**
 * Tests for the per-user progress routes. Tokens come from the local Auth0
 * stand-in (helpers/issuer.js); storage is an in-memory store with the same
 * interface as the Postgres one (that one is covered by progress-pg.test.js).
 */

import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { createApp } from "../app.js";
import { createRequireAuth } from "../auth.js";
import { emptyProgress, MAX_ITEM_LENGTH, MAX_ITEMS_PER_REQUEST, PROGRESS_KINDS } from "../progress.js";
import { AUDIENCE, close, otherKey, startIssuer } from "./helpers/issuer.js";

function createMemoryProgressStore() {
  const users = new Map(); // sub -> { kind -> Set }
  const forUser = (sub) => {
    if (!users.has(sub)) {
      users.set(sub, Object.fromEntries(PROGRESS_KINDS.map((k) => [k, new Set()])));
    }
    return users.get(sub);
  };
  const get = async (sub) => {
    const sets = forUser(sub);
    return Object.fromEntries(PROGRESS_KINDS.map((k) => [k, [...sets[k]]]));
  };
  return {
    get,
    add: async (sub, progress) => {
      const sets = forUser(sub);
      for (const k of PROGRESS_KINDS) for (const item of progress[k] ?? []) sets[k].add(item);
      return get(sub);
    },
    clear: () => users.clear(),
  };
}

let makeToken, issuerServer, appServer, appUrl;
const store = createMemoryProgressStore();
const alice = () => makeToken();
const bob = () => makeToken({ claims: { sub: "auth0|bob" } });

function request(method, token, body, path = "/v1/progress") {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return fetch(appUrl + path, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}
const getProgress = (token, path) => request("GET", token, undefined, path);
const addProgress = (token, body, path) => request("POST", token, body, path);

before(async () => {
  let issuer;
  ({ issuer, makeToken, server: issuerServer } = await startIssuer());
  const requireAuth = createRequireAuth({ issuerBaseURL: issuer, audience: AUDIENCE });
  appServer = createApp({ requireAuth, progressStore: store }).listen(0);
  await new Promise((resolve) => appServer.once("listening", resolve));
  appUrl = `http://localhost:${appServer.address().port}`;
});

after(() => close(appServer, issuerServer));
beforeEach(() => store.clear());

describe("authentication", () => {
  for (const [method, send] of [["GET", getProgress], ["POST", (t) => addProgress(t, {})]]) {
    it(`${method} rejects a missing token`, async () => {
      const res = await send(undefined);
      assert.equal(res.status, 401);
    });

    it(`${method} rejects a token signed with the wrong key`, async () => {
      const res = await send(makeToken({ key: otherKey }));
      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: "invalid_token" });
    });
  }

  it("doesn't write anything for a rejected request", async () => {
    await addProgress(makeToken({ key: otherKey }), { learnedWords: ["x"] });
    const res = await getProgress(alice());
    assert.deepEqual(await res.json(), emptyProgress());
  });
});

describe("GET /v1/progress", () => {
  it("starts empty, with every kind present", async () => {
    const res = await getProgress(alice());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      learnedWords: [],
      learnedPuzzles: [],
      completedLessons: [],
      activeDays: [],
    });
  });
});

describe("POST /v1/progress", () => {
  it("adds items and returns the full progress", async () => {
    const res = await addProgress(alice(), { learnedWords: ["allku|perro"], completedLessons: ["numbers:0"] });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      learnedWords: ["allku|perro"],
      learnedPuzzles: [],
      completedLessons: ["numbers:0"],
      activeDays: [],
    });
  });

  it("merges with what's already stored, counting each item once", async () => {
    await addProgress(alice(), { learnedPuzzles: ["sp1", "sp2"] });
    const res = await addProgress(alice(), { learnedPuzzles: ["sp2", "sp3", "sp3"] });
    assert.deepEqual((await res.json()).learnedPuzzles, ["sp1", "sp2", "sp3"]);
  });

  it("stores active days", async () => {
    const res = await addProgress(alice(), { activeDays: ["2026-11-13", "2026-11-14"] });
    assert.deepEqual((await res.json()).activeDays, ["2026-11-13", "2026-11-14"]);
  });

  it("never removes items (an empty body changes nothing)", async () => {
    await addProgress(alice(), { learnedWords: ["a"] });
    const res = await addProgress(alice(), {});
    assert.deepEqual((await res.json()).learnedWords, ["a"]);
  });
});

describe("isolation between users", () => {
  it("keeps each user's progress separate", async () => {
    await addProgress(alice(), { learnedWords: ["alice-word"] });
    await addProgress(bob(), { learnedWords: ["bob-word"] });

    assert.deepEqual((await (await getProgress(alice())).json()).learnedWords, ["alice-word"]);
    assert.deepEqual((await (await getProgress(bob())).json()).learnedWords, ["bob-word"]);
  });

  it("ignores a user named in the query string", async () => {
    await addProgress(bob(), { learnedWords: ["bob-word"] });
    const res = await getProgress(alice(), "/v1/progress?sub=auth0|bob");
    assert.deepEqual((await res.json()).learnedWords, []);
  });

  it("rejects a user named in the body instead of writing to them", async () => {
    const res = await addProgress(alice(), { sub: "auth0|bob", learnedWords: ["x"] });
    assert.equal(res.status, 400);
    assert.deepEqual((await (await getProgress(bob())).json()).learnedWords, []);
  });
});

describe("validation", () => {
  const invalid = {
    "an array body": [],
    "an unknown kind": { learnedVerbs: ["x"] },
    "a kind that isn't an array": { learnedWords: "allku" },
    "a non-string item": { learnedWords: [42] },
    "an empty item": { learnedWords: [""] },
    "an over-long item": { learnedWords: ["x".repeat(MAX_ITEM_LENGTH + 1)] },
    "too many items": {
      learnedWords: Array.from({ length: MAX_ITEMS_PER_REQUEST + 1 }, (_, i) => `w${i}`),
    },
  };

  for (const [name, body] of Object.entries(invalid)) {
    it(`rejects ${name} with 400 and stores nothing`, async () => {
      const res = await addProgress(alice(), body);
      assert.equal(res.status, 400);
      assert.equal(typeof (await res.json()).error, "string");
      assert.deepEqual(await (await getProgress(alice())).json(), emptyProgress());
    });
  }

  it("rejects malformed JSON with 400", async () => {
    const res = await addProgress(alice(), "{not json");
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "Invalid JSON" });
  });

  it("accepts exactly the maximum item length", async () => {
    const res = await addProgress(alice(), { learnedWords: ["x".repeat(MAX_ITEM_LENGTH)] });
    assert.equal(res.status, 200);
  });
});

describe("without Auth0 configured", () => {
  let server, url;

  before(async () => {
    server = createApp({ requireAuth: createRequireAuth(null), progressStore: store }).listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    url = `http://localhost:${server.address().port}`;
  });

  after(() => close(server));

  it("returns 503 instead of serving or storing progress", async () => {
    assert.equal((await fetch(`${url}/v1/progress`)).status, 503);
    const res = await fetch(`${url}/v1/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learnedWords: ["x"] }),
    });
    assert.equal(res.status, 503);
  });
});
