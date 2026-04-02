# Plan: task 20.1.3.1 — 20.1.3.1

## Contract
- **Tier:** task | **ID:** 20.1.3.1
- **Scope:** 20.1.3.1
- **Governance (harness snapshot):**
  - Governance Context (Task)
  - File-Scoped Violations
  - No existing violations in task files.
  - Thresholds (Quick Reference)

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
- [ ] Task 20.1.3.1 implementation in progress; run `/task-end 20.1.3.1` when done.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Sessions 20.1.1–20.1.2 aligned block shapes and instances; event modeling still encodes placement as `differential_role` and hangs calendar toggles on the shape. Principles §5.1–§5.4 require **placement types** on shapes and **named segments** (instances) with **per-segment** toggles and attendees — this session applies the DDL + model/type layer so later… _(truncated)_

## Story
**This task changes** PostgreSQL event tables, Sequelize models, and client entity/transform layers **because** Feature 20 §2.2–§2.4 require placement types on `event_shapes`, segment ownership and per-segment calendar toggles on `event_instances`, and attendee rows keyed to segments (`event_instance_attendees`).

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

- **Paths reviewed:** `server/src/db/models/booking/event_shape.ts`, `event_instance.ts`, `event_shape_attendee.ts`; `sequelizeModelAssociationsPartA.ts`; `index.ts`; `server/src/config/app.ts`; `relationshipConstants.ts`, `relationshipHelpersMapping.ts`, `relationshipHelpersValidation.ts`; `inviteAttendeeHelpers.ts`, `inviteOrchestrationService.ts`, `inviteAppointmentShared.ts`, `eventInstancePreviewService.ts`; `client/src/types/entities.ts`, `entityTransformers.ts`, `apiEntityFieldNormalization.ts`, `constants/relationships.ts`, `fetchToGlobalTransformer.ts`, `appointmentShapeEventAttendees.ts`, `useShapesTab.ts`, `eventShapeDisplays.ts`.
- **Patterns / call sites:** `differential_role` + shape-level invite toggles on `event_shapes`; attendees via `event_shape_attendees`; invite flow uses `eventShapeRef` + `EventShapeAttendee`; booking merges attendees onto shapes by matching `parent.id === eventShape.id`.
- **Gaps / unknowns:** `parent_block_instance_id` backfill uses first `event_assignments.parent_id` per segment; attendees attach to lexicographically first `event_instance` per shape when multiple exist.

## Analysis
- **Problem:** Align DB + ORM + client types with Feature 20 event model before UI/PartFinalizer rewrites in 20.1.3.2.
- **Boundaries:** Booking (invites, global merge), admin relationships, shared placement parsing.
- **Risks:** Admin metadata still references removed shape fields until a later pass; mitigated by migration deleting stale `eventShape` metadata keys for removed columns.

## Design
1. **Migration:** Add instance columns + backfill from shapes and `event_assignments`; add `placement_kind` / `anchor_edge` with CHECK; map `differential_role` → placement; migrate attendee rows to `event_instance_id`; rename table; drop legacy shape columns; insert default placement seed rows (ON CONFLICT by name).
2. **ORM:** `EventInstanceAttendee` model; associations `EventInstance` ↔ `EventInstanceAttendee` ↔ `BlockInstance`; registry `parentEntity: eventInstance`.
3. **Compat:** `shared` helper maps `placement_kind` + `anchor_edge` → legacy `DifferentialRole` for existing `partFinalizer` / `eventAttendeeUtils` until 20.1.3.2.
4. **Client:** `mergeAttendeesIntoEventShapes` aggregates relationships grouped by `eventInstance` parents sharing `eventShapeRef`.

## Goal (task 20.1.3.1 only)
- One migration implements §2.2–§2.4 DDL + data moves + attendee rename + seeds.
- Sequelize + `app.ts` + associations + relationship mapping/validation + invite helpers use new tables/columns.
- Client entity types, transformers, normalization, `RELATIONSHIP_KEYS.attendeeAssignments`, fetch resolver `eventInstanceId`, merge attendees, `useShapesTab` defaults, `eventShapeDisplays` for placement fields.
- `differentialRole` on `EventShapeEntity` remains as **derived** from placement for booking math until task 20.1.3.2 removes it.

## Files (this task)
- `server/src/db/migrations/20260432_000061_event_schema_placement_instance_attendees.mjs` (new)
- `server/src/db/models/booking/event_shape.ts`, `event_instance.ts`, `event_instance_attendee.ts` (new; delete `event_shape_attendee.ts`)
- `server/src/db/models/index.ts`, `sequelizeModelAssociationsPartA.ts`, `sequelizeModelsBag.ts`, `sequelizeModelAssociationsPartB.ts`
- `server/src/config/app.ts`, `relationshipConstants.ts`, `relationshipHelpersMapping.ts`, `relationshipHelpersValidation.ts`
- `server/src/routes/internal/entities/entitySanitizers.ts`, `entityConstants.ts` (field names if needed)
- `server/src/services/invites/*` (attendee + strip links + orchestration query)
- `shared/utils/eventPlacementUtils.ts` (new)
- `client/...` as listed in recon

## Approach
1. Author migration (idempotent guards).
2. Replace Sequelize attendee model; wire associations and exports.
3. Update server invite + relationship + sanitizer paths.
4. Add shared placement helpers; update client types + transformers + merge + constants + displays + shapes tab defaults.
5. `npm run lint` in `client` and `server`.

## Checkpoint
- Migration file committed; models load; TypeScript compiles for touched packages; lint clean.

## Deliverables
- [ ] Migration `000061` under `server/src/db/migrations/`
- [ ] Sequelize + relationship + invite code updated
- [ ] Client types/transformers/relationships/merge updated
- [ ] Client + server lint pass

## Acceptance Criteria
- [ ] `event_shapes` has `placement_kind` + `anchor_edge`; legacy shape columns removed in migration.
- [ ] `event_instances` has ownership, location, per-segment invite toggles.
- [ ] Table `event_instance_attendees` with `event_instance_id` FK; admin relationship parent is event instance.
- [ ] Default placement seed rows inserted per FEATURE_20 §2.2 names.
- [ ] App builds (client + server) and lint passes without new tests (testing suspended).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
