# Plan: task 20.4.3.2 — Time axis (placement-only; drop empty override threading)

## Contract
- **Tier:** task | **ID:** 20.4.3.2
- **Scope:** Stop populating and threading **`differentialEventRoleOverrides`** on the booking **`AppointmentShape`** path; call **`resolveEventShapes`** / **`resolveDifferentialMajorMinorFromEventShapes`** without overrides (placement-only, same as **20.4.3.1**). Keep **`AppointmentShape.differentialEventRoleOverrides?`** optional on the type for any future non-booking hydration — do not remove the field from the interface in this task.
- **Governance:** Booking utils; explicit types; preserve **`roundedDifferentialOffset`** / **`adjustMinorTimeRange`** behavior.

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
Task **20.4.3.1** shipped: **`calculateSlotShape`** no longer takes override maps. **`buildAppointmentShape`** still returned **`differentialEventRoleOverrides: {}`** and **`applyShapeToTime`** / **`derivePerspective`** still passed it into resolution helpers.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Empty override objects are noise; resolution already uses placement when overrides are empty/absent (**`hasNonEmptyDifferentialRoleOverrides`**).
- **Domain boundaries:** **`client/src/utils/booking/*`** composables that read **`AppointmentShape`**.

## Story
**This task changes** how we build and consume **`AppointmentShape`** for time ranges and perspective **because** overrides are not used on the live booking path and omitting them matches **20.4.3.1**’s placement-only contract.

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

- **Paths reviewed:** Ripgrep **`differentialEventRoleOverrides`**, **`resolveEventShapes`** under `client/`; opened **`appointmentSlotBuilder.ts`**, **`perspectiveResolver.ts`**, **`appointmentModels.ts`**, **`appointmentSlotsComputeds.ts`**, **`minimizerSchedulingBounds.ts`**, **`minimizerEventShapes.ts`**, **`availabilityStepData.ts`**.
- **Patterns / call sites:** **`AppointmentShape.differentialEventRoleOverrides`** is already **optional**. **`buildAppointmentShape`** sets **`{}`**; **`applyShapeToTime`** passes **`shape.differentialEventRoleOverrides ?? null`** to **`resolveEventShapes`**. **`derivePerspective`** passes overrides to **`resolveDifferentialMajorMinorFromEventShapes`**. **`appointmentSlotsComputeds`**, minimizer helpers, **`availabilityStepData`** read **`shape.differentialEventRoleOverrides ?? null`**. Admin display key **`blockInstanceDisplays.differentialEventRoleOverrides`** is unrelated (block instance field metadata).
- **Gaps / unknowns:** None — booking never supplies non-empty overrides today.

## Analysis
- **Problem:** Redundant empty object on **`AppointmentShape`** and redundant arguments to resolution helpers.
- **Approach:** Omit the property when building shapes; call **`resolveEventShapes(eventFinals)`** and **`resolveDifferentialMajorMinorFromEventShapes(entities)`** with one argument where we only need placement.
- **Risks:** Any code that assumes the key always exists — use optional chaining / **`?? null`** already in place. **`slot.shape`** in **`AppointmentSlot`** must still satisfy **`AppointmentShape`** (optional field omitted is valid).
- **Alternatives:** Delete **`differentialEventRoleOverrides`** from **`AppointmentShape`** interface — **deferred** (wider blast radius; **20.4.4** can grep again).

## Design
1. **`buildAppointmentShape`** / **`createMinimalAppointmentShapeForDuration`:** Stop setting **`differentialEventRoleOverrides`**. Remove unused **`DifferentialRole`** import from **`appointmentSlotBuilder.ts`** if applicable.
2. **`applyShapeToTime`:** **`resolveEventShapes(effectiveSlotShape.eventFinals)`** (single argument).
3. **`derivePerspective`:** **`resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)`** only.
4. **`appointmentSlotsComputeds`:** **`resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)`** only.
5. **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`availabilityStepData`:** Drop **`?? null` override argument** — call with one arg or pass **`undefined`** explicitly only if signature requires; prefer single-arg **`resolveEventShapes`** / **`resolveDifferentialMajorMinorFromEventShapes`**.
6. Leave **`resolveEventShapes(..., overrides?)`** signature in **`perspectiveResolver.ts`** for optional future callers; document in comment if needed.
7. **`client npm run lint`**.

### Implementation Orders
1. Edit **`appointmentSlotBuilder.ts`** (minimal shape + **`buildAppointmentShape`** return + **`applyShapeToTime`**).
2. Edit **`perspectiveResolver.ts`** (**`derivePerspective`** only; not required to change **`resolveEventShapes`** export signature).
3. Edit **`appointmentSlotsComputeds.ts`**, **`minimizerSchedulingBounds.ts`**, **`minimizerEventShapes.ts`**, **`availabilityStepData.ts`** as needed for single-arg calls.
4. Lint.

## Goal
**Task 20.4.3.2:** Booking **time axis** and **perspective** resolution use **placement-only** inputs (no empty override map on **`AppointmentShape`**, no override argument at call sites that only ever passed null/empty).

## Files
- `client/src/utils/booking/appointmentSlotBuilder.ts`
- `client/src/utils/booking/perspectiveResolver.ts`
- `client/src/utils/booking/appointmentSlotsComputeds.ts`
- `client/src/utils/booking/minimizerSchedulingBounds.ts`
- `client/src/utils/booking/minimizerEventShapes.ts`
- `client/src/utils/booking/availabilityStepData.ts`

## Approach
Grep after edits for **`differentialEventRoleOverrides`**; ensure only intentional reads remain (or none on booking hot path). Lint.

## Checkpoint
- **`applyShapeToTime`** and **`derivePerspective`** behavior unchanged for templates with no overrides (current product case).

## Deliverables
- No **`differentialEventRoleOverrides`** property on objects built by **`buildAppointmentShape`** / **`createMinimalAppointmentShapeForDuration`**.
- Call sites use single-arg resolution where overrides were always empty.

## Acceptance Criteria
- **`grep`** `differentialEventRoleOverrides` in `client/src/utils/booking` shows no **write** of `{}` on **`AppointmentShape`** from **`appointmentSlotBuilder`**; optional type remains for future use.
- **Client lint** clean.
- Session **20.4.4** / shared **`differentialRole*`** cleanup remains out of scope unless this task discovers a required coupling.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
