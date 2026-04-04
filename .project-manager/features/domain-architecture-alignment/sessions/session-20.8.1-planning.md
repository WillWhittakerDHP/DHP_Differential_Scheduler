# Plan: session 20.8.1 — Part-ledger contract residuals

## Contract
- **Tier:** session | **ID:** 20.8.1
- **Scope:** Part-ledger contract residuals (`rateOverBase*` / base columns vs **ARCHITECTURE.md** §10.1 **timePerUnit** / **feePerUnit** / **baseTime** / **baseFee** vocabulary)
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/admin/useEntityCardSaveAndActions.ts` — oversized-return: Return surface has 14 properties; decompose into focused composables
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture, booking
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off

**Phase 20.8** is active; **session 20.8.1** is the first execution slice — part-instance **ledger** field naming and version-table alignment per **`phase-20.8-guide.md`** and **`preflight-evidence-20.7.2.md`** (invariant rows §14.3 / §14.3a–c owning **20.8**).

## Story

**This session delivers** a closed **part-ledger contract** (either renamed end-to-end to match §10.1 vocabulary or **explicitly documented/quarantined** with stable API boundaries) **so that** sessions **20.8.2–20.8.3** and later phases do not fight ambiguous column semantics in admin, booking PartFinalizer, and persistence.

**Estimated size:** **M**

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — domain-specific editors for shapes/instances, wizard settings, availability rules, integrations (target: **no** DB-driven admin metadata pipeline; see `FEATURE_20_ARCHITECTURE_REDESIGN.md` §6.3).

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Until the metadata stack is removed (Feature 20 Pass 6), some admin routes may still prefetch legacy metadata — treat that as **transitional**, not the end state.

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
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

## 5. Per-domain conventions

### Booking / wizard

- **Composable prefixes:** `useBooking*`, `useAvailability*`, `useWizard*`, `useAppointment*`, `useProperty*` (orchestrators such as `useAvailabilityOrchestrator`, `useBookingWizardSetup`).
- **Components:** under `components/booking/` (steps in `components/booking/steps/`).
- **Depends on** admin configuration data (wizard blocks, availability rules) served as **entities and settings** — document cross-domain deps in planning **Analysis** (the legacy DB-driven admin metadata row model was removed in Feature **20** Pass **6**; booking must not reintroduce it).
- **Scheduling rules:** Block instances, part ledger, PartFinalizer, event placement, and invariants are defined in **§8–§14** below.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Domain-specific editors + `EntityBase` / `ENTITY_CONFIGS` where generic CRUD remains; **target** is direct Vuetify forms per entity, not DB field-metadata-driven renderers (Principles §7.1, plan §6.3a).
- **Shape vs instance:** Structural validity (`valid_*` relationships) is edited on the **shapes** side; orchestration editors **select** active assignments from that universe — they do not redefine structural possibility (see §9).

### Auth

- **Emerging domain;** keep route and model changes aligned with `routes/internal/auth` and `db/models/auth`. Consumed by all domains via middleware/guards over time.

### Users / `user_role`

- **`users.user_role`** is a **small closed set** (PostgreSQL ENUM + Joi + client types). **Delivered (Feature 6 Session 6.18.1):** **`@shared`** exports **`USER_ROLE_VALUES`** and per-role constants; server and client **import** that list. Product vocabulary uses **`owner`** (not `seller`) end-to-end, including wizard **`additionalContacts[].role`** and contact-step field names (`ownerInfo`, `showOwner`). **Note:** Older saved wizard or step snapshots that used `seller` / `sellerInfo` are not migrated client-side; users re-enter contacts or clear stored state if needed.
- **User-type block instances** (state-control shapes) drive scheduling/display semantics; **`getUserTypeBlockIdForRole`** maps **DB role** → block instance. **Session 6.18.2** adds **admin-persisted alignment** (role → `block_instance_id`) so mappings are configurable without code edits where product allows. See `features/appointment-workflow/phases/phase-6.18-guide.md`.
- **Feature 7 Enactment** exposes role to the client using the **same** shared vocabulary as the API.

### Integrations

- Prefer **dedicated services** and **external routes**; avoid mixing full-URL axios into `apiClient` call sites without reason.

### Beta

- Isolated feedback capture; keep `beta` paths grouped under composables/views/components/beta.

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
4. Resolve part-level event assignment (override ?? baseline).  
5. Apply **zero-out last** (after floor) — zero-out wins for that part’s contribution to rollups.  
6. Group resolved time **by event** for layout.  
7. Roll resolved fees **by orchestrator** for presentation / persistence fields the product needs.

### 10.4 Time atomics and `property_details`

Time atomics hold **rates**; **`property_details`** holds appointment-scoped **inputs** (MLS / wizard). Product: rate × input = duration contribution. `property_details` is property **data**, not a substitute for time configuration.

---

## 11. Events, shapes, and placement

- **Event shapes** are admin-managed **placement types** (`placement_kind`, `anchor_edge`) read by the pipeline — extensible via data, not ad-hoc role math.
- **Event instances** are **named segments** owned by an event block instance (`parent_block_instance_id`). Event **orchestrator** holds baseline segment assignments; **event profiles** (composite packages) override assignments per part via `event_assignments`.
- **Pipeline rule:** Placement comes from stored assignment graph + shape placement fields — **no separate placement calculator** from differential roles or hidden rules.

---

## 12. MLS and property enrichment

| Table | Role |
|-------|------|
| `property_details` | Physical characteristics of the inspected property (appointment-scoped). |
| `property_feature_mappings` | MLS-driven rules → suggested time block instances. |
| `property_field_mappings` | MLS field → `property_details` columns. |

**Separation:** `property_details` = what the property **is**; time atomics = how that maps to **duration** (configuration). Keep them distinct.

---

## 13. Admin configuration model

- **Orchestration surface:** Instances with `orchestrator = true` — multi-select style editors constrained by shape-level validity.
- **Services surface:** Atomic services — primary day-to-day hub; inline time/fee/event per part in one view; edits project to part rows and `event_assignments` (UI is not a second source of truth).
- **Direction:** **Domain-specific editors** for all admin entity surfaces, **including annotations** — no long-lived exception for DB-driven field metadata (plan §3.6, §6.3).

---

## 14. Invariants (formal drift test)

If any assertion below is violated, the architecture has drifted.

1. **Domain separation:** Each block type writes only its own concern to part instances. Domains compose; they do not overwrite.

2. **Three root block-instance properties:** `composite`, `orchestrator`, and `wizardVisible` on **all** block instances (including user). Any combination is valid; no combination implies another.
   - **2a.** **Composite** = same-shape children.
   - **2b.** **Orchestrator** = cross-shape active assignments selected from the shape-level validity graph.
   - **2c.** **WizardVisible** = appears in wizard lists for that shape when cascades allow.

3. **Part instances are per-block-instance with two resolution tiers:** Own part sets via `part_assignments`; no cross-writes.
   - **3a.** **Base** only on service orchestrator part rows.
   - **3b.** Atomic services do not set base unless they are also orchestrators.
   - **3c.** **PerUnit** on time/price atomic part rows; other columns null.
   - **3d.** **Lineage:** PartFinalizer must not use `part_shape` alone when multiple logical work items could collide.
   - **3e.** **Event assignments** are relational (`event_assignments`); override wins per part else baseline.
   - **3f.** **PartFinalizer is client-side aggregation** for booking totals; server persists submitted payload without recomputing that resolution for the same contract.
   - **3g.** **Per-block-instance** gives provenance, clean undo, and safe reconfiguration.

4. **Events are data, not computation:** Pipeline reads assignments and placement types from storage.
   - **4a.** Event shapes = placement types, not “which parts go where.”
   - **4b.** Event instances = segments with calendar fields.
   - **4c.** New placement types = new shape rows when valid; no mandatory engine code change per row.

5. **`property_details` is appointment data, not configuration** for duration rates.

6. **User instances are orchestrators** driving wizard state and cascades; their three-property flags are configuration, not hard-coded product constraints.

## Codebase recon (agent-led — required)
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `server/src/db/models/booking/part_instance.ts`, `part_instance_version.ts`, `server/src/services/instanceVersioning.ts`, `server/src/services/appointmentSnapshotLoader.ts`, `client/src/types/entities.ts`, `client/src/types/booking/partFinal.ts`, `client/src/utils/booking/PartFinal.ts`, `client/src/utils/booking/confirmationStepDataFee.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `client/src/composables/admin/useAtomicPartLedgerRows.ts`, `client/src/constants/entitySchemaDefaults.ts`, `client/src/utils/entityCrud/computedPartPropertyKeys.ts` — all reference **`baseTime`**, **`baseFee`**, **`rateOverBaseTime`**, **`rateOverBaseFee`** (not `timePerUnit` / `feePerUnit` in code identifiers today).
- **Patterns / call sites:** Sequelize + API use **rateOverBase**\* naming; **ARCHITECTURE.md** §10.1 table uses **PerUnit** tier labels **timePerUnit** / **feePerUnit** — naming drift is documentation-vs-storage, not a second math engine. PartFinalizer aggregates **`rateOverBaseFee` / `rateOverBaseTime`** in `client/src/utils/booking/PartFinal.ts`.
- **Gaps / unknowns:** Whether product accepts a **breaking rename migration** in one phase vs **keep columns + glossary** in code comments and `.project-manager` docs — **task 20.8.1.1** must produce an explicit decision for **task 20.8.1.2**.

## Analysis

- **Problem / why now:** Phase **20.8** execution starts with the cheapest contract surface: part-instance ledger columns. Drift between **§10.1** vocabulary and **persisted field names** confuses admin metadata, booking totals, and new contributors.
- **Boundaries:** **Booking** (PartFinalizer, transformers), **server** persistence (models, versioning, snapshots), **admin** (code-first metadata rows), **`@shared`** only if API shapes change.
- **Patterns:** Follow existing Sequelize + transformer patterns; no silent renames — migrations authored in-repo; execution per **Migration authority** (localhost only for `npm run migrate` when applicable).
- **Risks:** Full rename touches DB, all API payloads, and wizard snapshots — may be **deferred** in favor of **quarantine + truth table** if scope explodes; document either way in **`phase-20.8-handoff`**.
- **Alternatives:** (A) Full rename to `timePerUnit` / `feePerUnit` / align `base*`. (B) Keep storage names; add **`ARCHITECTURE.md`** ledger column map + code comments at model boundary. (C) Hybrid: rename in **types** only with explicit serialization layer — only if justified in task **20.8.1.1** matrix.

## Goal

1. Produce an **evidence-backed decision** on ledger naming: rename, map-only, or quarantine — aligned with **phase-20.8** acceptance (“residual `rateOverBase*` drift resolved **or explicitly quarantined**”).
2. Implement that decision in **code + migrations (as needed)** or **documentation + narrow code comments** so there is **no ambiguous middle state**.
3. Leave **event/attendee/placement** work to **20.8.2 / 20.8.3** (out of scope here except touch points that share `part_instance` types).

## Decomposition (tasks)

- **Task 20.8.1.1:** Ledger **contract matrix** — trace `baseTime`, `baseFee`, `rateOverBaseTime`, `rateOverBaseFee` across DB migrations, models, versioning, appointment/snapshot loaders, client types, PartFinalizer, admin code-first metadata; document **§10.1** mapping and recommend rename vs quarantine.
- **Task 20.8.1.2:** **Execute** the recommendation — migrations + code rename **or** **quarantine package** (e.g. subsection in **`ARCHITECTURE.md`** or feature worklog + model file header) + minimal code touchpoints so the contract is **auditable**.

## Files (session scope)

- **Server:** `server/src/db/models/booking/part_instance.ts`, `part_instance_version.ts`, migrations under `server/src/db/migrations/` (grep `rateOverBase`, `baseTime`), `server/src/services/instanceVersioning.ts`, `appointmentSnapshotLoader.ts`
- **Client:** `client/src/types/entities.ts`, `client/src/types/booking/partFinal.ts`, `client/src/utils/booking/PartFinal.ts`, `client/src/utils/transformers/globalToBookingPartInstanceTransform.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `useAtomicPartLedgerRows.ts`
- **Docs:** `.project-manager/ARCHITECTURE.md` §10 (if adding mapping table), `preflight-evidence-20.7.2.md` cross-link from session log if quarantine path

## Approach

1. **20.8.1.1:** Grep-driven inventory + spreadsheet-style matrix in planning or session log; **no code** except notes.
2. **20.8.1.2:** Apply chosen path; run **`vue-tsc`** / **`typecheck-audit.mjs`** if types shift; **author** migration files if renaming; **do not** run migrate against remote DB.

## Checkpoint

- After **20.8.1.1:** Matrix reviewed; Will / agent agree **rename** vs **quarantine** in chat or inline in planning doc.
- After **20.8.1.2:** Lint clean on touched packages; ledger semantics **single-sourced** in docs or code.
- **`/accepted-plan`:** User approves task breakdown; then **`/task-start 20.8.1.1`** (or combined execution per playbook).

## Deliverables

- **Task 20.8.1.1:** Ledger field **contract matrix** (paths + recommendation).
- **Task 20.8.1.2:** Implemented **rename** or **published quarantine** (docs + code boundaries) per matrix.
- **Session log / handoff** updated at **`/session-end`** with pointer to next session **20.8.2**.

## Acceptance Criteria (session)

- [ ] Every **rateOverBase** / **base** ledger field on `part_instance` (and version rows) is accounted for in the matrix
- [ ] A **single** explicit outcome: **rename complete** **or** **quarantine documented** with no silent drift
- [ ] No scope creep into **event_assignments** / placement (defer to **20.8.2–20.8.3**)

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
