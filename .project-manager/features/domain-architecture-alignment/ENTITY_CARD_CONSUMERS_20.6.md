# EntityCard consumer inventory (phase 20.6)

**Scope change (2026-04):** **`EntityCard`** removal is part of the same Pass 6 cleanup as **full** admin metadata stack removal (see **`DOMAIN_REWRITE_WORKLOG.md` → `### Admin metadata retirement (Pass 5 narrative)`**). Façades must be replaced with **domain editors**, not preserved as a permanent metadata exception.

**Purpose:** Remaining entry points that still mount or import **`EntityCard.vue`**, for FEATURE_20 **§6.3a** deletion planning. **Last updated:** task **20.6.2.1** (partial).

## Task 20.6.2.1 status

- **`AdminEntityEditorPanel.vue`** holds the former **`EntityCard`** implementation (expansion shell + content + dialogs).
- **Tab/modal consumers** below now import **`AdminEntityEditorPanel.vue`**, not **`EntityCard.vue`**.
- **`EntityCard.vue`** is a **thin wrapper** around **`AdminEntityEditorPanel`** for **`RelationshipCollection`** async import until **20.6.2.2**.

## Façade note

- **`AnnotationShapeListCard.vue`** wraps **`AdminEntityEditorPanel`** with fixed `entity-key="annotationShape"` (no **`EntityCard`** import).

## Remaining imports of `EntityCard.vue` (client)

| Path | Role |
|------|------|
| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | `defineAsyncComponent(() => import('../EntityCard.vue'))` — **migrate in 20.6.2.2** |
| `client/src/components/admin/generic/EntityCard.vue` | Thin forwarder only (not a “consumer” in the product sense) |

## Migrated off `EntityCard.vue` (20.6.2.1)

| Path | Replacement |
|------|-------------|
| `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue` | `AdminEntityEditorPanel` |
| `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue` | `AdminEntityEditorPanel` |
| `client/src/views/admin/tabs/components/ShapeCardList.vue` | `AdminEntityEditorPanel` |
| `client/src/views/admin/tabs/components/BlockInstancesGroup.vue` | `AdminEntityEditorPanel` |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | `AdminEntityEditorPanel` |
| `client/src/components/admin/BulkEditModal.vue` | `AdminEntityEditorPanel` |
| `client/src/components/admin/BlockInstanceCreateModal.vue` | `AdminEntityEditorPanel` |
| `client/src/components/admin/generic/AnnotationShapeListCard.vue` | `AdminEntityEditorPanel` |

## Internal tree (delete with generic name in 20.6.2.2)

Coupled for §6.3a: `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`, **`AdminEntityEditorPanel.vue`** (or its successor shell), and `useEntityCard*` composables per FEATURE_20 §6.3a.

## Reference

- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §6.3a
- `sessions/task-20.3.5.2-planning.md`
- `ANNOTATION_METADATA_DEFERRALS_20.6.md`
