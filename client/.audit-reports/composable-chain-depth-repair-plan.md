# Composable Chain Depth Repair Plan

Plan for reducing composable chain-depth violations by flattening dependency chains. Deep chains (depth > 2) hurt unit testability; batching repairs by shared root cause maximizes impact per change.

**Reference:** `client/.audit-reports/import-graph-audit.md`, `import-graph-audit.json` (section "Composable Chain Depth"). Threshold: **max depth 2** (config: `client/.audit-reports/import-graph-audit-config.json` → `thresholds.maxComposableChainDepth`).

---

## Current state (from latest audit run)

- **Violations (post–remaining repairs, after allowlist filtering):** 0 composables with chain depth > 2
- **By depth:** All composables at or under threshold (max depth 2).
- **Completed:** Wave 4 allowlists; remaining-repairs Batch 1 (merge useComponentEntityActions into useComponentEntity), Batch 2 (allowlist table models + useAppointmentLoader), Batch 3 (merge useFormFieldsContext into useFormFields), Batch 4 (allowlist useEntityCardFormSetup). Fixed pre-existing trailing comma in audit-global-config.json (composable-health section).

The full table (Composable | Depth | Longest Chain) is in `import-graph-audit.md`. Re-run the audit after each wave to refresh counts:

```bash
cd client && node .scripts/import-graph-audit.mjs
```

---

## Strategy overview

1. **Batch by shared chain first** — One refactor on a shared spine (e.g. entity CRUD, data collection, form/field context) can clear many violations at once.
2. **Then mop up depth-3 only** — Remaining violations that are exactly depth 3 get per-file or small-group refactors.
3. **Prefer extracting pure logic / thinning orchestrators** over allowlisting; use allowlist only when a composable is intentionally a thin coordinator and the team accepts the depth.

---

## Wave 1 — Entity CRUD chain (contained)

**Target:** Flatten or merge the middle of `useEntityCrud` → `useEntityCrudActions` → `useEntityCrudMutations` → `useEntityCrudMutationsCreate` → `useEntityCrudTypes` so that dependents see depth ≤ 2.

| Composable | Depth | Action |
| --- | ---: | --- |
| `client/src/composables/admin/useEntityCardSaveAndActions` | 6 | Will drop when entity CRUD chain is flattened. |
| `client/src/composables/admin/usePartInstanceCollection` | 6 | Same. |
| `client/src/composables/admin/useBlockInstanceForm` | 5 | Same. |
| `client/src/composables/admin/useCalibrationChart` | 5 | Same. |
| `client/src/composables/admin/useEntityCardActions` | 5 | Same. |
| `client/src/composables/admin/useEntityCardSubPanels` | 5 | Same. |
| `client/src/composables/admin/useInstanceBulkEdit` | 5 | Same. |
| `client/src/composables/admin/usePartInstanceBulkEdit` | 5 | Same. |
| `client/src/composables/admin/usePartInstanceForm` | 5 | Same. |
| `client/src/composables/admin/usePartsTotals` | 5 | Same. |
| `client/src/composables/admin/useShapeForm` | 5 | Same. |
| `client/src/composables/entityCrud/useEntityCrud` | 4 | Flatten here: extract pure helpers or merge 2–3 composables into one layer; keep public API where possible. |

**Action:** Extract pure helpers from the middle composables in `client/src/composables/entityCrud/` or merge 2–3 into a single layer; keep the same public API where possible.

**Verification:** Re-run `node client/.scripts/import-graph-audit.mjs` and confirm the above entries drop from composable chain depth violations.

---

## Wave 2 — Data collection chain (moderate)

**Target:** Flatten `useBusinessDataCollectionCrud` → `useBusinessDataCollectionActions` → `useDataCollectionActions` → types → `useCollectionTypes` (and the analogous global path: `useGlobalDataCollectionCrud` → `useGlobalDataCollectionActions` → …).

| Composable | Depth | Action |
| --- | ---: | --- |
| `client/src/composables/admin/tables/useAppointmentsTableModel` | 6 | Will drop when data collection chain is flattened. |
| `client/src/composables/admin/tables/usePropertiesTableModel` | 6 | Same. |
| `client/src/composables/admin/tables/useUsersTableModel` | 6 | Same. |
| `client/src/composables/booking/useAppointmentLoader` | 6 | Same. |
| `client/src/composables/useAppointment` | 5 | Same. |
| `client/src/composables/useProperty` | 5 | Same. |
| `client/src/composables/useUser` | 5 | Same. |
| `client/src/composables/businessDataCollections/useBusinessDataCollectionCrud` | 4 | Flatten here; extract shared logic or single "data collection core" composable. |
| `client/src/composables/globalDataCollections/useGlobalDataCollectionCrud` | 4 | Same (align with business path). |
| `client/src/composables/businessDataCollections/useBusinessDataCollectionActions` | 3 | Will drop when CRUD/actions layer is flattened. |
| `client/src/composables/globalDataCollections/useGlobalDataCollectionActions` | 3 | Same. |

**Action:** Extract shared logic into pure functions or a single "data collection core" composable; keep table/entity composables (useAppointment, useProperty, useUser, table models) as thin wrappers.

**Verification:** Same as Wave 1.

---

## Wave 3 — Form fields / field context chain (systemic)

**Target:** Reduce depth along useFormFields → useFormFieldsContext → useFieldContext → useFieldContextActions → useFieldContextState → useComponentEntity → useComponentEntityQuery → useGlobal.

| Composable | Depth | Action |
| --- | ---: | --- |
| `client/src/composables/formFields/useFormFields` | 7 | Will drop when form/field chain is flattened. |
| `client/src/composables/formFields/useFormFieldsContext` | 6 | Same. |
| `client/src/composables/fieldContext/useFieldContext` | 5 | Same. |
| `client/src/composables/fieldContext/useFieldContextActions` | 4 | Flatten here; consider merging with useFieldContextState or moving logic to pure functions. |
| `client/src/composables/fieldContext/useFieldContextState` | 3 | Will drop when upper layers are flattened. |

**Action:** Consider merging fieldContext + formFields layers or moving logic into pure functions / a single "field context core" composable.

**Verification:** Same as Wave 1.

---

## Wave 4 — Depth-3 only and other chains (contained)

**Target:** Remaining violations that are depth 3 (or depth 4 with a different chain). Per-file or small-group refactors; optionally allowlist thin orchestrators if justified.

| Composable | Depth | Chain / notes |
| --- | ---: | --- |
| `client/src/composables/admin/useEntityCardFormSetup` | 4 | useEntityCardFormSetup → useEntityCardComputed → useInstanceShape → useAdmin → useGlobal |
| `client/src/composables/admin/useEntityCardComputed` | 3 | useEntityCardComputed → useInstanceShape → useAdmin → useGlobal |
| `client/src/composables/admin/useBusinessRulesTab` | 3 | useBusinessRulesTab → useBusinessRuleForm → useBusinessRules → useAsyncOperation |
| `client/src/composables/admin/useEntityStatus` | 3 | useEntityStatus → useComponentEntity → useComponentEntityQuery → useGlobal |
| `client/src/composables/admin/useRelationshipCollection` | 3 | useRelationshipCollection → useRelationshipCollectionData → useAdmin → useGlobal |
| `client/src/composables/admin/useSelectFiltering` | 3 | useSelectFiltering → useComponentEntity → useComponentEntityQuery → useGlobal |
| `client/src/composables/booking/useAvailabilityOrchestrator` | 3 | useAvailabilityOrchestrator → useAppointmentSlots → useAppointmentShape → useAvailabilitySettings |
| `client/src/composables/booking/useDevPanelsAppointmentData` | 3 | useDevPanelsAppointmentData → useDevPanelsComputed → useBooking → useGlobal |
| `client/src/composables/booking/useInstanceComponents` | 3 | useInstanceComponents → useComponentEntity → useComponentEntityQuery → useGlobal |
| `client/src/composables/booking/useInstanceComponentsList` | 3 | useInstanceComponentsList → useComponentEntity → useComponentEntityQuery → useGlobal |
| `client/src/composables/booking/usePropertyDetailsLogic` | 3 | usePropertyDetailsLogic → useComponentEntity → useComponentEntityQuery → useGlobal |
| `client/src/composables/useComponentDistribution` | 3 | useComponentDistribution → useComponentEntity → useComponentEntityQuery → useGlobal |

**Action:** Per-file or small-group refactors: inline one composable, extract logic to a pure function, or accept as thin orchestrator and allowlist in `audit-global-config.json` (allowlists.import-graph) if justified.

**Verification:** Re-run audit; optionally tighten threshold to 1 later in `import-graph-audit-config.json` once waves 1–4 are done.

---

## Verification and config

- **After each wave:** Run `node client/.scripts/import-graph-audit.mjs` from the repo root (or `cd client && node .scripts/import-graph-audit.mjs`). Update this plan’s "Current state" and wave tables when counts change.
- **Threshold:** `client/.audit-reports/import-graph-audit-config.json` → `thresholds.maxComposableChainDepth` (default 2). Lower to 1 later to catch remaining shallow chains.
- **Allowlist:** If you keep a composable as an intentional thin orchestrator, add a specific allowlist entry under `audit-global-config.json` → `allowlists.import-graph` with a short reason (e.g. "Thin orchestrator; depth accepted").
