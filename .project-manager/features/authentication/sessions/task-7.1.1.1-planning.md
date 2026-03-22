# Plan: task 7.1.1.1 — Migration: sessions + magic_links

## Contract
- **Tier:** task | **ID:** 7.1.1.1
- **Scope:** Single Sequelize migration file; DDL only (no models — task 7.1.1.2)
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
No prior handoff for this task.

## Goal
Add a **new Sequelize migration** under `server/src/db/migrations/` that creates **`public.sessions`** and **`public.magic_links`** with columns, uniques, indexes, and FK to **`public.users`** as specified in **LAUNCH_CHECKLIST.md §2A.1**, adapted if the live `users` primary key type/name differs. **Reversible `down`** drops `magic_links` then `sessions`. No application auth code in this session.

## Files
- `server/src/db/migrations/<timestamp>_create_auth_sessions_and_magic_links.mjs` (or equivalent naming after existing migration conventions)
- Optionally `LAUNCH_CHECKLIST.md` checkbox / notes only if updating tracking — no checklist requirement for code

## Approach
1. Read **LAUNCH_CHECKLIST 2A.1** SQL verbatim as the source of truth for columns and indexes.
2. Confirm **`users`** table exists in the baseline schema and that **`users(id)`** is `uuid` (or adjust FK types to match reality before shipping).
3. Implement **`up`** with `queryInterface.sequelize.query` (same style as baseline migration using raw SQL), creating **sessions** first, then **magic_links**, then indexes.
4. Implement **`down`** with `DROP TABLE IF EXISTS` in safe order (magic_links before sessions).
5. Run the project’s migrate script against a dev database; resolve any name collision if tables already exist from manual experiments.

## Checkpoint
- Migration file committed; `up` applies without error on a clean dev DB (or documented baseline path).
- Both tables visible in PostgreSQL with expected columns and indexes from 2A.1.
- `down` runs without error on a DB that only has these two new tables (or full down documented if bundled with irreversible baseline policy).
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.1.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
