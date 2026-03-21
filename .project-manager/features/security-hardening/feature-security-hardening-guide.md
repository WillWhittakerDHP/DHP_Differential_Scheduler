# Feature security-hardening Guide

**Purpose:** Feature-level guide for planning and tracking major initiatives

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** security-hardening
**Description:** CORS lockdown, rate limiting, request validation (Joi), secrets audit, security headers (Helmet), CSRF when using session-based auth. Protects API before external access.
**Status:** 📋 Planning

**Duration:** [To be determined]
**Started:** —
**Completed:** —

---

## Research Phase

Research phase not yet started — architectural decisions to be documented in this guide.

---

## Feature Objectives

- Lock down CORS to specific origins (Render static site URL, localhost for dev)
- Add API rate limiting for internal and auth routes
- Add request validation / input sanitization (Joi on all POST/PUT bodies)
- Audit environment variables and ensure no secrets in committed files
- Review security response headers (Helmet, CSP)
- Implement CSRF protection if using session-based auth
- Replace checkOwnership stub with real implementation

---

## Existing Infrastructure & Stubs

| What | File(s) | Status |
|------|---------|--------|
| Helmet (security headers) | `server/src/app.ts` | Installed (`^8.1.0`), applied globally via `app.use(helmet())`. **Default config only** — no custom CSP, HSTS tuning, or referrer policy. |
| CORS | `server/src/app.ts` | Installed (`^2.8.6`), applied globally via `app.use(cors())`. **Wide open** — no origin restriction. No `CORS_ORIGIN` env var exists. |
| Joi | `server/package.json` | Installed (`^18.0.2`). Used only in `envConfig.ts` for env-var validation — **not used for request body validation**. |
| Custom per-route validators | `*Validators.ts` files across most routers | Hand-written `ValidationResult`-based functions. **Not Joi schemas.** |
| CRUD router factory security wiring | `server/src/routes/helpers/createCrudRouter.ts` | `csrfProtection` on POST/PUT/PATCH/DELETE; `checkOwnership` on PUT/PATCH/DELETE. **All CRUD routers inherit this automatically.** |
| `csrfProtection` (stub) | `server/src/middlewares/security.ts` | Exported, wired into ~16 route files. Just calls `next()`. |
| `checkOwnership` (stub) | `server/src/middlewares/security.ts` | Exported, wired into ~7 route files. Just calls `next()`. |
| Outbound API rate limiter | `server/src/services/rateLimiter.ts`, `googleApiRateLimiter.ts` | Sliding-window limiter for **outbound** Google/MLS API calls. **Not** inbound HTTP rate limiting. |
| Error handler | `server/src/middlewares/errorHandler.ts` | Global handler hides stack traces in production. |
| Security stubs doc | `server/docs/SECURITY_STUBS.md` | Documents planned behavior for csrf, requireAuth, checkOwnership. |
| Route structure | `server/src/routes/index.ts` | Clean split: `/api/v1/internal/*` (admin/app CRUD) vs `/api/v1/external/*` (Google/MLS integrations). Rate limiting can target these separately. |

**What does NOT exist yet:** No `express-rate-limit` (inbound HTTP rate limiting), no CORS origin restriction, no Helmet production config (CSP, HSTS), no Joi request-body schemas, no real CSRF implementation, no real checkOwnership implementation, no comprehensive `.env.example`, no formal secrets audit.

**Key architectural note:** The CRUD router factory (`createCrudRouter`) already wires `csrfProtection` and `checkOwnership` into every CRUD resource. Replacing the stubs with real implementations in `security.ts` will activate them on all routes automatically — no route-file changes needed.

---

## Phases Breakdown

> **Steps 1–5 are independent of Feature 7** and can be done now. Steps 6–7 require working sessions/auth and align with Feature 7's Enactment phase.

- [ ] ### Phase 8.1: CORS Lockdown
**Description:** Add `CORS_ORIGIN` env var, pass `{ origin }` to `cors()`. Set `http://localhost:3002` in dev, Render URL in production.
**Dependencies:** None
**Success Criteria:** CORS origin restricted to known domains; requests from unlisted origins rejected.

- [ ] ### Phase 8.2: Inbound Rate Limiting
**Description:** Install `express-rate-limit`, apply general limiter to `/api/v1/internal/*` (100 req/15 min), stricter limiter for auth routes (10 req/15 min).
**Dependencies:** None
**Success Criteria:** Rate limiter active on internal and auth routes; excess requests receive 429 response.

- [ ] ### Phase 8.3: Helmet Production Config
**Description:** Add CSP, tighten HSTS, configure referrer policy. Verify Vue app still loads.
**Dependencies:** None
**Success Criteria:** Security headers configured for production; Vue frontend loads without CSP violations.

- [ ] ### Phase 8.4: Secrets Audit
**Description:** Scan committed files for hardcoded credentials; expand `.env.example` to document all expected env vars; verify `.gitignore` coverage.
**Dependencies:** None
**Success Criteria:** No secrets in committed files; `.env.example` documents all expected variables.

- [ ] ### Phase 8.5: Joi Request Body Validation
**Description:** Audit routes missing validation; add Joi schemas for unvalidated POST/PUT bodies. Optionally migrate existing custom validators to Joi over time.
**Dependencies:** None
**Success Criteria:** All POST/PUT endpoints have request body validation; invalid payloads rejected with 400 + descriptive errors.

- [ ] ### Phase 8.6: CSRF Real Implementation
**Description:** Replace `csrfProtection` stub with token validation (double-submit cookie or `csrf-csrf`). Existing route wiring stays.
**Dependencies:** Feature 7 (Authentication — sessions)
**Success Criteria:** CSRF tokens required on state-changing requests; existing CRUD router wiring activates automatically.

- [ ] ### Phase 8.7: checkOwnership Real Implementation
**Description:** Replace stub to verify `req.user.id` against resource owner field. Existing route wiring stays.
**Dependencies:** Feature 7 (Authentication — `req.user`)
**Success Criteria:** Ownership check enforced on PUT/PATCH/DELETE; unauthorized access returns 403.

---

## Success Criteria (Feature-Level)

- [ ] CORS locked to production and dev origins
- [ ] Inbound rate limiting active on all routes
- [ ] Helmet configured with production-grade security headers
- [ ] Secrets audit complete; `.env.example` comprehensive
- [ ] Joi validation on all unvalidated POST/PUT routes
- [ ] CSRF protection active (after Feature 7)
- [ ] Ownership checks enforced (after Feature 7)
- [ ] All existing tests still pass

---

## Related Documents

- **PROJECT_PLAN.md:** Feature 8 section
- **Launch Checklist:** `../../LAUNCH_CHECKLIST.md` Phase 2
- **Security Stubs:** `server/docs/SECURITY_STUBS.md`
- **Authentication (dependency):** `../authentication/`

---

**Last Updated:** 2026-03-15
