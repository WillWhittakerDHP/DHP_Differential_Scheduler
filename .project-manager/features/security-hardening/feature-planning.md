<!-- harness-planning-rollup tier=feature id=security-hardening consolidatedAt=2026-03-24T22:18:02.803Z -->

# Consolidated planning: feature security-hardening

## Feature security-hardening (parent)

## Goal

Harden the API and server before exposing the app to external users (alpha testers). Lock down CORS origins, add inbound rate limiting, configure production-grade Helmet headers, audit secrets, add Joi request-body validation to unvalidated routes, and replace the CSRF + checkOwnership stubs with real implementations once Feature 7 (Authentication) delivers sessions.

## Files

- `server/src/app.ts` — CORS config, Helmet config (Phases 8.1, 8.3)
- `server/src/middlewares/security.ts` — `csrfProtection` and `checkOwnership` stubs (Phases 8.6, 8.7)
- `server/src/routes/index.ts` — route tree for applying rate limiters (Phase 8.2)
- `server/src/routes/helpers/createCrudRouter.ts` — CRUD factory already wires security middleware
- `server/src/config/envConfig.ts` — env-var validation; add `CORS_ORIGIN` (Phase 8.1)
- `server/.env.example` — expand to document all expected env vars (Phase 8.4)
- `server/src/routes/**/*Validators.ts` — existing hand-rolled validators; Joi migration targets (Phase 8.5)
- `.env`, `server/.env.production` — secrets audit targets (Phase 8.4)

## Approach

Phases 8.1–8.5 are independent of authentication and can proceed immediately. Each phase is a focused, single-concern server change. Phases 8.6–8.7 depend on Feature 7 (Authentication) and will be sequenced after it delivers `req.user` and session management. The CRUD router factory already wires `csrfProtection` and `checkOwnership` — replacing the stubs activates real enforcement on all routes automatically (no route-file surgery). Governance applies to server code: explicit return types, no silent error swallowing, Joi schemas as named exports with explicit types.

## Checkpoint

- After Phase 8.1: CORS rejects requests from unlisted origins; dev and production origins configured
- After Phase 8.3: `curl -I` shows production security headers (CSP, HSTS, Referrer-Policy)
- After Phase 8.5: All POST/PUT routes have Joi validation; invalid payloads return 400 with descriptive error
- After Phase 8.7: Feature complete — all security stubs replaced, ownership enforced

---

## Phase 8.1 (source: phase-8.1-planning.md)

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

## Phase 8.2 (source: phase-8.2-planning.md)

### Goal

Add inbound HTTP rate limiting to protect the API from abuse: general limiter on `/api/v1/internal/*` (100 req/15 min), stricter limiter for auth routes when they exist (10 req/15 min). Excess requests receive 429. Auth-route limiter can be wired to a placeholder path until Feature 7 (Authentication) adds actual login routes.

### Files

- `server/package.json` — add `express-rate-limit` dependency
- `server/src/app.ts` — mount rate limiters before route handlers
- `server/src/routes/index.ts` — route tree; identify internal vs auth route mounts
- `server/src/middlewares/` — new rate limiter middleware (or inline in app.ts)
- `server/docs/SECURITY_STUBS.md` — document rate limiting behavior

### Approach

Install `express-rate-limit`, create a general limiter (100 req/15 min per IP) and a stricter auth limiter (10 req/15 min). Apply general limiter to all `/api/v1/internal/*` routes. Wire auth limiter to `/api/v1/internal/auth/*` or a placeholder path; when Feature 7 adds login routes, they inherit it. Use `windowMs` and `max` options. Return 429 with `Retry-After` when limit exceeded. Follow governance: explicit return types, no silent error swallowing.

### Checkpoint

- General limiter active on internal API; excess requests return 429
- Auth-route limiter wired (placeholder or real); structure ready for Feature 7
- `curl` or manual test confirms rate limit behavior

---

---

## Phase 8.3 (source: phase-8.3-planning.md)

### Goal

Add request validation and input sanitization to protect against malformed or malicious POST/PUT payloads. Install Joi, create validation middleware or helpers, apply to internal API routes, and document patterns in SECURITY_STUBS.

### Files

- `server/package.json` — add Joi (or chosen validator)
- `server/src/middlewares/` — validation middleware or schema helpers
- `server/src/routes/internal/` — apply validation to POST/PUT handlers
- `server/docs/SECURITY_STUBS.md` — document validation patterns

### Approach

1. Install Joi; create reusable validation middleware or per-route schema pattern. 2. Wire validation to a sample internal route (proof of concept). 3. Apply across internal POST/PUT routes (entities, appointments, etc.) with appropriate schemas. 4. Return 400 Bad Request with validation errors when schema fails. 5. Document approach and schemas in SECURITY_STUBS.

### Checkpoint

- Validation library installed; middleware or helper pattern in place
- Sample and key internal routes validated; 400 returned on invalid payloads
- Documentation updated

---

---

## Phase 8.4 (source: phase-8.4-planning.md)

### Goal

Complete a secrets audit for the project: (1) inventory all environment variable usage and ensure secrets are loaded from env, not hardcoded; (2) verify no secrets or credentials exist in committed files. Document patterns in SECURITY_STUBS and ensure .env.example + .gitignore are complete.

### Files

- `server/.env.example`, `server/.env.development`, `server/.env.production` — template and env patterns
- Root `.env`, `.env.example` — if present
- `.gitignore` — ensure .env* and credential files excluded
- `server/src/**` — scan for process.env usage and any hardcoded strings
- `.project-manager/features/security-hardening/**/SECURITY_STUBS*` or equivalent — document audit findings
- Any `*.config.*` or config loaders that may hold secrets

### Approach

1. **Env audit:** Inventory all `process.env` (or config) usage across server/client; cross-check against .env.example; ensure no defaults contain secrets; document required vs optional vars.
2. **Committed-file scan:** Verify .gitignore covers .env*, .google-tokens.json, and any credential paths; optionally run a grep/truffleHog-style scan for high-entropy strings or known patterns; document safe patterns.
3. **Documentation:** Add "Secrets audit" section to SECURITY_STUBS with env var inventory, .gitignore coverage, and safe-handling guidelines.

### Checkpoint

- Env var inventory documented; .env.example complete for all required vars
- No hardcoded secrets in codebase; .gitignore verified
- SECURITY_STUBS updated with secrets audit section

---

---

## Phase 8.5 (source: phase-8.5-planning.md)

### Goal

Harden HTTP security headers for the Express API and Vue SPA: (1) review and tune Helmet configuration (HSTS, referrer policy, safe defaults); (2) add Content-Security-Policy suited for the API + Vue frontend; (3) document patterns in SECURITY_STUBS. Ensure the app continues to load and function after changes.

### Files

- `server/src/app.ts` — Helmet middleware and security header configuration
- `server/src/**` — any route or middleware that serves HTML or affects headers
- `client/` or `frontend/` — Vue SPA entry, meta tags, or CSP-related config if applicable
- `.project-manager/features/security-hardening/**/SECURITY_STUBS*` — document security header patterns and CSP directives
- `LAUNCH_CHECKLIST.md` — update security header item if complete

### Approach

1. **Helmet audit:** Review current `app.use(helmet())` defaults; tune HSTS (maxAge, includeSubDomains, preload), referrerPolicy, and other directives; disable or relax only where needed for app compatibility.
2. **CSP implementation:** Add Content-Security-Policy via Helmet's contentSecurityPolicy option; configure default-src, script-src, style-src, connect-src for API and Vue SPA; use nonces or hashes if inline scripts/styles exist; verify Vue app loads.
3. **Documentation:** Add "Security headers" section to SECURITY_STUBS with Helmet config, CSP directives, and tuning rationale.

### Checkpoint

- Helmet configured with HSTS, referrer policy, and safe defaults
- CSP header applied and verified; Vue app loads without CSP violations
- SECURITY_STUBS updated with security headers section

---

---
