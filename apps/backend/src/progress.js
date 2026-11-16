// Per-user progress: what the routes accept, and the Postgres store behind
// them. The store is passed into createApp() so route tests can swap in an
// in-memory one; the Postgres one has its own test against a real database.

// Same names as the web app's localStorage keys. activeDays holds local
// calendar dates ('YYYY-MM-DD') on which the user got something right.
export const PROGRESS_KINDS = ["learnedWords", "learnedPuzzles", "completedLessons", "activeDays"];

// Generous for one request (the whole vocabulary is ~700 words), but bounded
// so a single call can't write an unbounded number of rows.
export const MAX_ITEMS_PER_REQUEST = 5000;
export const MAX_ITEM_LENGTH = 200;

// learnedWords holds word ids (words.id, as strings). Older clients sent
// "kichwa|spanish" keys; those are rejected so a stale browser can't write
// keys that no longer match any word (see migration 0006).
const ITEM_PATTERNS = { learnedWords: /^[1-9][0-9]*$/ };

export const emptyProgress = () =>
  Object.fromEntries(PROGRESS_KINDS.map((kind) => [kind, []]));

// Returns { progress } with every kind present (missing ones as []), or
// { error } describing the first problem. Unknown keys are an error rather
// than silently dropped, so a typo on the client doesn't lose progress.
export function parseProgressBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Body must be a JSON object" };
  }
  const unknown = Object.keys(body).filter((k) => !PROGRESS_KINDS.includes(k));
  if (unknown.length > 0) {
    return { error: `Unknown progress kind: ${unknown.join(", ")}` };
  }

  const progress = emptyProgress();
  let total = 0;
  for (const kind of PROGRESS_KINDS) {
    if (body[kind] === undefined) continue;
    const items = body[kind];
    if (!Array.isArray(items)) return { error: `${kind} must be an array` };
    for (const item of items) {
      if (typeof item !== "string" || item.length === 0 || item.length > MAX_ITEM_LENGTH) {
        return { error: `${kind} items must be non-empty strings of at most ${MAX_ITEM_LENGTH} characters` };
      }
      if (ITEM_PATTERNS[kind] && !ITEM_PATTERNS[kind].test(item)) {
        return { error: `${kind} items must be word ids` };
      }
    }
    total += items.length;
    progress[kind] = [...new Set(items)];
  }
  if (total > MAX_ITEMS_PER_REQUEST) {
    return { error: `At most ${MAX_ITEMS_PER_REQUEST} items per request` };
  }
  return { progress };
}

export function createPgProgressStore(pool) {
  async function get(sub) {
    const { rows } = await pool.query(
      `SELECT kind, item_id FROM user_progress WHERE auth0_sub = $1 ORDER BY created_at, item_id`,
      [sub]
    );
    const progress = emptyProgress();
    for (const { kind, item_id } of rows) progress[kind].push(item_id);
    return progress;
  }

  // Adds items (already-present ones are ignored) and returns the user's
  // full progress afterwards.
  async function add(sub, progress) {
    const kinds = [];
    const items = [];
    for (const kind of PROGRESS_KINDS) {
      for (const item of progress[kind] ?? []) {
        kinds.push(kind);
        items.push(item);
      }
    }
    if (items.length > 0) {
      await pool.query(
        `INSERT INTO user_progress (auth0_sub, kind, item_id)
         SELECT $1, kind, item_id FROM unnest($2::text[], $3::text[]) AS t(kind, item_id)
         ON CONFLICT DO NOTHING`,
        [sub, kinds, items]
      );
    }
    return get(sub);
  }

  return { get, add };
}
