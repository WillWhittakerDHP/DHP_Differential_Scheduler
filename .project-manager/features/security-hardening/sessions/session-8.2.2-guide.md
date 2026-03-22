# Session 8.2.2 Guide: Auth-route limiter and verification

**Phase:** 8.2 — Inbound Rate Limiting
**Session:** 8.2.2 — Auth-route limiter and verification
**Status:** In Progress
**Branch:** `session-8.2.2`

---

## Quick Start

**Session ID:** 8.2.2
**Session Name:** Auth-route limiter and verification
**Description:** Add stricter limiter (10 req/15 min) for auth routes; wire to placeholder or real path; document in SECURITY_STUBS.

---

## Session Overview

Add a stricter rate limiter for auth/login routes to protect against credential stuffing and brute force. The auth limiter applies 10 requests per 15 minutes per IP. Wired to `/api/v1/internal/auth/*` placeholder until Feature 7 adds login routes. Session 8.2.1 delivered the general limiter (100 req/15 min) on all internal routes.

---

## Key Context

- **server/src/middlewares/rateLimit.ts** — Add authRateLimiter (10 req/15 min)
- **server/src/routes/index.ts** — Mount auth sub-router with auth limiter
- **server/src/routes/internal/auth/** — Placeholder auth router for Feature 7
- **express-rate-limit** — Already installed; reuse pattern from generalRateLimiter

---

## Tasks

### Task 8.2.2.1: Auth limiter config and mount

**Goal:** Create authRateLimiter (10 req/15 min), placeholder AuthRouter, mount under /internal/auth.

**Files:**
- `server/src/middlewares/rateLimit.ts` — add authRateLimiter
- `server/src/routes/internal/auth/authRouter.ts` — placeholder router (GET returns stub)
- `server/src/routes/index.ts` — mount auth path with auth limiter

**Checkpoint:** Auth limiter active on /api/v1/internal/auth/*; excess requests return 429.

### Task 8.2.2.2: Verify and document

**Goal:** Confirm 429 after 10 requests on auth path; update SECURITY_STUBS.md.

**Files:**
- `server/docs/SECURITY_STUBS.md` — auth-route limiter section and curl verification

**Checkpoint:** Manual curl confirms rate limit; documentation updated.

---

## Related Documents

- Phase Guide: `../phases/phase-8.2-guide.md`
- Feature Guide: `../feature-security-hardening-guide.md`
- Planning: `session-8.2.2-planning.md`

<!-- end excerpt session -->
