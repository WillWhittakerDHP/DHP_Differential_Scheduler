<!-- harness-planning-rollup tier=phase id=6.18 consolidatedAt=2026-04-02T01:17:13.756Z -->

# Consolidated planning: phase 6.18

## Phase 6.18 (parent)

## Story

**This phase delivers** a single **canonical user-role vocabulary** and **aligned** role→user-type block resolution **so that** API/DB/client stay in sync, product language can rename `seller` → `owner` safely, and (Session 6.18.2) operators can adjust role→block mappings without scattered code edits.

**Estimated size:** L (two sessions: full-stack rename + migration; then admin/API persistence).

---

## Analysis

- **Problem / why now:** Role strings are **duplicated** today: Joi (`server/src/routes/schemas/userSchemas.ts` local `USER_ROLE_VALUES`), Sequelize ENUM in `server/src/db/models/participantModels/Users.ts`, client `client/src/types/user.ts`, `InlineEditUserRoleCell.vue` `ROLE_ITEMS`, `authRedirect.ts`, `appointmentDataBuilders.ts`, plus `shared/types/appointmentTypes.ts` union. That blocks a consistent **`seller` → `owner`** rename and risks drift vs Feature 7 Enactment.
- **Domains (ARCHITECTURE.md):** **Auth / Sessions** + **Shared** — canonical strings live in `@shared`; server validates and persists; client types and admin UI consume the same exports. **Scheduling / block instances:** `getUserTypeBlockIdForRole` bridges DB role → user-type block instance (Session 6.18.2 adds config-first path).
- **Patterns to follow:** Extend existing **`shared/constants/roleConstants.ts`** (already sources `USER_ROLE_CLIENT` / `USER_ROLE_AGENT` for server `userRoles.ts` re-export). **PostgreSQL ENUM** changes only via migrations; respect migration guard (`DB_HOST` localhost) for local execution.
- **Risks:** ENUM alter + row update must be ordered; booking/wizard paths use `'seller'` in transformers and contacts — rename must include **attendee role** fields where they mirror DB role. External docs (Feature 7, 9, 17) need example updates. Seeds and magic-link test users must match new enum value.
- **Out of scope for 6.18:** Replacing Feature 7 auth implementation — only **vocabulary alignment** and documented mapping; full “business admin” overhaul may defer UI placement to Feature 17 (see phase guide).

---

## Goal

Deliver a **maintainable user role vocabulary** aligned with booking and admin flows, rename **`seller`** to **`owner`**, and reduce drift between **ENUM/API/UI** and **user-type block instances** (Session 6.18.2 for operator-driven alignment).

---

## Approach

1. **6.18.1:** Add **`USER_ROLE_VALUES`** (and per-role exports as needed) in `@shared`; migration: ENUM rename + row updates; replace duplicate arrays with shared imports across server/client; grep for `seller` and stray role lists; update middleware, routers, builders, transformers, admin select.
2. **6.18.2:** Minimal persistence for **role key → `block_instance_id`**; admin matrix fed from user-type instances; **`getUserTypeBlockIdForRole`** prefers persisted config, then legacy name map; document defaults/seeds.

---

## Checkpoint

After 6.18.1: any API consumer sees `owner` only (no `seller` in new writes); DB ENUM and Joi agree with `@shared`. After 6.18.2: changing a mapping in admin affects `getUserTypeBlockIdForRole` without a code deploy for that path.

---

## Deliverables

- Session planning files: `sessions/session-6.18.1-planning.md`, `sessions/session-6.18.2-planning.md` (filled at session-start).
- Migrations + shared module + grep-clean codebase per guide.
- Phase guide: `phases/phase-6.18-guide.md` (reference); update Feature 6 / Feature 7 cross-links if examples still say `seller`.

---

---

## Session 6.18.1 (source: session-6.18.1-planning.md)

### Story

Operators and integrators need **one authoritative list** of `users.user_role` values and a **product-correct** rename from **seller** to **owner** end-to-end. This session delivers the shared catalog, database migration, server validation/model alignment, client types and UI, booking/transformer paths, and a grep-backed audit so nothing still encodes a parallel role list or the old `seller` API value.

### Analysis

- **Why now:** Phase 6.18 guide and `ARCHITECTURE.md` already call for `@shared` `USER_ROLE_VALUES` and the rename; duplicate arrays in Joi, Sequelize, and Vue make drift and partial renames likely.
- **Domains:** **Shared** owns the string catalog; **server** owns ENUM migration, Joi, Sequelize, `userTypeMapping`, middleware, and appointment routes; **client** owns types, admin selects, booking builders/transformers, and redirect allowlists.
- **Risks:** PostgreSQL ENUM rename order (add `owner`, backfill, drop `seller` or equivalent safe sequence per project conventions); wizard/attendee shapes that use both **display** names and **DB** role strings must stay consistent; seeds and fixtures must be updated in the same change set as the migration.
- **Patterns:** Extend `shared/constants/roleConstants.ts` (already exports `USER_ROLE_CLIENT` / `USER_ROLE_AGENT`); keep `server/src/constants/userRoles.ts` as a thin re-export layer; preserve `userTypeMapping` warn behavior for unknown roles—update map key from seller to owner and document block instance display naming in session log if seeds change.

### Goal

Introduce a **single `@shared`** export for allowed `user_role` strings, migrate **`seller` → `owner`** at the database and application layers, and **audit** the codebase so no feature uses a divergent hardcoded list.

### Files

| Layer | Paths |
|-------|--------|
| Shared | `shared/constants/roleConstants.ts` (or new `userRoleCatalog` if split is clearer) |
| Server | `server/src/routes/schemas/userSchemas.ts`, `server/src/db/models/participantModels/Users.ts`, new migration under `server/src/db/migrations/`, `server/src/utils/userTypeMapping.ts`, `server/src/constants/userRoles.ts`, appointment + middleware files above |
| Client | `client/src/types/user.ts`, `shared/types/appointmentTypes.ts`, `client/src/constants/attendeeRoles.ts` (re-exports), admin + booking files above |

### Approach

1. Define **`USER_ROLE_VALUES`** and **`USER_ROLE_OWNER`** (`'owner'`) in `@shared`; export typed helpers or const object so Joi and Sequelize consume the same array.
2. Add migration: align PostgreSQL ENUM and rows (`seller` → `owner`); follow repo migration guard policy.
3. Replace server duplicates (Joi, model) with shared imports; update `userTypeMapping` and all server string literals (`requireRole`, ownership checks).
4. Task **6.18.1.2** updates client types, Vue role pickers, booking builders/transformers, auth redirect lists; run repo-wide search for `seller` and for ad-hoc role arrays; fix stragglers.
5. Verify lint, types, and app start; note grep evidence in session log.

### Checkpoint

After 6.18.1.1: DB and API accept `owner` only for the renamed role; server build passes. After 6.18.1.2: client and shared consumer types compile; no `seller` in product role semantics; grep clean for agreed patterns.

### Deliverables

- Shared module consumed by server and client for allowed roles.
- One forward migration (and updated seeds if present).
- Session log entry with grep notes; task planning files for 6.18.1.1 / 6.18.1.2 filled at task-start.

---

---

## Session 6.18.2 (source: session-6.18.2-planning.md)

### Story

Operators need to **choose which user-type block instance** backs each canonical **`users.user_role`** without shipping code. Today **`getUserTypeBlockIdForRole`** resolves via **`ROLE_TO_BLOCK_NAME`** in `server/src/utils/userTypeMapping.ts` and a DB lookup by **instance name** under **state-control** block shapes. That breaks when instances are renamed or duplicated. This session adds **persisted overrides** (role → `block_instance_id`), **validated APIs**, and **admin UI**, with the **existing name map as fallback** when a role has no override.

### Analysis

- **Why now:** `ARCHITECTURE.md` and `phase-6.18-guide.md` already commit to admin-persisted alignment; 6.18.1 stabilized role strings so keys are stable for storage.
- **Domains:** **Server** — persistence, Joi validation, `getUserTypeBlockIdForRole` read order, cache invalidation; **Admin client** — settings surface (Business Controls or Users-adjacent tab), pickers fed from metadata API for **user-type** instances; **Shared** — optional DTO type for alignment payload (`Record<UserRoleValue, uuid | null>`) if both sides consume it.
- **Risks:** Wrong `block_instance_id` → attendee creation fails or maps to wrong wizard state; must validate **instance exists**, **`block_shape.type === 'user'`**, and **`isStateControl`** on parent shape (same criteria as `findUserTypeBlockByName`). **Migration guard:** only run DDL on localhost per project rules.
- **Patterns:** Mirror **`business-settings`** key pattern (`businessSettingsCrudRouter`, `checkOwnership('businessSetting', …)`) for a dedicated key (e.g. `user_role_block_alignment`) **or** introduce a small table if JSON size/auditing warrants it — **decide in task 6.18.2.1** with preference for **one JSONB row** keyed like availability unless multiple writers conflict.
- **No silent fallback:** Unmapped role → keep current **warn** + `null`; unknown UUID in payload → **400** with clear error.

### Goal

Let operators **align** each canonical **`user_role`** to a **user-type block instance** via admin UI and persisted config, so **`getUserTypeBlockIdForRole`** uses **stored `block_instance_id` first** and falls back to the **legacy name-based map** when unset.

### Files

| Layer | Paths (expected touch) |
|--------|-------------------------|
| Server | `userTypeMapping.ts` (read overrides + cache bust), **new** alignment service + validation helper, `businessSettings` **or** new migration/model, **new** internal routes under `routes/internal/`, constants for setting key |
| Shared | Optional `shared/types/` or `shared/constants` for alignment payload / keys |
| Client | Admin view + composable for load/save; API client module; reuse `USER_ROLE_VALUES` for row labels |

### Approach

1. **Persistence:** Add storage for `Record<roleKey, blockInstanceId | null>` (subset of roles that need user-type mapping — likely all entries currently in `ROLE_TO_BLOCK_NAME` plus `admin` if ever needed; **product call:** map only roles that appear in attendee creation).
2. **Validation:** On write, each non-null UUID must resolve to a `block_instances` row whose shape is **user** and **state-control** (reuse query logic aligned with `findUserTypeBlockByName`).
3. **Runtime:** `getUserTypeBlockIdForRole`: if override present, return it (and optionally cache by role); else existing name path. **Invalidate** role/block cache when settings update.
4. **Admin UI:** Table: label per role (`USER_ROLE_VALUES` or filtered list) → autocomplete/select of eligible instances (name + id); save dirty state; link to Instances docs in help text.
5. **Docs:** Session log + `ARCHITECTURE.md` one-line update when delivered; seed note for default alignment in dev.

### Checkpoint

After **6.18.2.1:** API returns/saves alignment; server resolves attendees using overrides in a manual or integration check. After **6.18.2.2:** Admin can change mapping without code; lint and app start pass.

### Deliverables

- Persisted role → `block_instance_id` map (validated).
- GET/PUT (or PATCH) API for alignment.
- Admin UI matrix/list with pickers.
- `getUserTypeBlockIdForRole` reads config first; legacy map fallback; cache safety.
- Brief doc/seed note for defaults.

---

---
