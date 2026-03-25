# Plan: phase 8.7 — checkOwnership (real enforcement)

## Contract
- **Tier:** phase | **ID:** 8.7
- **Scope:** Replace **`checkOwnership`** stub in **`server/src/middlewares/security.ts`** with real ownership checks for CRUD and custom routes that already use the factory; document contract in **`server/docs/SECURITY_STUBS.md`**. No new global middleware — existing **`createCrudRouter`** / route wiring stays.
- **Governance:** Server middleware — explicit return types, **`createLogger`** on error paths, no silent failures.

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** function, docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Session guides own task lists; this doc sets phase intent and session boundaries only.

## Where we left off
Phase **8.6** complete (CSRF server + Vue). **`checkOwnership`** is still a no-op. Feature **7** provides **`req.user`** via **`requireAuth`**.

## Goal
Enforce **resource ownership** on routes that already call **`checkOwnership(resourceName, paramKey)`**: load the row by id from **`req.params`**, return **404** if missing, **403** if **`req.user.id`** does not match the configured owner field (default **`userId`**), otherwise **`next()`**. Support **admin** or **system-owned** resources where the product requires exceptions (document each). **`createCrudRouter`** and manual routers must keep working without per-file rewrites except where owner field or model mapping is wrong.

## Files
- `server/src/middlewares/security.ts` — real **`checkOwnership`** factory + any small helpers (keep branch count / nesting within governance thresholds or extract utilities)
- `server/src/routes/helpers/createCrudRouter.ts` — read-only unless param/contract mismatch discovered
- Entity / appointment / property routers that pass **`checkOwnership(...)`** — verify mapping only
- `server/docs/SECURITY_STUBS.md` — stub section → **active** behavior, owner-field table or registry notes
- Optional: thin `ownershipRegistry.ts` (or similar) if mapping tables stay out of **`security.ts`**

## Approach
1. **Inventory:** List every **`checkOwnership('…', '…')`** call site; note Sequelize model and which column is the owner (often **`userId`**, may differ for **`entity`** / **`businessSetting`** / admin-global rows).
2. **Design:** Central map **`resourceName` → `{ model, ownerField?, allowAdminBypass? }`** or equivalent; validate **`requireAuth`** ran first (**`req.user`** present); on mismatch log at **warn** with stable message.
3. **Implement:** **`findByPk`**, compare ids as strings or UUIDs consistently; **403** **`FORBIDDEN`** aligned with **`requireRole`** shape where possible.
4. **Edge cases:** Rows with **null** owner (global config) — define **403** vs **allow** vs **admin-only** per product rules; document in **SECURITY_STUBS**.
5. **Verification:** Manual IDOR attempts (wrong user cookie) on one internal CRUD route and one appointment route; **`server` lint** on touched files.

## Checkpoint
- Stub removed for production paths covered by the registry; **403/404** behavior matches **SECURITY_STUBS**
- No regression on routes that legitimately skip ownership (documented exceptions only)
- **`npm run lint`** (server) clean on touched files

## How we build the tierDown to achieve them
- **Session 8.7.1:** Ownership registry + real `checkOwnership` middleware (models, owner fields, 403/404, logging)
- **Session 8.7.2:** Edge routes, global/system rows, SECURITY_STUBS update, manual IDOR smoke notes

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/phases/phase-8.6-handoff.md`
- Contract: `server/docs/SECURITY_STUBS.md` (**checkOwnership** section)
- Implementation stub: `server/src/middlewares/security.ts`
- Governance reports: `client/.audit-reports/` (phase tier may still reference client audits per harness)
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
