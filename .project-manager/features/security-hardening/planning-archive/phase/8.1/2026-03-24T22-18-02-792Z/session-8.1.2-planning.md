<!-- harness-planning-rollup tier=session id=8.1.2 consolidatedAt=2026-03-24T22:18:02.780Z -->

# Consolidated planning: session 8.1.2

## Session 8.1.2 (parent)

## Goal

Verify CORS rejects disallowed origins in dev and production; polish `.env.example` documentation for `CORS_ORIGIN` with clear examples for dev and production.

## Files

- `server/.env.example` — expand CORS_ORIGIN documentation with dev/production examples
- `server/src/app.ts` — reference only (CORS wiring done in 8.1.1)
- `server/src/config/envConfig.ts` — reference only (env schema done in 8.1.1)

## Approach

Run curl tests to confirm disallowed origins receive CORS rejection and allowed origins succeed. Expand `.env.example` CORS_ORIGIN section with commented examples for localhost (dev) and Render URL (production). Document comma-separated format if multiple origins are needed.

## Checkpoint

- `curl -H "Origin: https://evil.com"` to API returns CORS error or no Access-Control-Allow-Origin
- `curl -H "Origin: http://localhost:3002"` (or configured origin) succeeds
- `.env.example` has clear CORS_ORIGIN examples for dev and production

---

## Task 8.1.2.2 (source: task-8.1.2.2-planning.md)

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

## Task 8.1.2.1 (source: task-8.1.2.1-planning.md)

### Goal

Verify CORS rejects requests from disallowed origins. Run curl with a disallowed Origin header and confirm the API returns CORS rejection (no Access-Control-Allow-Origin or CORS error). Run curl with an allowed origin and confirm success.

### Files

- No code changes. API endpoint (server) for curl verification. Assume API runs on configured port (e.g. 3001).

### Approach

1. Ensure server is running with CORS_ORIGIN set (e.g. `http://localhost:3002`).
2. Run `curl -i -H "Origin: https://evil.com" http://localhost:3001/api/v1/...` (or health/status route). Verify response has no `Access-Control-Allow-Origin` header (or CORS error).
3. Run `curl -i -H "Origin: http://localhost:3002" http://localhost:3001/...`. Verify response includes `Access-Control-Allow-Origin: http://localhost:3002` (or configured origin).

### Checkpoint

- Disallowed origin (`https://evil.com`) receives no Access-Control-Allow-Origin in response.
- Allowed origin (`http://localhost:3002`) receives Access-Control-Allow-Origin in response.
- Document verification steps in session log or as a manual checklist.

---
