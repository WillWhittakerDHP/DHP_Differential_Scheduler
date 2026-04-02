# Bonsai Differential Scheduler — Domain Architecture

**Purpose:** Canonical map of business domains, code boundaries, data flow, type placement, and **locked scheduling/domain rules** (§8–§14). Agents should read relevant sections before planning or decomposing work.

This document is the **codebase map** and the **authoritative domain model** for block shapes, instances, part ledger, PartFinalizer, and booking pipeline boundaries. Ordered implementation passes, migration sequencing, and acceptance checks for large domain rewrites live in the implementation plan: [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md).

---

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

## 5. Per-domain conventions

### Booking / wizard

- **Composable prefixes:** `useBooking*`, `useAvailability*`, `useWizard*`, `useAppointment*`, `useProperty*` (orchestrators such as `useAvailabilityOrchestrator`, `useBookingWizardSetup`).
- **Components:** under `components/booking/` (steps in `components/booking/steps/`).
- **Depends on** admin metadata (wizard blocks, availability rules) — document cross-domain deps in planning **Analysis**.
- **Scheduling rules:** Block instances, part ledger, PartFinalizer, event placement, and invariants are defined in **§8–§14** below.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Generic admin components + config objects + transformers.
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

## 6. Architectural patterns (not thresholds)

- **Admin metadata-driven UI:** Generic components + runtime config + transformers.
- **Entity CRUD:** `EntityBase<GlobalEntityKey>` with `ENTITY_CONFIGS` registry.
- **Booking wizard:** Step composables, injection keys, orchestrator composable for thin shell components.
- **TanStack Query:** Consistent query keys; mutations invalidate affected queries.

For **quality thresholds** (props, composable complexity, etc.), use the four authoring playbooks and cursor governance rules — this document is **domain and pattern** context, not numeric limits.

---

## 7. Machine-readable domain hints

Heuristic audits and tooling may read **`.project-manager/ARCHITECTURE_DOMAINS.json`** (path prefixes, composable prefixes, ignore lists). Keep that file aligned when adding new top-level domain folders.

---

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
- **Direction:** Prefer **domain-specific editors** over generic metadata-driven cards where the domain is stable; annotation metadata may remain narrower.

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
