<!-- harness-planning-rollup tier=session id=8.2.2 consolidatedAt=2026-03-24T22:18:02.782Z -->

# Consolidated planning: session 8.2.2

## Session 8.2.2 (parent)

## Goal

Add a stricter auth-route limiter (10 req/15 min per IP) for `/api/v1/internal/auth/*`. Wire to a placeholder path until Feature 7 (Authentication) adds login routes. Excess requests receive 429. General limiter (100 req/15 min) already done in Session 8.2.1.

## Files

- `server/src/middlewares/rateLimit.ts` — add `authRateLimiter` (10 req/15 min); re-export
- `server/src/routes/index.ts` — mount auth sub-router under `/internal/auth` with auth limiter
- `server/src/routes/internal/auth/` — placeholder auth router (e.g. GET returning stub) until Feature 7
- `server/docs/SECURITY_STUBS.md` — document auth-route limiter and verification steps

## Approach

Create `authRateLimiter` in `rateLimit.ts` with `max: 10`, same `windowMs` and headers as general limiter. Add `AuthRouter` under `routes/internal/auth/` with a placeholder route (e.g. GET `/` returning 501 or stub message). In `routes/index.ts`, add `v1Router.use("/internal/auth", authRateLimiter, AuthRouter)` before the general internal router so auth gets the stricter limit. Update SECURITY_STUBS.md with auth-route section and curl verification. Follow governance: explicit return types, no silent error swallowing.

## Checkpoint

- Auth limiter (10 req/15 min) active on `/api/v1/internal/auth/*`
- Placeholder auth path returns stub; structure ready for Feature 7 login routes
- `curl` confirms auth route returns 429 after 10 requests; SECURITY_STUBS.md updated

---

## Task 8.2.2.1 (source: task-8.2.2.1-planning.md)

### Goal

Create authRateLimiter (10 req/15 min per IP), a placeholder AuthRouter, and mount under `/api/v1/internal/auth/*`. Excess requests receive 429. Structure ready for Feature 7 login routes.

### Files

- `server/src/middlewares/rateLimit.ts` — add `authRateLimiter` (10 req/15 min); re-export
- `server/src/routes/internal/auth/authRouter.ts` — new: placeholder router (GET `/` returns stub)
- `server/src/routes/index.ts` — mount auth path with auth limiter before general internal routes

### Approach

1. In `rateLimit.ts`: add `authRateLimiter` with `max: 10`, same `windowMs` (15 min), `standardHeaders`, `legacyHeaders`, and message as `generalRateLimiter`.
2. Create `server/src/routes/internal/auth/authRouter.ts`: Router with GET `/` returning 501 or `{ message: 'Auth routes coming in Feature 7' }`.
3. In `routes/index.ts`: add `v1Router.use("/internal/auth", authRateLimiter, AuthRouter)` — order matters: auth path must be registered before the catch-all `/internal` so `/internal/auth/*` gets the stricter limit. Current structure: `v1Router.use("/internal", generalRateLimiter, InternalRouter)` — we need `/internal/auth` mounted first with its own limiter.
4. Export AuthRouter from internal auth; import in routes/index.ts.

### Checkpoint

- Auth limiter active on `/api/v1/internal/auth/*`; 11th request returns 429
- Placeholder GET `/api/v1/internal/auth` or `/api/v1/internal/auth/` returns stub response

---

## Task 8.2.2.2 (source: task-8.2.2.2-planning.md)

### Goal

Confirm auth-route limiter returns 429 after 10 requests; update SECURITY_STUBS.md with auth-route section and curl verification. Task 8.2.2.1 delivered the limiter and placeholder router.

### Files

- `server/docs/SECURITY_STUBS.md` — add auth-route limiter section, update "will be added" to "added", add curl verification for `/api/v1/internal/auth`

### Approach

1. Update SECURITY_STUBS.md: change "Auth-route limiter: Stricter limit... will be added in Session 8.2.2" to "Auth-route limiter: 10 req/15 min on `/api/v1/internal/auth/*`. Placeholder route returns 501 until Feature 7."
2. Add "Auth-route verification" subsection with curl examples: send 11 requests to `/api/v1/internal/auth`; 11th returns 429 with Retry-After.
3. Optionally run curl once to verify locally before committing.

### Checkpoint

- SECURITY_STUBS.md documents auth-route limiter and verification
- Manual curl (if run) confirms 429 after 10 requests on auth path

---
