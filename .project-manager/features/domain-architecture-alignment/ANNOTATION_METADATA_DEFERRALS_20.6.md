# Annotation metadata & EntityCard — deferred to phase 20.6

**Scope change (2026-04):** Feature 20 now targets **full** admin metadata deprecation (**no** annotation exception). Items below that referred to “retain for annotations only” are **superseded** — see **`FEATURE_20_ARCHITECTURE_REDESIGN.md` §6.3a** and **`DOMAIN_REWRITE_WORKLOG.md` → `### Admin metadata retirement (Pass 5 narrative)`** for ordering.

**Purpose:** Traceability for task **20.3.5.1** (narrowing). This file lists work **not** done in 20.3.5.1, to be picked up under FEATURE_20 **§6.3a** and phase **20.6** (full deletion inventory).

## Completed in 20.3.5.1

- Explicit `annotationInstance` display config (`annotationInstanceDisplays.ts` + `fullFieldDisplayConfig`).
- Scoped copy in `AdminPrimitiveMetadataEditor` for `annotationShape` / `annotationInstance` modals (wizard annotations only).

## Deferred (20.6 / §6.3a — do not duplicate here as tasks)

- **EntityCard tree and composables:** Delete `EntityCard.vue`, `EntityCardContent.vue`, related subcomponents, and the 14 `useEntityCard*` composables once domain editors cover all call sites (see FEATURE_20 §6.3a path list).
- **Metadata pipeline (full stack):** Remove **all** metadata composables, types, utils, `AdminPrimitiveMetadataEditor`, `AnnotationContentEditor`, `useAdminMetadataMutations`, `usePrimitiveMetadataSave`, and related server models/routes per **§6.3a** after annotation domain editors replace reads/writes.
- **Client-side filtering** of `admin_primitive_metadata` keys — **moot** once tables drop; optional only as a **transitional** measure before cutover if product requires hiding without a migration.
- **Selectable display config** for `annotationInstance` / `annotationShape` in `selectableDisplayConfigPartsAndPlaceholders.ts` — still `{}`; prefer **domain editor** explicit fields over expanding shared display metadata.

## Reference

- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §6.3, §6.3a
- `sessions/task-20.3.5.1-planning.md`
- **`ENTITY_CARD_CONSUMERS_20.6.md`** — remaining `EntityCard.vue` import sites + façade note (task 20.3.5.2)
