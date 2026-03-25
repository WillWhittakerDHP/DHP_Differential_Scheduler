<!-- harness-planning-rollup tier=feature id=security-hardening consolidatedAt=2026-03-25T20:29:47.025Z -->

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

## Phase 8.6 (source: phase-8.6-planning.md)

### Goal

Replace the `csrfProtection` stub in `server/src/middlewares/security.ts` with real CSRF defenses for cookie-based sessions: issue and validate tokens so cross-site requests cannot forge state-changing calls. Document behavior in `docs/SECURITY_STUBS.md` (or successor) and keep explicit logging on failure paths per project standards.

### Files

- `server/src/middlewares/security.ts` — `csrfProtection` implementation (this phase); `checkOwnership` remains stub until Phase 8.7
- `server/src/app.ts` — cookie parser / session ordering if token cookie or middleware order must change
- `server/src/routes/helpers/createCrudRouter.ts` — already wires `csrfProtection`; confirm method list matches intended coverage
- `client/src/**` — API client / fetch wrappers to send CSRF token header or body on mutating requests (as chosen pattern)
- `docs/SECURITY_STUBS.md` — update CSRF section when behavior is real

### Approach

Pick a standard pattern compatible with HttpOnly session cookies and the SPA (e.g. double-submit cookie, synchronizer token in session + header, or maintained middleware if it fits Express and the session store). Validate on POST/PUT/PATCH/DELETE (and other mutating routes the factory covers). Skip safe methods. Ensure dev workflow still works (`npm run start:dev`). Coordinate with Phase 8.5 CSP so the client can read or receive the token without violating CSP.

### Checkpoint

- Unauthenticated or cross-site mutating requests without a valid CSRF token receive **403** (or **400** per chosen convention), with logged, non-silent handling
- Authenticated Vue flows that perform CRUD through the shared client succeed with token attached
- `SECURITY_STUBS` documents the live CSRF contract (cookie/header names, exempt paths if any)

---

## Phase 8.7 (source: phase-8.7-planning.md)

### Goal

Enforce **resource ownership** on routes that already call **`checkOwnership(resourceName, paramKey)`**: load the row by id from **`req.params`**, return **404** if missing, **403** if **`req.user.id`** does not match the configured owner field (default **`userId`**), otherwise **`next()`**. Support **admin** or **system-owned** resources where the product requires exceptions (document each). **`createCrudRouter`** and manual routers must keep working without per-file rewrites except where owner field or model mapping is wrong.

### Files

- `server/src/middlewares/security.ts` — real **`checkOwnership`** factory + any small helpers (keep branch count / nesting within governance thresholds or extract utilities)
- `server/src/routes/helpers/createCrudRouter.ts` — read-only unless param/contract mismatch discovered
- Entity / appointment / property routers that pass **`checkOwnership(...)`** — verify mapping only
- `server/docs/SECURITY_STUBS.md` — stub section → **active** behavior, owner-field table or registry notes
- Optional: thin `ownershipRegistry.ts` (or similar) if mapping tables stay out of **`security.ts`**

### Approach

1. **Inventory:** List every **`checkOwnership('…', '…')`** call site; note Sequelize model and which column is the owner (often **`userId`**, may differ for **`entity`** / **`businessSetting`** / admin-global rows).
2. **Design:** Central map **`resourceName` → `{ model, ownerField?, allowAdminBypass? }`** or equivalent; validate **`requireAuth`** ran first (**`req.user`** present); on mismatch log at **warn** with stable message.
3. **Implement:** **`findByPk`**, compare ids as strings or UUIDs consistently; **403** **`FORBIDDEN`** aligned with **`requireRole`** shape where possible.
4. **Edge cases:** Rows with **null** owner (global config) — define **403** vs **allow** vs **admin-only** per product rules; document in **SECURITY_STUBS**.
5. **Verification:** Manual IDOR attempts (wrong user cookie) on one internal CRUD route and one appointment route; **`server` lint** on touched files.

### Checkpoint

- Stub removed for production paths covered by the registry; **403/404** behavior matches **SECURITY_STUBS**
- No regression on routes that legitimately skip ownership (documented exceptions only)
- **`npm run lint`** (server) clean on touched files

---

## Phase 8.8 (source: phase-8.8-planning.md)

### Story

**As a** server security maintainer, **I want** Joi request body validation on all remaining unvalidated CRUD routes, **so that** malformed or malicious payloads are rejected at the middleware layer before reaching Sequelize.
**Estimated size:** S

---

### Analysis

**Problem:** Three `createCrudRouter` configurations expose POST/PUT/PATCH/DELETE without any `validateRequest` callback. Request bodies pass directly to Sequelize `model.create()` / `model.update()`. This was flagged during a code audit against the GC-8-JOI checklist item, which was prematurely marked "done."

**Why now:** GC-8-JOI's "done" status is inaccurate. The gap was discovered during a `/phase-add 8.8` preparation audit. Closing it now ensures Feature 8 (security-hardening) is genuinely complete before alpha.

**Domain boundaries:** Server-only (security domain). No client, shared, or cross-domain work. Touches the Admin/Config domain routers (users, property mappings) per `ARCHITECTURE.md` §2 Domain Map.

**Existing patterns to follow:**
1. **CRUD factory `validateRequest` callback** — `(req: Request, method: 'create' | 'update' | 'patch') => ValidationResult`. Examples: `businessRulesCrudRouter.ts`, `betaFeedbackCrudRouter.ts`. Best fit for these routers since they already use `createCrudRouter`.
2. **Joi schemas in `server/src/routes/schemas/`** — named exports, co-located by resource. The CRUD callback can use Joi internally (`.validate()`) and return `ValidationResult`.
3. **Minimal schema pattern** — `entitySchemas.ts` uses `Joi.object().min(1).unknown(true)` for dynamic-shape entities. Property mapping and user schemas can be more specific since their model fields are fixed.

**Risks:** Low. Changes are additive (adding validation where none exists). No existing behavior changes — previously valid payloads still pass; only malformed payloads are newly rejected.

**Dependencies:** None. These routers exist and are wired. Joi is already installed (`^18.0.2`).

**Alternatives considered:**
- **Joi middleware approach** (`validateRequest(schema)` from `server/src/middlewares/validateRequest.ts`): Would require restructuring the CRUD router factory call sites to inject middleware. More invasive than using the built-in `validateRequest` callback.
- **Do nothing / accept risk:** Rejected — the CRUD factory passes raw `req.body` to Sequelize without sanitization. Sequelize's own validation is type-level only (allowNull, ENUM), not shape-level.

### Goal

Add Joi-backed `validateRequest` callbacks to three CRUD router configurations that currently accept unvalidated request bodies: `userCrudRouter.ts` (User model), `propertyMappingsRouter.ts` field-mappings (PropertyFieldMapping model), and `propertyMappingsRouter.ts` feature-mappings (PropertyFeatureMapping model). Close the GC-8-JOI gap in `GAP_CLOSURE_CHECKLIST.md` accurately.

### Files

- `server/src/routes/internal/users/userCrudRouter.ts` — CRUD config; add `validateRequest` callback
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — two `createCrudRouter` calls; add `validateRequest` to both
- `server/src/routes/schemas/userSchemas.ts` — **new file**: Joi schemas for User create/update/patch
- `server/src/routes/schemas/propertyMappingSchemas.ts` — **new file**: Joi schemas for PropertyFieldMapping and PropertyFeatureMapping create/update/patch
- `server/src/routes/helpers/crudRouterTypes.ts` — reference only (defines `validateRequest` callback signature)
- `server/src/routes/helpers/routerValidators.ts` — reference only (defines `ValidationResult` type)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — update GC-8-JOI status

### Approach

1. Create Joi schema files in `server/src/routes/schemas/` following the established pattern (named exports, one file per resource domain).
2. For each model, define schemas for `create`, `update`, and `patch` methods. `create` and `update` enforce required fields; `patch` makes all fields optional (partial update). Use `Joi.object().unknown(true)` to avoid breaking if Sequelize or the client sends extra fields (consistent with `entitySchemas.ts` pattern).
3. Wire the schemas into the existing `createCrudRouter` config via the `validateRequest: (req, method) => ValidationResult` callback. The callback selects the schema by method, calls `.validate()`, and returns `{ valid, error }`.
4. No structural changes to the CRUD factory or middleware pipeline — purely additive per-router config.
5. Run `cd server && npm run lint` after changes. Smoke-test by reviewing that the server starts without errors.

### Checkpoint

- After schema creation: Joi schema files exist and export named schemas for all three models
- After CRUD wiring: All three `createCrudRouter` calls include a `validateRequest` callback
- After lint: `cd server && npm run lint` passes with no new errors
- After smoke: `npm run start:dev` starts successfully; no runtime errors in console

### Deliverables

1. `server/src/routes/schemas/userSchemas.ts` — Joi schemas for User create/update/patch
2. `server/src/routes/schemas/propertyMappingSchemas.ts` — Joi schemas for PropertyFieldMapping and PropertyFeatureMapping create/update/patch
3. Updated `userCrudRouter.ts` with `validateRequest` callback
4. Updated `propertyMappingsRouter.ts` with `validateRequest` callbacks on both CRUD instances
5. Updated `GAP_CLOSURE_CHECKLIST.md` GC-8-JOI row: status corrected to reflect actual closure

### Acceptance Criteria

- [ ] `userCrudRouter.ts` rejects POST/PUT with missing required fields (firstName, lastName, email, userRole) → 400
- [ ] `userCrudRouter.ts` PATCH accepts partial bodies (at least one field required)
- [ ] PropertyFieldMapping CRUD rejects POST/PUT with missing required fields (sourceField, targetField) → 400
- [ ] PropertyFeatureMapping CRUD rejects POST/PUT with missing required fields (sourceField, matchType, blockInstanceId) → 400
- [ ] Both property mapping PATCHes accept partial bodies
- [ ] Server lint passes (`cd server && npm run lint`)
- [ ] Server starts without errors (`npm run start:dev`)
- [ ] GC-8-JOI checklist row updated with accurate status and notes

---

---
