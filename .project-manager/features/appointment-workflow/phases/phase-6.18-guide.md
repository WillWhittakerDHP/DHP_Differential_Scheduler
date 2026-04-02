# Phase 6.18 Guide: User role catalog, `owner` rename, and block-instance alignment

**Purpose:** Establish a **single canonical source** for `users.user_role` values used across API validation, DB ENUM, Sequelize models, client types, admin selects, and role→user-type block resolution — and plan **admin-configurable alignment** between canonical roles and user-type **block instances** so new instances do not require scattered code edits.

**Tier:** Phase (Tier 1 - High-Level)

---

## Overview

**Phase Number:** 6.18  
**Phase Name:** User role catalog, `seller` → `owner` rename, block-instance alignment  
**Description:** Today, the same small set of role strings is **duplicated** in Joi (`userSchemas.ts`), Sequelize `ENUM`, admin `VSelect` items, client `UserRequest` types, and `userTypeMapping.ts` (`ROLE_TO_BLOCK_NAME`). That drifts easily and blocks product language changes (e.g. **`seller` → `owner`**). Separately, **user-type** behavior is driven by **block instances** under state-control block shapes; the mapping from **DB role** → **block instance display name** is still code-first. This phase: (1) centralize the allowed role strings in **`@shared`** and consume them everywhere; (2) migrate **`seller` → `owner`** with a DB ENUM migration and full-stack renames; (3) optionally deliver **admin UI + persistence** so operators align block instances to canonical role keys (Session **6.18.2**).

**Duration:** Two sessions (6.18.1 — catalog + rename + audit; 6.18.2 — admin alignment UI + API)  
**Status:** Complete

**Relation to Feature 7 (Authentication):** Feature 7 **Enactment** exposes `user_role` to the client and gates routes. Phase 6.18 does **not** replace auth — it ensures **one** role vocabulary and **documented** mapping to user-type blocks. See `.project-manager/PROJECT_PLAN.md` Feature 7 — Enactment (cross-links added there).

**Relation to Feature 9 (Guided Alpha Testing):** Alpha cohort labels (e.g. dev / agent / friend) map to **`user_role`** values for testing; document the mapping in Feature 9 Open Questions, not only in code.

**Relation to Feature 17 (Admin UI Overhaul):** Long-term **business** admin for users/roles may live in the new Admin panel; Phase 6.18 can ship alignment in the **current** Developer/admin surfaces (e.g. Business Controls or Users) unless Feature 17 timeline subsumes it.

---

## Objectives

- **Single source of truth:** Exported **`USER_ROLE_VALUES`** (or equivalent) from `shared/` — imported by server Joi schemas, Sequelize ENUM list, client types, and UI role pickers — **no parallel string arrays** except tests of the shared module.
- **Rename:** Replace persisted and API value **`seller`** with **`owner`** everywhere (migration updates existing rows; code and seeds follow).
- **Audit:** Grep-driven inventory of hardcoded role lists; fix stragglers to use the shared catalog.
- **Mapping:** `server/src/utils/userTypeMapping.ts` — derive **`ROLE_TO_BLOCK_NAME`** from shared keys; block **display names** remain tied to block instance **names** in DB (e.g. "Seller" row may be renamed to "Owner" in admin or via seed note).
- **Optional (6.18.2):** Persist **role key → user-type block_instance_id** (or name indirection) in admin settings so adding user-type instances is **configuration-first**; fall back to code map until then.

---

## Policy / constraints

- **PostgreSQL ENUM:** Adding or renaming values requires **migrations**; coordinate with migration guard rules (`DB_HOST` localhost for execute on dev machine).
- **Type safety:** Client `UserRequest['userRole']` should derive from shared `typeof USER_ROLE_VALUES[number]` or explicit union re-exported from `@shared`.
- **No silent fallback:** Unknown roles in mapping logs at **warn** (existing `userTypeMapping` pattern).

---

## Sessions Breakdown

- [x] ### Session 6.18.1: Shared role catalog + `seller` → `owner` + full-stack audit  
**Description:** Add/extend `@shared` constants (array + per-role const exports as needed); migration to alter ENUM `seller` → `owner` and update existing `users.user_role` rows; update `Users` model, `userSchemas.ts`, `userTypeMapping.ts`, `client/src/types/user.ts`, `UserCreateForm.vue` and any `VSelect` role lists, `appointmentDataBuilders`, tests of behavior, seeds; grep for `seller` and hardcoded role arrays; align **Feature 7** enactment docs that mention role examples (`transaction_manager`, etc.).  
**Focus:** One import path for allowed values; rename complete across API/DB/client.

- [x] ### Session 6.18.2: Admin alignment — canonical roles ↔ user-type block instances  
**Description:** Design minimal persistence (e.g. JSON on `wizard_settings`, `organization_defaults`, or a small `user_role_block_alignment` table) mapping **canonical role key** → **block_instance_id** (user-type shape). Admin UI: table or matrix “Role → User-type instance” with pickers sourced from state-control user-type instances (`getUserTypeBlockIdForRole` reads config first, then legacy name map). Document seed expectations for default rows (“Owner”, “Buyer”, …).  
**Focus:** Operators can add/rename user-type instances without a deploy for mapping-only changes (where product allows).

_Register sessions with `/session-add` or tier workflow when starting work._

Session detail (Goal / Files / Implementation Orders) lives in **`sessions/session-6.18.x-planning.md`** per session.

---

## Dependencies

**Prerequisites:** None blocking catalog work; **Feature 7** should consume the same shared types when exposing role on the client (Enactment).  
**Coordinates with:** `.project-manager/ARCHITECTURE.md` (Users / roles boundary — shared constants).

---

## Related Documents

- `phases/phase-6.18-planning.md`
- `sessions/session-6.18.1-planning.md`, `sessions/session-6.18.2-planning.md`
- `feature-appointment-workflow-guide.md` (Phase 6.18 row)
- `.project-manager/PROJECT_PLAN.md` (Feature 6 — Phase 6.18, Open Questions)
- `.project-manager/PROJECT_PLAN.md` (Feature 7 — Enactment cross-reference)
- `features/guided-alpha-testing/feature-guided-alpha-testing-guide.md` (alpha cohort ↔ role mapping)

<!-- end excerpt phase -->