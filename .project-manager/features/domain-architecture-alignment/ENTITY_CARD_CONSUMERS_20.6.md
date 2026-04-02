# EntityCard consumer inventory (phase 20.6)

**Purpose:** Remaining entry points that still mount or import **`EntityCard.vue`**, for FEATURE_20 **§6.3a** deletion planning. Last updated with task **20.3.5.2**.

## Façade note (20.3.5.2)

- **`AnnotationShapeListCard.vue`** wraps **`EntityCard`** with fixed `entity-key="annotationShape"`. The Shapes → Annotations **tab panel** no longer imports `EntityCard` directly; **removing** `EntityCard` from the bundle still requires replacing this façade with an inline domain editor (or shared extracted shell) in **20.6**.

## Direct imports of `EntityCard.vue` (client)

| Path | Role |
|------|------|
| `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue` | Event shape list rows |
| `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue` | Part shape list rows |
| `client/src/views/admin/tabs/components/ShapeCardList.vue` | Generic shape cards |
| `client/src/views/admin/tabs/components/BlockInstancesGroup.vue` | Block instance cards |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | New-shape create form |
| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | `defineAsyncComponent(() => import('../EntityCard.vue'))` |
| `client/src/components/admin/BulkEditModal.vue` | Bulk edit |
| `client/src/components/admin/BlockInstanceCreateModal.vue` | Create modal |
| `client/src/components/admin/generic/AnnotationShapeListCard.vue` | Annotation shape list façade (this task) |

## Internal tree (delete with `EntityCard.vue`)

Not separate “consumers” but coupled for §6.3a: `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`, and `useEntityCard*` composables listed in FEATURE_20 §6.3a.

## Reference

- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §6.3a
- `sessions/task-20.3.5.2-planning.md`
- `ANNOTATION_METADATA_DEFERRALS_20.6.md`
