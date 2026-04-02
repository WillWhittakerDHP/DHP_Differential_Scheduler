<!-- harness-planning-rollup tier=session id=20.3.1 consolidatedAt=2026-04-02T19:31:58.421Z -->

# Consolidated planning: session 20.3.1

## Session 20.3.1 (parent)

## Story

**This session delivers** a dedicated **placement** editing experience on **event shape** admin surfaces and placement-forward copy **so that** configurators reason in **FEATURE_20** terms (placement → calendar ordering / scheduling semantics) without legacy differential-role-first labeling on **shape** templates.
**Estimated size:** M

---

## Analysis

- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
- **Boundaries:** **Client admin only** for this session; **no** server PartFinalizer or booking pipeline changes. **Shared** imports only where already used (`@shared/utils/eventPlacementUtils`, sanitizers).
- **Patterns:** Thin Vue components; composable for pairing logic if non-trivial; reuse `ENTITY_FIELD` / display config patterns; follow COMPONENT/COMPOSABLE playbooks.
- **Risks:** Over-building a new form system — prefer one focused component + map registration. Regression on `anchorEdge` null sentinel — preserve existing select resolution behavior.
- **Alternatives:** Leave generic text fields — **rejected** (fails §8.3 #1). Full EntityCard replacement — **out of scope** for 20.3.1 (later §8.3 items).

## Goal

Ship **PlacementTypeEditor** (or equivalent named component) for **eventShape** so admins set **placementKind** and **anchorEdge** with correct coupling (**primary** clears anchor), and refresh **shape-surface** copy so **placement** is primary; tighten **eventShapeDisplays** and the differential **override** matrix caption to **placement-forward** language where it describes template event shapes.

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.3, `.project-manager/ARCHITECTURE.md` §8–9
- **PM:** `sessions/session-20.3.1-guide.md`, `phases/phase-20.3-guide.md`
- **Implementation (primary):** `client/src/components/admin/generic/fields/` (new or extended editor), `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts` (if custom render), `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, optional small composable under `client/src/composables/admin/`

## Approach

1. **Task 20.3.1.1:** Implement grouped placement UI (kind + anchor) with disabled/null anchor for **primary**; integrate into event shape field rendering path without breaking save payload shape.
2. **Task 20.3.1.2:** Update display strings and **DifferentialEventRoleOverridesField** helper text / per-row caption to emphasize **placement** (and derived scheduling effect), not “differential role” as the lead concept on template rows.
3. Verify **Shapes → Event shapes** flow manually; run **client lint** + **vue-tsc** on touched paths; grep for user-visible “differential” on **event shape** templates and fix stragglers in scope.

## Checkpoint

- After **20.3.1.1:** Saving an event shape persists **placementKind** / **anchorEdge** consistent with server rules; UI blocks incoherent anchor when **primary**.
- After **20.3.1.2:** No task-level placeholder strings remain in session guide; copy review done for touched components.
- Before **session-end:** Phase **20.3** session checkbox for **20.3.1** ready to mark complete in `phase-20.3-guide.md`.

## Deliverables

- Registered **placement** editor (or equivalent) on **eventShape** admin edit path.
- Updated **`eventShapeDisplays.ts`** (and any related select labels) for clarity.
- **DifferentialEventRoleOverridesField** (and/or matrix helper) uses **placement-forward** explanations where it references template event shapes.
- Session **log** + **handoff** after `session-end`; optional **DOMAIN_REWRITE_WORKLOG** note if material.

---

## Task 20.3.1.1 (source: task-20.3.1.1-planning.md)

### Story

**This task changes** the **event shape** admin field pipeline **because** placement must be edited as one coupled concern (**placementKind** + **anchorEdge**) matching server rules, instead of two disconnected inputs.

---

### Analysis

- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
- **Boundaries:** **Client admin only** for this session; **no** … _(truncated)_

### Goal

Deliver a **grouped placement control** on **eventShape** EntityCard/edit flows: **placementKind** + **anchorEdge** with **primary ⇒ null anchor** and no duplicate **anchorEdge** row.

### Files

- `client/src/types/forms/fieldComponent.ts`
- `client/src/utils/forms/fieldComponentDispatcher.ts`
- `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts`
- `client/src/components/admin/generic/fields/EventShapePlacementFields.vue` (new)
- `client/src/composables/admin/useEntityCardFieldConfiguration.ts`
- Touch only if types require: `client/src/composables/admin/useFieldRendererComponent.ts` / `FieldRenderer.vue` (if map typing tight)

### Approach

1. Add `FieldComponent` variant + dispatcher branch + map entry + new Vue component (thin template, logic in small composable if > threshold).
2. Filter `anchorEdge` from `eventShape` `finalFieldKeys`.
3. Manual: Shapes tab → create/edit event shape → verify PATCH payload and UI for primary vs secondary.

### Checkpoint

- Saving **primary** shape sends **null**/`undefined` anchor per existing API expectations.
- Saving **non-primary** requires visible anchor; no duplicate anchor field.

### Deliverables

- Working **EventShapePlacementFields** (or **PlacementTypeEditor**) registered on **`placementKind`** for **`eventShape`**.
- **`anchorEdge`** excluded from standalone field list for **`eventShape`**.
- **Client lint** + **vue-tsc** clean on touched files.

### Acceptance Criteria

- [ ] Event shape card shows one grouped **Placement** control (kind + anchor), not two unrelated rows for kind and anchor.
- [ ] Choosing **primary** clears/disables **anchor**; choosing non-primary enables anchor (**start** / **end**).
- [ ] No regression: entity save still succeeds; transformer/sanitizer path unchanged aside from values set by UI.
- [ ] **20.3.1.2** copy work not required for this task to pass.

### Design

### New field component type
1. Extend `FieldComponent` with `{ type: 'eventShapePlacement'; reason: 'eventShapePlacement' }`.
2. In `getFieldComponent`: if `entityKey === 'eventShape'` and `fieldKey === 'placementKind'`, return `eventShapePlacement` (still require `fieldMetadataEntry` as today for display config).
3. Register in `createFieldRendererComponentMap()` → new Vue component, e.g. `EventShapePlacementFields.vue`.

### Hide standalone `anchorEdge`
4. In `useEntityCardFieldConfiguration`, when `entityKey === 'eventShape'`, compute `finalFieldKeys` that **excludes** `'anchorEdge'` so only the grouped control edits it.

### Component behavior (pseudocode)
```
onPlacementKindChange(kind):
  set placementKind = kind
  if kind === 'primary': set anchorEdge = null (and disable anchor UI)
  else: ensure anchorEdge is 'start' | 'end' (default 'start' if empty)

onAnchorEdgeChange(edge):
  set anchorEdge = edge
```
Use shared sanitizers when normalizing before emit if needed.

### Wiring
- Props: same as other field inputs — `field-context` for **placementKind** plus access to entity/form for **anchorEdge** (follow `SelectInputs.vue` / field context actions pattern; if insufficient, pass entity via existing inject from EntityCard — verify during implement).

### Out of scope for 20.3.1.1
- **`eventShapeDisplays.ts`** copy polish and **`DifferentialEventRoleOverridesField.vue`** → reserved for task **20.3.1.2**.

---

## Task 20.3.1.2 (source: task-20.3.1.2-planning.md)

### Story

**This task changes** admin **copy** on event-shape surfaces and the block-instance **scheduling overrides** matrix **because** Feature 20 makes **placement** the source of truth; user-visible text should not lead with “differential role” or pipe-delimited enums when a short placement sentence is clearer.

---

### Analysis

- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
- **Boundaries:** **Client admin only** for this session; **no** … _(truncated)_

### Goal

Refresh **placement-forward** admin copy: **`eventShapeDisplays`** placeholders and **`DifferentialEventRoleOverridesField`** (help text, empty state, **per-row caption**) so admins see **placement first** and **scheduling effect** second — not “Template: Major” as the lead. **20.3.1.1** (grouped placement UI) is **done**; this task is **copy + matrix row presentation** only.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5.1 / §8.3, `.project-manager/ARCHITECTURE.md` (admin / booking boundaries)
- **PM:** `sessions/session-20.3.1-guide.md`, `phases/phase-20.3-guide.md`
- **Implementation:** `client/src/utils/admin/differentialRoleMatrixRows.ts`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, optionally `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`

### Approach

1. Add **placement caption** (and optional scheduling label) to matrix row builder; unit-style pure formatting (no new composable unless logic exceeds ~15 lines — then `client/src/utils/admin/eventShapePlacementCaption.ts`).
2. Update **Vue** template + `defaultHelpText` + alert string.
3. Tighten **eventShapeDisplays** placeholders.
4. Optional **blockInstance** display override if types allow; else omit.
5. Lint, typecheck, quick grep for user-visible “Template:” / “differential role” in touched admin files.

### Checkpoint

- Captions read naturally on a real block instance with ≥2 active event shapes.
- No regression: override map still saves **DifferentialRole** keys/values unchanged.

### Deliverables

- Updated **`differentialRoleMatrixRows`** row shape + placement-first caption data.
- Updated **`DifferentialEventRoleOverridesField.vue`** strings and matrix secondary line.
- Updated **`eventShapeDisplays.ts`** placement/anchor placeholders.
- Client **lint** + **vue-tsc** clean on touched files.

### Acceptance Criteria

- [ ] Matrix row **secondary line** leads with **placement** (kind ± anchor), not raw scheduling enum; scheduling effect appears as a **following** clause (e.g. “Schedules as …”) using existing role labels.
- [ ] **Help paragraph** and **empty-state** alert in `DifferentialEventRoleOverridesField` do not use “differential role” as the opening concept.
- [ ] **`eventShapeDisplays`** `placementKind` / `anchorEdge` placeholders are prose-like, not only `a | b | c` pipes.
- [ ] **No behavior change** to override JSON shape or select values.
- [ ] **Lint + typecheck** pass for client on touched paths.

### Design

1. **`differentialRoleMatrixRows.ts`:** Extend `DifferentialRoleMatrixRow` with e.g. `placementCaption: string` built from `eventShape.placementKind` + `eventShape.anchorEdge` (human text: “Primary”, “Secondary · start”, “Floating · end”). Optionally `schedulingRoleLabel: string` from `DIFFERENTIAL_ROLE_LABELS[templateRole]` for a second clause.
2. **`DifferentialEventRoleOverridesField.vue`:** Replace `Template: {{ row.templateRole }}` with placement-first caption, e.g. **`{{ row.placementCaption }}`** and a muted second line **`Schedules as {{ scheduling label }}`** (exact wording locked at implement time — must not lead with “Differential role”).
3. **`defaultHelpText` + empty-state alert:** Rewrite to describe **placement templates** on each event shape and **per-instance override of scheduling behavior**, without “differential role” as the first noun. Keep “Inherit (use event shape template)” understandable — may shorten to “Inherit (use shape placement defaults)” if clearer.
4. **`eventShapeDisplays.ts`:** Replace pipe-style placeholders with short prose (e.g. primary vs secondary + anchor hint) so /admin-metadata-adjacent display hints match product language.
5. **`blockInstanceDisplays.ts` (optional):** If `GlobalFieldKey<'blockInstance'>` allows `differentialEventRoleOverrides`, add `label` + `tooltip` with placement-forward wording for the field title; if types block, skip and document under Gaps.
6. **Verification:** `cd client && npm run lint` && `npm run type-check`; manual: **Shapes → Event shapes** + **Instances → block** expanded field for overrides matrix.

---
