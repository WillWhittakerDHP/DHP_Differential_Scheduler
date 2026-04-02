# Plan: task 20.3.5.2 — Annotation shape list card + EntityCard debt (§8.3 #5)

## Contract
- **Tier:** task | **ID:** 20.3.5.2
- **Scope:** Remove **direct** `EntityCard` usage from **`ShapesTabAnnotationPanel`** for existing `annotationShape` rows by introducing a **domain-named** list card; add a **repo-relative inventory** of remaining `EntityCard` consumers for phase **20.6**. **Out of scope:** Deleting `EntityCard.vue`, rewriting `RelationshipCollection`, or re-implementing the full composable stack without `EntityCard` (deferred to 20.6 / §6.3a).
- **Governance:** Thin SFC; explicit props/emits; no new booking logic.

## Work Profile
- **Execution intent:** implement (after `/accepted-code`)
- **Action type:** localized_change
- **Scope shape:** file_local
- **Gate profile:** fast

## Where we left off
- Task **20.3.5.1** complete: annotation instance displays, metadata editor copy, `ANNOTATION_METADATA_DEFERRALS_20.6.md`.

## Parent context (session 20.3.5)
- **20.3.5.2:** Focused component for annotation shape rows; drag + save/delete parity; **EntityCard debt** path list for 20.6.

## Story
**This task changes** the Shapes → Annotations list **call site** to use **`AnnotationShapeListCard`** instead of **`EntityCard`** **because** FEATURE_20 §8.3 #5 starts the replacement sequence at the **smallest high-confidence** surface; a **typed façade** fixes `entityKey` to `annotationShape` and keeps behavior identical while making the admin tree ready for a future inline implementation without duplicating `EntityCard.vue` in this task.

---

## Architecture context (harness-injected)

_(See `.project-manager/ARCHITECTURE.md` admin domain; no server or booking changes.)_

---

## Codebase recon (agent-led — required)

- **Paths reviewed:**
  - `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue` — `v-for` over `annotationShapesList` with `<EntityCard entity-key="annotationShape" … show-shape-list-drag-handle @saved @delete>`; wrapper `:class="draggable-annotation-shape"` and `:data-drag-id` for mount logic in `useShapesTab` / drag util.
  - `client/src/components/admin/generic/EntityCard.vue` — `useExpansionPanel` default `true`; shape-list drag handle when `showShapeListDragHandle`; emits `saved`, `delete`; merges `$attrs.class` onto inner `VExpansionPanel`.
  - `client/src/composables/admin/useShapesTab.ts` — `mountShapeListDragAndDrop` (or equivalent) for `annotationShapes` group — must keep same DOM hooks (`draggable-annotation-shape`, `data-drag-id`).
  - Peer pattern: `ShapesTabEventPanel.vue` still imports `EntityCard` directly (unchanged this task).

- **Patterns / call sites:** **Façade component** pattern: single-entity wrapper around `EntityCard` is acceptable for wave 1 — satisfies “panel does not reference `EntityCard`” and narrows public API to `GlobalEntity<'annotationShape'>`. Full extraction of `EntityCard` script into a composable shared by both is **out of scope** here.

- **Gaps / unknowns:** None for wrapper approach; if lint complains on `saved` payload type, use narrow emit typing consistent with `EntityCard` emits.

## Analysis

- **Problem:** Session AC requires **`ShapesTabAnnotationPanel`** not to use **`EntityCard`** for existing rows; we still need **parity** (expansion, reorder grip, save, delete, global metadata form).
- **Boundaries:** Client admin only; do not change `AnnotationContentEditor` or instance-level annotation editing paths.
- **Risks:** `$attrs` (class, `data-drag-id`) must reach `EntityCard` root so drag mounting keeps working — wrapper uses **single root** `EntityCard` + `v-bind="$attrs"` (default `inheritAttrs: true`).
- **Alternatives considered:** (a) Copy full `EntityCard` script for `annotationShape` only — **rejected** (size + drift). (b) Generic `EntityCard` with no wrapper — **rejected** (fails AC).

## Design

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

## Goal

Deliver §8.3 **#5** slice **B:** **`ShapesTabAnnotationPanel`** uses **`AnnotationShapeListCard`** (not **`EntityCard`**) for existing annotation shape rows, and a **20.6 consumer inventory** exists under the feature folder.

## Files

| Action | Path |
|--------|------|
| Add | `client/src/components/admin/generic/AnnotationShapeListCard.vue` |
| Edit | `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue` |
| Add | `.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md` |
| Edit | `.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md` (link) |

## Approach

1. Implement façade + panel swap.
2. Write consumer inventory + one-line cross-link.
3. `cd client && npm run lint && npm run type-check`.
4. Manual smoke: Shapes → Annotations — expand row, edit field, save, delete, reorder drag.

## Checkpoint

- **Before `/accepted-code`:** Design locked; recon complete.
- **After implementation:** No `EntityCard` string in `ShapesTabAnnotationPanel.vue` template or imports.

## Deliverables

- [ ] `AnnotationShapeListCard.vue` + panel wired.
- [ ] `ENTITY_CARD_CONSUMERS_20.6.md` with consumer list + façade note.
- [ ] Link from annotation deferrals doc.

## Acceptance Criteria

- [ ] **`ShapesTabAnnotationPanel`** does not import or render **`EntityCard`** for existing rows.
- [ ] **Parity:** expansion, drag handle, `@saved`, `@delete`, `draggable-annotation-shape` / `data-drag-id` still work.
- [ ] **Debt doc** lists remaining EntityCard consumer entry points for 20.6.
- [ ] Client **lint** + **vue-tsc** clean.

## Definition of Done

- [ ] `npm run start:dev` spot-check optional
- [ ] `cd client && npm run lint` and `npm run type-check`
- [ ] `/task-end 20.3.5.2` when complete

---

## Reference

- Session: `sessions/session-20.3.5-planning.md`
- FEATURE_20: §6.3, §6.3a, §8.3
- Phase: `phases/phase-20.3-guide.md`
- Prior task: `sessions/task-20.3.5.1-planning.md`
