<!-- harness-planning-rollup tier=session id=20.3.3 consolidatedAt=2026-04-02T20:22:09.191Z -->

# Consolidated planning: session 20.3.3

## Session 20.3.3 (parent)

## Story

**This session delivers** (1) **time** and **price** counterparts to the **service** convergence table pattern from **20.3.2**, and (2) clearer **event** block-instance admin copy and field framing aligned with **orchestrators as active assignment selectors** — **so that** §8.3 item **#3** is satisfied before **segment relocation (20.3.4)**.

**Estimated size:** M

---

## Analysis

- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment-island move (deferred to **20.3.4**).
- **Dependencies:** Reuse **`blockInstancePartsTotalsResolution`** + **`useEntityCrud('partInstance')`** patterns from **20.3.2**.
- **Risks:** Copy-heavy task (**20.3.3.2**) can sprawl — keep changes in **display metadata**, **tooltips**, or a **small** presentational component; avoid rewriting **RelationshipCollection** internals in this session.
- **Alternatives:** Single mega-composable for all shape types — **rejected** for readability; prefer **shared utility** + **thin per-type composable** or **parameterized** gate list if duplication is mechanical.

## Goal

Close **FEATURE_20 §8.3 #3** for this feature branch: deliver **time**- and **price**-shaped **block instance** part-ledger editors analogous to **ServiceAtomicEditor**, and improve **event** **block instance** admin **copy / field framing** for orchestration-related surfaces using **validity-constrained selection** language — **without** implementing **segment manager relocation** (session **20.3.4**).

## Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§3, §6, §8.3, §9.1), `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `phases/phase-20.3-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/views/admin/**`, `client/src/components/admin/**`, `client/src/composables/admin/**`, `client/src/configs/field/**`, `client/src/types/admin/**`, `client/src/types/entities.ts`, `client/src/utils/admin/**`, `client/src/utils/transformers/entityTransformers.ts`

## Approach

1. **Task 20.3.3.1:** Add **time** and **price** gated composables (or one parameterized composable) + **editor component(s)** mounted from **`EntityCardContent`** for **`blockInstance` && !isNew**, mirroring **ServiceAtomicEditor** (convergence / work-item copy adjusted per domain).
2. **Task 20.3.3.2:** **Event** `blockInstance` — targeted **label / description / display** updates (`blockInstanceDisplays`, optional small helper component) so **orchestrator** / **wizardVisible** / relationship UI reads as **choosing among shape-valid options**, not redefining structure.
3. Run **§9.1 drift checklist** at **session-end**; **lint + vue-tsc** per task; manual Instances-tab smoke for **time**, **price**, **event** shapes.

## Checkpoint

- **After 20.3.3.1:** **Time** and **price** service cards show editable part tables when shape type matches; **service** cards unchanged; **lint/type-check** clean.
- **After 20.3.3.2:** **Event** block instance cards show updated copy on agreed fields; no change to **eventShape** placement editor from **20.3.1**.
- **Before `/session-end 20.3.3`:** §9.1 checklist recorded in session notes; session log + handoff updated.

## Deliverables

- [ ] **Time** + **price** atomic / convergence part tables (composable + UI + **EntityCardContent** wiring).
- [ ] **Event** block-instance orchestration-related **admin copy** and display tweaks (scoped list in task plan).
- [ ] **§9.1** drift checklist completed in session log or handoff.
- [ ] No new server endpoints; PartFinalizer unchanged.

## Acceptance Criteria

- [ ] **Orchestration / atomic** language matches §8.3 acceptance: selectors, not validity definers, on touched surfaces.
- [ ] **Shapes** tab / shape editors remain **structural** — no instance-only business moved onto shape cards in this session.
- [ ] **Client** `npm run lint` and `npm run type-check` pass after tasks.
- [ ] Manual smoke: at least one **time**, one **price**, one **event** block instance card in admin shows expected new UX.

---

## Task 20.3.3.1 (source: task-20.3.3.1-planning.md)

### Story

This task adds **time**- and **price**-shaped **block instance** part ledgers in admin (**VCard + VDataTable**) by **generalizing** the **20.3.2** composable + editor pattern, **because** §8.3 #3 requires parity with **service** convergence UX without triplicating resolution, drafts, and **`partInstance` update** wiring.

---

### Analysis

- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment… _(truncated)_

### Goal

Deliver **time** and **price** **`blockInstance`** part-ledger editors (**VCard + VDataTable**, same **`partAssignments`** resolution and **`partInstance` update** behavior as **20.3.2**) by **generalizing** the existing service implementation; **service** UX remains correct after refactor.

### Files

- **New:** `client/src/composables/admin/useAtomicPartLedgerRows.ts` (or merge into existing module if preferred), `client/src/components/admin/generic/AtomicPartLedgerEditor.vue`, `client/src/components/admin/generic/TimePriceAtomicPartLedgerEditor.vue` (thin wrapper)
- **Modify:** `useServiceAtomicPartRows.ts`, `ServiceAtomicEditor.vue`, `EntityCardContent.vue`
- **Optional:** `client/src/types/admin/serviceAtomicPartRows.ts` — only if return type / interface names need a neutral **`AtomicPartLedger`** alias
- **Reference:** `blockInstancePartsTotalsResolution.ts`, `session-20.3.3-guide.md`

### Approach

1. Implement **`useAtomicPartLedgerRows`** + refactor **`useServiceAtomicPartRows`**; add **`useTimePriceAtomicPartRows`** (or inline allowed-types in wrapper only).
2. Extract table UI to **`AtomicPartLedgerEditor`**; slim **`ServiceAtomicEditor`**; add **time/price** wrapper + **`EntityCardContent`** mount.
3. **`cd client && npm run lint`** and **`npm run type-check`**; manual Instances tab: one **time** and one **price** shape show the new card; **service** card still shows **ServiceAtomicEditor** only.

### Checkpoint

- Refactor leaves **service** behavior unchanged (smoke).
- **Time** / **price** instances show the new editor; **event** / **user** instances show **neither** service nor time/price ledger cards.

### Deliverables

- [ ] Parameterized composable + **time/price** entry point.
- [ ] Shared **AtomicPartLedgerEditor** + **TimePrice** wrapper + **EntityCardContent** wiring.
- [ ] **Service** path still works; **lint** + **vue-tsc** clean.

### Acceptance Criteria

- [ ] **`blockShape.type === 'time'`** or **`'price'`** → time/price ledger visible (when `!isNew`); **`service`** → only service editor; other types → no atomic ledger from this task.
- [ ] Row order and **`partInstance`** persistence match **20.3.2** semantics (blur/checkbox patterns preserved).
- [ ] **`npm run lint`** and **`npm run type-check`** pass in **`client/`**.

### Design

**1. Composable layer**
- Add **`useAtomicPartLedgerRows(blockInstanceId, allowedShapeTypes)`** where **`allowedShapeTypes`** is **`readonly BlockShapeType[]`** (or **`MaybeRefOrGetter`** of same). **`matchesGate`** computed: block exists and **`blockShape.type`** is in the set. **`rows`**: same pipeline as today when gate true.
- Refactor **`useServiceAtomicPartRows`** to delegate to **`useAtomicPartLedgerRows(..., [BLOCK_SHAPE_TYPES.SERVICE])`** and expose **`isServiceBlockInstance`** (alias of gate) for backward compatibility.
- Add **`useTimePriceAtomicPartRows(blockInstanceId)`** delegating to **`[TIME, PRICE]`** with **`isTimeOrPriceBlockInstance`** (or reuse generic `matchesGate` name in component only).

**2. Component layer**
- Extract **`AtomicPartLedgerEditor.vue`** (or equivalent name): props **`blockInstanceId`**, **`allowedShapeTypes`**, **`title`**, **`subtitle`**; internal composable call + same table/draft/save logic as current **ServiceAtomicEditor**.
- **`ServiceAtomicEditor.vue`** becomes a **thin wrapper** passing **service** constants + convergence copy (existing strings), **or** re-exports the generic component with fixed props — prefer **wrapper** to avoid breaking imports.
- Add **`TimePriceAtomicPartLedgerEditor.vue`** (thin): **`[TIME, PRICE]`** + domain copy (e.g. duration/fee **inputs** / **per-instance ledger** language — not “service convergence”).

**3. Integration**
- **`EntityCardContent.vue`:** mount **`TimePriceAtomicPartLedgerEditor`** when **`blockInstance` && !isNew`** (alongside **`ServiceAtomicEditor`**; only one shows per card because gates are mutually exclusive by shape type).

**4. Types**
- Reuse **`ServiceAtomicPartRow`** / **`UseServiceAtomicPartRowsReturn`** or introduce **`UseAtomicPartLedgerRowsReturn`** with **`matchesGate: ComputedRef<boolean>`** — choose the smallest rename that keeps **`ServiceAtomicEditor`** typings clear.

---

## Task 20.3.3.2 (source: task-20.3.3.2-planning.md)

### Story

**This task changes** admin-facing **labels and tooltips** for **block instance** fields that express **orchestration** and **wizard visibility** (`orchestrator`, `wizardVisible`, and optionally **`composite`**) **because** FEATURE_20 §8.3 #3 calls for **parity** and **plain-language framing** on scheduling cards—especially **event** block instances—so admins understand they are **choosing among shape-valid options**, not redefining structure. **No** RelationshipCollection refactors and **no** segment relocation (20.3.4).

---

### Analysis

- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment… _(truncated)_

### Goal

For **block instance** admin cards (including **event**), provide **validity-constrained orchestration language** via **display metadata** for **`orchestrator`**, **`wizardVisible`**, and clarified **`composite`** help—**without** RelationshipCollection core refactors or **20.3.4** segment work.

### Files

- **Implementation:** `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` (primary)
- **Reference:** `client/src/types/entities.ts` (`BlockInstanceEntity` JSDoc), `client/src/configs/field/display/fullFieldDisplayConfig.ts`
- **Optional:** `client/src/components/admin/generic/EventBlockInstanceOrchestrationHint.vue` + `EntityCardContent.vue` (only if needed)

### Approach

1. Add **`orchestrator`** and **`wizardVisible`** display blocks with labels + tooltips; add **`tooltip`** on **`composite`**.
2. Run **`cd client && npm run lint`** and **`npm run type-check`**.
3. **Manual smoke:** open an **event** block instance in Admin Instances (and one non-event) and confirm labels/tooltips read clearly in the field chrome.

### Checkpoint

- **After 20.3.3.2:** Orchestration-related toggles on block instance cards show the new copy; **lint + vue-tsc** clean; no regressions to **20.3.1** event placement UI.

### Deliverables

- Updated **`blockInstanceDisplays.ts`** with **`orchestrator`**, **`wizardVisible`**, and enhanced **`composite`** metadata.
- Optional small component + mount **only** if smoke shows an event-only gap.

### Acceptance Criteria

- [ ] `blockInstanceDisplays` includes typed entries for **`orchestrator`** and **`wizardVisible`** (`satisfies` still holds).
- [ ] Tooltips state that choices respect **shape-valid** / **configured** relationships (no implication that toggles invent new structure).
- [ ] **`composite`** has a concise tooltip distinct from orchestrator semantics.
- [ ] Client **lint** and **type-check** pass.
- [ ] Manual check: at least one **event** block instance card shows updated strings.

### Design

1. **Extend** `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`:
   - **`orchestrator`:** Human label (e.g. “Assignment hub” or “Orchestrator”) + **tooltip**: marks this instance as the **selector** among downstream options **already allowed** on the block shape / relationships—not a free-form structural editor.
   - **`wizardVisible`:** Label + **tooltip**: controls whether this instance appears as a **main wizard-visible** line vs add-on style; clarify it does **not** change which relationships are valid.
   - **`composite`:** Add **`tooltip`** (keep label): same-shape composition vs orchestrator hub (one sentence, matches `BlockInstanceEntity` JSDoc spirit).
2. **Pseudocode (display entries):**
   ```ts
   orchestrator: { label: '…', placeholder: '', tooltip: '…', inline: true, stacked: false, width: 'auto', align: 'left' }
   wizardVisible: { label: '…', tooltip: '…', … }
   composite: { …existing…, tooltip: '…' }
   ```
3. **Optional (defer unless requested):** `EventBlockInstanceOrchestrationHint.vue` + mount in `EntityCardContent` when shape type is `event`—only if field tooltips are insufficient after smoke.

---
