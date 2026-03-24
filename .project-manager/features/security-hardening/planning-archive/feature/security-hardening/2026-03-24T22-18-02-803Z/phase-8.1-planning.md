<!-- harness-planning-rollup tier=phase id=8.1 consolidatedAt=2026-03-24T22:18:02.792Z -->

# Consolidated planning: phase 8.1

## Phase 8.1 (parent)

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

## Session 8.1.1 (source: session-8.1.1-planning.md)

### Goal

Replace the current wide-open CORS config with origin restriction. Add `CORS_ORIGIN` env var, pass `{ origin }` to `cors()`, set `http://localhost:3002` in dev, Render URL in production. Requests from unlisted origins must be rejected.

### Files

- `server/src/app.ts` — where `cors()` is currently called; add `{ origin: corsOrigin }` from env
- `server/src/config/envConfig.ts` — add `CORS_ORIGIN` to env schema and validated config; parse comma-separated origins if multiple
- `server/.env.example` — document `CORS_ORIGIN` with example values for dev and production

### Approach

Add `CORS_ORIGIN` to the env validation (Joi schema in envConfig). Support a single origin or comma-separated list (e.g. `http://localhost:3002,https://app.example.onrender.com`). Pass the resolved origin(s) to `cors({ origin })`. In dev, use `http://localhost:3002` (Vite dev server). In production, use the Render static site URL. Explicit return types, no silent fallbacks.

### Checkpoint

- CORS rejects requests from origins not in the allowlist (verify with `curl -H "Origin: https://evil.com"`)
- Dev: `http://localhost:3002` accepted; Vue app can call API
- Production: Render static site origin accepted; other origins rejected
- `.env.example` documents `CORS_ORIGIN`

---

---

## Session 8.1.2 (source: session-8.1.2-planning.md)

### Goal

Verify CORS rejects disallowed origins in dev and production; polish `.env.example` documentation for `CORS_ORIGIN` with clear examples for dev and production.

### Files

- `server/.env.example` — expand CORS_ORIGIN documentation with dev/production examples
- `server/src/app.ts` — reference only (CORS wiring done in 8.1.1)
- `server/src/config/envConfig.ts` — reference only (env schema done in 8.1.1)

### Approach

Run curl tests to confirm disallowed origins receive CORS rejection and allowed origins succeed. Expand `.env.example` CORS_ORIGIN section with commented examples for localhost (dev) and Render URL (production). Document comma-separated format if multiple origins are needed.

### Checkpoint

- `curl -H "Origin: https://evil.com"` to API returns CORS error or no Access-Control-Allow-Origin
- `curl -H "Origin: http://localhost:3002"` (or configured origin) succeeds
- `.env.example` has clear CORS_ORIGIN examples for dev and production

---

---
