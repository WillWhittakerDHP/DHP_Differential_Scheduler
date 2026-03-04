# Four deferred admin panel components (extraction list)

**Purpose:** Document the exact four admin panel components addressed per plan "Address 4 Deferred Admin Panel Components."

**Source:** Component-logic audit (Tier1 "requiring review") + component-health audit (P0/P1/P2 admin files). Run from client: `node .scripts/component-logic-audit.mjs`, `node .scripts/component-health-audit.mjs`.

## List

| # | Component | Audit signal | Extraction |
|---|-----------|--------------|------------|
| 1 | `client/src/views/admin/entities/BlockInstanceList.vue` | Tier1 async/await (inline remove wrapper) | `useBlockInstanceList.ts` – entityList config + remove wrapper |
| 2 | `client/src/views/admin/tabs/ShapesTab.vue` | P2 oversized-template; heavy script orchestration | `useShapesTab.ts` – orchestration (state, modals, creation, deletion, drag, tab labels, entity config) |
| 3 | `client/src/views/admin/tabs/components/EventInstancesSection.vue` | P1 score 4; oversized-template; complex expressions | `useEventInstancesSection.ts` – display computeds + toggle (thin script → composable) |
| 4 | `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue` | P2 oversized-template; many local handler functions | `useOverlapConstraintsPanel.ts` – handler functions + label/hint computeds |

## Status

- Identified and documented.
- Implemented: useBlockInstanceList, useShapesTab, useEventInstancesSection, useOverlapConstraintsPanel; SFCs thinned accordingly.
- Component-logic audit: admin Tier1 "requiring review" reduced from 1 (BlockInstanceList) to 0 for these four; overall audit now 2 files (booking only). Component-health unchanged (template-size findings remain where applicable).
