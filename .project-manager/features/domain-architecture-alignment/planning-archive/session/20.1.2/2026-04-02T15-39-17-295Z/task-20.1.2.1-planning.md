# Plan: task 20.1.2.1 — 20.1.2.1

## Contract
- **Tier:** task | **ID:** 20.1.2.1
- **Scope:** 20.1.2.1
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [ ] #### Task 20.1.2.1: Block instance three-property columns
**Goal:** Add `orchestrator` / `wizardVisible` to `block_instances`, remove legacy instance fields, and update the direct server/client consumers that break when those fields disappear.
**Files:** See **Files** below.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Session 20.1.1 renamed the type vocabulary; the next locked architecture rule is that the three orthogonal properties live on `block_instances`, not `block_shapes`. Current models and client types still encode the old split, so later event/admin passes would build on the wrong shape.
- **Domain boundaries:** Server persistence (`db/models`, migrations) pl… _(truncated)_

## Story
**This task changes** `block_instances` storage, its Sequelize/client contracts, and the direct booking/admin/versioning code that still reads `bookingMode`, `differential`, or `differentialEventRoleOverrides` **because** Session 20.1.2 must move the three-property model onto block instances before block-shape cleanup can happen safely.

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
| **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |

---

## 3. Data flow

Canonical path:

1. **Vue view** → **presentational component**
2. **Composable** (state + orchestration; thin components)
3. **Client HTTP**
   - **Default:** `utils/api/apiClient` — relative paths, same-origin API.
   - **Integrations:** `services/*ApiService` — full-base-URL axios (calendar, maps, enrichment).
4. **Express route** (`routes/internal/*` or `routes/external/*`)
5. **Service** (`server/src/services/`)
6. **Repository** (`server/src/repositories/`) or direct Sequelize access
7. **Sequelize model** (`server/src/db/models/`)

Cross-cutting: **transformers** (e.g. global → booking), **injection keys** for wizard scope, **TanStack Query** keys + invalidation for mutations.

**Booking resolution boundary:** The server serves **configuration and raw storage rows** (e.g. part instances, relationships) plus appointment-scoped inputs such as `property_details`. **PartFinalizer** on the **client** resolves wizard time, fee, and segment placement for the live booking flow. On submit, the client sends a **full appointment payload**; the server **persists** it and does **not** re-run PartFinalizer to recompute or “verify” those totals. Do not introduce a second booking calculator on the server for the same contract (see §10).

---

## 4. Type boundaries

| Layer | Location | Use when |
|-------|----------|----------|
| **Shared contracts** | Repo `shared/`, imported as `@shared/types/...` | Types needed by **both** client and server (API shapes, branded IDs, shared enums). |
| **Client-only** | `client/src/types/<domain>/` | UI-only: injection keys, wizard step types, transformer helpers, form field types. **Never** imported by server. |
| **Server-only** | `server/src/types/` | Handler params, repository types, internal DTOs. **Never** imported by client. |

**Rule:** If both sides need it → `@shared`. If only one side → keep it local.

**Reactivity boundaries:** Prefer `ComputedRef<T>` for read-only consumer APIs; `Ref<T>` for internal mutable state; avoid leaking `Ref | ComputedRef` unions at public composable boundaries (see type governance rule + TYPE_AUTHORING_PLAYBOOK).

---

## Codebase recon (agent-led — required)
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `server/src/db/models/booking/block_instance.ts`; `server/src/db/models/booking/block_instance_version.ts`; `server/src/services/instanceVersioning.ts`; `server/src/services/appointmentSnapshotLoader.ts`; `client/src/types/entities.ts`; `client/src/utils/transformers/entityTransformers.ts`; `client/src/utils/transformers/globalToBookingTransformerBlocks.ts`; `client/src/utils/booking/appointmentSlotBuilder.ts`; `client/src/composables/admin/useInstanceFiltering.ts`; grep across `server/src/**` and `client/src/**` for `bookingMode`, `differential`, `differentialEventRoleOverrides`, `wizardVisible`, `orchestrator`.
- **Patterns / call sites:** `BlockInstance` still stores `bookingMode`, `differential`, `differentialEventRoleOverrides`, and lacks `orchestrator` / `wizardVisible`. Snapshot/versioning code still compares and persists `differential` in `instanceVersioning.ts` and `block_instance_version.ts`. Client hydration (`entityTransformers.ts`) normalizes `bookingMode`, `differential`, and `differentialEventRoleOverrides` from API rows into `BlockInstanceEntity`. Booking transformer code (`globalToBookingTransformerBlocks.ts`) and admin filtering (`useInstanceFiltering.ts`) still use `bookingMode`; booking slot building still emits `differentialEventRoleOverrides`.
- **Gaps / unknowns:** Removing `bookingMode` and `differentialEventRoleOverrides` from `BlockInstanceEntity` is larger than a model-only change because booking/admin flows still consume them. This task must either re-home those values to a new source of truth now or remove/update those call sites in the same pass. Also verify whether `block_instance_versions.differential` should be dropped now or just stop being populated.

## Analysis
- **Problem / why now:** The architecture says block instances own the three orthogonal properties. Right now `block_instances` still carries old drift fields and lacks two of the new booleans, so later event/admin work would continue building on obsolete runtime contracts.
- **Domain boundaries:** Server persistence + booking/admin client types and the small set of direct consumers wired to the removed fields. No new shared contracts required.
- **Grounding in code:** The server model and versioning path still persist `differential`; client hydration and booking transforms still expose and consume the removed fields. This task is not complete unless those concrete reads are addressed.
- **Patterns to follow:** Keep migration + model + client type updates in one task so the app can compile. Prefer focused cleanup of touched call sites instead of broad booking refactors.
- **Risks / open questions:** `bookingMode` appears in admin filtering and booking transforms, so removing it may force a design choice about where that behavior now lives. If the field is truly deleted this session, this task should either remove dependent behavior or move it to a surviving source; leaving stale reads would break runtime even if lint passes.
- **Alternatives considered:** Deferring all consumer cleanup to a later phase was rejected because the migration/model removal would immediately invalidate current compile/runtime assumptions.

## Design
1. Author a migration that adds `orchestrator` + `wizard_visible` to `block_instances` with safe defaults and drops `booking_mode`, `differential`, and `differential_event_role_overrides`.
2. Update `block_instance.ts` to expose `orchestrator` / `wizardVisible` and remove the dropped fields.
3. Update versioning/snapshot touchpoints so they no longer depend on removed block-instance fields (`instanceVersioning.ts`, `block_instance_version.ts`, `appointmentSnapshotLoader.ts` as needed).
4. Update `BlockInstanceEntity` and the direct client hydration / booking / admin call sites that currently read those fields.
5. Verify whether any remaining `bookingMode` / `differentialEventRoleOverrides` usage belongs in later sessions; if yes, leave a documented follow-up rather than silent dead code.

## Goal
**Task 20.1.2.1 only:** Bring `block_instances` in line with the three-property model by adding `orchestrator` / `wizardVisible`, removing `bookingMode`, `differential`, and `differentialEventRoleOverrides`, and updating the server/client code paths that directly depend on those fields.

**Done for this task:** Migration authored; `block_instance.ts` updated; direct versioning/client type consumers updated; client + server lint pass for the touched surface.

## Files
- **Migration (create):** `server/src/db/migrations/` — add `orchestrator`, `wizard_visible`; drop `booking_mode`, `differential`, `differential_event_role_overrides` from `block_instances`
- **Server model (modify):** `server/src/db/models/booking/block_instance.ts`
- **Versioning / snapshot server consumers:** `server/src/db/models/booking/block_instance_version.ts`, `server/src/services/instanceVersioning.ts`, `server/src/services/appointmentSnapshotLoader.ts`
- **Client entity + transforms:** `client/src/types/entities.ts`, `client/src/utils/transformers/entityTransformers.ts`, `client/src/utils/transformers/globalToBookingTransformerBlocks.ts`
- **Client direct consumers to verify/update:** `client/src/composables/admin/useInstanceFiltering.ts`, `client/src/utils/booking/appointmentSlotBuilder.ts`, plus any smaller booking/admin files still reading removed fields
- **Out of scope for this task:** `block_shapes` boolean removal and its server/client consumers — task `20.1.2.2`

## Approach
1. Author the migration for `block_instances` only. Keep it idempotent and avoid touching `block_shapes` in this task.
2. Update `block_instance.ts` declarations + `init()` entries to the new field set.
3. Remove or rework version/snapshot code that still reads `instanceData.differential`.
4. Update `BlockInstanceEntity` and the client hydration / booking/admin consumers that directly rely on the removed fields.
5. Run `cd server && npm run lint` and `cd client && npm run lint`; grep for removed instance field names in code, excluding docs and unrelated “differential” domains.

## Checkpoint
- `BlockInstance` and `BlockInstanceEntity` compile with `orchestrator` / `wizardVisible`.
- No touched code path still expects `blockInstance.bookingMode`, `blockInstance.differential`, or `blockInstance.differentialEventRoleOverrides`.
- Server and client lint pass for this narrowed scope.

## Deliverables
- Migration for `block_instances` field alignment
- Updated `server/src/db/models/booking/block_instance.ts`
- Updated versioning/snapshot code for removed instance fields
- Updated `client/src/types/entities.ts` plus direct client consumers of removed instance fields

## Acceptance Criteria
- [ ] `block_instances` migration adds `orchestrator` / `wizard_visible` and drops `booking_mode`, `differential`, `differential_event_role_overrides`.
- [ ] `server/src/db/models/booking/block_instance.ts` reflects the new schema.
- [ ] Versioning/snapshot code no longer depends on removed instance fields.
- [ ] `client/src/types/entities.ts` and direct client consumers compile without `bookingMode`, `differential`, or `differentialEventRoleOverrides` on `BlockInstanceEntity`.
- [ ] `cd server && npm run lint` and `cd client && npm run lint` pass.

## Implementation Orders
**Implement the task now** (edit files per Goal / Files / Approach). When implementation is complete, run **`/task-end 20.1.2.1`**.

**Task:** 20.1.2.1  
**End command:** `/task-end 20.1.2.1`

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
