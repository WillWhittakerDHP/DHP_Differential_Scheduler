<!-- harness-planning-rollup tier=session id=8.1.1 consolidatedAt=2026-03-24T22:18:02.778Z -->

# Consolidated planning: session 8.1.1

## Session 8.1.1 (parent)

## Goal

Replace the current wide-open CORS config with origin restriction. Add `CORS_ORIGIN` env var, pass `{ origin }` to `cors()`, set `http://localhost:3002` in dev, Render URL in production. Requests from unlisted origins must be rejected.

## Files

- `server/src/app.ts` — where `cors()` is currently called; add `{ origin: corsOrigin }` from env
- `server/src/config/envConfig.ts` — add `CORS_ORIGIN` to env schema and validated config; parse comma-separated origins if multiple
- `server/.env.example` — document `CORS_ORIGIN` with example values for dev and production

## Approach

Add `CORS_ORIGIN` to the env validation (Joi schema in envConfig). Support a single origin or comma-separated list (e.g. `http://localhost:3002,https://app.example.onrender.com`). Pass the resolved origin(s) to `cors({ origin })`. In dev, use `http://localhost:3002` (Vite dev server). In production, use the Render static site URL. Explicit return types, no silent fallbacks.

## Checkpoint

- CORS rejects requests from origins not in the allowlist (verify with `curl -H "Origin: https://evil.com"`)
- Dev: `http://localhost:3002` accepted; Vue app can call API
- Production: Render static site origin accepted; other origins rejected
- `.env.example` documents `CORS_ORIGIN`

---

## Task 8.1.1.1 (source: task-8.1.1.1-planning.md)

### Goal

Add `CORS_ORIGIN` to the env validation (Joi schema) and export it from `envConfig`. Support a single origin or comma-separated list. The value will be consumed by `app.ts` in the next task.

### Files

- `server/src/config/envConfig.ts` — add CORS_ORIGIN to Joi schema, EnvConfig interface, and validated config; parse comma-separated into string or array for cors() consumption

### Approach

1. Add `CORS_ORIGIN: Joi.string().required()` to the Joi schema (or `.default('http://localhost:3002')` for dev if we allow optional in dev — session says required).
2. Add `CORS_ORIGIN: string` to `EnvConfig` interface.
3. Export a helper or the raw value: cors expects `origin: string | string[] | ((origin, cb) => void)`. For comma-separated, split and trim to produce `string[]`; for single, pass as `string`.
4. Explicit return types per function governance. No silent fallbacks.

### Checkpoint

- `envConfig.CORS_ORIGIN` is available and typed
- Server starts successfully with `CORS_ORIGIN` set in env
- Comma-separated origins parse correctly
---

---

## Task 8.1.1.2 (source: task-8.1.1.2-planning.md)

### Goal

Replace the wide-open `cors()` call with `cors({ origin: getCorsOrigin() })` so requests from unlisted origins are rejected.

### Files

- `server/src/app.ts` — import getCorsOrigin from envConfig; replace app.use(cors()) with app.use(cors({ origin: getCorsOrigin() }))

### Approach

1. Import `getCorsOrigin` from `./config/envConfig.js`.
2. Replace `app.use(cors())` with `app.use(cors({ origin: getCorsOrigin() }))`.
3. No other changes. The getCorsOrigin() helper (from Task 8.1.1.1) returns string or string[] for cors() consumption.

### Checkpoint

- CORS middleware uses origin restriction
- Server starts successfully
- Requests from unlisted origins (e.g. curl -H "Origin: https://evil.com") return CORS error or are rejected
---

---
