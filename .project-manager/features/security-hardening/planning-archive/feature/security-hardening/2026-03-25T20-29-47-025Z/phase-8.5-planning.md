<!-- harness-planning-rollup tier=phase id=8.5 consolidatedAt=2026-03-25T19:10:04.579Z -->

# Consolidated planning: phase 8.5

## Phase 8.5 (parent)

## Goal

Harden HTTP security headers for the Express API and Vue SPA: (1) review and tune Helmet configuration (HSTS, referrer policy, safe defaults); (2) add Content-Security-Policy suited for the API + Vue frontend; (3) document patterns in SECURITY_STUBS. Ensure the app continues to load and function after changes.

## Files

- `server/src/app.ts` — Helmet middleware and security header configuration
- `server/src/**` — any route or middleware that serves HTML or affects headers
- `client/` or `frontend/` — Vue SPA entry, meta tags, or CSP-related config if applicable
- `.project-manager/features/security-hardening/**/SECURITY_STUBS*` — document security header patterns and CSP directives
- `LAUNCH_CHECKLIST.md` — update security header item if complete

## Approach

1. **Helmet audit:** Review current `app.use(helmet())` defaults; tune HSTS (maxAge, includeSubDomains, preload), referrerPolicy, and other directives; disable or relax only where needed for app compatibility.
2. **CSP implementation:** Add Content-Security-Policy via Helmet's contentSecurityPolicy option; configure default-src, script-src, style-src, connect-src for API and Vue SPA; use nonces or hashes if inline scripts/styles exist; verify Vue app loads.
3. **Documentation:** Add "Security headers" section to SECURITY_STUBS with Helmet config, CSP directives, and tuning rationale.

## Checkpoint

- Helmet configured with HSTS, referrer policy, and safe defaults
- CSP header applied and verified; Vue app loads without CSP violations
- SECURITY_STUBS updated with security headers section

---

## Session 8.5.1 (source: session-8.5.1-planning.md)

### Goal

Audit current Helmet defaults, tune HSTS and referrer policy for production safety, and document the configuration in SECURITY_STUBS. Session 8.5.2 will add CSP separately.

### Files

- `server/src/app.ts` — Helmet middleware; add options object to `helmet()`
- `server/docs/SECURITY_STUBS.md` — add "Security headers (Helmet)" section with config and rationale

### Approach

1. **Audit:** Review Helmet v8 defaults (hsts, referrerPolicy, etc.); identify directives that may need tuning for API-only vs SPA use.
2. **Configure:** Replace `app.use(helmet())` with `app.use(helmet({ ... }))`; enable HSTS with maxAge, includeSubDomains, preload for production; set referrerPolicy (e.g. strict-origin-when-cross-origin); keep other defaults unless compatibility requires relaxation.
3. **Document:** Add "Security headers (Helmet)" section to SECURITY_STUBS with config summary and verification steps.

### Checkpoint

- Helmet configured with HSTS and referrer policy options
- App starts and API responds; no regression in existing behavior
- SECURITY_STUBS updated with Helmet section

---

## Session 8.5.2 (source: session-8.5.2-planning.md)

### Goal

Add Content-Security-Policy via Helmet for the Express API and Vue SPA; configure CSP directives (default-src, script-src, style-src, connect-src); verify app loads without CSP violations; document CSP in SECURITY_STUBS.

### Files

- `server/src/app.ts` — Add Helmet contentSecurityPolicy option (CSP directives)
- `server/docs/SECURITY_STUBS.md` — Document CSP directives and rationale
- `client/` — Vue SPA (consumes API; CSP may affect script/style/connect sources)

### Approach

1. **Add CSP via Helmet:** Configure contentSecurityPolicy in existing helmet({ ... }); set default-src, script-src, style-src, connect-src to allow Vue dev/build, API calls, and trusted CDNs (e.g. Google Fonts, Vite).
2. **Tune for API + SPA:** API serves JSON; Vue SPA is separate origin or same-origin depending on proxy. Ensure connect-src includes API base URL; script-src/style-src allow Vite HMR in dev.
3. **Verify:** Run app; check browser console for CSP violations; relax or add sources only if needed.
4. **Document:** Extend SECURITY_STUBS "Security headers" section with CSP directives and tuning notes.

### Checkpoint

- CSP header applied; Vue app loads without CSP violations in browser console
- SECURITY_STUBS updated with CSP section

---

## Session 8.5.3 (source: session-8.5.3-planning.md)

### Story

**This session delivers** systematic Joi validation on mutating internal routes in batch A **so that** invalid payloads fail fast with consistent 400s, CSRF/ownership ordering stays correct, and the gap-closure checklist row for this batch can be marked verified with evidence.
**Estimated size:** M

---

### Analysis

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase guide.
- **Domains:** **Server / internal API** only for implementation. **Docs** for checklist evidence. No Vue/composable work unless a task discovers a required shared type (then follow ARCHITECTURE.md — prefer `@shared` only if both sides need it).
- **Patterns to follow:** Existing routers already import `validateRequest` from `server/src/middlewares/validateRequest.js` and co-locate `*Schema` / `*Validators` modules (see `adminMetadataCrudRouter`, `entityCrudRouter`, `calendarSettingsCrudRouter`). Preserve **middleware order**: CSRF and ownership checks must stay in the documented sequence relative to validation.
- **Risks:** Over-validating and breaking admin flows; missing multipart/streaming edge cases; diverging schema shapes from Sequelize models. Mitigate with incremental rollout per task and manual smoke of affected endpoints.
- **Alternatives:** Central per-route wrapper vs inline validators — **follow existing per-route `validateRequest(schema)` pattern** for consistency with the codebase.

### Goal

Close **Joi gap closure — internal routes batch A**: (1) produce an audit of mutating routes in the first half of `server/src/routes/internal` missing `validateRequest` (or equivalent); (2) add Joi schemas and wire `validateRequest` without changing security middleware order; (3) verify behavior and update the **GC-8-JOI** row in `.project-manager/GAP_CLOSURE_CHECKLIST.md` when the batch is objectively done.

### Files

- `server/src/routes/internal/**` — batch A scope (task 8.5.3.1 defines “first half”; typically alphabetical or `index.ts` mount order — lock exact boundary in task 8.5.3.1 output).
- `server/src/middlewares/validateRequest.ts` — shared validation middleware (routers import `validateRequest.js` after build; read-only unless contract requires extension).
- Co-located `*Validators.ts` / `*Constants.ts` next to touched routers (match sibling feature folders).
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — row **GC-8-JOI** (create or update per repo state).
- `.project-manager/features/security-hardening/sessions/session-8.5.3-log.md` — task entries as work completes.

### Approach

1. **Task 8.5.3.1 — Audit:** Enumerate `POST`/`PUT`/`PATCH` routes in batch A; note which lack `validateRequest`; document CSRF/ownership neighbors; write findings in session log or a short audit subsection for traceability.
2. **Task 8.5.3.2 — Implement:** For each audited gap, add Joi schemas consistent with existing patterns, import `validateRequest`, place middleware **after** CSRF/ownership where those apply (mirror sibling routers). Use `createLogger` in any new catch paths per coding standards.
3. **Task 8.5.3.3 — Verify + checklist:** Smoke critical paths; run `npm run start:dev` and server lint; only then mark **GC-8-JOI** complete with a one-line evidence pointer (e.g. “batch A routers listed in session log”).

### Checkpoint

- Audit list exists and matches batch A boundary before code changes.
- Each changed route has schema + `validateRequest` wired; no silent validation failures.
- Checklist row updated with evidence; app starts and server lint passes.

### Deliverables

- Written audit for batch A internal mutating routes (task 8.5.3.1).
- Joi schemas + `validateRequest` wiring for all audited gaps in scope (task 8.5.3.2).
- **GC-8-JOI** updated + session log / handoff reflecting completion (task 8.5.3.3).

---

---

## Session 8.5.4 (source: session-8.5.4-planning.md)

### Story

**This session delivers** Joi validation coverage on the remaining internal mutating routes (batch B — mounts 12–17) and a final cross-batch closure assessment **so that** GC-8-JOI can be marked done with evidence that every internal POST/PUT/PATCH route is validated or explicitly exempted.
**Estimated size:** M

---

### Analysis

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklist row GC-8-JOI is `pending`. All batch A work is merged on `feature/security-hardening`; batch B completes the remaining internal routes.
- **Domains:** **Server / internal API** only for implementation. **Docs** for checklist closure. No Vue/composable work.
- **Patterns to follow:** Two established validation patterns in the codebase:
  1. **Middleware pattern** (`validateRequest(schema)` as Express middleware) — used by entities, properties, orgDefaults, adminMetadata, eventInstancePreview, and users (converted in 8.5.3). Standard for explicit route registrations.
  2. **Factory callback pattern** (`createCrudRouter({ validateRequest: (req, method) => ... })`) — used by betaFeedback, appointments, businessRules. The factory calls the callback before database operations and rejects with 400 on failure.
  Both patterns provide input validation before data operations. Batch B GAPs (property mappings) use `createCrudRouter` with **neither** pattern — no validation at all.
- **Risks:** Over-validating mapping payloads used by admin tooling; schemas drifting from model constraints. Mitigate by deriving schemas from model field definitions (types, lengths, nullability).
- **Alternatives considered:**
  - *Convert property mapping routers to explicit routes with middleware* — more aligned with COVERED standard but high disruption for simple CRUD routers.
  - *Add factory `validateRequest` callbacks with validators* (recommended) — follows existing betaFeedback pattern, lower disruption, validation still runs before DB operations. Moves routes from GAP → LOCAL_PATTERN (accepted).
- **Dependencies:** Session 8.5.3 completed (batch A). No client-side changes needed.

### Goal

Close **Joi gap closure — internal routes batch B**: (1) audit all POST/PUT/PATCH handlers in mounts 12–17 of `server/src/routes/internal`; (2) add validation to the 6 GAP routes in property field-mappings and feature-mappings; (3) combine batch A + B results and update GC-8-JOI in `GAP_CLOSURE_CHECKLIST.md` to `done` with cross-batch evidence.

### Files

- `server/src/routes/internal/index.ts` — mount order reference (read-only)
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — **modify**: add `validateRequest` callbacks + validators to both `createCrudRouter` configs
- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` — **new**: Joi-based validators for field and feature mapping CRUD
- `server/src/routes/internal/organizationDefaults/organizationDefaultsCrudRouter.ts` — read-only (already COVERED)
- `server/src/routes/internal/admin-metadata/adminMetadataCrudRouter.ts` — read-only (already COVERED)
- `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` — read-only (LOCAL_PATTERN accepted)
- `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts` — read-only (already COVERED)
- `server/src/routes/internal/dev/devStatusRouter.ts` — read-only (N/A — GET only, dev-only)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — **modify**: update GC-8-JOI row to `done`

### Approach

1. **Task 8.5.4.1 — Audit:** Walk each batch B mount (12–17). For every `router.post`/`.put`/`.patch`, classify as COVERED / LOCAL_PATTERN / GAP. Document in planning doc.
2. **Task 8.5.4.2 — Implement:** Create `propertyMappingsValidators.ts` with Joi-based validators for field-mapping and feature-mapping create/update/patch. Wire `validateRequest` callbacks into both `createCrudRouter` configs in `propertyMappingsRouter.ts`. Preserve CSRF/ownership middleware order (factory handles this automatically). Run server lint.
3. **Task 8.5.4.3 — Verify + close GC-8-JOI:** Verify `npm run start:dev` + server lint. Produce combined batch A+B summary. Update `GAP_CLOSURE_CHECKLIST.md` row GC-8-JOI to `done` with evidence. Update session log/handoff.

### Checkpoint

- Audit table complete for all batch B routes.
- Property mapping routes reject invalid bodies with 400 + validation details.
- App starts; server lint passes.
- GC-8-JOI set to `done` with cross-batch evidence pointer.

### Deliverables

- Written audit for batch B internal mutating routes (task 8.5.4.1).
- `propertyMappingsValidators.ts` with create/update/patch validators for field-mappings and feature-mappings.
- Modified `propertyMappingsRouter.ts` wiring `validateRequest` callbacks.
- GC-8-JOI updated to `done` in `GAP_CLOSURE_CHECKLIST.md`.
- Session log / handoff reflecting cross-batch closure.

### Acceptance Criteria

- Every POST/PUT/PATCH in batch B scope is listed with a verdict in the audit.
- Property mapping GAP routes (6 total) have validation via factory `validateRequest` callback.
- Valid requests continue to work (same behavior).
- CSRF and ownership middleware order unchanged.
- No silent fallbacks or empty catch blocks.
- Server lint passes; app starts.
- GC-8-JOI row in checklist is `done` with evidence.

---

---

## Session 8.5.5 (source: session-8.5.5-planning.md)

### Story

**This session delivers** a documented **batch C** verification pass (auth router + any stragglers under `server/src/routes/internal`) **so that** the optional third slice from `GAP_CLOSURE_HARNESS_ADD_PROMPTS.md` is explicitly closed with evidence, even though **GC-8-JOI** was already marked **done** in session 8.5.4.
**Estimated size:** S

---

### Analysis

- **Context:** Sessions **8.5.3** (batch A) and **8.5.4** (batch B) audited `InternalRouter` mounts in `server/src/routes/internal/index.ts` and fixed GAPs; **GC-8-JOI** was set to **done** in 8.5.4. The playbook’s **batch C** is an optional final sweep: dev-only routers, edge paths, and anything missed.
- **Gap vs prior work:** The main internal tree is mounted from `internal/index.ts`. **`/v1/internal/auth`** is registered separately in `server/src/routes/index.ts` but lives under `server/src/routes/internal/auth/` — it was **not** in the batch A/B mount list. Auth POST routes already use **`validateRequest` + Joi** (`loginBodySchema`, `magicLinkRequestBodySchema`, etc.); GET routes need no body validation.
- **Dev router:** `devStatusRouter` is **GET-only** — N/A for POST/PUT/PATCH Joi sweep (confirmed in 8.5.4 batch B).
- **This session’s value:** Written confirmation in planning + session log that batch C scope is reviewed; optional **Notes** line on **GC-8-JOI** citing batch C (status stays **done**).

### Goal

Complete **batch C** as **verification + documentation**: (1) confirm `internal/auth` mutating routes use `validateRequest` or are documented exceptions; (2) confirm no additional `routes/internal/**` routers are mounted outside the batch A/B inventory without review; (3) run **server lint**; (4) add a **GC-8-JOI** Notes bullet for batch C (or session-log-only if checklist row is already crowded).

### Files

- `server/src/routes/index.ts` — mount layout (`/internal/auth` vs `/internal`)
- `server/src/routes/internal/auth/authRouter.ts` — read-only verification
- `server/src/routes/internal/index.ts` — batch A/B mount inventory (read-only)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — optional Notes refinement for GC-8-JOI
- Session log / handoff — batch C summary

### Approach

1. **Task 8.5.5.1:** Read auth router + route index; record verdict table (mutating routes → COVERED / N/A); one paragraph “no further GAPs” for batch C scope.
2. **Task 8.5.5.2:** `cd server && npm run lint`; update checklist Notes (optional) and session log; **`/session-end 8.5.5`** when tasks complete.

### Checkpoint

- Batch C verification narrative exists (task planning or session log).
- Server lint clean.
- Harness docs updated for session close.

### Deliverables

- Batch C verification record (auth + mount layout).
- Server lint evidence.
- Optional GC-8-JOI Notes append; session log entry.

### Acceptance Criteria

- Auth mutating POST routes are confirmed to use `validateRequest` (or equivalent) per file read.
- Explicit statement that dev/internal sweep has no remaining unvalidated mutating routes in scope.
- Server lint passes.

---
