# Plan: task 8.7.2.1 — SECURITY_STUBS: active checkOwnership

## Contract
- **Tier:** task | **ID:** 8.7.2.1
- **Scope:** Document registry-backed **`checkOwnership`** in **`server/docs/SECURITY_STUBS.md`** only (no server code unless a doc typo requires a comment tweak elsewhere).
- **Governance:** Markdown accuracy must match **`ownershipEnforcement.ts`** / **`ownershipRegistry.ts`** / **`security.ts`**.

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** docs
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** light
- **Downstream advice:** Task 8.7.2.2 adds the manual smoke checklist and phase-guide sync.

## Where we left off
Session **8.7.2** accepted; **`checkOwnership`** is implemented in code but **SECURITY_STUBS** still calls it a stub.

## Goal
Align **`SECURITY_STUBS.md`** with production: intro lists **`checkOwnership`** as **active**; replace the generic bullet list with **ordering**, **response shapes**, **registry kinds** (`sequelize`, `dynamic_entity`, `special`), **staff roles** (`agent`, `transaction_manager`, `seller`), **fail-closed** rules (unknown `resourceName`, missing `req.user`, null owner column), and pointers to **`ownershipRegistry.ts`** / **`ownershipEnforcement.ts`**. Add a **stub → real** table row for **`checkOwnership`**.

## Files
- **`server/docs/SECURITY_STUBS.md`**

## Approach
1. Update the opening paragraph (line ~3): **`checkOwnership`** active (Phase **8.7.1.2**, docs **8.7.2.1**).
2. Replace **`### checkOwnership`** under **Planned behavior** with a **checkOwnership (active)** subsection: factory in **`security.ts`** → **`runOwnershipCheck`**; table of outcomes (**403** `code: FORBIDDEN` + `message` vs **404** `{ error }`).
3. Summarize per-kind behavior consistent with **`runOwnershipCheck`**: **`sequelize`** (column vs `row_pk_is_user`), **`dynamic_entity`** (staff-only after **`req.entityConfig`**), **`special`** (singleton settings, fee summary chain, property rows, staff-scoped models) — high level, defer exhaustive smoke steps to task **8.7.2.2**.
4. Insert **`checkOwnership`** row in **Stub → real implementation mapping** before the appointment/client rows.

## Checkpoint
- Intro no longer says **`checkOwnership`** is a stub.
- A reader can wire a new route: **`requireAuth`** → **`checkOwnership(name, paramKey)`** and know where to register **`resourceName`**.
- No **`[TASK_PLACEHOLDERS]`** strings remain in this file.

## Design Before Execute
- **Middleware order:** `requireAuth` then `checkOwnership` (same as `requireRole`).
- **403 vs 404:** missing/empty param, missing row → **404** `{ error: 'Resource not found' }`; policy denial, unknown resource, missing user → **403** `{ code: FORBIDDEN, message: 'Access denied' }` (same `FORBIDDEN` code as `requireRole`).
- **Registry:** extend **`OWNERSHIP_RESOURCE_NAMES`** / **`OWNERSHIP_REGISTRY`** before adding new **`checkOwnership('…')`** call sites.

---
## Reference
- Session guide: `.project-manager/features/security-hardening/sessions/session-8.7.2-guide.md`
- Code: `server/src/middlewares/security.ts`, `ownershipRegistry.ts`, `ownershipEnforcement.ts`
