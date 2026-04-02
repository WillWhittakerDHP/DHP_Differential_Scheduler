# Annotation metadata & EntityCard — deferred to phase 20.6

**Purpose:** Traceability for task **20.3.5.1** (narrowing). This file lists work **not** done in 20.3.5.1, to be picked up under FEATURE_20 **§6.3a** and phase **20.6** (full deletion inventory).

## Completed in 20.3.5.1

- Explicit `annotationInstance` display config (`annotationInstanceDisplays.ts` + `fullFieldDisplayConfig`).
- Scoped copy in `AdminPrimitiveMetadataEditor` for `annotationShape` / `annotationInstance` modals (wizard annotations only).

## Deferred (20.6 / §6.3a — do not duplicate here as tasks)

- **EntityCard tree and composables:** Delete `EntityCard.vue`, `EntityCardContent.vue`, related subcomponents, and the 14 `useEntityCard*` composables once domain editors cover all call sites (see FEATURE_20 §6.3a path list).
- **Metadata pipeline shrink:** Remove non-annotation metadata composables and types per inventory; retain `AnnotationContentEditor`, `useAdminMetadataMutations` / `usePrimitiveMetadataSave` **for annotations only** (per plan).
- **Client-side filtering** of `admin_primitive_metadata` keys for annotation entity types if DB rows still include keys outside the annotation domain (only if product requires hiding without a migration).
- **Selectable display config** for `annotationInstance` / `annotationShape` in `selectableDisplayConfigPartsAndPlaceholders.ts` — still `{}`; expand only when relationship/select fields need shared display metadata.

## Reference

- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §6.3, §6.3a
- `sessions/task-20.3.5.1-planning.md`
- **`ENTITY_CARD_CONSUMERS_20.6.md`** — remaining `EntityCard.vue` import sites + façade note (task 20.3.5.2)
