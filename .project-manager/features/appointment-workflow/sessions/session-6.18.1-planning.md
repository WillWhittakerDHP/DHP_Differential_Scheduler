# Session 6.18.1 — Shared user role catalog + `seller` → `owner` + audit

## Contract

- **Tier:** session | **ID:** 6.18.1 | **Parent phase:** 6.18

## Story

Operators and integrators need **one authoritative list** of `users.user_role` values and a **product-correct** rename from **seller** to **owner** end-to-end. This session delivers the shared catalog, database migration, server validation/model alignment, client types and UI, booking/transformer paths, and a grep-backed audit so nothing still encodes a parallel role list or the old `seller` API value.

## Analysis

- **Why now:** Phase 6.18 guide and `ARCHITECTURE.md` already call for `@shared` `USER_ROLE_VALUES` and the rename; duplicate arrays in Joi, Sequelize, and Vue make drift and partial renames likely.
- **Domains:** **Shared** owns the string catalog; **server** owns ENUM migration, Joi, Sequelize, `userTypeMapping`, middleware, and appointment routes; **client** owns types, admin selects, booking builders/transformers, and redirect allowlists.
- **Risks:** PostgreSQL ENUM rename order (add `owner`, backfill, drop `seller` or equivalent safe sequence per project conventions); wizard/attendee shapes that use both **display** names and **DB** role strings must stay consistent; seeds and fixtures must be updated in the same change set as the migration.
- **Patterns:** Extend `shared/constants/roleConstants.ts` (already exports `USER_ROLE_CLIENT` / `USER_ROLE_AGENT`); keep `server/src/constants/userRoles.ts` as a thin re-export layer; preserve `userTypeMapping` warn behavior for unknown roles—update map key from seller to owner and document block instance display naming in session log if seeds change.

## Codebase recon (agent-led — required)

**Paths reviewed:** `shared/constants/roleConstants.ts`, `server/src/constants/userRoles.ts`, `server/src/routes/schemas/userSchemas.ts`, `server/src/db/models/participantModels/Users.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/routes/internal/appointments/appointmentRouter.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/middlewares/ownershipChecks.ts`, `client/src/types/user.ts`, `shared/types/appointmentTypes.ts`, `client/src/utils/booking/appointmentDataBuilders.ts`, `client/src/utils/transformers/appointmentToWizardTransformer.ts`, `client/src/utils/authRedirect.ts`, `client/src/views/admin/tabs/components/InlineEditUserRoleCell.vue`, `client/src/utils/booking/wizardContactsStepFromState.ts`, `client/src/types/booking/injectionContexts.ts`.

**Patterns / call sites:** Joi duplicates a local `USER_ROLE_VALUES` array; `Users` model ENUM mirrors it; client unions and `ROLE_ITEMS` repeat the same set; `appointmentDataBuilders` defines `APPOINTMENT_ATTENDEE_ROLES.seller`; transformers and injection contexts reference `'seller'`; `userTypeMapping` maps `'seller'` → `'Seller'` block name.

**Gaps / unknowns:** Confirm latest migration naming/sequence under `server/src/db/migrations`; scan seeds and test fixtures for `seller` before task-end; optional `inspector` / `transaction_manager` handling stays unchanged except as part of the shared tuple.

## Goal

Introduce a **single `@shared`** export for allowed `user_role` strings, migrate **`seller` → `owner`** at the database and application layers, and **audit** the codebase so no feature uses a divergent hardcoded list.

## Files (primary)

| Layer | Paths |
|-------|--------|
| Shared | `shared/constants/roleConstants.ts` (or new `userRoleCatalog` if split is clearer) |
| Server | `server/src/routes/schemas/userSchemas.ts`, `server/src/db/models/participantModels/Users.ts`, new migration under `server/src/db/migrations/`, `server/src/utils/userTypeMapping.ts`, `server/src/constants/userRoles.ts`, appointment + middleware files above |
| Client | `client/src/types/user.ts`, `shared/types/appointmentTypes.ts`, `client/src/constants/attendeeRoles.ts` (re-exports), admin + booking files above |

## Approach

1. Define **`USER_ROLE_VALUES`** and **`USER_ROLE_OWNER`** (`'owner'`) in `@shared`; export typed helpers or const object so Joi and Sequelize consume the same array.
2. Add migration: align PostgreSQL ENUM and rows (`seller` → `owner`); follow repo migration guard policy.
3. Replace server duplicates (Joi, model) with shared imports; update `userTypeMapping` and all server string literals (`requireRole`, ownership checks).
4. Task **6.18.1.2** updates client types, Vue role pickers, booking builders/transformers, auth redirect lists; run repo-wide search for `seller` and for ad-hoc role arrays; fix stragglers.
5. Verify lint, types, and app start; note grep evidence in session log.

## Decomposition (Leaf tier)

- **Task 6.18.1.1:** **Shared catalog + migration + server alignment** — Add `@shared` role tuple and `owner` constant; migration for ENUM + data; Joi + Sequelize + `userTypeMapping` + server routes/middleware free of `seller` and duplicate role arrays.
- **Task 6.18.1.2:** **Client + booking audit** — Client types, admin role UI, appointment transformers/builders/contacts, `authRedirect`; full-stack grep for `seller` and parallel role lists; align `shared/types/appointmentTypes.ts` with catalog.

## Checkpoint

After 6.18.1.1: DB and API accept `owner` only for the renamed role; server build passes. After 6.18.1.2: client and shared consumer types compile; no `seller` in product role semantics; grep clean for agreed patterns.

## Deliverables

- Shared module consumed by server and client for allowed roles.
- One forward migration (and updated seeds if present).
- Session log entry with grep notes; task planning files for 6.18.1.1 / 6.18.1.2 filled at task-start.

## Acceptance criteria

- [ ] Single shared module is the authoritative list for allowed roles (Joi + Sequelize + primary client unions derive from it).
- [ ] No remaining `seller` in persisted role semantics (DB rows, API payloads, types used for `user_role`).
- [ ] `userTypeMapping` uses `owner` key; unknown roles still log per existing pattern.
- [ ] Lint passes; Vue and server apps start locally.

## Out of scope

- Session 6.18.2 admin alignment UI (configurable role → `block_instance_id`).
- Adding new role values beyond the seller→owner rename.

## Dependencies

- Phase 6.18 guide (`phases/phase-6.18-guide.md`); migration execution only when `DB_HOST` is local per project policy.

## Reference

- `phases/phase-6.18-guide.md`, `phases/phase-6.18-planning.md`
- `.project-manager/ARCHITECTURE.md` — Users / `user_role`
