# Plan: task 8.7.2.2 — Smoke checklist + phase guide sync

## Contract
- **Tier:** task | **ID:** 8.7.2.2
- **Scope:** Add an actionable **manual IDOR / ownership smoke** section to **`server/docs/SECURITY_STUBS.md`**; align **`.project-manager/features/security-hardening/phases/phase-8.7-guide.md`** and **`phase-8.7-log.md`** with completed **8.7** work (objectives + session **8.7.2** narrative). No server **`.ts`** unless a doc-driven correction appears.
- **Governance:** Docs only; keep examples consistent with real route prefixes and middleware order (**`requireAuth`** → **`checkOwnership`**; **`csrfProtection`** on mutating routes).

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** light
- **Downstream advice:** After this task, run **`/task-end 8.7.2.2`**, then **`/session-end 8.7.2`** when ready.

## Where we left off
Task **8.7.2.1** committed; **`checkOwnership (active)`** is documented in **SECURITY_STUBS** with a pointer that smoke steps land in **8.7.2.2**.

## Goal
Give QA and developers a **copy-paste-friendly** checklist: two browser users (or two cookie jars), **CSRF** header on mutating requests, expected **403** vs **404**, and one **staff-only** path (**internal staff roles**: `agent`, `transaction_manager`, `seller`). Update the phase **8.7** guide so objectives and session **8.7.2** match reality; clean up **phase-8.7-log** template noise for sessions **8.7.1** / **8.7.2**.

## Files
- **`server/docs/SECURITY_STUBS.md`**
- **`.project-manager/features/security-hardening/phases/phase-8.7-guide.md`**
- **`.project-manager/features/security-hardening/phases/phase-8.7-log.md`**

## Approach
1. Under **Planned behavior**, add **`### Manual IDOR / ownership smoke (8.7.2.2)`** after **`checkOwnership (active)`**: prerequisites, table or bullets for **user**, **appointment**, **entity PUT/PATCH**, **registry fail-closed** (optional dev-only), **404** synthetic id.
2. Remove the one-line placeholder that deferred smoke to **8.7.2.2** inside the **checkOwnership** section (replaced by the new subsection).
3. **Phase guide:** Check **Phase Objectives** and **Session 8.7.2** in **Sessions Breakdown**; update **Success Criteria** checkboxes that are satisfied; set **Phase Overview** **Status** to **Complete** only if both sessions’ work is done (after this task, **8.7.2** implementation is complete — session-end still runs harness steps).
4. **Phase log:** Record **Session 8.7.2** completion (date **2026-03-23**), trim duplicate template session stubs.

## Checkpoint
- Smoke steps name real base path **`/api/v1/internal`** and mention **`X-CSRF-Token`** where mutations apply.
- Phase **8.7** guide no longer shows unchecked objectives for work that is already shipped.
- No task placeholder strings remain in this planning file.

## Design Before Execute
- **403** body: `{ code: "FORBIDDEN", message: "Access denied" }` (see `AUTH_FAILURE_CODES` in code).
- **404** ownership: `{ error: "Resource not found" }`.
- Entity write routes: **`PUT|PATCH|DELETE /api/v1/internal/entities/:entityType/:id`** use **`checkOwnership('entity','id')`** after **`csrfProtection`**; **`requireAuth`** is mounted on the internal router stack — confirm in `appointmentRouter` / `userCrudRouter` parent if needed for “unauthenticated” step.

---
## Reference
- Session guide: `.project-manager/features/security-hardening/sessions/session-8.7.2-guide.md`
- Routes: `server/src/routes/index.ts`, `server/src/routes/internal/index.ts`, `entityCrudRouter.ts`, `createCrudRouter.ts`
- Prior task handoff: `.project-manager/features/security-hardening/sessions/task-8.7.2.1-handoff.md`
