<!-- harness-planning-rollup tier=session id=20.3.4 consolidatedAt=2026-04-02T20:41:01.746Z -->

# Consolidated planning: session 20.3.4

## Session 20.3.4 (parent)

## Story

**This session delivers** an **event block instance–scoped** segment (event instance) manager **so that** admins configure **calendar segments where the orchestration lives** (on the event block instance card), not on a separate **Instances → Events** island — matching FEATURE_20 **§8.3 #4** and keeping **Shapes** structural-only.

**Estimated size:** M (UI relocation + shared CRUD wiring + tab cleanup)

---

## Analysis

- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
- **Domain boundaries:** **Admin / config** client; **reuse** existing `eventInstance` entity CRUD and relationship routes from Phase **20.2** — **no** new booking math, **no** PartFinalizer changes. Server validation already treats **`parentBlockInstanceId`** as required on create; client must align.
- **Patterns:** Thin **EntityCard** slices + composables; reuse **`EventInstanceBuilderBody`**, **`EventInstanceListItem`**, template variable warnings, and drag/order patterns from `useInstancesTabEventInstanceDrag` where possible rather than duplicating templates.
- **Risks:** Shrinking **`InstancesTabContext`** or removing the Events tab without a clear **empty state** may confuse admins — mitigate with copy + link to open the right block shape tab. Drag-and-drop refs (`eventInstancesContainer`) are tied to Instances tab today; **20.3.4.1** must re-bind or replace with a card-local container.
- **Alternatives considered:** (a) Keep global Events tab as read-only aggregate — **optional** fallback if product needs a bird’s-eye list; default per phase guide is **relocate**. (b) New server endpoints for “segments by block” — **rejected**; filter client global entities + existing relationships.

## Goal

Finish FEATURE_20 **§8.3 #4** on this branch: **embed** event-segment (**`eventInstance`**) management under **event-shaped block instance** cards and **remove or replace** the redundant **Instances tab → Events** workflow, while staying aligned with **20.2** APIs and **§9** (instances hold orchestration behavior; shapes stay structural).

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§8.3), `.project-manager/ARCHITECTURE.md` (§8–§10)
- **PM / harness:** `phases/phase-20.3-guide.md`, `sessions/session-20.3.3-handoff.md` (prior context)
- **Implementation (expected hotspots):** `client/src/views/admin/tabs/InstancesTab.vue`; `client/src/composables/admin/useInstancesTab.ts`; `client/src/views/admin/tabs/components/EventInstancesSection.vue`; `client/src/composables/admin/useInstancesTabEventInstance.ts`; `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts`; `client/src/components/admin/generic/EntityCardContent.vue`; new composable(s) under `client/src/composables/admin/`; optional new presentational component(s) under `client/src/components/admin/generic/`; `client/src/types/admin/adminInjectionKeys.ts` (only if context is refactored); `client/src/types/entities.ts` / transformers if field plumbing is missing for `parentBlockInstanceId` in create payloads

## Approach

1. **20.3.4.1 — Segment panel on event block instance card:** Resolve block shape type for the open card; when **`event`**, render a **Segments** sub-panel (list + create + delete + reorder) scoped to **`parentBlockInstanceId === entityId`**. Ensure **create** sends **`parentBlockInstanceId`** per `eventInstanceEntityValidation`. Extract shared logic from Instances-tab composables into reusable modules to avoid duplication.
2. **20.3.4.2 — Instances tab cleanup:** Remove or replace the **`Events (n)`** tab and `EventInstancesSection` mount with a short **guidance** surface (“Segments are edited on each event block instance”) or a **read-only** aggregate if we keep minimal visibility; delete dead context fields only after call sites are gone; run **regression** on Instances + Shapes tabs.
3. **Quality:** After each task: `cd client && npm run lint` + `npm run type-check`; manual smoke on one **event** block instance card and remaining Instances navigation.
4. **§9.1 drift:** Record checklist notes in **`session-20.3.4-log.md`** at **`/session-end`**.

## Checkpoint

- **After 20.3.4.1:** Editing an **event** block instance shows segment list; create/delete/order works; payloads include valid **`parentBlockInstanceId`**.
- **After 20.3.4.2:** Instances tab no longer duplicates full segment editor (per chosen UX); no broken imports; lint/type-check clean.
- **Before `/session-end 20.3.4`:** Session log + handoff updated; phase-20.3 guide **Segments** objective ready to check.

## Deliverables

- [ ] **Event block instance** UI: embedded **segment / `eventInstance`** manager (scoped by block instance id).
- [ ] **Client** create/update paths aligned with server **`parentBlockInstanceId`** rules (Phase **20.2** contract).
- [ ] **Instances tab** Events island removed, replaced, or reduced to non-duplicative UX (document which in task **20.3.4.2**).
- [ ] **§9.1** drift notes captured at session-end.
- [ ] Lint + vue-tsc clean; manual smoke documented.

## Acceptance Criteria

- [ ] **§8.3 #4:** Segment / **`eventInstance`** editing is available in **event block instance** context (not only the global Events tab).
- [ ] **API alignment:** Create/update flows respect server rules (**`parentBlockInstanceId`** on create; no ad-hoc endpoints contradicting Phase **20.2**).
- [ ] **Shapes remain structural:** No new shape-level editors for segment templates beyond existing **20.3.1** placement work; this session does not move validity definition onto instance cards.
- [ ] **No duplicate primary UX:** After **20.3.4.2**, admins are not required to use two full segment editors for the same operation (document if a **read-only** aggregate remains).
- [ ] **Quality:** Client **lint** + **type-check** pass; manual smoke on Instances + at least one **event** block instance card.

---

## Task 20.3.4.1 (source: task-20.3.4.1-planning.md)

### Story

**This task adds** a **Segments** panel on **event-shaped block instance** cards **because** FEATURE_20 **§8.3 #4** requires segment management next to the owning block instance; server validation already **requires `parentBlockInstanceId`** on `eventInstance` create (`eventInstanceEntityValidation.ts`), and the current Instances-tab create path does not send it — this task fixes the **card-scoped** path and establishes shared building blocks for **20.3.4.2**.

---

### Analysis

- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
- **Domain boundaries:** **Admin / config** client; **reuse** existing `event… _(truncated)_

### Goal

Deliver the **first half** of session **20.3.4**: an **event block instance–scoped** segment (**`eventInstance`**) panel with **valid `parentBlockInstanceId`** on create and **list / delete / reorder** parity with the current Instances-tab behavior — **without** removing the Instances **Events** tab yet (**20.3.4.2**).

### Files

- **Change / add:** `client/src/utils/admin/blockInstanceShape.ts` (or sibling) — expose **event** detection for block instance.
- **Add:** `client/src/composables/admin/useBlockInstanceEventSegments.ts` (and optionally `useBlockInstanceEventSegmentDrag.ts` if split keeps functions under complexity limits).
- **Add:** `client/src/components/admin/generic/EventBlockInstanceSegmentsPanel.vue`.
- **Change:** `client/src/components/admin/generic/EntityCardContent.vue` — mount panel + gate.
- **Maybe:** `client/src/utils/admin/eventInstanceSegmentDraft.ts` (pure helpers for default create payload) if shared with Instances tab in same or follow-up task.
- **Verify only:** `client/src/composables/entityCrud/*` create typing for `eventInstance` includes `parentBlockInstanceId`.

### Approach

1. Expose **event shape** flag from block instance + shape store helper.
2. Implement **`useBlockInstanceEventSegments`** (filter, CRUD, inline create state, logging on catch).
3. Add **panel component** reusing **`EventInstanceListItem`** / **`EventInstanceBuilderBody`** / expansion layout from **`EventInstancesSection`**.
4. Wire **drag** with **card-local** refs.
5. Mount from **`EntityCardContent`** for **event** instances only.
6. Run **`cd client && npm run lint`** and **`npm run type-check`**; manual smoke: open **event** block instance → create segment → reorder → delete.

### Checkpoint

- **This task:** Event block instance card shows segments; **create** succeeds with **parent** set; order updates persist; **Instances → Events** still works (unchanged).
- **Next task (20.3.4.2):** Remove or replace global Events editor.

### Deliverables

- [ ] **`EventBlockInstanceSegmentsPanel`** + composable(s) on **`EntityCardContent`** for **event** block instances (`!isNew`).
- [ ] **Create** payload includes **`parentBlockInstanceId`** aligned with server validation.
- [ ] **List / delete / reorder** for segments whose parent matches the card.
- [ ] Client **lint** + **type-check** clean.

### Acceptance Criteria

- [ ] Panel appears **only** for **event**-type block instances (not service/time/price/user).
- [ ] New segment **create** sends **`parentBlockInstanceId`** equal to the card’s block instance id.
- [ ] **Delete** and **drag reorder** update persisted order (same mechanism as Instances tab).
- [ ] **No** removal of **`EventInstancesSection`** / Instances **Events** tab in this task.
- [ ] **`cd client && npm run lint`** and **`npm run type-check`** pass.

### Design

1. **Detect event shape:** Extend **`getBlockInstanceShapeProperties`** (or add **`getBlockInstanceShapeType`**) to expose **`shapeType`** or **`isEvent: shape.type === BLOCK_SHAPE_TYPES.EVENT`** so `EntityCardContent` can gate the panel without duplicate store reads.
2. **Composable `useBlockInstanceEventSegments(parentBlockInstanceId)`** (explicit return type):
   - `useEntityCrud('eventInstance')` + `useEntityCrud('eventShape')` for shapes list.
   - `segmentsForParent = computed` filter `parentBlockInstanceId === parentBlockInstanceId`.
   - **Create:** `create({ ...fields, parentBlockInstanceId: parent })` — match entity CRUD payload shape (camelCase).
   - **Delete / reorder:** same as Instances tab (`remove`, `patchOrderIndex`).
   - **UI state:** `isCreating`, `newEventInstanceData`, `templateWarnings` — copy patterns from **`useInstancesTabEventInstance`**; optionally extract **`openDefaultNewEventSegmentDraft(eventShapes, parentId)`** to `utils/admin/` if it reduces duplication.
3. **Drag:** Instantiate **`useInstancesTabEventInstanceDrag`-style** logic **inside** the composable or a dedicated **`useBlockInstanceEventSegmentDrag`** that takes **`filteredEventInstances`** computed for **this parent only** and **local** container/panels refs; call **`mountEventInstancesDragAndDrop`** in **`onMounted` + nextTick** with those refs.
4. **Component `EventBlockInstanceSegmentsPanel.vue`:** `VCard` title “Calendar segments” (or “Event segments”); **Create** button; **`VExpansionPanels`** listing **`EventInstanceListItem`** + **new** panel using **`EventInstanceBuilderBody`**; wire emits/handlers to composable.
5. **`EntityCardContent.vue`:** `v-if="entityKey === 'blockInstance' && !isNew && isEventBlockInstance"` pass **`entityId`** as parent; do **not** remove Instances tab in this task.

**Pseudocode (mount):**
```vue
<EventBlockInstanceSegmentsPanel
  v-if="showEventSegments"
  :block-instance-id="entityId"
/>
```

---

## Task 20.3.4.2 (source: task-20.3.4.2-planning.md)

### Story

**This task removes** the redundant **Instances tab → Events** full segment editor and **slims** `useInstancesTab` / **`InstancesTabContext`** **because** **20.3.4.1** moved segment CRUD to **event block instance** cards; keeping two primary editors violates §8.3 #4 intent. **Global** `/admin-metadata` for **eventInstance** fields remains available from **Shapes** (duplicate modal on Instances tab is removed).

---

### Analysis

- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
- **Domain boundaries:** **Admin / config** client; **reuse** existing `event… _(truncated)_

### Goal

Complete session **20.3.4** cleanup: **remove** the **Instances** tab **Events** island and **deduplicate** global **eventInstance** metadata editing (single path: **Shapes** tab), after **20.3.4.1** delivers card-scoped segments.

### Files

- **Edit:** `client/src/views/admin/tabs/InstancesTab.vue`, `client/src/composables/admin/useInstancesTab.ts`, `client/src/types/admin/adminInjectionKeys.ts`, `client/src/types/admin/instancesTab.ts`, `client/src/types/admin/instancesTabEventInstance.ts` (trim unused exports)
- **Delete:** `client/src/views/admin/tabs/components/EventInstancesSection.vue`, `client/src/composables/admin/useEventInstancesSection.ts`, `client/src/composables/admin/useInstancesTabEventInstance.ts`, `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts`, `client/src/types/admin/instancesTabEventInstanceDrag.ts` (if unused)
- **Verify:** `grep` for **`EventInstancesSection`**, **`useEventInstancesSection`**, **`InstancesTabContext`** event keys

### Approach

1. Shrink **`InstancesTabContext`** + **`useInstancesTab`** + **`InstancesTab.vue`** per Design.
2. Delete obsolete components/composables/types.
3. `cd client && npm run lint` + `npm run type-check`.
4. Manual smoke: **Instances** tab (per-shape + calibration); **Shapes → Events → Instance Fields** modal still opens; **event** block instance card **segments** still work (**20.3.4.1**).

### Checkpoint

- Instances tab has **no** Events sub-tab and **no** duplicate **eventInstance** metadata modal.
- **Shapes** tab still exposes **Event Instance Fields (Global)**.
- **Lint/type-check** clean; no broken inject in **BlockInstancesGroup**.

### Deliverables

- [ ] Removed **Events** tab UI and related composable wiring from **`useInstancesTab`**.
- [ ] Trimmed **`InstancesTabContext`** + fixed **provide** object.
- [ ] Guidance **`VAlert`** on Instances tab.
- [ ] Deleted dead files (list above).
- [ ] Client **lint** + **type-check** pass.

### Acceptance Criteria

- [ ] **Instances** tab: no **Events (`n`)** tab; no **`EventInstancesSection`**.
- [ ] **`InstancesTabContext`** contains **no** event-segment CRUD or event modal state.
- [ ] **Shapes → Events** still opens **Event Instance Fields** global metadata modal.
- [ ] **Event** block instance cards still show **Calendar segments** panel (**20.3.4.1**).
- [ ] **`cd client && npm run lint`** and **`npm run type-check`** pass.

### Design

1. **`InstancesTab.vue`:** Remove **Events** `VTab`, **`VSpacer`** adjustment if needed (keep **Calibration** tab layout readable). Remove **`VWindowItem value="eventInstances"`**. Remove **`EventInstancesSection`** import. Simplify **empty BlockShapes** `VAlert` (drop `activeTab !== 'eventInstances'` branch). Remove **duplicate** bottom **`MetadataEditModal`** for **`eventInstance`** (lines ~158–163 pattern). Add **`VAlert`** (info, tonal, `class="mb-4"`) above **`VWindow`**: short copy + link-style text to **Shapes → Events** for global field metadata (plain text; no new router API).
2. **`useInstancesTab.ts`:** Delete **`useInstancesTabEventInstance`**, **`useInstancesTabEventInstanceDrag`**, **`useEntityCrud('eventInstance')`** / **`eventShapes`** wiring used only for Events tab; remove **`eventInstanceFieldsGlobalEntity`** computed; strip **`instancesTabContext`** down to fields **BlockInstancesGroup** still needs. Remove **`void eventInstancesContainer.value`** hack. Drop **`toGlobalEntityId`** import if unused after removal.
3. **`adminInjectionKeys.ts`:** **`InstancesTabContext`** — remove all **`event*`** / **`template*`** / **`openCreate*`** / **`handleEventInstance*`** / **`eventInstancesContainer`** properties; update comment (**BlockInstancesGroup** only). Remove **`NewEventInstanceData`** import if unused.
4. **`instancesTab.ts`:** Update **`UseInstancesTabReturn`** — remove **`filteredEventInstances`**, **`eventInstanceMetadataModalOpen`**, **`eventInstanceFieldsGlobalEntity`**.
5. **Delete dead modules:** `EventInstancesSection.vue`, `useEventInstancesSection.ts`, `useInstancesTabEventInstance.ts`, `useInstancesTabEventInstanceDrag.ts`; **`client/src/types/admin/instancesTabEventInstanceDrag.ts`** if nothing else imports it after deletes.
6. **`instancesTabEventInstance.ts`:** Keep **`NewEventInstanceData`** (still used by **`EventInstanceBuilderBody`**, **`useBlockInstanceEventSegments`**); remove **`UseInstancesTabEventInstanceParams`** if unused after deleting composable.
7. **Styles:** Remove **`.event-instances-tab`*** rules from **`InstancesTab.vue`** scoped CSS if obsolete.
8. **Audit config:** If **`audit-global-config.json`** references deleted paths, update allowlist rows only if CI fails (prefer minimal touch).

---
