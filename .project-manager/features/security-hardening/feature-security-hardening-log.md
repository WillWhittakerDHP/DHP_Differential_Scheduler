# Feature security-hardening Log

**Purpose:** Track feature-level progress, decisions, and blockers

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Status

**Feature:** security-hardening
**Status:** Complete
**Started:** 2026-03-21

---

## Feature Checkpoints

### Checkpoint 2026-03-21
**Status:** [On track / Behind / Ahead]
**Notes:** [Checkpoint notes]
**Git Branch:** `feature/security-hardening`
**Git Commit:** [Commit hash]

---

## Feature Completion Summary

**Feature:** security-hardening
**Completed:** 2026-03-25

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (24): `.project-manager/ARCHITECTURE.md`, `.project-manager/PROJECT_PLAN.md`, `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`, `.project-manager/features/authentication/feature-authentication-guide.md`, `.project-manager/features/guided-alpha-testing/feature-guided-alpha-testing-guide.md`, `.project-manager/features/security-hardening/across-ladder.json`, `.project-manager/features/security-hardening/feature-planning.md`, `.project-manager/features/security-hardening/feature-security-hardening-handoff.md`, `.project-manager/features/security-hardening/feature-security-hardening-log.md`, `.project-manager/features/security-hardening/phases/phase-8.1-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.2-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.3-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.4-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.5-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.6-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.7-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.8-handoff.md`, `.project-manager/features/security-hardening/phases/phase-8.8-planning.md`, `server/src/db/models/admin/availability_setting.ts`, `.project-manager/features/appointment-workflow/phases/phase-6.18-guide.md`, `.project-manager/features/appointment-workflow/phases/phase-6.18-planning.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.1-planning.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-planning.md`, `.project-manager/features/security-hardening/planning-archive/feature/`

### `git diff --stat HEAD`

```text
.project-manager/ARCHITECTURE.md                   |   8 +-
 .project-manager/PROJECT_PLAN.md                   |  21 +-
 .../feature-appointment-workflow-guide.md          |  13 +
 .../authentication/feature-authentication-guide.md |   2 +
 .../feature-guided-alpha-testing-guide.md          |  11 +-
 .../features/security-hardening/across-ladder.json |   2 +-
 .../security-hardening/feature-planning.md         | 316 ++++++++++++++++++---
 .../feature-security-hardening-handoff.md          |   4 +-
 .../feature-security-hardening-log.md              |   2 +-
 .../phases/phase-8.1-planning.md                   |  44 ---
 .../phases/phase-8.2-planning.md                   |  47 ---
 .../phases/phase-8.3-planning.md                   |  46 ---
 .../phases/phase-8.4-planning.md                   |  50 ----
 .../phases/phase-8.5-planning.md                   | 262 -----------------
 .../phases/phase-8.6-planning.md                   |  47 ---
 .../phases/phase-8.7-planning.md                   |  54 ----
 .../security-hardening/phases/phase-8.8-handoff.md |   2 +-
 .../phases/phase-8.8-planning.md                   | 158 -----------
 server/src/db/models/admin/availability_setting.ts |   1 -
 19 files changed, 334 insertions(+), 756 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/ARCHITECTURE.md b/.project-manager/ARCHITECTURE.md
index 01717edf..0f5a797e 100644
--- a/.project-manager/ARCHITECTURE.md
+++ b/.project-manager/ARCHITECTURE.md
@@ -21,7 +21,7 @@ TanStack **Vue Query** manages server-state caching. Composables typically expos
 |--------|----------------|-------------|---------------------|--------------|
 | **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
 | **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
-| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving) | Auth contracts in `@shared` as they stabilize |
+| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Phase 6.18) |
 | **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
 | **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |
 
@@ -76,6 +76,12 @@ Cross-cutting: **transformers** (e.g. global → booking), **injection keys** fo
 
 - **Emerging domain;** keep route and model changes aligned with `routes/internal/auth` and `db/models/auth`. Consumed by all domains via middleware/guards over time.
 
+### Users / `user_role`
+
+- **`users.user_role`** is a **small closed set** (PostgreSQL ENUM + Joi + client types). **Planned (Feature 6 Phase 6.18):** a single **`@shared`** module exports **`USER_ROLE_VALUES`** and per-role constants; server and client **import** that list — no duplicate hardcoded arrays. Product rename **`seller` → `owner`** is part of Phase 6.18 Session 6.18.1.
+- **User-type block instances** (state-control shapes) drive scheduling/display semantics; **`getUserTypeBlockIdForRole`** maps **DB role** → block instance. **Session 6.18.2** adds **admin-persisted alignment** (role → `block_instance_id`) so mappings are configurable without code edits where product allows. See `features/appointment-workflow/phases/phase-6.18-guide.md`.
+- **Feature 7 Enactment** exposes role to the client using the **same** shared vocabulary as the API.
+
 ### Integrations
 
 - Prefer **dedicated services** and **external routes**; avoid mixing full-URL axios into `apiClient` call sites without reason.
diff --git a/.project-manager/PROJECT_PLAN.md b/.project-manager/PROJECT_PLAN.md
index d4ff0b2a..f5130d8e 100644
--- a/.project-manager/PROJECT_PLAN.md
+++ b/.project-manager/PROJECT_PLAN.md
@@ -2,7 +2,7 @@
 
 **Purpose:** Single source of truth for all feature development planning and tracking
 
-**Last Updated:** 2026-03-15
+**Last Updated:** 2026-03-25
 **Status:** Active Planning Document
 
 ---
@@ -304,6 +304,7 @@ Production OAuth token storage and MLS activation (credentials, validation, end-
 | 6.11 | Drive Time Fee Line Item | Not Started | Admin-configurable complimentary drive time (min), driving rate per hour ($), and rounding; billable drive = max(0, totalDrive − complimentary); round and multiply by rate; add "Drive time" line item to fees. Business Controls (driving / business rules area). Session 6.11.1. |
 | 6.14 | Organization Defaults & Resolved Numeric Policy | In Progress | Canonical defaults + merge at read; admin tab; shared types and resolver. Sessions **6.14.1** (foundation) + **6.14.2** (primary wiring) + **6.14.3** (exhaustive audit, optional badges, Phase 3.0 test checklist). See `features/appointment-workflow/phases/phase-6.14-guide.md`. |
 | 6.17 | Generalized Dependency-Aware Delete Wizard | Not Started | Preflight dependency inspection; reusable admin delete wizard; resolve/finalize API; policy registry; wire generic CRUD delete. Sessions 6.17.1–6.17.5. See `features/appointment-workflow/phases/phase-6.17-guide.md`. Complements Phase 6.6 (soft vs hard delete). |
+| 6.18 | User role catalog & block alignment | Not Started | Single `@shared` catalog for `user_role`; rename `seller` → `owner`; audit all hardcoded role lists; Session 6.18.2 admin alignment of canonical roles ↔ user-type block instances. See `features/appointment-workflow/phases/phase-6.18-guide.md`. Coordinates with Feature 7 Enactment. |
 
 ### Phase 6.1 Completed (Workflow)
 - Updated status ENUM from 5 to 8 values (started, held, rescheduling, quoted, submitted, confirmed, cancelled, deleted)
@@ -383,6 +384,10 @@ Production OAuth token storage and MLS activation (credentials, validation, end-
 
 1. **Coupon fee calculation and finalizer integration:** The coupon block shape (`BLOCK_SHAPE_TYPES.COUPON`) and cascade dropdown on step 5 are implemented (Session 6.10.1). However, coupon discount is still a placeholder (0) in `confirmationStepData.ts` — the actual fee reduction (e.g. percentage off, negative base fee) is not wired into the finalizers (`createBlockFinal` / `createPartFinals`). Planned as **Session 6.10.4** (phase-6.10-guide.md): "add percentage column to part instance, adjust Part/Block Finals for percentage off (e.g. 10% off) and negative base fee." *(Design decision needed: should coupons reduce the fee via a percentage column on the part instance, a flat discount, or both? How does this interact with the pricing cascade?)*
 
+2. **`user_role` ENUM vs configurable user types:** `users.user_role` is a **small PostgreSQL ENUM** validated by Joi and duplicated in several UI layers. **User-type** semantics in booking also depend on **block instances** (state-control shapes) via `getUserTypeBlockIdForRole` / `ROLE_TO_BLOCK_NAME`. Adding a new **block instance** in admin does **not** automatically add a new API role — ENUM + migration + shared catalog would still be required for a new first-class role. **Phase 6.18** delivers a **single shared catalog** (`@shared`), renames **`seller` → `owner`**, and adds **Session 6.18.2** (admin alignment of canonical roles ↔ user-type instances). A future architecture might narrow ENUM to coarse gates (e.g. staff vs client) and lean on instance IDs for display; that split is out of scope for 6.18 unless explicitly added.
+
+3. **Fixed role lists — single import path:** Every location that enumerates allowed roles (Joi, Sequelize ENUM args, `VSelect` items, type unions) must consume **`USER_ROLE_VALUES` / exports from `@shared`** after Phase 6.18 Session 6.18.1 — no ad hoc parallel arrays.
+
 ### Key Files
 - **Workflow:** Feature 6 appointment-workflow planning (see Related Documents)
 - **Calculations:** confirmationStepData, partsTotals, pricingCascadeResolver, appointmentTimeCalculations, useTimeSlotCalculations, BlockFinal/PartFinals (booking utils)
@@ -398,6 +403,7 @@ Production OAuth token storage and MLS activation (credentials, validation, end-
 - Phase 6.11 Guide: `features/appointment-workflow/phases/phase-6.11-guide.md` (Drive Time Fee Line Item)
 - Phase 6.14 Guide: `features/appointment-workflow/phases/phase-6.14-guide.md` (Organization Defaults & Resolved Numeric Policy)
 - Phase 6
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
