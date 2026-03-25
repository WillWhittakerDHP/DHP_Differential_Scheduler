# Plan: session 8.6.2 — Vue CSRF on mutating API calls

## Contract
- **Tier:** session | **ID:** 8.6.2
- **Scope:** Client-only — attach **`X-CSRF-Token`** on mutating requests; **`withCredentials: true`**; align with `server/docs/SECURITY_STUBS.md` (Vue SPA section)
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
Session **8.6.1** shipped server CSRF issuance + validation + docs. **`session-8.6.1-handoff.md`** has transition context. SPA CRUD may **403** until this session lands.

## Goal
Ensure the Vue app sends **`X-CSRF-Token`** (value from readable **`csrf_token`** cookie) on **POST**, **PUT**, **PATCH**, and **DELETE** through the **shared API client**, with **credentials** included so session + CSRF cookies reach the API. No server changes unless a bugfix is unavoidable.

## Files
- `client/src/utils/api/apiClientCore.ts` — `withCredentials: true`; request interceptor (or equivalent) for mutating methods; constants matching server (`csrf_token`, `X-CSRF-Token`) in one place (e.g. small `csrfConstants.ts` next to core if it keeps `apiClientCore` thin)
- Call sites that bypass `apiClientCore` (raw `fetch`, second axios instance) — grep and align or document exceptions
- `server/docs/SECURITY_STUBS.md` — tweak only if client reality differs from the checklist (prefer code matching doc)

## Approach
1. Add a small **cookie reader** utility for `csrf_token` (parse `document.cookie`; handle missing token gracefully — first request after login may need a prior GET; interceptor can skip header if empty and let server 403, or log once via `createLogger` client pattern).
2. Configure axios **`withCredentials: true`** on the shared instance.
3. **Request interceptor:** for methods `post`, `put`, `patch`, `delete`, set header **`X-CSRF-Token`** from cookie when present.
4. Grep **`client/src`** for `axios.create` / `fetch(` to internal API — route through shared client or duplicate header logic minimally.
5. Manual smoke: admin entity save + one booking mutating call (or document steps in task handoff).

## Checkpoint
- Authenticated user can complete at least one **POST/PUT/PATCH/DELETE** against `/api/v1/internal/...` without **403 CSRF** (when session + `csrf_token` exist).
- **`npm run lint`** (client) passes on touched files.
- No new silent failures: use project logger in catch paths per standards.

## How we build the tierDown to achieve them
- **Task 8.6.2.1:** Shared axios client — `withCredentials`, CSRF header on mutating methods, constants + cookie helper
- **Task 8.6.2.2:** Audit non-core HTTP usage + smoke-test (or document) admin/booking CRUD paths

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.6-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/session-8.6.1-handoff.md`
- Contract: `server/docs/SECURITY_STUBS.md` (Vue SPA — CSRF header wiring)
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
