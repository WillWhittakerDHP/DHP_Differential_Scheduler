# Plan: session 7.1.1 — Migrations for sessions and magic_links

## Contract
- **Tier:** session | **ID:** 7.1.1
- **Scope:** Database migrations only for `sessions` and `magic_links` (no Sequelize models in this session — Session 7.1.2)
- **Governance:** 3 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase 7.1 is open on branch `phase-7.1`; this is the first session — only DDL. Models and `index.ts` registration belong to **7.1.2** and **7.1.3**.

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

## How we build the tierDown to achieve them
- **Task 7.1.1.1:** Add migration creating `sessions` and `magic_links` + indexes + FK to `users` per LAUNCH_CHECKLIST 2A.1
- **Task 7.1.1.2:** Run migrate (up/down smoke), fix DDL drift vs actual `users` model, and align filename with repo migration ordering
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.1-guide.md`
- Checklist DDL: `LAUNCH_CHECKLIST.md` — item **2A.1**
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
