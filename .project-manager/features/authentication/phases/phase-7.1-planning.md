# Plan: phase 7.1 — 7.1

## Contract
- **Tier:** phase | **ID:** 7.1
- **Scope:** 7.1
- **Governance:** 2 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Feature **authentication** is in planning; **Phase 7.1** is the first build slice: persist sessions and magic-link tokens in PostgreSQL so Phase 7.2 can implement session manager and middleware. No auth routes or strategies in this phase—data layer only. Harness warning about “phase 7.1 not listed” was from a stale parse; the feature guide lists **Phase 7.1: Database & Models** under Phases Breakdown.

## Goal
Deliver **Phase 7.1 — Database & Models** for Feature 7: Sequelize migrations and models for **`sessions`** and **`magic_links`** (columns and indexes aligned with LAUNCH_CHECKLIST Phase 2A / PROJECT_PLAN Step 1), models registered in the DB index, and a verified migrate/sync path so Phase 7.2 can depend on real tables.

## Files
- `server/src/db/migrations/` — new migration(s) for `sessions`, `magic_links` (and any minimal supporting indexes/constraints)
- `server/src/db/models/` — new models (e.g. under `auth/` or `booking/` per existing conventions), plus `index.ts` registration
- `server/docs/SECURITY_STUBS.md` or inline comments — only if documenting table semantics; no functional auth code required here
- Phase guide: `.project-manager/features/authentication/phases/phase-7.1-guide.md` (session list stays in sync with tierDown below)

## Approach
1. Align column shapes with the planned session contract: session id, user linkage (or nullable until users exist), expiry, cookie/session secret storage strategy as per team decision; magic link token, expiry, consumed flag, email linkage.
2. Author idempotent migrations using the project’s existing migration style (e.g. `.mjs` / Sequelize CLI pattern already in repo).
3. Implement Sequelize models with explicit fields, timestamps, and associations only where the schema requires them; avoid inventing columns not needed for 7.2–7.3.
4. Register models in `server/src/db/models/index.ts` and ensure the app boots and migrations run against dev DB without errors.
5. Stop at DB boundary: do not implement `auth/` router, magic link send, or middleware in this phase.

## Checkpoint
- Migrations apply cleanly on a fresh or migrated dev database; tables exist with expected columns and indexes.
- Models load without Sequelize errors; `index.ts` exports/register paths match project patterns.
- Phase 7.2 can start immediately: session manager can assume tables exist (or document any temporary stub columns).

## How we build the tierDown to achieve them
- **Session 7.1.1:** Migrations for `sessions` and `magic_links` tables
- **Session 7.1.2:** Sequelize models, fields, and associations for auth tables
- **Session 7.1.3:** Register models in DB index and verify migrate/boot path
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/feature-authentication-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
