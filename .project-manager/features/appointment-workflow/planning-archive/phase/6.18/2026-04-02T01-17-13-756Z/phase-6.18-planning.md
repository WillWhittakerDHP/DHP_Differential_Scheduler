# Plan: phase 6.18 — User role catalog, owner rename, block alignment

## Contract

- **Tier:** phase | **ID:** 6.18
- **Scope:** Canonical `@shared` user role list; `seller` → `owner` migration; eliminate duplicate hardcoded role arrays; optional admin persistence for role ↔ user-type block instance alignment
- **Governance:** Type boundaries (`@shared` for cross-client-server strings); no silent fallbacks in mapping (see `userTypeMapping` warn pattern)

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

## Codebase recon

| Area | Paths / notes |
|------|----------------|
| **Shared roles (partial)** | `shared/constants/roleConstants.ts` — `USER_ROLE_CLIENT`, `USER_ROLE_AGENT` (+ attendee labels). Phase extends with full tuple / `USER_ROLE_VALUES` and `owner`. |
| **Server re-export** | `server/src/constants/userRoles.ts` re-exports from shared; add new constants there as needed. |
| **Joi / API** | `server/src/routes/schemas/userSchemas.ts` — duplicate `USER_ROLE_VALUES` array incl. `'seller'` → replace with `@shared` import. |
| **Sequelize** | `server/src/db/models/participantModels/Users.ts` — ENUM list + TS union incl. `'seller'`. |
| **Role → block instance** | `server/src/utils/userTypeMapping.ts` — `ROLE_TO_BLOCK_NAME`, `getUserTypeBlockIdForRole`; Session 6.18.2: config-first read. |
| **Appointments** | `server/src/routes/internal/appointments/appointmentRouter.ts` — `requireRole(..., 'seller', ...)`. `appointmentPersistenceHelpers.ts` uses `getUserTypeBlockIdForRole`. |
| **Middleware** | `ownershipEnforcement.ts`, `ownershipChecks.ts` — literal `'seller'`. |
| **Client types** | `client/src/types/user.ts`, `shared/types/appointmentTypes.ts`, `client/src/types/booking/injectionContexts.ts`, `wizardStepInterfaces.ts`, `contactsStepData.ts`. |
| **Client constants / UX** | `client/src/constants/attendeeRoles.ts` (re-exports shared); `appointmentDataBuilders.ts` (`APPOINTMENT_ATTENDEE_ROLES.seller`); `wizardContactsStepFromState.ts`; `appointmentToWizardTransformer.ts`; `authRedirect.ts`. |
| **Admin** | `client/src/views/admin/tabs/components/InlineEditUserRoleCell.vue` — `ROLE_ITEMS` array. |

---

## Goal

Deliver a **maintainable user role vocabulary** aligned with booking and admin flows, rename **`seller`** to **`owner`**, and reduce drift between **ENUM/API/UI** and **user-type block instances** (Session 6.18.2 for operator-driven alignment).

---

## Approach

1. **6.18.1:** Add **`USER_ROLE_VALUES`** (and per-role exports as needed) in `@shared`; migration: ENUM rename + row updates; replace duplicate arrays with shared imports across server/client; grep for `seller` and stray role lists; update middleware, routers, builders, transformers, admin select.
2. **6.18.2:** Minimal persistence for **role key → `block_instance_id`**; admin matrix fed from user-type instances; **`getUserTypeBlockIdForRole`** prefers persisted config, then legacy name map; document defaults/seeds.

---

## Decomposition

| Unit | Session | Outcome |
|------|---------|---------|
| **Shared catalog + rename + audit** | 6.18.1 | `USER_ROLE_VALUES` in `@shared`; migration; Joi/model/client/UI/mapping updated; grep clean for `seller` / duplicate lists |
| **Admin alignment UI** | 6.18.2 | Persisted mapping role → `block_instance_id`; admin matrix; `getUserTypeBlockIdForRole` prefers config |

**Coverage check:** Sessions follow **catalog + rename first**, then **configurable mapping** — matches phase guide and avoids building UI on a moving enum. No third session required for the stated guide; optional follow-ups (Feature 17 shell, Feature 9 alpha labels doc) are cross-feature, not extra 6.18 sessions.

---

## Checkpoint

After 6.18.1: any API consumer sees `owner` only (no `seller` in new writes); DB ENUM and Joi agree with `@shared`. After 6.18.2: changing a mapping in admin affects `getUserTypeBlockIdForRole` without a code deploy for that path.

---

## Deliverables

- Session planning files: `sessions/session-6.18.1-planning.md`, `sessions/session-6.18.2-planning.md` (filled at session-start).
- Migrations + shared module + grep-clean codebase per guide.
- Phase guide: `phases/phase-6.18-guide.md` (reference); update Feature 6 / Feature 7 cross-links if examples still say `seller`.

---

## Acceptance criteria

- [ ] Single **`USER_ROLE_VALUES`** (or equivalent) in `@shared`; server Joi, Sequelize ENUM, and client role unions derive from it — **no parallel string arrays** except tests of the shared module.
- [ ] **`seller` → `owner`** complete: migration, seeds, API, client, middleware, appointment flows; existing rows updated.
- [ ] **`getUserTypeBlockIdForRole`** uses shared role keys; block display names documented for seed/admin (e.g. "Seller" row → "Owner" as product dictates).
- [ ] **6.18.2:** Admin can persist role → user-type block instance mapping; resolver reads config first, legacy map second; **warn** on unknown role (no silent default).
- [ ] Lint + app start after phase work; **no new test files** per project policy.

---

## Reference

- `phases/phase-6.18-guide.md`
- `.project-manager/ARCHITECTURE.md` — Users / `user_role`
- `feature-appointment-workflow-guide.md` — Phase 6.18 row
- `.project-manager/PROJECT_PLAN.md` — Feature 6 / 7 cross-reference
