# Auth0 Integration Plan

Scope decided: Auth0 gates login on web + native, and the backend gets a
protected, per-user progress-sync API (not just a login wall). Quiz/puzzle
progress moves from `localStorage` to a real per-user store once this lands.

## Status

- [x] `apps/backend` migrated from plain `http` to Express (behavior-preserving)
- [x] Auth0 tenant / API / applications created
- [ ] Backend: JWT verification + `/v1/progress` endpoints + Postgres store
- [ ] Web: `@auth0/nextjs-auth0` integration
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

## 4. Web (`apps/web`): `@auth0/nextjs-auth0`

- Add `middleware.ts` for the SDK's auth routes; wrap the root layout in
  its provider.
- Env vars in `.env.local` (git-ignored): `AUTH0_SECRET`, `AUTH0_BASE_URL`,
  `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`,
  `AUTH0_AUDIENCE`, `AUTH0_SCOPE`.
- Add login/logout links. `/progress` requires a session and calls the
  backend's `/v1/progress` with the SDK's access token as
  `Authorization: Bearer`.

## 5. Native (`apps/native`): `expo-auth-session`

- Use `expo-auth-session` + `expo-web-browser` (not `react-native-auth0`)
  so login keeps working in Expo Go, matching the current dev workflow —
  no custom dev client required.
- Store the token with `expo-secure-store`; attach it to progress calls
  from `dataLoader.ts` (or a new `progress.ts`).

## 6. Testing & deployment

- Unit-test the Express auth middleware (missing/invalid token → 401)
  alongside the existing Vitest suite.
- On Heroku: set `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_SECRET`,
  attach the Postgres addon, and update the Auth0 application's allowed
  URLs to include the Heroku domain.

## Note: `.env` files

CLAUDE.md currently states no `.env` files exist in the repo. This plan
requires them (`.env.local` for web, `.env` for backend) since Auth0
secrets can't be hardcoded or passed as public runtime vars. Update
CLAUDE.md's conventions section once this lands, and confirm `.gitignore`
covers `.env*`.
