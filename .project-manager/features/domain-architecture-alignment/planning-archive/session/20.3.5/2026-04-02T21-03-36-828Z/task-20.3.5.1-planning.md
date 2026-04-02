# Plan: task 20.3.5.1 — Annotation metadata narrowing (FEATURE_20 §6.3)

## Contract
- **Tier:** task | **ID:** 20.3.5.1
- **Scope:** Narrow admin **presentation / display config** and **copy** for `annotationShape` and `annotationInstance` so Shapes-tab metadata modals clearly serve **annotation-only** field rendering (per FEATURE_20 §6.3). **Out of scope:** `EntityCard` replacement (task **20.3.5.2**), deleting metadata composables, or DB migrations.
- **Governance:** Governance Context (Task) — thin template changes; any new util stays in `client/src/utils/admin/` if logic grows.

## Work Profile
- **Execution intent:** implement (after `/accepted-code`)
- **Action type:** localized_change
- **Scope shape:** file_local
- **Gate profile:** fast

## Where we left off
- Session **20.3.5** started; decomposition lists **20.3.5.1** (this task) then **20.3.5.2** (EntityCard slice).

## Parent context (session 20.3.5)
- **20.3.5.1:** Audit/narrow field/metadata/config exposure for annotation shape/instance admin; defer heavy metadata deletion to **20.6** (§6.3a).
- **20.3.5.2:** Replace `EntityCard` in `ShapesTabAnnotationPanel` + debt doc.

## Story
**This task changes** display-field config and admin-metadata **UX copy** for annotations **because** FEATURE_20 §6.3 requires the metadata system to **shrink toward annotations-only** usage: today `annotationInstance` uses an **empty** display map in `fullFieldDisplayConfig`, which is inconsistent with other entities and makes annotation field presentation less explicit than it should be.

---

## Architecture context (harness-injected)

_(Abbreviated: see parent `session-20.3.5-planning.md` and `.project-manager/ARCHITECTURE.md` for full domain map.)_

---

## Codebase recon (agent-led — required)

- **Paths reviewed:**
  - `client/src/views/admin/tabs/ShapesTab.vue` — `MetadataEditModal` for global **Annotation Shape Fields** and **Annotation Instance Fields** (`annotationShapeFieldsEntity`, `annotationInstanceConfigEntity` from `useShapesTab`).
  - `client/src/composables/admin/useShapesTab.ts` — sentinel entities `ANNOTATION_SHAPE_GLOBAL_CONFIG_ID` / `ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID` for those modals.
  - `client/src/components/admin/MetadataEditModal.vue` → `AdminPrimitiveMetadataEditor.vue` — field list from `useEntityMetadata` → `resolveEntityFieldMetadataRecord` / metadata cache (`admin_primitive_metadata` shape).
  - `client/src/configs/field/display/fullFieldDisplayConfig.ts` — `annotationShape` uses `annotationShapeDisplays` + selectable merge; **`annotationInstance: {}`** (no per-field display labels in config).
  - `client/src/configs/field/display/appliedDisplay/annotationShapeDisplays.ts` — explicit keys: `id`, `name`, `orderIndex`, `active`, `uiSlot`.
  - `client/src/types/entities.ts` — `AnnotationInstanceEntity`: `type`, `text`, `contentRows`, plus `GlobalEntityBase` fields.
  - `client/src/configs/adminConfig.ts` — `annotationShape` / `annotationInstance` marked metadata-driven (`fields: undefined`).

- **Patterns / call sites:** Display configs feed **field labels/placeholders** in generic admin rendering; metadata modal lists **whatever keys exist** in cached metadata for that entity type — narrowing **display** config does not remove DB rows but aligns **client** presentation with annotation domain vocabulary.

- **Gaps / unknowns:** Exact set of **primitive row keys** in `admin_primitive_metadata` for `annotation_instance` / `annotation_shape` (server) — verify against DB or API responses if a field appears that should be hidden only in UI (prefer display/visibility metadata over client-side filtering unless product demands).

## Analysis

- **Problem:** Annotation **instance** fields lack a dedicated `*Displays.ts` map while **shape** already has one; global metadata modals use the same `AdminPrimitiveMetadataEditor` intro as other entities, which understates §6.3 “annotations-only” intent.
- **Boundaries:** **Client admin only**; no PartFinalizer / booking pipeline changes.
- **Risks:** Adding display keys that do not exist on the entity type can confuse TypeScript — use `as const` maps consistent with `GlobalFieldKey<'annotationInstance'>` where required, or `Partial` patterns used by sibling display files.
- **Alternatives considered:** (a) Filter metadata keys in `resolveEntityFieldMetadataRecord` for annotation types — **deferred** unless audit finds stray non-annotation keys in cache; (b) only copy change — **insufficient** vs session deliverable.

## Design

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

## Goal

Deliver **annotation metadata narrowing** for **20.3.5.1**: explicit **display** config for `annotationInstance`, **scoped copy** in the primitive metadata editor for annotation entity keys, and a **deferrals** note for **20.6** — without changing task **20.3.5.2** scope.

## Files

| Action | Path |
|--------|------|
| Add | `client/src/configs/field/display/appliedDisplay/annotationInstanceDisplays.ts` |
| Edit | `client/src/configs/field/display/fullFieldDisplayConfig.ts` |
| Edit | `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` |
| Add | `.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md` |

## Approach

1. Implement display map + wire `fullFieldDisplayConfig`.
2. Add annotation-scoped intro copy in `AdminPrimitiveMetadataEditor`.
3. Add deferrals markdown for 20.6.
4. Run `cd client && npm run lint && npm run type-check` (server lint if touched — **not expected**).

## Checkpoint

- **Before `/accepted-code`:** This planning doc complete; Design matches session **20.3.5.1** line in `session-20.3.5-planning.md`.
- **After implementation:** Shapes → Annotations → **Shape Fields** / **Instance Fields** modals still open and save; labels read sensibly for annotation instance fields.

## Deliverables

- [ ] `annotationInstanceDisplays` + `fullFieldDisplayConfig` wiring.
- [ ] Annotation-specific scope copy in `AdminPrimitiveMetadataEditor`.
- [ ] `ANNOTATION_METADATA_DEFERRALS_20.6.md` with deferred §6.3a / EntityCard / pipeline items.

## Acceptance Criteria

- [ ] **§6.3 alignment:** Annotation **instance** fields have explicit display config (no longer `{}`-only in `fullFieldDisplayConfig` for that entity).
- [ ] **UX:** Admins see clear copy that annotation metadata modals configure **wizard annotation** rendering, not generic scheduling entities.
- [ ] **Traceability:** Deferrals file lists what remains for **20.6** (no implementation of those items in this task).
- [ ] **Quality:** Client lint + vue-tsc clean.
- [ ] **Regression:** Metadata modals for annotation shape/instance still load and save (manual smoke).

## Definition of Done

- [ ] App starts (`npm run start:dev`) — spot-check if time
- [ ] `cd client && npm run lint` and `npm run type-check`
- [ ] Session guide / task checklist updated at **task-end**

---

## Reference

- Session: `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-planning.md`
- FEATURE_20: §6.3, §6.3a
- Phase guide: `phases/phase-20.3-guide.md`
- Playbooks: `COMPOSABLE_AUTHORING_PLAYBOOK.md`, `COMPONENT_AUTHORING_PLAYBOOK.md` (template-only edits)
