# Plan: task 6.12.1.2 — Block shapes tab entity card expansion

## Contract
- **Tier:** task | **ID:** 6.12.1.2
- **Scope:** Admin **block shapes** tab — entity cards using `VExpansionPanels` / `VExpansionPanel` open and close reliably on header click (no stuck collapsed state, no double-click requirement).
- **Governance:** Clean — thin template changes preferred; expansion logic stays in `useEntityCardExpansion` or adjacent composable if extended.

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, component
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Task **6.12.1.1** complete (event shape invite link toggles). TierUp: `sessions/session-6.12.1-planning.md`. Optional handoff: `task-6.12.1.1-handoff.md`.

## Goal
Fix **block shapes** (and any shared path) so **expansion panels** on entity cards respond consistently to user interaction: clicking the panel title expands/collapses as expected, including when multiple panels are open (`multiple`), when list order changes (drag), and when `expanded` is driven by parent `Ref<string[]>` + `isPanelExpanded`. **Out of scope:** event shape toggles (**6.12.1.1** done), annotation content table (**6.12.1.3**), annotation delete 409 (**6.12.1.4**), UI slots (**6.12.2**).

## Files
- `client/src/views/admin/tabs/components/ShapeCardList.vue` — `VExpansionPanels` `v-model` ↔ `expanded` ref; `EntityCard` loop and `isPanelExpanded` wiring.
- `client/src/components/admin/generic/EntityCard.vue` — `VExpansionPanel` `:value`, `group:selected`, title slot `@click.stop` interactions.
- `client/src/composables/admin/useEntityCardExpansion.ts` — internal vs prop sync; watch when `expanded` is a non-ref boolean from parent.
- `client/src/composables/admin/useShapesTab.ts` (or tab view that hosts block shapes) — `expandedPanels` / `isPanelExpanded` for `blockShape` list if bug is in parent state.
- Types: `client/src/types/admin/entityCardExpansion.ts` only if return/options contract changes.

## Approach
1. **Reproduce** on admin Shapes tab → **Block shapes**: single click on card header should toggle; verify with multiple cards and after reorder if DnD applies.
2. **Trace data flow:** `ShapeCardList` `expandedModel` getter/setter vs `EntityCard` `expanded={isPanelExpanded(id)}` vs `VExpansionPanel` `:value="entity.id"` — ensure panel `value` type matches what `VExpansionPanels` v-model expects (string vs number).
3. **Fix minimally:** e.g. align `value`/`v-model` types; add `watch` on `props.expanded` when it is a plain boolean (composable currently only watches ref); avoid fighting Vuetify’s group selection — prefer single source of truth from parent `v-model` array.
4. **Verify:** block shapes and, if shared, event shapes / part shapes lists still expand; no new prop/emit surface unless required.

## Checkpoint
- [ ] Block shape cards expand/collapse on first click consistently.
- [ ] Multiple expanded panels behave correctly where `multiple` is used.
- [ ] Client lint / `vue-tsc` clean for touched files.

## How we build the tierDown to achieve them
- **Session 6.12.1:** Entity enhancements and annotation data layer
- **Task 6.12.1.1:** Event shape reschedule/cancel link toggles and invite builder
- **Task 6.12.1.2:** Block shapes tab entity card expansion fix
- **Task 6.12.1.3:** `annotation_instance_content` table, migration, and model/API alignment
- **Task 6.12.1.4:** Annotation shape delete — 409 when dependents exist

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.12.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.12.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
