# Plan: task 7.4.4.2 — Apply selective auth gates (GC-7-E1 enactment)

## Contract
- **Tier:** task | **ID:** 7.4.4.2
- **Scope:** Implement **`requireAuth`** + **`requireRole`** on agreed internal routes per **`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`**; preserve wizard paths; run lint; update **GC-7-E1** and session docs when verified.
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Task **7.4.4.1** shipped the **enactment matrix** (`INTERNAL_API_ENACTMENT_MATRIX.md`) + **SECURITY_STUBS** link. This task applies **code** gates aligned with that matrix.

## Parent context (session planning — Analysis excerpt)

- **Problem:** Internal API is intentionally **not** globally behind `requireAuth` so the **booking wizard** works with anonymous identity (session cookie + CSRF only).
- **Matrix:** Task **7.4.4.1** defined priorities — especially **`GET /appointments/list-for-admin-entry`** must be **staff-only** (was world-readable).

## Story
**This task wires** `requireAuth` + `requireRole` on the **highest-priority** unauthenticated admin endpoint identified in the matrix **so that** appointment lists for admin entry are not exposed to anonymous browsers, **without** changing **`POST /availability/computed-data`** or other wizard-critical routes in this pass.

---

## Architecture context (harness-injected)

_(Preserved from harness template — see session planning for full domain map.)_

---

## Analysis
- **Problem:** `list-for-admin-entry` returns recent appointments for **admin UI** (Edit quote / Reschedule) but had **no** auth middleware on the Express route.
- **Boundaries:** Server-only — `server/src/routes/internal/appointments/appointmentRouter.ts` (or handler wrapper). Align role allowlist with **`isInternalStaffRole`** semantics in **`ownershipEnforcement.ts`** (**`agent`**, **`transaction_manager`**, **`seller`**) plus **`admin`** (used by **`forceCreateRouter`**).
- **Patterns:** **`GET`** is a safe method — **no** `csrfProtection` required for this route (see `security.ts` **SAFE_HTTP_METHODS**). Stack: **`requireAuth`** → **`requireRole(...)`** → handler.
- **Risks:** Admin user not logged in → **401** on admin entry page; ensure **admin booking entry** view is only used after magic-link / session identity (already expected for admin).
- **Deferred:** Broad `requireAuth` on other routers — out of scope unless trivial; matrix lists follow-up rows.

## Design

### Route change

**File:** `server/src/routes/internal/appointments/appointmentRouter.ts`

**Before:** `router.get('/list-for-admin-entry', listForAdminEntryHandler)`

**After:**

```ts
router.get(
  '/list-for-admin-entry',
  requireAuth,
  requireRole(USER_ROLE_AGENT, 'transaction_manager', 'seller', 'admin'),
  listForAdminEntryHandler
)
```

**Imports:** `requireAuth`, `requireRole` from `../../../middlewares/security.js`; `USER_ROLE_AGENT` from `../../../constants/userRoles.js` (re-export of shared role constants).

**Rationale:** Matches **internal staff** definition used in ownership enforcement + **admin** for superuser-style accounts referenced elsewhere.

### Documentation

- Update **`INTERNAL_API_ENACTMENT_MATRIX.md`** — add an **“Implemented (date)”** note under priorities for `list-for-admin-entry` (or a small **Changelog** subsection).
- Update **`.project-manager/GAP_CLOSURE_CHECKLIST.md`** — **GC-7-E1**: set **Status** to **done** when lint + smoke verified, with **Notes** citing this task + route change (or **split** a follow-up row if broader enactment remains).

### Client

- **No change expected** if admin entry already uses **`apiClient`** with **`withCredentials: true`** (session cookie). If **`useListForAdminEntry`** runs only on authenticated admin routes, behavior is correct; unauthenticated users get **401** — confirm UX (error boundary / redirect) is acceptable.

## Goal

1. Gate **`GET /appointments/list-for-admin-entry`** with **`requireAuth`** + **`requireRole`** as designed.
2. Run **`cd server && npm run lint`** (and **`cd client && npm run lint`** if any client file is touched).
3. Update matrix + gap checklist + task/session notes per **Acceptance Criteria**.
4. Do **not** add blanket `requireAuth` on **`InternalRouter`** or **`POST /availability/computed-data`** in this task.

## Files

- **`server/src/routes/internal/appointments/appointmentRouter.ts`** — primary edit
- **`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`** — changelog / status
- **`.project-manager/GAP_CLOSURE_CHECKLIST.md`** — **GC-7-E1**
- **Optional:** `.project-manager/features/authentication/sessions/session-7.4.4-handoff.md` — if present, one-line policy “list-for-admin-entry gated”

## Approach

1. Implement middleware on **`appointmentRouter`**; keep handler unchanged.
2. Lint server.
3. Smoke mentally: anonymous **GET** → **401**; logged-in **agent**/**admin** → **200** (manual or describe for session log).
4. Update docs and checklist.

## Checkpoint

- Server compiles; **no** new lint errors.
- Matrix documents the implemented gate.
- **GC-7-E1** reflects closure or a explicit **follow-up** ID for remaining internal routes.

## Deliverables

- Express route gated per **Design**.
- Docs + checklist updated.

## Acceptance Criteria

- [ ] `list-for-admin-entry` returns **401** when no authenticated `User` session
- [ ] Same route returns **403** when user role is not in the allowlist (e.g. plain **client** if such a session can hit internal API)
- [ ] **200** for **agent** / **admin** / other allowed roles when session valid
- [ ] **`POST /availability/computed-data`** unchanged (no new `requireAuth` on that router)
- [ ] Server lint passes
- [ ] **GC-7-E1** row updated

## Definition of Done

- [ ] App starts (`npm run start:dev`) — quick verify
- [ ] Lint passes (`cd server && npm run lint`; client if touched)
- [ ] Session guide task **7.4.4.2** ready for **task-end**

---
## Reference (read before filling — governance and inventory compliance is required)
- Enactment matrix: `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`
- TierUp guide: `.project-manager/features/authentication/sessions/session-7.4.4-guide.md`
- Prior task handoff: `.project-manager/features/authentication/sessions/task-7.4.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md`
- Security behavior: `server/docs/SECURITY_STUBS.md`
- Workflow friction log: `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences: `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/`, `server` audits as applicable
- Playbooks: `.project-manager/*_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
