<!-- harness-planning-rollup tier=phase id=8.2 consolidatedAt=2026-03-24T22:18:02.794Z -->

# Consolidated planning: phase 8.2

## Phase 8.2 (parent)

## Goal

Add inbound HTTP rate limiting to protect the API from abuse: general limiter on `/api/v1/internal/*` (100 req/15 min), stricter limiter for auth routes when they exist (10 req/15 min). Excess requests receive 429. Auth-route limiter can be wired to a placeholder path until Feature 7 (Authentication) adds actual login routes.

## Files

- `server/package.json` — add `express-rate-limit` dependency
- `server/src/app.ts` — mount rate limiters before route handlers
- `server/src/routes/index.ts` — route tree; identify internal vs auth route mounts
- `server/src/middlewares/` — new rate limiter middleware (or inline in app.ts)
- `server/docs/SECURITY_STUBS.md` — document rate limiting behavior

## Approach

Install `express-rate-limit`, create a general limiter (100 req/15 min per IP) and a stricter auth limiter (10 req/15 min). Apply general limiter to all `/api/v1/internal/*` routes. Wire auth limiter to `/api/v1/internal/auth/*` or a placeholder path; when Feature 7 adds login routes, they inherit it. Use `windowMs` and `max` options. Return 429 with `Retry-After` when limit exceeded. Follow governance: explicit return types, no silent error swallowing.

## Checkpoint

- General limiter active on internal API; excess requests return 429
- Auth-route limiter wired (placeholder or real); structure ready for Feature 7
- `curl` or manual test confirms rate limit behavior

---

## Session 8.2.1 (source: session-8.2.1-planning.md)

### Goal

Add general inbound rate limiting (100 req/15 min per IP) to `/api/v1/internal/*` routes. Excess requests receive 429 with Retry-After. Auth-route limiter is Session 8.2.2.

### Files

- `server/package.json` — add `express-rate-limit` dependency
- `server/src/app.ts` — create and mount general limiter before internal routes
- `server/docs/SECURITY_STUBS.md` — document rate limiting behavior

### Approach

Install `express-rate-limit`; create a limiter with `windowMs: 15 * 60 * 1000`, `max: 100`; enable `standardHeaders` and `legacyHeaders` for RateLimit-* and Retry-After. Mount limiter on the path prefix `/api/v1/internal` (or wherever internal routes are mounted). Follow governance: explicit return types, no silent error swallowing.

### Checkpoint

- General limiter active; excess requests return 429 with Retry-After
- Documentation updated in SECURITY_STUBS.md
- Manual curl or script confirms rate limit behavior

---

---

## Session 8.2.2 (source: session-8.2.2-planning.md)

### Goal

Add a stricter auth-route limiter (10 req/15 min per IP) for `/api/v1/internal/auth/*`. Wire to a placeholder path until Feature 7 (Authentication) adds login routes. Excess requests receive 429. General limiter (100 req/15 min) already done in Session 8.2.1.

### Files

- `server/src/middlewares/rateLimit.ts` — add `authRateLimiter` (10 req/15 min); re-export
- `server/src/routes/index.ts` — mount auth sub-router under `/internal/auth` with auth limiter
- `server/src/routes/internal/auth/` — placeholder auth router (e.g. GET returning stub) until Feature 7
- `server/docs/SECURITY_STUBS.md` — document auth-route limiter and verification steps

### Approach

Create `authRateLimiter` in `rateLimit.ts` with `max: 10`, same `windowMs` and headers as general limiter. Add `AuthRouter` under `routes/internal/auth/` with a placeholder route (e.g. GET `/` returning 501 or stub message). In `routes/index.ts`, add `v1Router.use("/internal/auth", authRateLimiter, AuthRouter)` before the general internal router so auth gets the stricter limit. Update SECURITY_STUBS.md with auth-route section and curl verification. Follow governance: explicit return types, no silent error swallowing.

### Checkpoint

- Auth limiter (10 req/15 min) active on `/api/v1/internal/auth/*`
- Placeholder auth path returns stub; structure ready for Feature 7 login routes
- `curl` confirms auth route returns 429 after 10 requests; SECURITY_STUBS.md updated

---

---
