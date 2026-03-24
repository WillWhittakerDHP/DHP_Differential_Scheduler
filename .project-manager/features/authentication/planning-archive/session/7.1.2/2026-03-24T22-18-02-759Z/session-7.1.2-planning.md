# Plan: session 7.1.2 — Sequelize models — register Session and MagicLink (or agreed names), associations, model index wiring

## Contract
- **Tier:** session | **ID:** 7.1.2
- **Scope:** Sequelize models — register Session and MagicLink (or agreed names), associations, model index wiring
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
Session **7.1.1** complete on `phase-7.1`: PostgreSQL migrations for `public.sessions` and `public.magic_links` are merged. This session adds **Sequelize models only** (no new DDL, no auth routes/middleware).

## Goal
Add **Sequelize model definitions** for the **`sessions`** and **`magic_links`** tables created in 7.1.1, match column types/names/nullability to the migrations, register models in **`initializeModels`** / model bag, and define **`User`** associations where the schema has `user_id` FKs. Out of scope: Express session middleware, passport/strategies, client — Phase **7.2+**.

## Files
- **Migrations (read-only alignment):** `server/src/db/migrations/*sessions*`, `server/src/db/migrations/*magic*link*` (exact filenames on disk from 7.1.1).
- **New models:** e.g. `server/src/db/models/auth/session.ts`, `server/src/db/models/auth/magic_link.ts` (or same folder naming pattern as repo conventions — mirror `participantModels/Users.ts` style).
- **Wiring:** `server/src/db/models/index.ts` (factory + `initializeModels` locals bag), `server/src/db/models/sequelizeModelsBag.ts` if the project exports a typed model map, `server/src/db/models/sequelizeModelAssociations*.ts` for `User` ↔ `Session` / `MagicLink` as applicable.
- **Reference:** `server/src/db/models/participantModels/Users.ts` for FK target and association style.
- **Not in scope:** `server/src/auth/**`, `client/**`, new migrations.

## Approach
1. Read 7.1.1 migration files and list exact table/column names; implement `Session` and `MagicLink` with `Model.init` + shared column helpers if the codebase uses them (`manualCreatedUpdatedAtColumns`, etc.).
2. Register both factories in `initializeModels`, pass instances into `associateSequelizeModels` (or equivalent) and add `belongsTo`/`hasMany` only where DDL supports it.
3. Run **server lint** after edits; run **migrations** only per DB policy (`DB_HOST` localhost). No new routes or session store wiring until 7.2.

## Checkpoint
- App bootstrap loads models without Sequelize errors; model attributes match migrations (including JSON/BLOB and timestamp fields).
- Associations compile and match FKs; no orphan `include` requirements for unrelated domains.
- `npm run lint` (server) clean for touched files.

## How we build the tierDown to achieve them
- **Task 7.1.2.1:** Define `Session` and `MagicLink` Sequelize models aligned with 7.1.1 migrations.
- **Task 7.1.2.2:** Register models in `index.ts` / model bag and wire associations to `User`.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.1-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/session-7.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
