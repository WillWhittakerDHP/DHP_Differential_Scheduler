# Plan: task 7.1.3.2 — Migrate, compile, and boot-path smoke

## Contract
- **Tier:** task | **ID:** 7.1.3.2
- **Scope:** Runtime verification that auth DDL + ORM load cleanly on a normal dev machine. **Task 7.1.3.1** completed the static audit (no code changes required).
- **Governance:** No new features; server-only commands and optional one-line doc touch only if the harness/session log needs a pointer.

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
**7.1.3.1:** Audit PASS — `Session` / `MagicLink` match migration and §2A.2–2A.3 wiring. This task proves **migrate + build + model init** on the live path.

## Goal
Run **`npm run migrate`** from **`server/`** against the configured local DB (must be **`localhost`** per runner guard) and confirm pending migrations apply or report “all executed.” Run **`npm run compile`** and **`npm run lint`**. Confirm the app’s startup path loads **`initializeModels`** without throwing (read **`server/src/index.ts`** / **`config/models.ts`** / **`config/database.ts`** — no code change unless a real init bug appears).

## Files
- **Commands only:** `server/` — `npm run migrate`, `npm run compile`, `npm run lint`
- **Read-only trace:** `server/src/index.ts`, `server/src/config/models.ts`, `server/src/config/database.ts` (and any import that pulls `models`)
- **Edits only if broken:** fix minimal import/init bug; otherwise **no file changes**

## Approach
1. **`cd server && npm run migrate`** — expect success or “all migrations executed”; note output for task handoff.
2. **`npm run compile && npm run lint`** — must pass.
3. **Boot trace:** Follow imports from server entry to `initializeModels(sequelize)`; confirm `Session` / `MagicLink` are registered via `config/models.ts` side effect when that module loads.
4. **Stop:** Do not add auth routes, strategies, or client code (**7.2+**).

## Checkpoint
- Migrate + compile + lint all succeed (or documented blocker: remote DB — runner blocks; use local host for this smoke).
- Written confirmation that model init path is coherent; **session-end 7.1.3** can follow.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- Session plan: `.project-manager/features/authentication/sessions/session-7.1.3-planning.md`
- Prior task handoff: `.project-manager/features/authentication/sessions/task-7.1.3.1-handoff.md`
- TierUp guide: `.project-manager/features/authentication/sessions/session-7.1.3-guide.md`
- Migrations README: `server/src/db/migrations/README.md`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
