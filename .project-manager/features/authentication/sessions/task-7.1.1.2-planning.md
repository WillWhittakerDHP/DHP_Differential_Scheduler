# Plan: task 7.1.1.2 — 7.1.1.2

## Contract
- **Tier:** task | **ID:** 7.1.1.2
- **Scope:** 7.1.1.2
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
Task **7.1.1.1** added `20260322_100001_create_auth_sessions_and_magic_links.mjs`. Next: validate migrations against a real DB and align DDL with the live **`User`** model / `users` table.

## Goal
**Smoke-test** the auth DDL migration: run **`migrate` up** (and a controlled **`down`** where safe), confirm **`sessions`** / **`magic_links`** match **LAUNCH_CHECKLIST §2A.1**, and fix any **DDL drift** vs the Sequelize **`User`** model (e.g. `users.id` type, table name). Ensure migration **filename ordering** is correct relative to baseline migrations so new environments apply in the right sequence.

## Files
- `server/src/db/migrations/20260322_100001_create_auth_sessions_and_magic_links.mjs` (adjust only if drift or ordering requires it)
- `server/src/db/migrations/*baseline*.mjs` — confirm ordering vs auth migration
- `server/src/db/models/participantModels/Users.ts` — source of truth for `users` PK / column naming
- `LAUNCH_CHECKLIST.md` §**2A.1** — column/index checklist

## Approach
1. From `server/`, run **`npm run migrate`** on dev DB; capture errors (duplicate table, FK mismatch, ordering).
2. Compare migration FK/column types to **`User`** (`DataTypes.UUID` PK → `user_id uuid` should match).
3. If the repo has multiple baseline files, confirm Sequelize CLI order (timestamps) so the auth migration runs **after** the baseline that creates `users`.
4. Optional: on a disposable DB or after backup, run **`down`** for the auth migration only (drops `magic_links` then `sessions`); then **`up`** again — document if full stack `down` is unsafe.
5. If checklist §2A.1 differs from applied DDL, patch the migration (and re-test) rather than allowing silent drift.

## Checkpoint
- `npm run migrate` succeeds on a representative dev database after any fixes.
- `sessions` / `magic_links` columns, uniques, indexes, and FK to `public.users(id)` match intent of §2A.1 and the **`User`** model.
- Migration ordering documented or corrected; no duplicate/conflicting migration timestamps for the same intent.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.1.1-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/task-7.1.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
