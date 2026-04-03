# EntityCard consumer inventory (phase 20.6)

**Scope change (2026-04):** **`EntityCard.vue`** (generic SFC name) is **removed** from the client. **`AdminEntityEditorPanel.vue`** is the shared shell until FEATURE_20 **§3.6** domain editors and **§6.3a** full inner-tree deletion land.

**Purpose:** Historical tracker for Pass 6 **§6.3a** work. **Last updated:** task **20.6.2.2**.

## Task 20.6.2.2 status

- **`EntityCard.vue`** — **deleted** (no file on disk).
- **`RelationshipCollection.vue`** imports **`AdminEntityEditorPanel`** directly (no async **`EntityCard`** chunk).
- **Remaining `EntityCard*` SFCs** (`EntityCardContent`, `EntityCardSubPanels`, etc.) and **`useEntityCard*`** composables — **still in use** by **`AdminEntityEditorPanel`**; **not** deleted in 20.6.2 (see FEATURE_20 **§6.3a** for the later full inventory).

## Client imports of `EntityCard.vue`

**None.** (Verify: `rg 'EntityCard\\.vue' client/src`.)

## Current shell

| Component | Role |
|-----------|------|
| `client/src/components/admin/generic/AdminEntityEditorPanel.vue` | Expansion + title + `EntityCardContent` + save/delete dialogs |

## Reference

- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §3.6, §6.3a, §8.6
- `ANNOTATION_METADATA_DEFERRALS_20.6.md`
