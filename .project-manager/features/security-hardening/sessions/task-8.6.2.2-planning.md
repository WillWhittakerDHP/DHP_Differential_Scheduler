# Plan: task 8.6.2.2 — Internal API bypasses + smoke notes

## Contract
- **Tier:** task | **ID:** 8.6.2.2
- **Scope:** Grep for HTTP clients that bypass the shared `apiClientCore`; wire CSRF for any **`/api/v1/internal`** mutating calls; document manual smoke steps (no automated tests — project suspended).
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Task **8.6.2.1** shipped: shared **`apiClientCore`** has **`withCredentials: true`**, **`csrfClient.ts`**, and a mutating-method interceptor. See **`task-8.6.2.1-handoff.md`**.

## Goal
Find every client path that calls **`/api/v1/internal/...`** without the shared axios instance; ensure **mutating** requests send **`X-CSRF-Token`** and **credentials** the same way as **`apiClientCore`**. As of repo scan: only **`calendarApiService.fetchComputedAvailabilityData`** uses raw **`axios.post`** to **`/api/v1/internal/availability/computed-data`** — migrate that call to the **default export** from **`client/src/utils/api`** (or equivalent thin wrapper) so interceptors apply. Other raw axios usages hit **`/api/v1/external/...`** (GET-only in current code) — no CSRF header required; document as verified exceptions.

## Files
- `client/src/services/calendarApiService.ts` — replace internal POST with **`apiClient.post('/availability/computed-data', request)`** (base URL is already **`/api/v1/internal`** on the shared instance; path must match current server route).
- `server/docs/SECURITY_STUBS.md` — update the Session **8.6.2** checklist boxes to reflect shared client + bypass cleanup (if still unchecked).

## Approach
1. Grep **`client/src`** for **`/api/v1/internal`**, **`axios.create`**, and **`fetch(`**; confirm no second mutating internal client remains after the calendar change.
2. In **`calendarApiService`**, import the default API client from **`@/utils/api`** (same as CRUD). Remove standalone **`axios.post`** for computed availability; preserve existing **`handleApiError`** / logging behavior around the call (response shape unchanged).
3. Run **`cd client && npm run lint`** on touched files.
4. **Smoke (manual, for handoff / session notes):** log in → open booking flow → trigger computed availability (or admin save via shared client) → Network tab: mutating internal request shows **`X-CSRF-Token`** and cookies; no **403 CSRF validation failed**.

## Checkpoint
- **`calendarApiService`** internal POST goes through **`apiClientCore`** (or documented equivalent with same CSRF + credentials behavior).
- Grep confirms no other raw mutating **`/api/v1/internal`** calls from the Vue app.
- Client lint clean on touched files.

## Design Before Execute
- Default export from **`client/src/utils/api/index.ts`** re-exports **`apiClientCore`**; use **`import apiClient from '@/utils/api'`** to avoid a second axios instance.
- POST path: **`'/availability/computed-data'`** relative to base **`import.meta.env.VITE_API_BASE_URL || '/api/v1/internal'`** — must match today’s full URL **`.../api/v1/internal/availability/computed-data`**.
- Keep **`API_BASE_URL`** in the file only if still needed for comments or future; remove unused axios import if nothing else uses it.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.6.2-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.6.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
