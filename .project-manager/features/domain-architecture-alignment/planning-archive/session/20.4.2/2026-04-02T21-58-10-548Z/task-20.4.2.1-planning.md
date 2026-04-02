# Plan: task 20.4.2.1 — Remove role enrichment + narrow PartFinal

## Contract
- **Tier:** task | **ID:** 20.4.2.1
- **Scope:** Remove **`enrichBlockFinalsWithDifferentialRoles`** and **`resolvePartShapeDifferentialFlags`** from the booking client; stop mutating **`PartFinal`** with **`major` / `minor` / `minimizer`**; keep **`eventAssignmentsByPartShape`** + **`eventShapes`** flowing into **`calculateSlotShape`** unchanged. Session **20.4.2.2** owns slot-shape / perspective refactors.
- **Governance (harness snapshot):**
  - Governance Context (Task)
  - File-Scoped Violations
  - No existing violations in task files.
  - Thresholds (Quick Reference)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, booking
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Session **20.4.2** started; **`/accepted-plan`** completed. This task is the first implementation slice (see **`session-20.4.2-planning.md`**).

## Parent context (session planning — Analysis excerpt)

- **Intent:** FEATURE_20 **§4.3** — delete differential-role **enrichment** on block finals; **`PartFinal.major|minor|minimizer`** removed in favor of placement/instance-driven data downstream. **20.4.2.1** = pipeline + type narrowing; **20.4.2.2** = slot/time/perspective/minimizer consumers.

## Story
**This task removes** the **`enrichBlockFinalsWithDifferentialRoles`** stage and **PartFinal** role ternaries **because** session **20.4.1** showed slot math already uses **`getEventShapeByRoleWithOverrides`** + **`eventAssignmentsByPartShape`**, not those part-level flags — enrichment only duplicated placement → role → ternary. **Placement data remains** on event shapes and in **`eventAssignmentsByPartShape`** for **20.4.2.2** to consume exclusively.

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

---

## (from ARCHITECTURE.md — domain rules §8+)

## 8. Domain model (block shape types)

The system has five block shape **types**. Each owns one scheduling concern. All five participate in the three-property instance model (§9).

| Type | Domain | What it owns |
|------|--------|----------------|
| `user` | Identity | User identity and wizard state. User instances drive cascades and annotations. |
| `service` | Structure | Work items (part instances), active downstream assignments per service context. **Base** time/fee defaults and floors live only on **service orchestrator** part instances. |
| `event` | Event | Part-instance calendar segment assignments and time-axis patterns. |
| `time` | Duration | Part-instance duration contributions from property characteristics (rates × inputs). |
| `price` | Fee | Part-instance fee contributions and rollups from rates and cascades. |

**Domain separation:** Each domain writes only its own concern on part instances. Domains **compose**; they do not overwrite each other’s values.

**Legacy names:** During migrations, stored enums or code may still reference older labels (`property` / `coupon` / `option`); target names are **`time`**, **`price`**, **`event`** aligned to this table.

---

## 9. Block instances: three-property model and layering

### 9.1 Three orthogonal properties (instance storage only)

Every **block instance** has three independent booleans (not on block **shapes**):

| Property | Axis | Question |
|----------|------|----------|
| `orchestrator` | Behavior | Root of an active assignment graph across other shapes? |
| `composite` | Structure | Owns child block instances of the **same** shape? |
| `wizardVisible` | Presentation | Appears in the booking wizard when cascades permit? |

Any combination is valid. Compositeness is **same-shape** hierarchy; orchestration is **cross-shape** active selection from the shape-level validity graph.

### 9.2 Layering

```
Block shape (template — type, domain, valid shape-level relationships)
  └─ Block instance (runtime — carries composite / orchestrator / wizardVisible)
       └─ Part instance (value ledger per block instance)
```

- **Shapes** define what is structurally possible (`valid_*` tables). They do **not** store the three booleans.
- **Block instances** store the three booleans and create part instances.
- **Orchestrator instances** choose which downstream instances are **active** from the options the shape graph allows — they do **not** redefine validity.

---

## 10. Part instances, PartFinalizer, and resolution

### 10.1 Per-block-instance ledger

Each block instance owns its own part instances via `part_assignments` (including user block instances). No instance writes another instance’s part rows.

**Two resolution tiers on part rows:**

| Tier | Who | Columns |
|------|-----|---------|
| **Base** | Service orchestrator only | `baseTime`, `baseFee` (floor + starting values) |
| **PerUnit** | Time / price atomics | `timePerUnit`, `feePerUnit` |

**Events:** Routed via relational **`event_assignments`** (event instance ↔ part instance), not scalar default/override columns on part instances.

### 10.2 PartFinalizer (client)

Part instances are storage. **PartFinalizer** (booking client pipeline) aggregates:

- `resolvedTime` = service base + Σ(timePerUnit × input) for time atomics in the same **lineage** bucket.
- `resolvedFee` = service base + Σ(feePerUnit × input) and percentage passes.
- `resolvedEvent` = event profile override **else** event orchestrator baseline assignment **per part instance**.

Base acts as a **floor** until zero-out. **Correlation:** bucket by lineage to the atomic service / line item — **forbidden** to resolve by `part_shape` alone when multiple work items could collide.

### 10.3 Resolution order (per part)

1. Per-block-instance part records exist.  
2. Resolve part-level time (base + time atomics using `property_details` inputs).  
3. Resolve part-level fee (base + price atomics).  
4. Resolve part-level event assignment (override ?? baselin

_(Excerpt truncated.)_

## Codebase recon (agent-led — required)
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `client/src/utils/booking/partFinalizer.ts` (defines **`enrichBlockFinalsWithDifferentialRoles`**, **`resolvePartShapeDifferentialFlags`**), `appointmentSlotBuilder.ts` (sole **caller** of enrich), `PartFinal.ts`, `client/src/types/booking/partFinal.ts`, `blockFinal.ts`, `appointmentModels.ts`, dev panel types/composables using **`PartFinal[]`**. Repo **`grep`**: no **`client/`** reads of **`part.major` / `pf.major` / `PartFinal` ternary fields** outside **`partFinalizer.ts`** (matches **20.4.1** session log).
- **Patterns / call sites:** **`buildAppointmentShape`** builds **`eventAssignmentsByPartShape`**, optionally calls **enrich** when assignments + shapes exist, then **`calculateSlotShape(..., differentialEventRoleOverrides)`** with `{}` overrides. Slot helpers use **event shape names** and **role** via **`getEventShapeByRoleWithOverrides`**, not **`PartFinal.major`**.
- **Gaps / unknowns:** None for this task's delete scope. **20.4.2.2** must ensure **`calculateSlotShape`** / offsets still behave when **`PartFinal`** no longer carries ternaries (today enrichment matched placement-derived roles when overrides are empty).

## Analysis
- **Problem:** FEATURE_20 **§4.3** lists **enrichment** and **PartFinal** role fields for **removal**. Audit confirmed they are **redundant** with placement + **`eventAssignmentsByPartShape`** for current production (`mergedRoleOverrides` / appointment overrides **{}**).
- **Boundaries:** **Client booking** only; **no** `@shared` type changes required unless a stray export breaks (unlikely). **Admin** **`DifferentialEventRoleOverridesField`** unchanged.
- **Risks:** Theoretical divergence if a future path supplied **non-empty** overrides into **`PartFinal`** — today **`buildAppointmentShape`** always passes **`null`** into **`resolvePartShapeDifferentialFlags`** via enrich's internal call; removing enrich **does not** remove override support from **`calculateSlotShape`** / perspective (still `{}` on shape until wired later).
- **Alternatives:** No-op **enrich** — **rejected** (dead code). Parallel "placement flags" type — **rejected** (violates §4.3).

## Design
1. **`appointmentSlotBuilder.buildAppointmentShape`:** Remove the block that assigns **`nonZeroedBlockFinals = enrichBlockFinalsWithDifferentialRoles(...)`**. Keep **`eventAssignmentsByPartShape`** and **`resolvedEventShapes`** as today.
2. **`partFinalizer.ts`:** Delete **`resolvePartShapeDifferentialFlags`**, **`enrichBlockFinalsWithDifferentialRoles`**, and imports only they need. After removal, **`BlockFinal`** type import may be unused — remove if so.
3. **`client/src/types/booking/partFinal.ts`:** Remove **`major`**, **`minor`**, **`minimizer`** from **`PartFinal`**.
4. **`PartFinal.ts` (`createPartFinal`):** Remove default ternary constants and object properties.
5. Run **`cd client && npm run lint`**; fix any type errors.

## Goal
Remove **`enrichBlockFinalsWithDifferentialRoles`** from the booking pipeline and delete **`PartFinal.major` / `minor` / `minimizer`** so **§4.3** narrowing is done at the part-final type; **eventAssignmentsByPartShape** + shapes remain the source for placement-linked data into **`calculateSlotShape`**.

## Files
- `client/src/utils/booking/partFinalizer.ts`
- `client/src/utils/booking/appointmentSlotBuilder.ts`
- `client/src/utils/booking/PartFinal.ts`
- `client/src/types/booking/partFinal.ts`

## Approach
1. Edit **`partFinal.ts`** (type) and **`PartFinal.ts`** (**`createPartFinal`**) first.
2. Remove enrich function + helpers from **`partFinalizer.ts`**; drop unused imports; keep **`calculateSlotShape`** re-export.
3. Remove enrich **import** and **call** from **`appointmentSlotBuilder.ts`**.
4. **`grep`** **`client/`** for **`enrichBlockFinalsWithDifferentialRoles`** and **`PartFinal`** role fields; fix stragglers.
5. **`npm run lint`** in **`client/`**.

## Checkpoint
- **`grep`** shows **no** **`enrichBlockFinalsWithDifferentialRoles`** in **`client/`**.
- **`PartFinal`** interface has **no** role ternaries; **`client` lint** passes.

## Deliverables
- Code changes in the four files above + any compile fixes.
- No behavioral change expected for slots when overrides are empty; note in **task-end** if smoke finds otherwise.

## Acceptance Criteria
- **AC1:** **`enrichBlockFinalsWithDifferentialRoles`** and **`resolvePartShapeDifferentialFlags`** deleted from **`partFinalizer.ts`**.
- **AC2:** **`buildAppointmentShape`** does not call enrich; still passes **`eventAssignmentsByPartShape`** into **`calculateSlotShape`**.
- **AC3:** **`PartFinal`** type and **`createPartFinal`** omit **`major` / `minor` / `minimizer`**.
- **AC4:** **`cd client && npm run lint`** exits 0.

## Implementation Orders

1. Update **`client/src/types/booking/partFinal.ts`** — remove **`major`**, **`minor`**, **`minimizer`** (and associated JSDoc).
2. Update **`client/src/utils/booking/PartFinal.ts`** — remove constants and properties aligned with the type.
3. Update **`client/src/utils/booking/partFinalizer.ts`** — remove **`enrichBlockFinalsWithDifferentialRoles`**, **`resolvePartShapeDifferentialFlags`**, and unused imports; remove **`BlockFinal`** import if unused.
4. Update **`client/src/utils/booking/appointmentSlotBuilder.ts`** — remove **`enrichBlockFinalsWithDifferentialRoles`** import and the conditional enrich block (~lines 143–152).
5. **`grep`** **`client/`** for **`enrichBlockFinalsWithDifferentialRoles`**; fix any remaining references.
6. Run **`cd client && npm run lint`**.


## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
