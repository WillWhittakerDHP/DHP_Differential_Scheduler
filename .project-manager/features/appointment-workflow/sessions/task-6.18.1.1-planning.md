# Plan: task 6.18.1.1 — Shared user role catalog, migration, server alignment

## Contract

- **Tier:** task | **ID:** 6.18.1.1 | **Parent session:** 6.18.1
- **Scope:** `@shared` role tuple + constants; PostgreSQL `enum_users_user_role` migration (`seller` → `owner`); server Joi, Sequelize `User` model, `userTypeMapping`, and server-only `seller` string literals (middleware, appointment router).
- **Governance:** Shared constants consumed by server; explicit types on exports; logger on migration failure paths if any try/catch is added; no silent role fallback in `userTypeMapping`.

## Where we left off

Session **6.18.1** approved: catalog + rename is split so this task owns **shared + DB + server**; task **6.18.1.2** owns client/booking surfaces.

## Story

This task introduces **`USER_ROLE_VALUES`** and **`USER_ROLE_OWNER`** in `@shared`, migrates existing **`users.user_role`** rows and the PostgreSQL enum from **`seller`** to **`owner`**, and rewires **server** validation and models so Joi and Sequelize both use the same shared list—eliminating duplicate arrays and server-side `seller` literals before the client task runs.

## Codebase recon (agent-led — required)

**Paths reviewed:** `shared/constants/roleConstants.ts`, `server/src/constants/userRoles.ts`, `server/src/routes/schemas/userSchemas.ts`, `server/src/db/models/participantModels/Users.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/routes/internal/appointments/appointmentRouter.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/middlewares/ownershipChecks.ts`, `server/src/db/migrations/20260432_000045_magic_links_user_id_nullable_admin_enum_will_user.mjs`, `server/src/db/migrations/20260320_000001_baseline_schema.sql` (enum `enum_users_user_role`).

**Patterns / call sites:** Joi duplicates a six-role array including `'seller'`. `User` model ENUM and TS union mirror that list. `userTypeMapping` maps `'seller'` → block display name `'Seller'`. `appointmentRouter` and ownership middleware compare role to `'seller'`. Migrations use `DO $migrate$` blocks with `pg_enum` checks before `ALTER TYPE ... ADD VALUE`.

**Gaps / unknowns:** Confirm target PostgreSQL version for **`ALTER TYPE ... RENAME VALUE`** (PG 15+); if unavailable, use **add `owner` → UPDATE rows → leave `seller` label unused** (document in migration comment). Grep seeds and raw SQL under `server/` for `'seller'` after code changes.

## Analysis

- **Problem:** Without a single shared list, renaming `seller` requires editing many server files and risks Joi/model drift.
- **Boundaries:** **`@shared`** owns string literals for roles; **server** owns migration and Sequelize/Joi consumption only—no Vue files in this task.
- **Patterns:** Extend `roleConstants.ts` (already exports `USER_ROLE_CLIENT` / `USER_ROLE_AGENT`); keep `server/src/constants/userRoles.ts` as re-export barrel for server imports where convenient.
- **Risks:** Enum migrations are order-sensitive; down migration may be no-op for enum label removal; shared package must resolve in both TS compile paths (`tsc` / `tsx`).
- **Alternative considered:** New file `shared/constants/userRoleCatalog.ts`—only if `roleConstants.ts` becomes crowded; default is extend existing module.

## Design

**Data model:** `public.enum_users_user_role` gains `owner` (or renames `seller` via PG15+), and `public.users.user_role` stores `owner` for former sellers.

**Shared module:**

- Export `USER_ROLE_TRANSACTION_MANAGER`, `USER_ROLE_OWNER`, `USER_ROLE_INSPECTOR`, `USER_ROLE_ADMIN` as `as const` strings aligned with DB.
- Export `USER_ROLE_VALUES` as readonly tuple or array used by Joi `.valid(...USER_ROLE_VALUES)` and Sequelize `DataTypes.ENUM(...USER_ROLE_VALUES)`.
- Export type `UserRoleValue = (typeof USER_ROLE_VALUES)[number]` for server typing.

**Migration (new `.mjs` under `server/src/db/migrations/`):**

- Follow naming sequence after latest `20260432_*` file.
- Up: ensure enum has `owner`; move data `seller` → `owner`; if using RENAME, `ALTER TYPE public.enum_users_user_role RENAME VALUE 'seller' TO 'owner'` (PG 15+). Else: `ADD VALUE` + `UPDATE users SET user_role = 'owner' WHERE user_role = 'seller'`.
- Down: document limitation (cannot safely restore seller without data loss) — prefer minimal no-op or reverse UPDATE only if enum still has both values.

**Server code:**

- `userSchemas.ts`: import `USER_ROLE_VALUES` from `@shared` path used elsewhere in server (match existing import style for `roleConstants.js`).
- `Users.ts`: ENUM values from shared; TS `userRole` type uses `UserRoleValue` or mapped typeof from shared.
- `userTypeMapping.ts`: replace key `'seller'` with `USER_ROLE_OWNER`; map to block name **Owner** (or keep **Seller** display until block instance seed rename—document one-line in task-end note if DB block name lags).
- `appointmentRouter`, `ownershipEnforcement`, `ownershipChecks`: use `USER_ROLE_OWNER` constant instead of string literal.

## Goal

Ship **one shared authoritative role list** and complete **server-side** `seller` → `owner` migration and code alignment so the API and DB agree before client work in **6.18.1.2**.

## Files (primary)

| Layer | Paths |
|--------|--------|
| Shared | `shared/constants/roleConstants.ts` |
| Server | `server/src/routes/schemas/userSchemas.ts`, `server/src/db/models/participantModels/Users.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/constants/userRoles.ts`, `server/src/routes/internal/appointments/appointmentRouter.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/middlewares/ownershipChecks.ts`, **new** `server/src/db/migrations/20260432_000056_*.mjs` (or next sequence) |

## Approach

1. Add role constants + `USER_ROLE_VALUES` + `UserRoleValue` type in `shared/constants/roleConstants.ts`; re-export from `server/src/constants/userRoles.ts` as needed.
2. Author migration for `enum_users_user_role` + `users` data; follow repo migration guard (run only on localhost DB per policy).
3. Wire Joi and Sequelize `User` to shared values; update `userTypeMapping` and server middleware/routes to use `USER_ROLE_OWNER`.
4. Run `cd server && npm run lint`; grep `server/` for `'seller'` in role context; fix stragglers.
5. Do **not** change client Vue/TS in this task (deferred to **6.18.1.2**).

## Checkpoint

- Migration applies cleanly on dev DB; `users.user_role` has no `seller` values.
- Server lint passes; `userSchemas` and `User` model reference only shared array.
- No remaining `'seller'` string in server role checks except migration/SQL comments if documented.

## Deliverables

- Updated `roleConstants.ts` with full role catalog and `owner`.
- New Sequelize migration file.
- Updated server files in the table above; `userTypeMapping` uses owner key.

## Acceptance criteria

- [ ] `USER_ROLE_VALUES` defined once in `@shared` and imported by `userSchemas.ts` and `Users.ts`.
- [ ] Migration updates enum + existing user rows from `seller` to `owner`.
- [ ] Server grep shows no business-logic `'seller'` for `user_role` (migration allowed).
- [ ] `npm run lint` in `server/` passes.

## Definition of done

- [ ] App starts (`npm run start:dev`) after full stack eventually matches (may require 6.18.1.2 for client—note in session log if client still sends `seller` until then).
- [ ] `cd server && npm run lint` passes.
- [ ] Session guide task checkbox for 6.18.1.1 updated at task-end.

## Reference

- Session: `sessions/session-6.18.1-planning.md`, `sessions/session-6.18.1-guide.md`
- Phase: `phases/phase-6.18-guide.md`
- `.project-manager/ARCHITECTURE.md` — Users / `user_role`

## Architecture context (pointer)

Full domain map and booking boundaries: `.project-manager/ARCHITECTURE.md` (§ Users / `user_role`, type boundaries). Session planning doc contains the extended excerpt if needed.
