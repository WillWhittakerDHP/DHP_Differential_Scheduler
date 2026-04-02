# Plan: task 20.4.3.1 — Slot shape + differential offsets (placement-only API)

## Contract
- **Tier:** task | **ID:** 20.4.3.1
- **Scope:** Remove the unused **`mergedRoleOverrides`** / **`DifferentialRole`** parameter from **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`**; keep offset math and **`resolvePrimarySecondaryEventShapesForBooking`** placement-first behavior (empty overrides). **Do not** change **`applyShapeToTime`** here — task **20.4.3.2**.
- **Governance:** Booking utils only; explicit types; no silent behavior change.

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
Session **20.4.3** started; **`/accepted-plan`** completed. First task: narrow slot-shape public API after **20.4.2** placement work.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** **20.4.2** moved primary/secondary selection to **placement**; **`buildAppointmentShape`** always passes **empty** overrides into **`calculateSlotShape`**, but signatures still expose **`Record<string, DifferentialRole>`**.
- **Domain boundaries:** **Booking** client utils; **`eventAttendeeUtils`** unchanged except indirect use via existing helper.

## Story
**This task changes** the **`calculateSlotShape`** / **`computeDifferentialOffsetsFromMaps`** surface **because** the booking path no longer supplies differential-role overrides for slot math, and dead parameters obscure the real source of truth (**placement + event shapes**).

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

- **Paths reviewed:** `client/src/utils/booking/partFinalizerSlotShape.ts`, `partFinalizerSlotShapeHelpers.ts`, `appointmentSlotBuilder.ts` (**`buildAppointmentShape`** → **`calculateSlotShape`**), `partFinalizer.ts` (re-export); ripgrep **`calculateSlotShape`** / **`computeDifferentialOffsetsFromMaps`** under `client/`.
- **Patterns / call sites:** Only **`buildAppointmentShape`** calls **`calculateSlotShape`**; it passes **`differentialEventRoleOverrides`** as **`{}`**. **`computeDifferentialOffsetsFromMaps`** is only used from **`partFinalizerSlotShape.ts`**. **`resolvePrimarySecondaryEventShapesForBooking`** already implements placement-first when overrides empty / absent.
- **Gaps / unknowns:** None for this task — no other callers. If a future non-booking caller needs overrides, it would reintroduce an optional parameter in a follow-up task (documented).

## Analysis
- **Problem:** Redundant **`mergedRoleOverrides`** on **`calculateSlotShape`** suggests two sources of truth; booking always passes `{}`.
- **Boundaries:** **`client/src/utils/booking/*` only** for edits; do not edit **`eventAttendeeUtils`** unless a signature ripple forces it (not expected).
- **Risks:** Signature change on **`calculateSlotShape`** — verify **`partFinalizer`** barrel and any type-only imports. Mitigation: grep after edit.
- **Alternatives:** Keep parameter as deprecated no-op — **rejected**; grep shows zero non-empty use.

## Design
Drop **`mergedRoleOverrides`** from **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`**. Inside **`computeDifferentialOffsetsFromMaps`**, call **`resolvePrimarySecondaryEventShapesForBooking(candidateEventShapes, undefined)`** (or omit second argument) so the placement-only path is explicit. Remove **`DifferentialRole`** imports where unused in these two modules. **`buildAppointmentShape`** stops passing the sixth argument to **`calculateSlotShape`**.

### Implementation Orders
1. **`partFinalizerSlotShapeHelpers.ts`:** Change **`computeDifferentialOffsetsFromMaps`** to accept only **`(eventRawDurations, eventRoundedDurationsByShapeId, eventShapes)`**; call **`resolvePrimarySecondaryEventShapesForBooking`** without overrides.
2. **`partFinalizerSlotShape.ts`:** Update **`calculateSlotShape`** signature and **`computeDifferentialOffsetsFromMaps`** call; remove unused imports.
3. **`appointmentSlotBuilder.ts`:** **`calculateSlotShape(...)`** — remove **`differentialEventRoleOverrides`** argument (still build **`differentialEventRoleOverrides: {}`** on **`AppointmentShape`** for **20.4.3.2**).
4. **`cd client && npm run lint`**; fix any stale references.

## Goal
**Task 20.4.3.1 only:** Placement-native **slot shape** API — **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`** no longer accept differential-role override maps; behavior unchanged for current booking data (**empty overrides**).

## Files
- `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`
- `client/src/utils/booking/partFinalizerSlotShape.ts`
- `client/src/utils/booking/appointmentSlotBuilder.ts` (**`buildAppointmentShape`** call only)

## Approach
1. Edit signatures and single call site as in **Design**.
2. Grep for **`calculateSlotShape(`** and **`mergedRoleOverrides`** after changes.
3. Lint; no server or test file changes.

## Checkpoint
- After implementation, **`grep`** shows no **`calculateSlotShape`** arity mismatch.
- **`applyShapeToTime`** / **`perspectiveResolver`** left for **20.4.3.2**.

## Deliverables
- Updated function signatures and call chain; no behavioral change for empty overrides.
- Clean imports (**`DifferentialRole`** removed from slot-shape modules if unused).

## Acceptance Criteria
- **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`** have no **`mergedRoleOverrides`** / **`DifferentialRole`** parameter.
- **`buildAppointmentShape`** compiles and still produces the same **`slotShape`** for representative shapes (placement-only path).
- **Client lint** passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
