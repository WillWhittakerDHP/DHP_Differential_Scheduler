# Preflight evidence — Session 20.7.2

**Date:** 2026-04-04  
**Feature:** Domain architecture alignment (Feature 20)  
**Session:** 20.7.2 — preflight evidence package  

**Canonical cross-links:**

- [architecture-alignment-closeout-master-plan.md](./architecture-alignment-closeout-master-plan.md) — close-out sequencing (phases 20.7–20.13).
- [.project-manager/ARCHITECTURE.md](../ARCHITECTURE.md) — **§10** (PartFinalizer, `event_assignments`), **§11** (events / placement).

This file is the **single primary surface** for preflight notes produced in session **20.7.2**. Sections **2–4** are completed in tasks **20.7.2.2** and **20.7.2.3** (stubs below).

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
| **Map keyed by part shape name** in `eventAssignmentsByPartShape` vs **§10 / §14** lineage rules | **Risk (model collision)** | PartFinalizer **slot-shape** aggregation indexes assigned events by **`part.partShape`** string. **ARCHITECTURE.md** §10.2 / §14.3d warns against resolving **only** by `part_shape` when multiple work items could collide; the watchpoint does **not** assert that collision case is fully handled in **`appointmentSlotBuilder`** — **unknown / deferred** to **20.7.2.2** invariant audit. |

### 1.5 Next (remaining preflight sections)

- **§2 — Invariant audit** — task **20.7.2.2** (§14-style table, owning phases **20.8–20.13**).
- **§3 — Migration execution policy** and **§4 — `property_details` boundary** — task **20.7.2.3**.

---

## 2. Invariant audit (ARCHITECTURE.md §14-style)

*To be completed in task **20.7.2.2**.*

---

## 3. Migration execution policy

*To be completed in task **20.7.2.3**.*

---

## 4. `property_details` vs time-configuration storage

*To be completed in task **20.7.2.3**.*
