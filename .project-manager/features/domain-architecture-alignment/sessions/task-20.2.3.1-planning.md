# Plan: task 20.2.3.1 — Relationship integrity for event segments

## Contract
- **Tier:** task | **ID:** 20.2.3.1
- **Scope:** Server-only **`eventAssignments`** and **`attendeeAssignments`** POST validation: parent event block instance ↔ segment ownership; **`validEventCascades`** audit (add shape-pair guard on create only if absent). **Out of scope:** `event-instance-preview` / client (**task 20.2.3.2**).
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
Session **20.2.3** started; first task is relationship integrity before preview re-scope.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** **`eventAssignments`** only checks that **parentId** is *some* **`BlockInstance`**; **`attendeeAssignments`** does not require **`event_instances.parent_block_instance_id`**. That allows cross-owner wiring inconsistent with **§5.2** (segment owned by an event block instance).
- **Preview** ambiguity is **20.2.3.2** — not this task.

## Story
**This task changes** internal **relationship POST** validation **because** admin (and future flows) must not persist **eventAssignments** or **attendeeAssignments** unless the **event instance** is anchored to the **same** parent **event** **block instance** as the relationship parent, and the shape graph allows the segment’s event shape under that block shape.

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

- **Paths reviewed:** `relationshipCrudRouter.ts` — **POST** runs **`validatePricingCascadeAgainstShapeRules`** for **pricingCascades** only; **`validateAttendeeAssignmentEntities`** for **attendeeAssignments** only; **no** branch for **`eventAssignments`**. **`relationshipHelpersValidation.ts`** — attendee validator loads **`EventInstance`** + **`BlockInstance`** (user type) only. **`relationshipHelpersMapping.ts`** — **`mapEventAssignmentsFields`** checks parent is **`BlockInstance`**. **`RELATIONSHIP_REGISTRY`**: **eventAssignments** parent = block instance, child = event instance. **`ValidEventCascade`** model: **parentId** = block shape id, **childId** = event shape id.
- **Patterns / call sites:** Prefer **`ValidationResult`** (`routerValidators`) for new checks to keep **POST** handler branching flat; mirror **pricing** cascade pattern (`if (!v.valid) sendBadRequest`).
- **Gaps / unknowns:** Legacy rows may still have **`null`** **`parent_block_instance_id`** — validation should **400** new bad links; migrating old data is out of scope. **DELETE** relationship does not need symmetry for this task unless product asks.

## Analysis
- **Problem:** Without integrity checks, an admin can link an **event instance** to block instance **A** while that segment’s **`parent_block_instance_id`** is **B** or **null**, breaking §5.2 ownership and confusing invite/preview consumers.
- **Boundaries:** **Server** `routes/internal/relationships` only; no client or shared type changes; no booking math.
- **Patterns:** **`validateEventAssignmentIntegrity`** returns **`Promise<ValidationResult>`**; **`validateAttendeeAssignmentEntities`** extended with a **`parent_block_instance_id`** guard (throw or refactor to **`ValidationResult`** — prefer one style per function; extending throw is OK if router already maps **`does not exist`** / user-type errors).
- **Risks:** Stricter POST may **400** legacy admin flows that relied on loose checks — intended per FEATURE_20.
- **validEventCascades:** If **POST** `validEventCascades` has no duplicate/shape validation today, add **optional** check: parent/child UUIDs resolve to **BlockShape** + **EventShape** and **`disabled: false`** duplicate — only if truly missing; otherwise document “already generic” in task notes.

## Design
1. **`validateEventAssignmentIntegrity(parentBlockInstanceId, eventInstanceId): Promise<ValidationResult>`** in **`relationshipHelpersValidation.ts`**  
   - Load **parent** **`BlockInstance`** with **`BlockShape`** (**`include`**).  
   - If missing → `{ valid: false, error: '...' }`.  
   - If **`block_shape.type !== 'event'`** → invalid.  
   - Load **`EventInstance`** by **`eventInstanceId`** (minimal attributes: **`id`**, **`eventShapeRef`**, **`parentBlockInstanceId`**).  
   - If missing → invalid.  
   - If **`parentBlockInstanceId`** null/empty or **≠** **`parentBlockInstanceId`** arg → invalid.  
   - **`ValidEventCascade.findOne`** where **`parentId`** = parent’s **block shape id**, **`childId`** = **`eventInstance.eventShapeRef`**, **`disabled: false`**. If none → invalid (shape graph must allow the segment’s event shape under that block shape).  
2. **`validateAttendeeAssignmentEntities`** — after confirming **`EventInstance`** exists, if **`parentBlockInstanceId`** is null/empty → **`throw new Error('Event segment has no parent block instance; assign parent before attendee links.')`** (or equivalent stable message mapped to **400** in router).  
3. **`relationshipCrudRouter` POST** — after **`ATTENDEE_ASSIGNMENTS`** block (or before **`mapRelationshipFields`**), if **`normalizedKind === EVENT_ASSIGNMENTS`**: run **`validateEventAssignmentIntegrity`**, **`sendBadRequest`** on failure.  
4. **validEventCascades audit:** Read generic create path; if no validation beyond FK, add **`validateValidEventCascadeShapes(parentShapeId, childShapeId)`** only if IDs are not validated elsewhere — keep function small and explicit.

## Goal
**`eventAssignments`** and **`attendeeAssignments`** relationship **creates** reject payloads that violate segment ownership or allowed **validEventCascades** shape pairs. No preview or client changes in this task.

## Files
- `server/src/routes/internal/relationships/relationshipHelpersValidation.ts` — new **`validateEventAssignmentIntegrity`**; extend **`validateAttendeeAssignmentEntities`**
- `server/src/routes/internal/relationships/relationshipCrudRouter.ts` — wire **EVENT_ASSIGNMENTS** branch
- Optionally same file or validation module: **`validEventCascades`** create guard if audit finds gap
- Reference: `server/src/db/models/booking/event_instance.ts`, `server/src/db/models/admin/valid_event_cascade.ts`, `server/src/constants/relationshipTypes.ts`

## Approach
1. Implement **`validateEventAssignmentIntegrity`** with explicit **`ValidationResult`** and stable error strings.  
2. Extend attendee validator for **non-null** **`parent_block_instance_id`**.  
3. Wire router; map errors to **`sendBadRequest`** consistently with existing attendee branch.  
4. Audit **`validEventCascades`** POST — implement minimal guard or document “no change” in **## Implementation notes** after review.  
5. **`cd server && npm run lint`** and **`npx tsc --noEmit`**.

## Checkpoint
- **20.2.2** entity validators require **parent** on **eventInstance** create — DB may still have legacy nulls; new relationship rules complement that.

## Deliverables
- Validator(s) + **POST** wiring for **eventAssignments** / **attendeeAssignments** as above.  
- Short note in **`DOMAIN_REWRITE_WORKLOG.md`** or task-end summary if behavior change is user-visible.

## Acceptance Criteria
- **eventAssignments** **POST**: **400** when parent is not an **event**-type block instance; when **EventInstance** missing; when **`parent_block_instance_id`** missing or ≠ relationship **parentId**; when no active **`validEventCascades`** row for (**parent block shape**, **event instance’s event shape ref**).  
- **attendeeAssignments** **POST**: **400** when **EventInstance** has no **`parent_block_instance_id`**.  
- Existing attendee checks (user-type child, existence) still pass.  
- **`cd server && npm run lint`** and **`npx tsc --noEmit`** pass.  
- No server-side resolved booking totals introduced.

## Implementation Orders
1. Add **`validateEventAssignmentIntegrity`** to **`relationshipHelpersValidation.ts`**; import **`ValidEventCascade`** from **`config/app.js`**.  
2. Update **`validateAttendeeAssignmentEntities`** for parent segment requirement.  
3. In **`relationshipCrudRouter.ts`**, for **`RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS`**, call validator before **`mapRelationshipFields`**.  
4. Audit **`validEventCascades`** create; add shape-existence validation only if missing.  
5. Run server **lint** + **tsc**.

## Definition of Done

- [ ] App starts (`npm run start:dev`) — smoke if other work unchanged
- [ ] Lint passes (`cd server && npm run lint`)
- [ ] Session guide task **20.2.3.1** updated at **task-end**

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-guide.md`
- Session planning: `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-planning.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- FEATURE_20 §5.1 row: `eventAssignments`, `validEventCascades`, `event_instance_attendees` / attendee handlers
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
