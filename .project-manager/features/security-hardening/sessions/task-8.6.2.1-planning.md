# Plan: task 8.6.2.1 — Shared axios: `withCredentials` + CSRF header

## Contract
- **Tier:** task | **ID:** 8.6.2.1
- **Scope:** Only the **default shared API axios instance** — not a full-repo grep (that is **8.6.2.2**)
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
Session **8.6.2** started; this is the first task. Contract: `server/docs/SECURITY_STUBS.md` (Vue SPA — CSRF header wiring).

## Goal
On the **shared axios client** (`apiClientCore`): enable **`withCredentials: true`**, define **`csrf_token`** / **`X-CSRF-Token`** constants aligned with the server, read the CSRF value from **`document.cookie`**, and add a **request interceptor** that sets **`X-CSRF-Token`** on **post**, **put**, **patch**, and **delete** when the cookie value exists. Keep **`apiClientCore.ts`** thin: put constants + cookie parser in a **small colocated module** (e.g. `csrfClient.ts` alongside core).

## Files
- `client/src/utils/api/apiClientCore.ts` — `withCredentials: true`; register interceptor; import helpers
- `client/src/utils/api/csrfClient.ts` (new) — `CSRF_COOKIE_NAME`, `CSRF_HEADER_NAME`, `readCsrfTokenFromDocumentCookie(): string | null`, explicit return types
- No server changes; no `SECURITY_STUBS` edits unless the implementation diverges from the doc (prefer matching the doc)

## Approach
1. Add **`csrfClient.ts`** with string literals **`csrf_token`** and **`X-CSRF-Token`** (must match `server/src/middlewares/csrfIssuance.ts` exports).
2. Implement **`readCsrfTokenFromDocumentCookie`** with a simple `document.cookie` parse (no new dependency); return **`null`** if missing.
3. **`axios.create`**: set **`withCredentials: true`**.
4. **`interceptors.request.use`**: normalize **`config.method`** to lowercase; if method is **`post`**, **`put`**, **`patch`**, or **`delete`**, read token; if non-empty, set **`config.headers`** (merge with existing) so **`X-CSRF-Token`** is sent. If token missing, do not throw — server may **403** until a prior GET mints the cookie (per server docs); optional **`createLogger`** **debug** once if useful (avoid log spam).
5. Run **`cd client && npm run lint`** on touched files.

## Checkpoint
- With session + `csrf_token` cookie present, a **`apiClient.post`** (or put/patch/delete) to internal API includes **`X-CSRF-Token`** (verify in Network tab).
- Client lint clean.
- Task **8.6.2.2** covers bypassing clients + smoke flows.

## Design Before Execute
- `config.headers = { ...config.headers, [CSRF_HEADER_NAME]: token }` when Axios headers are plain objects; use `AxiosHeaders` / `set` if typings require.
- Methods: compare `(config.method ?? 'get').toLowerCase()` against a small `Set` of mutating verbs.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.6.2-guide.md`
- Contract: `server/docs/SECURITY_STUBS.md` (Vue SPA section)
- Server constants: `server/src/middlewares/csrfIssuance.ts`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
