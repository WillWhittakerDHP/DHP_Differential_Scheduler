<!-- harness-planning-rollup tier=session id=8.2.1 consolidatedAt=2026-03-24T22:18:02.781Z -->

# Consolidated planning: session 8.2.1

## Session 8.2.1 (parent)

## Goal

Add general inbound rate limiting (100 req/15 min per IP) to `/api/v1/internal/*` routes. Excess requests receive 429 with Retry-After. Auth-route limiter is Session 8.2.2.

## Files

- `server/package.json` — add `express-rate-limit` dependency
- `server/src/app.ts` — create and mount general limiter before internal routes
- `server/docs/SECURITY_STUBS.md` — document rate limiting behavior

## Approach

Install `express-rate-limit`; create a limiter with `windowMs: 15 * 60 * 1000`, `max: 100`; enable `standardHeaders` and `legacyHeaders` for RateLimit-* and Retry-After. Mount limiter on the path prefix `/api/v1/internal` (or wherever internal routes are mounted). Follow governance: explicit return types, no silent error swallowing.

## Checkpoint

- General limiter active; excess requests return 429 with Retry-After
- Documentation updated in SECURITY_STUBS.md
- Manual curl or script confirms rate limit behavior

---

## Task 8.2.1.1 (source: task-8.2.1.1-planning.md)

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

## Task 8.2.1.2 (source: task-8.2.1.2-planning.md)

### Goal

Verify rate limit behavior: confirm 429 when limit exceeded; add verification instructions to SECURITY_STUBS.md.

### Files

- `server/docs/SECURITY_STUBS.md` — add "How to verify" section with curl example

### Approach

Add a "How to verify" subsection under the rate limiting section with a curl loop that exhausts the limit (101 requests) and shows 429 + Retry-After. No code changes to rateLimit.ts or routes. Optionally run the verification once to confirm.

### Checkpoint

- Verification instructions documented in SECURITY_STUBS.md
- 429 and Retry-After confirmed (manual or documented curl)

---
