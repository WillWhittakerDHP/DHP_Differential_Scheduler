<!-- harness-planning-rollup tier=session id=20.3.5 consolidatedAt=2026-04-02T21:03:36.828Z -->

# Consolidated planning: session 20.3.5

## Session 20.3.5 (parent)

## Story

**This session delivers** (1) tighter **annotation** metadata surfacing in admin configs/modals and (2) a **first** `EntityCard` replacement at a **single, high-confidence** call site **so that** the admin UI aligns with FEATURE_20 **§8.3** item **#5** and phase **20.6** has an explicit debt list — without deleting the shared `EntityCard` tree yet.
**Estimated size:** M (metadata audit + one replacement + documentation)

---

## Analysis

- **Why now:** Phase **20.3** sequence (§8.3) places annotation metadata narrowing and the start of EntityCard replacement **after** placement, service atomic, other domain editors, and segment relocation — those are done through **20.3.4**.
- **Domains:** Admin/config client only; **no** booking math or PartFinalizer changes. Annotations remain **wizard presentation** metadata (see ARCHITECTURE.md domain map).
- **Boundaries:** Do not remove the shared `EntityCard` component or composable tree in this session; one **call-site** replacement + **docs** for **20.6**.
- **Patterns:** Prefer extracting a **`AnnotationShape*` focused card** (or reusing subcomponents from `EntityCardContent` / field renderers) over forking generic metadata for all entities.
- **Risks:** Drag-and-drop ordering for annotation shapes must stay wired (`draggable-annotation-shape`, `useShapesTab` refs). Save/delete parity with current `EntityCard` events (`@saved`, `@delete`).
- **Alternatives considered:** (a) Replace `ShapeCreationForm` first — **rejected** for wave 1: multi-`entityKey` generic surface, lower confidence. (b) Replace `ShapesTabAnnotationPanel` loop only — **selected**: fixed entity type, clear boundary. (c) Metadata-only session with no UI card — **rejected**: §8.3 #5 asks for both narrowing **and** start of EntityCard replacement.

## Goal

Execute FEATURE_20 **§8.3 #5** on `feature/domain-architecture-alignment`: **narrow** annotation-related metadata exposure where the plan allows, **replace** the `EntityCard` usage in **`ShapesTabAnnotationPanel`** for existing **annotationShape** rows with a **focused** component, and **document** remaining `EntityCard` debt for **20.6** (path list or worklog section). Capture **§9.1** drift notes at session-end if UI copy or behavior touches instance three-property semantics.

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§6.3, §6.3a, §8.3), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §7, `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `sessions/session-20.3.5-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md` (or new `ENTITY_CARD_DEBT_20.6.md` under feature folder if preferred)
- **Implementation (likely):** `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue`, `client/src/composables/admin/useShapesTab.ts`, `client/src/components/admin/**` (new focused card), `client/src/configs/**` / `client/src/constants/entities.ts` / field metadata as needed for **20.3.5.1**

## Approach

1. **20.3.5.1:** Inventory configs / field metadata / modal wiring for `annotationShape` and `annotationInstance`; remove or hide **non-annotation** generic metadata that §6.3 says should not drive annotation editors; keep `AnnotationContentEditor` path intact.
2. **20.3.5.2:** Add a focused **annotation shape** card component; swap the `v-for` in `ShapesTabAnnotationPanel` from `EntityCard` to that component; preserve expansion, drag handle class, save/delete, and `@saved` / `@delete` behavior; run lint + type-check + manual Shapes → Annotations smoke.
3. **Documentation:** Add a concise **EntityCard remaining call sites** list (repo-relative paths) targeted for **20.6**, linked from worklog or feature guide.
4. **Testing:** Suspended — **lint**, **vue-tsc**, manual admin smoke only.

## Checkpoint

- **Before `/accepted-plan`:** Decomposition covers metadata narrowing + one EntityCard replacement + debt doc; recon paths recorded above.
- **Per task:** No regressions on annotation shape reordering or CRUD; no removal of `AnnotationContentEditor` from instance editing flows.
- **Session-end:** §9.1 drift note if applicable; phase-20.3-guide checkbox for **20.3.5** when session completes.

## Deliverables

- [ ] **Metadata:** Annotation shape/instance admin surfaces only show metadata intended for annotations per FEATURE_20 §6.3 (document any deferred items referencing **20.6**).
- [ ] **UI:** `ShapesTabAnnotationPanel` no longer uses `EntityCard` for **existing** `annotationShape` rows; behavior parity (expand, drag, save, delete).
- [ ] **Debt doc:** Remaining `EntityCard` import sites listed for **20.6** (markdown under `.project-manager/features/domain-architecture-alignment/` or append to `DOMAIN_REWRITE_WORKLOG.md`).
- [ ] **Quality:** `client` lint + type-check clean; manual smoke: Shapes → Annotations tab.

## Acceptance Criteria

- [ ] **§8.3 #5:** Annotation metadata narrowed per FEATURE_20 §6.3 where feasible; no accidental removal of annotation instance content editing (`AnnotationContentEditor` contract preserved where still used).
- [ ] **EntityCard wave:** At least one **high-confidence** replacement shipped — **`ShapesTabAnnotationPanel`** existing-row loop uses a **domain-focused** component, not `EntityCard`.
- [ ] **20.6 debt:** Written inventory of **remaining** `EntityCard` consumer paths for later deletion pass.
- [ ] **Architecture:** No new booking-resolution logic; admin/config client only; shapes vs instances semantics unchanged unless §9.1 drift explicitly documented.
- [ ] **Quality:** Client lint + vue-tsc clean; manual smoke on Shapes → Annotations.

---

## Task 20.3.5.1 (source: task-20.3.5.1-planning.md)

### Story

**This task changes** display-field config and admin-metadata **UX copy** for annotations **because** FEATURE_20 §6.3 requires the metadata system to **shrink toward annotations-only** usage: today `annotationInstance` uses an **empty** display map in `fullFieldDisplayConfig`, which is inconsistent with other entities and makes annotation field presentation less explicit than it should be.

---

### Analysis

- **Problem:** Annotation **instance** fields lack a dedicated `*Displays.ts` map while **shape** already has one; global metadata modals use the same `AdminPrimitiveMetadataEditor` intro as other entities, which understates §6.3 “annotations-only” intent.
- **Boundaries:** **Client admin only**; no PartFinalizer / booking pipeline changes.
- **Risks:** Adding display keys that do not exist on the entity type can confuse TypeScript — use `as const` maps consistent with `GlobalFieldKey<'annotationInstance'>` where required, or `Partial` patterns used by sibling display files.
- **Alternatives considered:** (a) Filter metadata keys in `resolveEntityFieldMetadataRecord` for annotation types — **deferred** unless audit finds stray non-annotation keys in cache; (b) only copy change — **insufficient** vs session deliverable.

### Goal

Deliver **annotation metadata narrowing** for **20.3.5.1**: explicit **display** config for `annotationInstance`, **scoped copy** in the primitive metadata editor for annotation entity keys, and a **deferrals** note for **20.6** — without changing task **20.3.5.2** scope.

### Files

| Action | Path |
|--------|------|
| Add | `client/src/configs/field/display/appliedDisplay/annotationInstanceDisplays.ts` |
| Edit | `client/src/configs/field/display/fullFieldDisplayConfig.ts` |
| Edit | `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` |
| Add | `.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md` |

### Approach

1. Implement display map + wire `fullFieldDisplayConfig`.
2. Add annotation-scoped intro copy in `AdminPrimitiveMetadataEditor`.
3. Add deferrals markdown for 20.6.
4. Run `cd client && npm run lint && npm run type-check` (server lint if touched — **not expected**).

### Checkpoint

- **Before `/accepted-code`:** This planning doc complete; Design matches session **20.3.5.1** line in `session-20.3.5-planning.md`.
- **After implementation:** Shapes → Annotations → **Shape Fields** / **Instance Fields** modals still open and save; labels read sensibly for annotation instance fields.

### Deliverables

- [ ] `annotationInstanceDisplays` + `fullFieldDisplayConfig` wiring.
- [ ] Annotation-specific scope copy in `AdminPrimitiveMetadataEditor`.
- [ ] `ANNOTATION_METADATA_DEFERRALS_20.6.md` with deferred §6.3a / EntityCard / pipeline items.

### Acceptance Criteria

- [ ] **§6.3 alignment:** Annotation **instance** fields have explicit display config (no longer `{}`-only in `fullFieldDisplayConfig` for that entity).
- [ ] **UX:** Admins see clear copy that annotation metadata modals configure **wizard annotation** rendering, not generic scheduling entities.
- [ ] **Traceability:** Deferrals file lists what remains for **20.6** (no implementation of those items in this task).
- [ ] **Quality:** Client lint + vue-tsc clean.
- [ ] **Regression:** Metadata modals for annotation shape/instance still load and save (manual smoke).

### Design

1. **Add** `client/src/configs/field/display/appliedDisplay/annotationInstanceDisplays.ts` with labels/placeholders for annotation-instance fields that appear in admin (`name`, `type`, `text`, `orderIndex`, `active`, and any other keys already present on `AnnotationInstanceEntity` / relationship refs used in forms — mirror style of `annotationShapeDisplays.ts` and hide internal keys with “This Field Should Be Hidden” where pattern matches siblings).
2. **Wire** `annotationInstance` in `fullFieldDisplayConfig.ts` through `buildAllPerEntityDisplayConfig('annotationInstance', annotationInstanceDisplays, selectableDisplayConfig.annotationInstance)` (selectable map stays `{}` unless we add valid selectable fields later).
3. **Copy / scope:** In `AdminPrimitiveMetadataEditor.vue`, extend the intro `<p>` with a **v-if** branch for `entityKey === 'annotationShape' || entityKey === 'annotationInstance'` stating these settings apply to **wizard annotation** field rendering only, consistent with FEATURE_20 §6.3 (keep wording short).
4. **Deferrals doc:** Add a short note file under `.project-manager/features/domain-architecture-alignment/` (e.g. `ANNOTATION_METADATA_DEFERRALS_20.6.md`) listing what **was not** done (e.g. full metadata pipeline deletion, `useAdminMetadataMutations` split, EntityCard tree) — **one screen** for phase **20.6** traceability.

**Pseudocode**

```
// annotationInstanceDisplays.ts
export const annotationInstanceDisplays = {
  id: hiddenPlaceholder,
  name: { label: DISPLAY_LABELS.NAME, ... },
  type: { label: 'Annotation shape', ... }, // FK to annotation shape
  text: { ... },
  orderIndex: hiddenPlaceholder,
  active: { ... ENTITY_STATUS ... },
} as const

// fullFieldDisplayConfig.ts
import { annotationInstanceDisplays } from './appliedDisplay/annotationInstanceDisplays'
annotationInstance: buildAllPerEntityDisplayConfig('annotationInstance', annotationInstanceDisplays, selectable.annotationInstance)

// AdminPrimitiveMetadataEditor.vue template
<p v-if="annotation entity keys">… annotations-only field rendering …</p>
```

---

## Task 20.3.5.2 (source: task-20.3.5.2-planning.md)

### Story

**This task changes** the Shapes → Annotations list **call site** to use **`AnnotationShapeListCard`** instead of **`EntityCard`** **because** FEATURE_20 §8.3 #5 starts the replacement sequence at the **smallest high-confidence** surface; a **typed façade** fixes `entityKey` to `annotationShape` and keeps behavior identical while making the admin tree ready for a future inline implementation without duplicating `EntityCard.vue` in this task.

---

### Analysis

- **Problem:** Session AC requires **`ShapesTabAnnotationPanel`** not to use **`EntityCard`** for existing rows; we still need **parity** (expansion, reorder grip, save, delete, global metadata form).
- **Boundaries:** Client admin only; do not change `AnnotationContentEditor` or instance-level annotation editing paths.
- **Risks:** `$attrs` (class, `data-drag-id`) must reach `EntityCard` root so drag mounting keeps working — wrapper uses **single root** `EntityCard` + `v-bind="$attrs"` (default `inheritAttrs: true`).
- **Alternatives considered:** (a) Copy full `EntityCard` script for `annotationShape` only — **rejected** (size + drift). (b) Generic `EntityCard` with no wrapper — **rejected** (fails AC).

### Goal

Deliver §8.3 **#5** slice **B:** **`ShapesTabAnnotationPanel`** uses **`AnnotationShapeListCard`** (not **`EntityCard`**) for existing annotation shape rows, and a **20.6 consumer inventory** exists under the feature folder.

### Files

| Action | Path |
|--------|------|
| Add | `client/src/components/admin/generic/AnnotationShapeListCard.vue` |
| Edit | `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue` |
| Add | `.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md` |
| Edit | `.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md` (link) |

### Approach

1. Implement façade + panel swap.
2. Write consumer inventory + one-line cross-link.
3. `cd client && npm run lint && npm run type-check`.
4. Manual smoke: Shapes → Annotations — expand row, edit field, save, delete, reorder drag.

### Checkpoint

- **Before `/accepted-code`:** Design locked; recon complete.
- **After implementation:** No `EntityCard` string in `ShapesTabAnnotationPanel.vue` template or imports.

### Deliverables

- [ ] `AnnotationShapeListCard.vue` + panel wired.
- [ ] `ENTITY_CARD_CONSUMERS_20.6.md` with consumer list + façade note.
- [ ] Link from annotation deferrals doc.

### Acceptance Criteria

- [ ] **`ShapesTabAnnotationPanel`** does not import or render **`EntityCard`** for existing rows.
- [ ] **Parity:** expansion, drag handle, `@saved`, `@delete`, `draggable-annotation-shape` / `data-drag-id` still work.
- [ ] **Debt doc** lists remaining EntityCard consumer entry points for 20.6.
- [ ] Client **lint** + **vue-tsc** clean.

### Design

1. **Add** `client/src/components/admin/generic/AnnotationShapeListCard.vue`
   - **Props:** `entity: GlobalEntity<'annotationShape'>`, `expanded: boolean`
   - **Emits:** `saved` (entity), `delete` (id string) — match `EntityCard`
   - **Template:** single child `<EntityCard entity-key="annotationShape" :entity="entity" :expanded="expanded" show-shape-list-drag-handle v-bind="$attrs" @saved="…" @delete="…" />`
   - **Script:** `defineOptions({ inheritAttrs: false })` **only if** we need attrs on EntityCard explicitly; prefer default pass-through to `EntityCard` single root.

   _Note:_ If `inheritAttrs: false` is required by tooling, forward `class` and `data-drag-id` explicitly via `v-bind="$attrs"`.

2. **Edit** `ShapesTabAnnotationPanel.vue` — replace `EntityCard` import with `AnnotationShapeListCard`; same props/events on the `v-for`.

3. **Add** `.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md` — table or bullet list of **remaining** files that still **import** or **async-import** `EntityCard.vue` for **user-visible** editing (exclude composables that only mention EntityCard in comments). Baseline list from recon:
   - `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue`
   - `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue`
   - `client/src/views/admin/tabs/components/ShapeCardList.vue`
   - `client/src/views/admin/tabs/components/BlockInstancesGroup.vue`
   - `client/src/views/admin/tabs/components/ShapeCreationForm.vue`
   - `client/src/components/admin/generic/collections/RelationshipCollection.vue`
   - `client/src/components/admin/BulkEditModal.vue`
   - `client/src/components/admin/BlockInstanceCreateModal.vue`
   - _(After this task: `AnnotationShapeListCard.vue` **wraps** `EntityCard` — note in doc that annotation list is **façade-only** until 20.6 inline removal.)_

4. **Cross-link** from `ANNOTATION_METADATA_DEFERRALS_20.6.md` to `ENTITY_CARD_CONSUMERS_20.6.md` (one line).

**Pseudocode**

```
// AnnotationShapeListCard.vue
props: { entity, expanded }
emit: saved, delete
<EntityCard entity-key="annotationShape" v-bind="$attrs" ... />

// ShapesTabAnnotationPanel.vue
- import EntityCard
+ import AnnotationShapeListCard
<AnnotationShapeListCard v-for="..." :entity="..." :expanded="..." class="draggable-annotation-shape" :data-drag-id="..." @saved @delete />
```

---
