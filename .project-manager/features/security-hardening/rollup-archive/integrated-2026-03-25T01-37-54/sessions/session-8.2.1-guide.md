# Session 8.2.1 Guide: General rate limiter for internal API routes

**Phase:** 8.2 — Inbound Rate Limiting
**Session:** 8.2.1 — General rate limiter for internal API routes
**Status:** In Progress
**Branch:** `session-8.2.1`

---

## Quick Start

**Session ID:** 8.2.1
**Session Name:** General rate limiter for internal API routes
**Description:** Install express-rate-limit, create general limiter (100 req/15 min per IP), mount on `/api/v1/internal/*`. Verify 429 response when limit exceeded.

---

## Session Overview

Add inbound HTTP rate limiting to protect the internal API from abuse. The general limiter applies 100 requests per 15 minutes per IP to all internal routes. Auth routes (when they exist) will get a stricter limiter in Session 8.2.2.

---

## Key Context

- **server/src/app.ts** — Mount rate limiter middleware before route handlers
- **server/src/routes/index.ts** — Route tree; internal routes under `/api/v1/internal/*`
- **express-rate-limit** — npm package; `windowMs`, `max`, `standardHeaders`, `legacyHeaders` options

---

## Tasks

### Task 8.2.1.1: Add express-rate-limit and create general limiter

**Goal:** Install express-rate-limit, create a limiter (100 req/15 min per IP), mount on internal API routes.

**Files:**
- `server/package.json` — add express-rate-limit dependency
- `server/src/app.ts` — create and mount limiter before internal routes
- Optional: `server/src/middlewares/rateLimit.ts` — if extracting to a middleware file

**Checkpoint:** General limiter active; excess requests return 429 with Retry-After header.

### Task 8.2.1.2: Verify rate limit behavior

**Goal:** Confirm 429 response when limit exceeded; document in SECURITY_STUBS.md.

**Files:**
- `server/docs/SECURITY_STUBS.md` — document inbound rate limiting

**Checkpoint:** Manual curl or script confirms rate limit; documentation updated.

---

## Related Documents

- Phase Guide: `../phases/phase-8.2-guide.md`
- Feature Guide: `../feature-security-hardening-guide.md`

<!-- end excerpt session -->