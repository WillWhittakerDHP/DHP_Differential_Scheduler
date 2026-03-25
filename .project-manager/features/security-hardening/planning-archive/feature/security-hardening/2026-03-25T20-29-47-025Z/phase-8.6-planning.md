# Plan: phase 8.6 — 8.6

## Contract
- **Tier:** phase | **ID:** 8.6
- **Scope:** 8.6
- **Governance:** 2 governance highlights — read reports before filling slots

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
Phase **8.5** (Helmet + CSP) may still be finishing session **8.5.2**; see `phase-8.5-handoff.md`. Feature **7** (Authentication) should provide session cookies and stable mutating API usage before CSRF enforcement breaks the Vue app. `createCrudRouter` already applies `csrfProtection` on state-changing methods — replacing the stub turns enforcement on for those routes in one place.

## Goal
Replace the `csrfProtection` stub in `server/src/middlewares/security.ts` with real CSRF defenses for cookie-based sessions: issue and validate tokens so cross-site requests cannot forge state-changing calls. Document behavior in `docs/SECURITY_STUBS.md` (or successor) and keep explicit logging on failure paths per project standards.

## Files
- `server/src/middlewares/security.ts` — `csrfProtection` implementation (this phase); `checkOwnership` remains stub until Phase 8.7
- `server/src/app.ts` — cookie parser / session ordering if token cookie or middleware order must change
- `server/src/routes/helpers/createCrudRouter.ts` — already wires `csrfProtection`; confirm method list matches intended coverage
- `client/src/**` — API client / fetch wrappers to send CSRF token header or body on mutating requests (as chosen pattern)
- `docs/SECURITY_STUBS.md` — update CSRF section when behavior is real

## Approach
Pick a standard pattern compatible with HttpOnly session cookies and the SPA (e.g. double-submit cookie, synchronizer token in session + header, or maintained middleware if it fits Express and the session store). Validate on POST/PUT/PATCH/DELETE (and other mutating routes the factory covers). Skip safe methods. Ensure dev workflow still works (`npm run start:dev`). Coordinate with Phase 8.5 CSP so the client can read or receive the token without violating CSP.

## Checkpoint
- Unauthenticated or cross-site mutating requests without a valid CSRF token receive **403** (or **400** per chosen convention), with logged, non-silent handling
- Authenticated Vue flows that perform CRUD through the shared client succeed with token attached
- `SECURITY_STUBS` documents the live CSRF contract (cookie/header names, exempt paths if any)

## How we build the tierDown to achieve them
- **Session 8.6.1:** Server — CSRF token issuance, `csrfProtection` validation, env/docs updates, manual verification against a mutating route
- **Session 8.6.2:** Client — wire token into API layer for mutating requests; smoke-test admin and booking flows that use CRUD
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/phases/phase-8.5-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
