<!-- harness-planning-rollup tier=session id=20.3.2 consolidatedAt=2026-04-02T19:56:33.023Z -->

# Consolidated planning: session 20.3.2

## Session 20.3.2 (parent)

## Story

**This session delivers** a **service block-instance atomic / convergence editor** (VCard + tabular part rows) **so that** admins see and edit **all work-item part instances** for a service in one place—matching FEATURE_20 **§3.6** / **§8.3** item 2 and proving the **inline part-row** pattern before time/price/event atomic editors.
**Estimated size:** M

---

## Analysis

- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side resolution. **Shapes** tab stays structural; this editor lives on **Instances** for **service** `blockInstance` only. **Orchestrator / composite / wizardVisible** stay on the existing EntityCard fields—only add the **atomic parts** table (or explicitly defer three-property toggles if already sufficient in metadata).
- **Grounding:** Reuse **`usePartsTotals` / `blockInstancePartsTotalsResolution`** lineage—same part rows the fee preview uses—so admin and booking share one notion of “parts under this block.”
- **Child-tier patterns:** Thin **ServiceAtomicEditor.vue**; composable for row resolution + optional save orchestration; explicit return types; logger on catch per project rules.
- **Risks:** Wide table on mobile—use **horizontal scroll** + compact density. Accidental edits—confirm save path matches **partInstance** entity mutations. **Mitigation:** start with read-only columns if wiring is unclear, then enable edits in 20.3.2.2.
- **Alternatives:** Only link to **PartInstanceList** — **rejected** (fails §3.6 convergence goal). Full **EntityCard** replacement — **out of scope** for this session (additive panel first).

## Goal

Ship **ServiceAtomicEditor** for **service** `blockInstance`: a **VCard + VDataTable** (or equivalent) listing **all part instances** under the instance (via `partAssignments`), showing **convergence-relevant** columns (at minimum **name**, **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart**; extend with per-unit columns if already on `PartInstanceEntity`). **User-facing copy** describes **work items / convergence**, not generic “rows.” **Session 20.3.1** placement work is **not** repeated here.

## Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §4 / §7; `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §3.6, §8.3, §9.1 drift checklist; `.project-manager/ARCHITECTURE.md` §8–9
- **PM:** `sessions/session-20.3.2-guide.md`, `phases/phase-20.3-guide.md`, `sessions/session-20.3.1-handoff.md`
- **Implementation (primary):** `client/src/utils/admin/blockInstancePartsTotalsResolution.ts` (reuse/extend), `client/src/composables/admin/` (new composable, e.g. `useServiceAtomicPartRows.ts`), `client/src/components/admin/generic/ServiceAtomicEditor.vue` (new), `client/src/components/admin/generic/EntityCardContent.vue` (conditional mount for service instances), optional `client/src/components/admin/generic/EntityCard.vue` props pass-through; reference `PartInstanceBulkEditModal.vue` for field semantics

## Approach

1. **Task 20.3.2.1:** Implement **composable** (and small pure helpers if needed) that returns **typed rows** for a **service** block instance’s part instances + **part shape** labels; gate on `blockShape.type === 'service'`; no UI beyond dev-only smoke optional.
2. **Task 20.3.2.2:** Add **ServiceAtomicEditor** UI: Vuetify **VDataTable** (or VTable) inside **VCard**; wire **save** to existing **partInstance** update path; insert into **EntityCardContent** above sub-panels or below fee preview per layout review; **lint + vue-tsc**; manual: Instances → **service** block → table matches parts under card.
3. Run **§9.1 drift checklist** in session notes before **session-end**.

## Checkpoint

- **After 20.3.2.1:** Composable returns stable row DTO for at least one real service instance in dev data; unit clarity documented in file header.
- **After 20.3.2.2:** Table visible only for **service** instances; editing one scalar persists and reloads from store; no new server endpoints.
- **Before session-end:** Phase objective **“Service atomic”** in `phase-20.3-guide.md` ready to check when product agrees.

## Deliverables

- Composable (or approved extension) resolving **service atomic** part rows from **`partAssignments` + `partInstance`** store.
- **ServiceAtomicEditor.vue** integrated into **block instance** card for **`blockShape.type === 'service'`**.
- Placement-forward / convergence-oriented **labels** (card title, column headers, empty state).
- Client **lint** + **typecheck** clean on touched paths.

## Acceptance Criteria

- [ ] **Service-only:** Editor does not mount for non-service block instances.
- [ ] **Row completeness:** Table lists the same part instances as **`usePartsTotals`** / resolution helpers for that parent (no orphan rows).
- [ ] **Columns:** At least **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart** surfaced (read or read/write per task 2 outcome).
- [ ] **Principles §4.8:** **Zeroed-out** parts remain visible in admin (no filter that hides `zeroOutPart` in this view).
- [ ] **No server booking math** added; **no** shape-level validity editing on this surface.
- [ ] **Lint + vue-tsc** pass for touched client files.

---

## Task 20.3.2.1 (source: task-20.3.2.1-planning.md)

### Story

This task adds a **focused composable** that exposes **typed part-instance rows** for a **service** `blockInstance`, reusing the same **partAssignments → ordered child IDs → partInstance entities** pipeline as `usePartsTotals`. **20.3.2.2** will mount **ServiceAtomicEditor** on top of this data; without the composable, the editor would duplicate relationship resolution and logging.

---

### Analysis

- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side r… _(truncated)_

### Goal

Implement **`useServiceAtomicPartRows`** (or agreed name) that returns **typed, ordered rows** of part instances for a **`blockInstance`** whose **`blockShape.type` is `service`**, using the same **`partAssignments` resolution** as `usePartsTotals` (`blockInstancePartsTotalsResolution` helpers). Rows must be sufficient for **20.3.2.2** to render **convergence** columns without re-deriving relationships.

### Files

- **New:** `client/src/composables/admin/useServiceAtomicPartRows.ts`
- **New (optional but preferred):** `client/src/types/admin/serviceAtomicPartRows.ts` — `ServiceAtomicPartRow`, `UseServiceAtomicPartRowsReturn`
- **Reuse (no behavioral change unless a tiny shared export is needed):** `client/src/utils/admin/blockInstancePartsTotalsResolution.ts`
- **Reference only:** `client/src/composables/admin/usePartsTotals.ts`, `client/src/constants/blockShapeTypes.ts`, `client/src/types/entities.ts` (`PartInstanceEntity`)

### Approach

1. Add row + return types with **explicit exported return type** on the composable (`Composable` governance).
2. Gate with **`BLOCK_SHAPE_TYPES.SERVICE`**; return empty rows and `isServiceBlockInstance: false` for non-service or missing entities.
3. Reuse **`activeChildIdsForBlockParent`** + **`resolvePartInstancesByChildIds`**; mirror **`usePartsTotals`** logging for duplicates and missing instances.
4. Resolve **part shape `name`** per row via `getGlobalEntityById('partShape', …)`; log missing shapes at **warn** or **debug** per frequency (prefer **debug** for shape, **warn** for missing instance ids).
5. Do **not** add UI files in this task.

### Checkpoint

- Composable is importable; **vue-tsc** clean for new files.
- For a dev **service** `blockInstance` with `partAssignments`, `rows` length matches ordered part instances; for **non-service** shapes, `rows` is `[]`.

### Deliverables

- [ ] `useServiceAtomicPartRows` composable with documented row ↔ `PartInstanceEntity` column mapping (file header or types file).
- [ ] Typed `ServiceAtomicPartRow` (and return interface) in `client/src/types/admin/` if not inlined.
- [ ] No new server or shared-package changes.

### Acceptance Criteria

- [ ] **`isServiceBlockInstance`** is true only when the instance exists and **`blockShape.type === 'service'`**.
- [ ] **Row order** matches **`partAssignments`** child order (after dedupe), consistent with **`usePartsTotals`**.
- [ ] Each row exposes convergence fields needed for the table: at minimum **instance `name`**, **`baseTime`**, **`baseFee`**, **`rateOverBaseTime`**, **`rateOverBaseFee`**, **`zeroOutPart`**, plus **part shape label** (or documented placeholder).
- [ ] **Logger** used on recoverable anomalies (duplicate/missing ids; optional missing part shape), not silent catches.
- [ ] **`cd client && npm run lint`** passes for touched files.

### Design

**New file:** `client/src/composables/admin/useServiceAtomicPartRows.ts`

**Public API (sketch):**
- `useServiceAtomicPartRows(blockInstanceId: string)` with explicit return type, e.g. `UseServiceAtomicPartRowsReturn`.
- **Computed flags:** `isServiceBlockInstance` (true when entity is `blockInstance`, shape exists, `shape.type === 'service'`).
- **Computed rows:** `ServiceAtomicPartRow[]` — empty when not a service instance.

**Row DTO** (`client/src/types/admin/serviceAtomicPartRows.ts` or co-located type + export):
- `partInstance: PartInstanceEntity` (or pick fields) + `partShapeName: string` (resolved label; fallback empty string + `logger.debug` if shape missing).
- Document mapping to **convergence columns**: `name` (part instance `name`), `baseTime`, `baseFee`, `rateOverBaseTime`, `rateOverBaseFee`, `zeroOutPart`.

**Internals (pseudocode):**
1. `useGlobal`, `useRelationshipCrud('partAssignments')`, `useEntityCrud('partInstance')` — same as `usePartsTotals`.
2. Resolve `blockInstance` + `blockShape`; if missing or type !== `service` → empty rows.
3. `activeChildIdsForBlockParent(partAssignments, blockInstanceId)` → `resolvePartInstancesByChildIds` — same order as totals.
4. Optional: `hadDuplicates` / `missingIds` → `logger.warn` with same metadata shape as `usePartsTotals`.
5. Map each `PartInstanceEntity` to row + resolve part shape name.

**Out of scope for 20.3.2.1:** Vue components, `EntityCardContent`, mutations (handled in **20.3.2.2**).

---

## Task 20.3.2.2 (source: task-20.3.2.2-planning.md)

### Story

This task adds **ServiceAtomicEditor** (VCard + VDataTable) so admins see and edit **work items** (part instances) for **service** block instances **inside the same EntityCard** they already use. **20.3.2.1** supplies rows; this task wires **UI + `useEntityCrud('partInstance').update`** so convergence fields persist without new APIs.

---

### Analysis

- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side r… _(truncated)_

### Goal

Add **ServiceAtomicEditor.vue** (**VCard + VDataTable**) and mount it from **EntityCardContent** for **existing** **`blockInstance`** cards. Show **convergence** columns (**part shape**, **work item name**, **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart**) sourced from **`useServiceAtomicPartRows`**. **Persist** edits via **`useEntityCrud('partInstance').update`**. **Copy** uses **work items / convergence** language. **No** new server endpoints.

### Files

- **New:** `client/src/components/admin/generic/ServiceAtomicEditor.vue`
- **Modify:** `client/src/components/admin/generic/EntityCardContent.vue` (conditional import + mount)
- **Reuse:** `client/src/composables/admin/useServiceAtomicPartRows.ts`, `client/src/types/admin/serviceAtomicPartRows.ts`
- **Reference:** `PartInstanceBulkEditModal.vue`, `EntityCardFeePreview.vue`, `*TableDataGrid.vue` (VDataTable patterns)
- **PM / canon:** `session-20.3.2-guide.md`, `task-20.3.2.1-handoff.md`, `ARCHITECTURE.md` §8–9

### Approach

1. Implement **ServiceAtomicEditor** with thin script: composable for rows + **update** calls; template = VCard + VDataTable + slots.
2. Integrate at top of **EntityCardContent** body for **`blockInstance` && !isNew**.
3. **Lint + vue-tsc**; manual smoke: Instances → **service** block → table appears; **non-service** → no table; edit one number → reload reflects change.

### Checkpoint

- Table **only** when composable **`isServiceBlockInstance`** (and card is not new).
- At least one field **persists** through **`partInstance` update** and visible after global data refresh.

### Deliverables

- [ ] `ServiceAtomicEditor.vue` with convergence-oriented titles and documented column semantics (brief header comment).
- [ ] `EntityCardContent.vue` integration for `blockInstance` / `!isNew`.
- [ ] No new API routes; logger on failed updates.

### Acceptance Criteria

- [ ] **Service-only:** Non-service `blockInstance` cards show **no** atomic editor (composable gate).
- [ ] **New instance:** No editor when **`isNew`** (no stable part ledger UX until saved).
- [ ] **Columns** match **20.3.2.1** row fields + editable persistence for numeric/fee/time + **zeroOutPart**.
- [ ] **`cd client && npm run lint`** and **`npm run type-check`** pass.

### Design

**1. `ServiceAtomicEditor.vue` (new)**  
- **Props:** `blockInstanceId: string` (required when mounted).  
- **Behavior:** Call **`useServiceAtomicPartRows(blockInstanceId)`**. Render **nothing** unless **`isServiceBlockInstance`** (composable already enforces service shape).  
- **Layout:** **VCard** (variant tonal, class for spacing) → **VCardTitle** + **VCardText** with **VDataTable**  
  - **Title / subtitle copy:** convergence-oriented (e.g. “Work items” / “Per-part time and fee for this service”).  
  - **Table:** `items` = `rows`; `item-value` = `partInstance.id`; **dense** + **horizontal scroll** wrapper (`overflow-x-auto`) for narrow panels.  
  - **Columns:** Part shape (text), Work item name (editable or read-only — prefer editable **VTextField** density compact), **baseTime**, **rateOverBaseTime**, **baseFee**, **rateOverBaseFee**, **zeroOutPart** (**VCheckbox**).  
- **Save:** On blur or small “Apply” per row — prefer **debounced blur** or **explicit row save** to avoid N mutations per keystroke; minimal viable: **@update:model-value** with **throttle** or **save on blur** per cell. **Implementation choice:** **blur-to-save** per field to limit API chatter.  
- **Persistence:** `useEntityCrud('partInstance').update({ [field]: value }, partInstance.id)`; **createLogger** on failure; no empty catch.  
- **Loading/disabled:** optional `isSaving` ref during `update` promise.

**2. `EntityCardContent.vue`**  
- After **EventInstanceTemplateRef** (or top of stacked content), add:  
  `ServiceAtomicEditor` when **`entityKey === 'blockInstance' && !isNew`** with **`:block-instance-id="entity.id"`**.

**3. Out of scope**  
- Bulk apply across rows (use existing **PartInstanceBulkEditModal**).  
- **eventInstance** / placement UI (**20.3.1**).

---
