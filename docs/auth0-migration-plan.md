# Auth0 Integration Plan

Scope decided: Auth0 gates login on web + native, and the backend gets a
protected, per-user progress-sync API (not just a login wall). Quiz/puzzle
progress moves from `localStorage` to a real per-user store once this lands.

## Status

- [x] `apps/backend` migrated from plain `http` to Express (behavior-preserving)
- [x] Auth0 tenant / API / applications created
- [x] Backend: JWT verification + protected `GET /v1/me`
- [x] Backend: `/v1/progress` endpoints + Postgres store (`user_progress` table, migration 0002)
- [x] Web: `@auth0/nextjs-auth0` login/logout
- [x] Web: sync progress to the account with the access token (`ProgressSync.tsx` / `lib/progressSync.ts`)
- [ ] Web: confirm the sync by hand with a real login (see step 3)
- [ ] Native: `expo-auth-session` integration
- [ ] Deployment: Heroku env vars + Postgres addon + Auth0 allowed URLs

## 1. Express migration (done)

`apps/backend/src/server.js` was rewritten on top of Express 5. Routes are
1:1 with the original plain-`http` server — same paths, same JSON payloads,
same request logging, same `Access-Control-Allow-Origin: *` header, same 404
fallback shape (`{ error: "Not Found" }`). No behavior change; this step only
exists so protected routes can use standard Express JWT middleware
(`express-oauth2-jwt-bearer`) instead of hand-rolled verification.

Routes ported: `GET /health`, `GET /v1/vocabulary`, `GET /v1/puzzles`,
`GET /v1/categories`, `GET /v1/vocabulary/by-category`. All remain
unauthenticated.

`express`, `express-oauth2-jwt-bearer`, and `pg` are already listed in
`apps/backend/package.json` for the steps below.

## 2. Auth0 dashboard setup (manual, one-time)

1. **API** (Applications → APIs): identifier e.g. `https://api.rimanashun.app`
   (this is the "audience"), signing algorithm RS256. Add scopes
   `read:progress`, `write:progress`.
2. **Application — "Rimanashun Web"**, type *Regular Web Application*:
   - Callback URLs: `http://localhost:3000/auth/callback` + prod (Heroku) URL
   - Logout URLs: `http://localhost:3000` + prod URL
   - Web Origins: `http://localhost:3000` + prod URL
   - Record: Domain, Client ID, Client Secret
3. **Application — "Rimanashun Native"**, type *Native*:
   - Callback/Logout URLs: whatever `expo-auth-session`'s
     `makeRedirectUri()` produces for the app's scheme
   - Record: Domain, Client ID (no secret — PKCE public client)

## 3. Backend: protected progress API

Token verification is done: `apps/backend/src/auth.js` wraps
`express-oauth2-jwt-bearer`, and `GET /v1/me` is the first protected route.
If `AUTH0_DOMAIN`/`AUTH0_AUDIENCE` are unset, protected routes return 503 and
public routes keep working. Progress is done (2026-11-14):

- `GET /v1/progress` returns `{ learnedWords, learnedPuzzles, completedLessons }`.
- `POST /v1/progress` adds items (union; it never removes) and returns the
  full progress. This differs from the original `PUT` idea on purpose:
  progress only grows, so an add-only API makes merging a browser's offline
  progress safe and lets two tabs/devices write at once without overwriting
  each other.
- Table `user_progress (auth0_sub, kind, item_id)`, one row per item.
- Tests: `progress.test.js` (routes) and `progress-pg.test.js` (SQL).

**Manual check with a real login:** restart the backend (`npm run backend`
doesn't reload), log in on the web app, answer a quiz question, then run
`SELECT kind, item_id FROM user_progress;` in the dev database: the row
should be there under your Auth0 `sub`. Log in from another browser and the
progress should appear there too.

Original design notes:

- Add `express-oauth2-jwt-bearer` middleware (`issuerBaseURL`, `audience`)
  on new routes only — existing content routes stay public.
- New routes: `GET /v1/progress`, `PUT /v1/progress`. User identity always
  comes from the verified token's `req.auth.payload.sub`, never from a
  client-supplied ID.
- Storage: Heroku Postgres (mini/free tier). A plain-file or SQLite store
  won't survive Heroku's ephemeral filesystem. One `progress` table keyed
  by `auth0_sub`, queried directly with `pg` (no ORM needed for one table).
- New env vars: `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `DATABASE_URL` (set
  automatically once the Postgres addon is attached on Heroku).

## 4. Web (`apps/web`): `@auth0/nextjs-auth0` v4

Login/logout is done:

- `src/lib/auth0.ts` creates the `Auth0Client`, passing only the API
  audience; everything else the SDK reads from the environment itself.
  Login is optional: logged-out users get no error.
- `src/middleware.ts` runs `auth0.middleware()`, which serves the
  `/auth/login`, `/auth/logout` and `/auth/callback` routes and keeps
  sessions fresh. It doesn't protect any page.
- `src/components/AuthControls.tsx` shows Log in / Log out (and the user's
  name) in the header, via `useUser()`.

Env vars in `apps/web/.env.local` (git-ignored). These are the v4 names;
the v3 names `AUTH0_BASE_URL` and `AUTH0_ISSUER_BASE_URL` are not read.

| Variable | Read by | Value |
|---|---|---|
| `AUTH0_DOMAIN` | SDK | tenant domain, no `https://` |
| `AUTH0_CLIENT_ID` | SDK | "Rimanashun Web" Client ID |
| `AUTH0_CLIENT_SECRET` | SDK | "Rimanashun Web" Client Secret |
| `AUTH0_SECRET` | SDK | random 32-byte hex, encrypts the session cookie (`openssl rand -hex 32`) |
| `APP_BASE_URL` | SDK | `http://localhost:3000` locally, the Heroku URL in prod |
| `AUTH0_AUDIENCE` | `auth0.ts` | API identifier, same value as in `apps/backend/.env` |

Progress sync (done): `components/ProgressSync.tsx`, mounted in `Providers`,
gets the access token in the browser with the SDK's client
`getAccessToken()` (served by the middleware at `/auth/access-token`) and
calls `/v1/progress` directly with `Authorization: Bearer`. Progress only counts
toward an account while logged in: logged-out progress stays in the
browser's localStorage and is discarded on login (never uploaded); on
logout the account's progress is removed from the browser. Rules in
`lib/progressSync.ts`.

## 5. Native (`apps/native`): `expo-auth-session`

- Use `expo-auth-session` + `expo-web-browser` (not `react-native-auth0`)
  so login keeps working in Expo Go, matching the current dev workflow —
  no custom dev client required.
- Store the token with `expo-secure-store`; attach it to progress calls
  from `dataLoader.ts` (or a new `progress.ts`).

## 6. Testing & deployment

- Express auth middleware tests live in `apps/backend/src/__tests__/auth.test.js`
  (missing/invalid token → 401), run with `node --test`.
- On Heroku: set the backend's `AUTH0_DOMAIN`/`AUTH0_AUDIENCE` and the web
  app's six variables from step 4 (with `APP_BASE_URL` set to the Heroku URL),
  attach the Postgres addon, and update the Auth0 application's allowed
  URLs to include the Heroku domain.

## Note: `.env` files

`apps/backend/.env` and `apps/web/.env.local` hold the Auth0 values; both
are git-ignored (`.env*` in `.gitignore`, `.env.example` excepted). Secrets
can't be hardcoded or passed as public runtime vars.
