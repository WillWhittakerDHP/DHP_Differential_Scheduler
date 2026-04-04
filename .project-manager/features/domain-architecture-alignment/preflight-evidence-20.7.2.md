# Preflight evidence — Session 20.7.2

**Date:** 2026-04-04  
**Feature:** Domain architecture alignment (Feature 20)  
**Session:** 20.7.2 — preflight evidence package  

**Canonical cross-links:**

- [architecture-alignment-closeout-master-plan.md](./architecture-alignment-closeout-master-plan.md) — close-out sequencing (phases 20.7–20.13).
- [.project-manager/ARCHITECTURE.md](../ARCHITECTURE.md) — **§10** (PartFinalizer, `event_assignments`), **§11** (events / placement).

This file is the **single primary surface** for preflight notes: **§§1–2** from session **20.7.2**; **§§3–4** completed in session **20.7.3** (task **20.7.3.2**).

---

## 1. Event-routing watchpoint (`event_assignments` / `eventAssignments`)

### 1.1 Locked contract (architecture)

Per **ARCHITECTURE.md** §10.1 and §14.3e, **events are routed relationally** via the **`event_assignments`** table (API / global: `eventAssignments`), **not** via scalar override columns on part rows for the primary routing story. §10.2 describes **`resolvedEvent`** as *event profile override else orchestrator baseline per part instance*; the live booking **slot-shape** path below consumes **assigned event instances** grouped for the **PartFinalizer** duration pipeline.

### 1.2 Data flow (booking)

1. **`useAppointmentShape`** (`client/src/composables/booking/useAppointmentShape.ts`) reads the global bundle: `globalData.relationships.eventAssignments` as **`GlobalRelationship[]`** (falls back to `[]` if missing), plus `eventInstance` and `eventShape` entities and `partShape` map.
2. **`buildAppointmentShape`** (`client/src/utils/booking/appointmentSlotBuilder.ts`) calls **`buildEventAssignmentsByPartShape`** when `eventInstances`, `eventAssignmentsRelationships`, and `partShapeById` are all present. That builds a map **`eventAssignmentsByPartShape: Record<string, EventInstance[]>`** keyed by **part shape name** (`partShape` string on finalized parts).
3. **`lookupEventsForPartShape`** filters `eventAssignmentsRelationships` to parents with **`parent.entityKey === 'blockInstance'`** and block instances that **contain a part instance** whose `partShape` matches the name, then collects child **`eventInstance`** ids and resolves them against `eventInstances`.
4. **`calculateSlotShape`** (`client/src/utils/booking/partFinalizerSlotShape.ts`) is the PartFinalizer **slot-shape** entry: it passes **`eventAssignmentsByPartShape`** into **`accumulateRawDurationsFromBlockFinals`** (`client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`), which for each finalized part reads **`eventAssignmentsByPartShape[part.partShape]`** and rolls raw duration into per-**eventShape** buckets before rounding and **`eventFinals`**.

**Additional booking touchpoints (supporting):**

- `client/src/utils/booking/appointmentTimeCalculations.ts` — passes through `eventAssignmentsRelationships` where used for time math.
- `client/src/utils/booking/minimizerPartShapeName.ts` — reads `shape.eventAssignmentsByPartShape` for minimizer logic.
- `client/src/components/booking/dev/DevPanelsContainer.vue` — dev visibility of `eventAssignmentsByPartShape`.

### 1.3 Admin surface

- **Relationship naming** — `client/src/constants/relationships.ts`: `eventAssignments.backendName === 'event_assignments'`, **`parentEntity`: `blockInstance`**, **`childEntity`: `eventInstance`**.
- **Code-first metadata** — `client/src/utils/admin/codeFirstMetadataCache.ts`:
  - **`blockInstance.eventAssignments`** — relationship collection (display config from `codeFirstBlockInstanceSelectInputs.eventAssignments`).
  - **`partInstance.eventAssignments`** — separate row using **`PART_INSTANCE_EVENT_ASSIGNMENTS_INPUT_CONFIG`** (`client/src/utils/admin/codeFirstSelectInputConfigs.ts`: `groupByKey: 'eventShapeRef'`, `selectedParentKey: 'partInstance'`, migration comment **20260431_000029**).
- **Display / filter** — `client/src/configs/field/display/selectableDisplayConfigBlockInstance.ts` (block instance event assignment select), `client/src/utils/admin/selectFilteringResolveBranches.ts` / `selectFilterStrategies.ts` (event cascade filtering commentary).

### 1.4 API / transform ambiguity (**pass** vs **risk**)

| Topic | Assessment | Notes |
|-------|------------|--------|
| **Confirm live meaning of `event_assignments` where code appears ambiguous** (phase guide Session 20.7.2) | **Pass with documented nuance** | **Default** relationship parent is **`blockInstance`** → **`eventInstance`** (`relationships.ts`). **`fetchToGlobalTransformer.transformApiRelationship`** allows **`parentKind` override** when the API sends `raw.parentKind` for **`eventAssignments`**, so global graphs may include **non–block-instance** parents while the booking rebuild in **`appointmentSlotBuilder`** only consumes relationships whose **`parent.entityKey === 'blockInstance'`**. If the API emits only part-scoped edges, **booking `eventAssignmentsByPartShape` may be empty** until shapes align — **risk** for drift between admin editing surface and booking consumer. **Owning follow-up:** extension phases **20.8–20.13** as needed; booking alignment emphasis **20.10** if product requires part-scoped edges in the live pipeline. |
| **Two admin surfaces** (`blockInstance` vs `partInstance` `eventAssignments`) | **Risk (coordination)** | Both are intentional in code-first metadata; they must stay consistent with **migrations** and the **global relationship** graph the API returns. Single source of truth is **server + global fetch**, not either editor alone. |
| **Map keyed by part shape name** in `eventAssignmentsByPartShape` vs **§10 / §14** lineage rules | **Risk (model collision)** | PartFinalizer **slot-shape** aggregation indexes assigned events by **`part.partShape`** string. **ARCHITECTURE.md** §10.2 / §14.3d warns against resolving **only** by `part_shape` when multiple work items could collide; see **§2** table row **§14.3d**. |

### 1.5 Next (remaining preflight sections)

- **§2 — Invariant audit** — completed session **20.7.2** (task **20.7.2.2**).
- **§3 — Migration execution policy** and **§4 — `property_details` boundary** — completed session **20.7.3** (task **20.7.3.2**).

---

## 2. Invariant audit (ARCHITECTURE.md §14-style)

**Authority:** [.project-manager/ARCHITECTURE.md](../ARCHITECTURE.md) **§14** — *“If any assertion below is violated, the architecture has drifted.”*

**Method:** Each row states **pass**, **fail**, or **unknown** against current code/docs as of this preflight. **unknown** means the audit did not trace or prove the invariant end-to-end. **Owning phase** applies to **fail** and **unknown** only (pass → **—**).

**See also:** **§1** for `event_assignments` / `parentKind` / dual admin surfaces.

**Extension phase guides (ownership targets):** [phase-20.8-guide.md](./phases/phase-20.8-guide.md) (schema/API), [phase-20.9-guide.md](./phases/phase-20.9-guide.md) (admin), [phase-20.10-guide.md](./phases/phase-20.10-guide.md) (booking), [phase-20.11-guide.md](./phases/phase-20.11-guide.md) (migrations), [phase-20.12-guide.md](./phases/phase-20.12-guide.md) (cleanup), [phase-20.13-guide.md](./phases/phase-20.13-guide.md) (truth docs).

| Invariant (§14 ref) | Status | Evidence (paths / notes) | Owning phase | Guide |
|---------------------|--------|---------------------------|--------------|--------|
| **§14.1** Domain separation — block types write only their concern; domains compose | **unknown** | No exhaustive audit of every write path to `part_instances` / cross-domain overwrites in this pass. | **20.8** | [phase-20.8-guide.md](./phases/phase-20.8-guide.md) |
| **§14.2** Three booleans on all block instances: `composite`, `orchestrator`, `wizardVisible` | **pass** | `server/src/db/models/booking/block_instance.ts` declares **composite**, **orchestrator**, **wizardVisible**; **wizardVisible** / **orchestrator** on `block_instance_version.ts`. | — | — |
| **§14.2a–c** Composite / orchestrator / wizardVisible semantics | **unknown** | Semantics match **ARCHITECTURE** §9 in intent; not proven against all cascade/wizard list code paths here. | **20.9** | [phase-20.9-guide.md](./phases/phase-20.9-guide.md) |
| **§14.3** Per-block part sets via `part_assignments`; no cross-writes | **unknown** | Expected from Sequelize models and transformers; not proven with a full cross-write audit. | **20.8** | [phase-20.8-guide.md](./phases/phase-20.8-guide.md) |
| **§14.3a–c** Base only on orchestrator; atomics PerUnit; atomic base rules | **unknown** | Resolution tiers described in **§10.1**; enforcement across all admin mutations not traced in this pass. | **20.8** | [phase-20.8-guide.md](./phases/phase-20.8-guide.md) |
| **§14.3d** Lineage — PartFinalizer must not use `part_shape` alone when collisions possible | **unknown** | `client/src/utils/booking/partFinalizer.ts` **`groupPartsByShape`** / **`partShapeKey`** group booking parts by **part shape name**; **`appointmentSlotBuilder`** / **`partFinalizerSlotShapeHelpers`** key **`eventAssignmentsByPartShape`** by **part shape name**. No **`lineage`** bucket field found under `client/src/utils/booking/*.ts` (string search). Aligns with **§1.4** risk. | **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) |
| **§14.3e** Event assignments relational (`event_assignments`); override per part else baseline | **pass** (nuance) | Relational model: `client/src/constants/relationships.ts` (**`event_assignments`**); booking consumes **`globalData.relationships.eventAssignments`**. **Nuance:** API **`parentKind` override** (`client/src/utils/transformers/fetchToGlobalTransformer.ts`) vs booking filter on **`blockInstance`** parents — see **§1.4**. “Override vs baseline” for **resolvedEvent** not fully traced in one function in this pass. | — | — |
| **§14.3f** PartFinalizer client-side aggregation; server persists without recomputing same resolution | **pass** | `server/src/routes/internal/appointments/appointmentHelpers.ts` module doc: persistence-only, **does not re-run PartFinalizer** or verify resolved totals. | — | — |
| **§14.3g** Per-block-instance provenance / undo / reconfiguration | **unknown** | Consistent with per-block part rows in models; operational “undo” not audited. | **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) |
| **§10.3 step 5** Zero-out **after** floor; zero-out wins for rollups | **unknown** (partial) | **Excluded from rollups:** `filterZeroedParts` / **`filterZeroedBlocks`** (`client/src/utils/booking/partFinalizer.ts`, `blockFinalizer.ts`) remove zeroed parts before **`buildAppointmentShape`** slot pipeline. Full ordering vs **§10.3** steps 2–5 (floor vs zero-out) not proven in one trace. | **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) |
| **§14.4** Events are data — pipeline reads assignments + placement from storage | **pass** (partial) | Event shapes / instances loaded from global; slot pipeline uses stored relationships and **`eventShape`** entities. Placement “no hidden calculator” not formally proven. | — | — |
| **§14.4a–c** Event shape = placement type; instances = segments; new rows without engine change | **unknown** | Broadly matches product direction; extensibility per row not tested. | **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) |
| **§14.5** `property_details` is appointment data, not configuration for duration rates | **unknown** | Wizard / request builders use `propertyDetails` on appointments (`client/src/utils/booking/appointmentDataBuilders.ts`, etc.). **Distinction** vs time atomics / rates is **ARCHITECTURE** §10.4 / §12 — detailed evidence paragraph is **§4** below. | **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) |
| **§14.6** User instances as orchestrators; flags are configuration | **unknown** | Product rule; user-type block wiring not audited in this pass. | **20.9** | [phase-20.9-guide.md](./phases/phase-20.9-guide.md) |

### 2.1 Summary

- **Passes:** **§14.2** (three booleans present), **§14.3e** (relational events with documented API nuance), **§14.3f** (server persistence boundary stated in code), **§14.4** (partial — data-driven events).
- **Highest-risk unknowns:** **§14.3d** (lineage vs **part_shape** grouping), **§10.3** zero-out ordering vs filtered pipeline, **§14.5** (see **§4** for boundary prose).
- **Next (execution):** Close-out phases **20.8–20.13** — see **`### Preflight follow-ups`** in each **`phase-20.x-guide.md`** and [architecture-alignment-closeout-master-plan.md](./architecture-alignment-closeout-master-plan.md).

---

## 3. Migration execution policy

**Authority:** Workspace rule **Migration authority** (`.cursor/rules` / process workflow): do **not** run `npm run migrate`, `db:reset`, Sequelize DDL, or similar **unless** `DB_HOST` in the active server env (e.g. `server/.env.development`) is **`localhost`** or **`127.0.0.1`**. If `DB_HOST` points at a **shared / remote** database, this machine is a **consumer** — **only the host** runs migrations.

**Authoring vs execution**

- **Authoring** migration files in-repo is allowed from any machine; **commit** them for the host to run.
- **Executing** migrations against a database requires the **localhost guard** above (or the designated migration host for that environment).

**Feature 20 ordering**

- Ordered passes and migration **narrative** (which migration runs when, baseline seeds, conversion crosswalks) live in [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](../../analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) and are **operationalized** in extension phase **[phase-20.11-guide.md](./phases/phase-20.11-guide.md)** (migration narrative and data conversion close-out). Preflight does **not** replace that plan — it restates **who may run DDL** so agents do not accidentally migrate a shared DB.

**Session harness:** Tier workflow may run **`/phase-start`** / **`/session-start`** on a consumer machine; that does **not** override the migration rule.

---

## 4. `property_details` vs time-configuration storage

**Authority:** [.project-manager/ARCHITECTURE.md](../ARCHITECTURE.md) **§10.4** (time atomics and `property_details`), **§12** (MLS / property enrichment tables), **§14.5** (`property_details` is appointment data, not configuration for duration rates).

**Roles**

| Concern | Role |
|--------|------|
| **Time atomics** (part instances / time domain) | Hold **rates** and configuration used with inputs — **how** duration maps from property characteristics. |
| **`property_details`** | **Appointment-scoped inputs** (MLS / wizard): what the **property is** for this inspection — square footage, ADU count, address fields, etc. |
| **Product rule** | **Rate × input** → duration contribution. **`property_details`** is **data**; it is **not** a substitute for **time configuration** (rates live on atomic part rows / settings per architecture). |

**Storage map (architecture)**

- **`property_details`** table — physical characteristics of the inspected property (**appointment-scoped**). See **ARCHITECTURE** §12 table.
- **`property_field_mappings`** / **`property_feature_mappings`** — MLS-driven rules and field mapping into **`property_details`** columns; distinct from **timePerUnit**-style configuration on part rows.

**Client evidence (booking)**

- **`client/src/utils/booking/appointmentDataBuilders.ts`** — `buildPropertyDetailsForRequest` and appointment payloads carrying `propertyDetails` for persistence; wizard flow supplies step data that becomes this payload shape.

**Execution follow-up**

- **§14.5** remained **unknown** in the §2 audit until product paths are fully traced end-to-end; **owning phase [20.10](./phases/phase-20.10-guide.md)**. This §4 paragraph is the **contract restatement**; verification work stays in the booking pipeline phase, not in preflight alone.
