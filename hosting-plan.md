# Hosting plan (draft, 2026-11-17)

Set up production hosting for Rimanashun instead of Heroku.

**Status (2026-11-18):** web deployed on Vercel (project root `apps/web`); CNAME `rimanashun` → `rimanashun.vercel.app` added at Squarespace; Heroku `Procfile` and scripts removed. Supabase project created (region AWS us-west-2, Session pooler; connection string in git-ignored `apps/backend/.env.supabase`), migrated (0001–0006) and bootstrapped; an export from it is byte-identical to `packages/shared/data`. API on Render free (Oregon), `https://rimanashun.onrender.com`; Vercel's `NEXT_PUBLIC_API_URL` points to it (a Config variable, not Sensitive: the browser needs it). Not done: deleting the Heroku app, `api.rimanashun` custom domain (optional), backups of `user_progress`, CI. Done: Auth0 production URLs (login verified on rimanashun.logicielsmm.com).

**Decision (2026-11-17): try Supabase for Postgres.** Host for the API and the web still to choose (see options below).

## What needs hosting
- **API** (`apps/backend`, Express): long-running Node 20 server, `npm start`, reads `DATABASE_URL`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`.
- **Postgres**: run `db:migrate` then `db:bootstrap` once on the new database. `user_progress` holds user data, so it needs backups.
- **Web** (`apps/web`, Next.js 15): needs a server (the Auth0 v4 SDK keeps a client secret), so no static hosting.
- **Native** (Expo): uses the same API, so cold starts hurt (first screen waits 30–60 s).

## Options (approximate prices from memory; verify before signing up)

| Option | Cost / month | Notes |
| :--- | :--- | :--- |
| Heroku Eco dyno + Essential-0 Postgres | ~US$10 (~$12 with Basic) | Eco sleeps after 30 min. `Procfile` already targets Heroku. |
| Railway Hobby: API + Postgres | ~US$5 (includes $5 usage) | Always on, deploys from GitHub. Best value once real users start. |
| Render free API + Neon free Postgres | $0 | Render sleeps after 15 min; Neon free = 0.5 GB, wakes in < 1 s. |
| Fly.io + Neon | ~US$2–5 | More setup (Docker/CLI). |
| **Supabase free Postgres (chosen to try)** | $0 | Pauses after 1 week inactive; Pro ~US$25/month. |
| Vercel Hobby for the web | $0 | Non-commercial only; Pro is US$20/month. |

## Recommendation
1. **While building:** Supabase (Postgres) + Render (API) + Vercel (web) = $0, cold starts accepted. Neon is the fallback if Supabase's weekly pause gets in the way.
2. **When real users start:** move the API to Railway (~US$5) or Render always-on (~US$7); move Supabase to Pro (~US$25) or the database to a cheaper always-on host (Neon, Railway).

## Supabase plan (Postgres)
Points to check when setting it up (from memory; verify on supabase.com):
- **Free plan:** about 500 MB database; the project **pauses after 1 week with no activity** (restore it from the dashboard). Fine for building and testing; for real users, the Pro plan (~US$25/month) or a keep-alive is needed.
- **Backups:** the free plan has no downloadable daily backups. Keep `db:export` (content) and plan a `pg_dump` of `user_progress` until on a paid plan.
- **Connection string:** Project settings → Database → Connect. The direct connection (`db.<ref>.supabase.co:5432`) is IPv6 only on the free plan; hosts like Render and Vercel need the **pooler** string (Supavisor, `...pooler.supabase.com`). Use **session mode (port 5432)** for the long-running Express API; transaction mode (6543) only for serverless.
- **SSL:** required. No code change: append `?sslmode=require&uselibpqcompat=true` to the pooler string (libpq meaning: encrypted, certificate not verified). Plain `sslmode=require` in `pg` 8 means verify-full, which fails against Supabase's own CA. To also verify the server, download Supabase's CA certificate (Database settings → SSL) and use `sslmode=verify-full&sslrootcert=<path>`.
- **Setup:** set `DATABASE_URL` in `apps/backend/.env` to the Supabase string, then `npm run db:migrate` and `npm run db:bootstrap` (from `apps/backend`). Run the backend tests against a local database, not Supabase (the `-pg` tests create and drop databases).
- **Keep Auth0** for login. Supabase Auth, Row Level Security and its auto-generated REST API are not needed: the Express API stays the only way to reach the database. Don't expose the Supabase `service_role` key anywhere.
- Region: pick one close to Montreal (e.g. Canada Central or US East).

## Steps for next session
1. Create the Supabase project; copy the session-pooler connection string.
2. Migrate and bootstrap the Supabase database (SSL options in the URL).
3. Choose and set up the API host (Render free to start), with `DATABASE_URL`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`.
4. Deploy the web to Vercel with its Auth0 variables and `NEXT_PUBLIC_API_URL`.
5. DNS at Squarespace Domains: `rimanashun` and `api.rimanashun` CNAMEs on logicielsmm.com.
6. Auth0 dashboard URLs. Delete the Heroku app (and its Postgres addon) in the Heroku dashboard, and `git remote remove heroku`.

## Domains
Reuse the company domain `logicielsmm.com` (DNS at Squarespace Domains, same as `marcomaigua.logicielsmm.com`):
- `rimanashun.logicielsmm.com` → Vercel (web)
- `api.rimanashun.logicielsmm.com` → the API

## Code / config changes needed
- SSL: set through `DATABASE_URL` (see Supabase plan), no code change; `db.js` and the db scripts all read it.
- Set `NEXT_PUBLIC_API_URL` (web) and `EXPO_PUBLIC_API_URL` (native) to the API address.
- Web env vars on the host: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL`, `AUTH0_AUDIENCE`.
- Auth0 dashboard: add the new web address to allowed callback, logout and web origin URLs.
- CORS on the API if it restricts origins.

## Open questions for Marco
- Will Rimanashun charge money (affects Vercel Hobby)?
- Is a cold start acceptable for testers now?
- Backups: which plan's backups are enough for `user_progress`?
