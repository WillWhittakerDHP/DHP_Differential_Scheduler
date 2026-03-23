# Plan: session 8.6.1 — Server CSRF middleware and token issuance

## Contract
- **Tier:** session | **ID:** 8.6.1
- **Scope:** Server-only CSRF token issuance and `csrfProtection` validation (Vue wiring is Session 8.6.2)
- **Governance:** 3 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase **8.6** started; this is the first session in that phase. Feature **7** session cookies should exist before enforcement breaks the SPA — expect follow-up in **8.6.2** for the Vue client.

## Goal
On the server only: replace the `csrfProtection` no-op with real validation for cookie-backed sessions, issue or surface a CSRF secret/token in a way Session 8.6.2 can consume, and document the contract. Do not change `checkOwnership` (Phase 8.7).

## Files
- `server/src/middlewares/security.ts` — `csrfProtection` (+ any small helpers); keep explicit return types and logger on reject paths
- `server/src/app.ts` — middleware order, cookie/session setup if the token lives in session or a readable cookie
- `server/src/routes/helpers/createCrudRouter.ts` — confirm which methods run `csrfProtection` (no behavior change unless ordering requires it)
- `docs/SECURITY_STUBS.md` — CSRF section updated to match implementation
- `server/.env.example` — only if new env vars (e.g. cookie name flags)

## Approach
Choose one pattern and implement end-to-end on the server: e.g. synchronizer token stored server-side with header comparison, or double-submit cookie where a non-HttpOnly cookie pairs with a header/body field. Skip safe methods (GET, HEAD, OPTIONS). Exempt only what is strictly necessary (e.g. health, webhook routes if any) with documented rationale. Verify with `curl` or Thunder Client: mutating request without token fails; with token succeeds. Accept that the Vue app may be broken until 8.6.2 attaches the token.

## Checkpoint
- Mutating route protected by `createCrudRouter` returns an error without valid CSRF credentials, with `createLogger` used on failure paths
- Same route succeeds when token is supplied per the chosen contract
- `SECURITY_STUBS` names cookie/header/field names and any exemptions

## How we build the tierDown to achieve them
- **Task 8.6.1.1:** Token issuance and persistence — session/cookie shape, middleware order in `app.ts`, minimal happy-path test
- **Task 8.6.1.2:** `csrfProtection` validation, status codes, logging, edge cases (missing token, wrong token)
- **Task 8.6.1.3:** Docs (`SECURITY_STUBS`, env example if needed) + manual verification notes for Session 8.6.2 handoff
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.6-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
