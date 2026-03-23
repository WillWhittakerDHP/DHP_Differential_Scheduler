# Plan: session 8.7.2 — Docs, edge notes, and IDOR smoke checklist

## Contract
- **Tier:** session | **ID:** 8.7.2
- **Scope:** Align **`server/docs/SECURITY_STUBS.md`** with **active** **`checkOwnership`** (registry + **`ownershipEnforcement.ts`**), document **staff vs row-level** rules and known edge routes (singleton settings PUT, **`businessSetting`** key). Add a **manual IDOR / ownership smoke** checklist. **Optional** tiny code fixes only if a concrete bug is found (e.g. route/param mismatch); no broad **`requireAuth`** refactors unless explicitly scoped in a task.
- **Governance:** Server docs and comments only unless a task adds code; **`createLogger`** / lint rules unchanged for doc-only work.

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Task docs own file lists; this session finishes phase **8.7** narrative in guides.

## Where we left off
Session **8.7.1** shipped **`ownershipRegistry.ts`**, **`ownershipEnforcement.ts`**, and registry-backed **`checkOwnership`** in **`security.ts`**. **`SECURITY_STUBS.md`** still describes **`checkOwnership`** as a stub in the intro and has a short generic **checkOwnership** bullet list.

## Goal
Make **SECURITY_STUBS** the **source of truth** for ownership middleware: status **active**, link to implementation files, summarize **registry kinds** (**`sequelize`**, **`dynamic_entity`**, **`special`**), document **internal staff roles** (`agent`, `transaction_manager`, `seller`) vs **client** row checks, and list **manual verification** steps (wrong user → **403**, missing row → **404**, unknown `resourceName` → **403**). Update **phase 8.7** guide objectives / session checklist as appropriate.

## Files
- **`server/docs/SECURITY_STUBS.md`** — intro line, **checkOwnership** section, stub→real table row for **`checkOwnership`**
- **`.project-manager/features/security-hardening/phases/phase-8.7-guide.md`** — mark objectives / sessions complete when true
- **Optional:** **`.project-manager/features/security-hardening/phases/phase-8.7-log.md`** — minimal stub if harness expects it (one entry for **8.7.2**)

## Approach
1. **Task 8.7.2.1:** Edit **SECURITY_STUBS** — replace stub wording; document behavior, response shapes (**403** `FORBIDDEN` / **404** `{ error }`), **`requireAuth`** ordering, and pointers to **`ownershipRegistry.ts`** / **`ownershipEnforcement.ts`**.
2. **Task 8.7.2.2:** Add **manual smoke checklist** (appointment + user CRUD + one staff-only route); sync **phase-8.7-guide** status; add **phase-8.7-log** only if needed for tier workflow.
3. **`cd server && npm run lint`** if any **`.ts`** file is touched.

## Checkpoint
- A new developer can understand ownership from **SECURITY_STUBS** without reading every route file.
- Phase guide reflects **8.7.2** / phase **8.7** completion when work is done.
- Server lint clean on any touched **`.ts`** files.

## How we build the tierDown to achieve them
- **Task 8.7.2.1:** SECURITY_STUBS — active checkOwnership + implementation summary
- **Task 8.7.2.2:** Smoke checklist + phase guide / optional phase log sync

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/security-hardening/phases/phase-8.7-guide.md`
- Prior session handoff: `.project-manager/features/security-hardening/sessions/session-8.7.1-handoff.md`
- Code: `server/src/middlewares/security.ts`, `ownershipRegistry.ts`, `ownershipEnforcement.ts`
- Playbook: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md` (if code changes)
