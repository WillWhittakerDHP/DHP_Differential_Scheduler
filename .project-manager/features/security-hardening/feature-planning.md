# Plan: feature security-hardening — security-hardening

## Contract
- **Tier:** feature | **ID:** security-hardening
- **Scope:** security-hardening
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this feature.

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

## How we build the tierDown to achieve them
- **Phase 8.1:** CORS Lockdown — add CORS_ORIGIN env var, restrict origins in app.ts
- **Phase 8.2:** Inbound Rate Limiting — install express-rate-limit, apply to internal + auth routes
- **Phase 8.3:** Helmet Production Config — CSP, HSTS, referrer policy; verify Vue app loads
- **Phase 8.4:** Secrets Audit — scan for hardcoded credentials, expand .env.example, verify .gitignore
- **Phase 8.5:** Joi Request Body Validation — add Joi schemas for unvalidated POST/PUT routes
- **Phase 8.6:** CSRF Real Implementation — replace stub with token validation (depends on Feature 7)
- **Phase 8.7:** checkOwnership Real Implementation — verify req.user.id matches resource owner (depends on Feature 7)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/feature-security-hardening-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
