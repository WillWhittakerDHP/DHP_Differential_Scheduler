<!-- harness-planning-rollup tier=session id=6.18.1 consolidatedAt=2026-04-02T00:08:40.400Z -->

# Consolidated planning: session 6.18.1

## Session 6.18.1 (parent)

## Story

Operators and integrators need **one authoritative list** of `users.user_role` values and a **product-correct** rename from **seller** to **owner** end-to-end. This session delivers the shared catalog, database migration, server validation/model alignment, client types and UI, booking/transformer paths, and a grep-backed audit so nothing still encodes a parallel role list or the old `seller` API value.

## Analysis

- **Why now:** Phase 6.18 guide and `ARCHITECTURE.md` already call for `@shared` `USER_ROLE_VALUES` and the rename; duplicate arrays in Joi, Sequelize, and Vue make drift and partial renames likely.
- **Domains:** **Shared** owns the string catalog; **server** owns ENUM migration, Joi, Sequelize, `userTypeMapping`, middleware, and appointment routes; **client** owns types, admin selects, booking builders/transformers, and redirect allowlists.
- **Risks:** PostgreSQL ENUM rename order (add `owner`, backfill, drop `seller` or equivalent safe sequence per project conventions); wizard/attendee shapes that use both **display** names and **DB** role strings must stay consistent; seeds and fixtures must be updated in the same change set as the migration.
- **Patterns:** Extend `shared/constants/roleConstants.ts` (already exports `USER_ROLE_CLIENT` / `USER_ROLE_AGENT`); keep `server/src/constants/userRoles.ts` as a thin re-export layer; preserve `userTypeMapping` warn behavior for unknown roles—update map key from seller to owner and document block instance display naming in session log if seeds change.

## Goal

Introduce a **single `@shared`** export for allowed `user_role` strings, migrate **`seller` → `owner`** at the database and application layers, and **audit** the codebase so no feature uses a divergent hardcoded list.

## Files

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

## Checkpoint

After 6.18.1.1: DB and API accept `owner` only for the renamed role; server build passes. After 6.18.1.2: client and shared consumer types compile; no `seller` in product role semantics; grep clean for agreed patterns.

## Deliverables

- Shared module consumed by server and client for allowed roles.
- One forward migration (and updated seeds if present).
- Session log entry with grep notes; task planning files for 6.18.1.1 / 6.18.1.2 filled at task-start.

---

## Task 6.18.1.1 (source: task-6.18.1.1-planning.md)

### Story

This task introduces **`USER_ROLE_VALUES`** and **`USER_ROLE_OWNER`** in `@shared`, migrates existing **`users.user_role`** rows and the PostgreSQL enum from **`seller`** to **`owner`**, and rewires **server** validation and models so Joi and Sequelize both use the same shared list—eliminating duplicate arrays and server-side `seller` literals before the client task runs.

### Analysis

- **Problem:** Without a single shared list, renaming `seller` requires editing many server files and risks Joi/model drift.
- **Boundaries:** **`@shared`** owns string literals for roles; **server** owns migration and Sequelize/Joi consumption only—no Vue files in this task.
- **Patterns:** Extend `roleConstants.ts` (already exports `USER_ROLE_CLIENT` / `USER_ROLE_AGENT`); keep `server/src/constants/userRoles.ts` as re-export barrel for server imports where convenient.
- **Risks:** Enum migrations are order-sensitive; down migration may be no-op for enum label removal; shared package must resolve in both TS compile paths (`tsc` / `tsx`).
- **Alternative considered:** New file `shared/constants/userRoleCatalog.ts`—only if `roleConstants.ts` becomes crowded; default is extend existing module.

### Goal

Ship **one shared authoritative role list** and complete **server-side** `seller` → `owner` migration and code alignment so the API and DB agree before client work in **6.18.1.2**.

### Files

| Layer | Paths |
|--------|--------|
| Shared | `shared/constants/roleConstants.ts` |
| Server | `server/src/routes/schemas/userSchemas.ts`, `server/src/db/models/participantModels/Users.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/constants/userRoles.ts`, `server/src/routes/internal/appointments/appointmentRouter.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/middlewares/ownershipChecks.ts`, **new** `server/src/db/migrations/20260432_000056_*.mjs` (or next sequence) |

### Approach

1. Add role constants + `USER_ROLE_VALUES` + `UserRoleValue` type in `shared/constants/roleConstants.ts`; re-export from `server/src/constants/userRoles.ts` as needed.
2. Author migration for `enum_users_user_role` + `users` data; follow repo migration guard (run only on localhost DB per policy).
3. Wire Joi and Sequelize `User` to shared values; update `userTypeMapping` and server middleware/routes to use `USER_ROLE_OWNER`.
4. Run `cd server && npm run lint`; grep `server/` for `'seller'` in role context; fix stragglers.
5. Do **not** change client Vue/TS in this task (deferred to **6.18.1.2**).

### Checkpoint

- Migration applies cleanly on dev DB; `users.user_role` has no `seller` values.
- Server lint passes; `userSchemas` and `User` model reference only shared array.
- No remaining `'seller'` string in server role checks except migration/SQL comments if documented.

### Deliverables

- Updated `roleConstants.ts` with full role catalog and `owner`.
- New Sequelize migration file.
- Updated server files in the table above; `userTypeMapping` uses owner key.

### Design

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

---

## Task 6.18.1.2 (source: task-6.18.1.2-planning.md)

### Story

This task **confirms** the **`seller` → `owner`** rename is consistent across **client and shared** surfaces, **documents** allowed exceptions (legacy persisted wizard JSON, migration SQL, block-instance **name** `"Seller"`, unrelated copy), and **captures** the audit in the session log so Session **6.18.1** can end cleanly.

### Analysis

- **Problem:** Session **6.18.1** promised a **grep-backed audit**; without a recorded pass, drift can return unnoticed.
- **Boundaries:** **Client + shared** source under repo roots above; **no** new server behavior unless a straggler `seller` appears in `server/src` **role** checks (unlikely after 6.18.1.1).
- **Patterns:** Prefer `USER_ROLE_*` / `USER_ROLE_VALUES` from `@shared` via `attendeeRoles`; keep legacy **`seller`** only in wizard **persisted-role** union and equality checks for **migration of old state**.
- **Risks:** Renaming UI field names (`sellerInfo`, `showSeller`) is **high churn** for validators and injection keys — **not required** for this task; they denote the **owner** contact slot, not the DB enum string.
- **Alternatives:** Full rename to `ownerInfo` everywhere — defer to a follow-up UX pass if product wants.

### Goal

Close **Session 6.18.1** with a **documented, grep-verified** client/shared alignment to **`owner`**, with **no** unintended **`seller`** API values and **no** stray hardcoded full role lists in product source.

### Files

| Action | Paths |
|--------|--------|
| Verify / tiny edits | Any straggler under `client/src`, `shared/` found by grep |
| Session record | `sessions/session-6.18.1-log.md` (audit excerpt) |
| Optional doc | `.project-manager/ARCHITECTURE.md` § Users / `user_role` |

### Approach

1. Run targeted search (e.g. `rg seller client/src server/src shared`) and triage each match.
2. Fix only **product** issues (e.g. forgotten `'seller'` in a role union or items array).
3. Append grep summary to **session log**.
4. Run `vue-tsc -b`, `server` `tsc --noEmit`, `npm run lint` in `client` and `server`.
5. If all clean, optionally update **ARCHITECTURE.md** one bullet to reflect **delivered** catalog/rename.

### Checkpoint

- Grep triage documented; **no** `seller` as **current** API `user_role` in app source except legacy wizard read paths and comments.
- Lint + typecheck pass.

### Deliverables

- Session log audit note.
- Zero or minimal code diffs (stragglers only).
- Optional ARCHITECTURE.md tweak.

### Design

1. **Grep:** Search `client/src`, `server/src`, `shared/` for `seller` / `"seller"` / `'seller'`; classify each hit (allowlist vs fix).
2. **Fix:** Only if a hit maps to **live `user_role`** or a **parallel role array**; otherwise document-only.
3. **Session log:** Append a short **“Role audit (6.18.1.2)”** subsection with command + summary (allowed vs fixed).
4. **ARCHITECTURE.md** (optional): Adjust **Users / `user_role`** bullet from “Planned” to **delivered** for catalog + rename when audit is clean (appointment-workflow scope).

---
