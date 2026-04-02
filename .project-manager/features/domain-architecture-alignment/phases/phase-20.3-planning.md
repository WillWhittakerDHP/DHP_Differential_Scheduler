<!-- harness-planning-rollup tier=phase id=20.3 consolidatedAt=2026-04-02T21:07:16.992Z -->

# Consolidated planning: phase 20.3

## Phase 20.3 (parent)

## Story

**As an** admin configurator, **I want** domain-specific editors that respect instance-level orchestration and event placement (no differential-role UX), **so that** admin behavior matches **ARCHITECTURE** §8–§9 and the **20.2** API contracts without reintroducing legacy mental models.
**Estimated size:** L (multiple editor surfaces + EntityCard rollout start)

---

## Analysis

- **Problem / why now:** Phases **20.1–20.2** moved schema and APIs to **placement + instance three-property** semantics. Admin UI still mixes generic cards, legacy tabs, and differential-role **language** in places. Pass **§8.3** makes admin **reflect** the new model: shapes = structural validity; instances = orchestration selection + segments + placement types.
- **Domain boundaries:** Primarily **client admin** (`components/admin`, `composables/admin`, `views/admin`, `configs/field`). Touches **shared** only if new display enums or copy constants belong in `@shared`. **No** server-side PartFinalizer or booking totals. Server edits only for missing internal endpoints or bugs uncovered by UI (document in session if any).
- **Patterns to follow:** Thin components; composables with explicit return types; reuse `ENTITY_CONFIGS` / field display configs; governance playbooks (component, composable, type). Replacement-before-delete for EntityCard per §6.3.
- **Risks:** Over-scoping “rewrite all admin” — stay within §8.3 sequence. Regression risk on **Instances** and **Shapes** tabs; verify block-instance vs event-instance flows after relocation.
- **Alternatives:** Big-bang EntityCard removal — **rejected**; plan requires incremental high-confidence replacements first.

## Goal

Complete **FEATURE_20 §8.3 — Pass 3 (Admin UX alignment)** on branch `feature/domain-architecture-alignment`: orchestration editors use **validity-constrained selection** language; **shapes** UI stays **structural**; **event** editing centers on **segments**, **placement**, and **part-instance** assignments; begin **EntityCard** replacement with the smallest safe editors and annotation-metadata narrowing per plan §6.3.

## Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§3, §6, §8.3, §9.1), `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `phases/phase-20.3-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/views/admin/**`, `client/src/components/admin/**`, `client/src/composables/admin/**`, `client/src/configs/field/**`, `client/src/types/admin/**`, `client/src/types/entities.ts`, `client/src/utils/admin/**`, `client/src/utils/transformers/entityTransformers.ts`

## Approach

1. Follow FEATURE_20 **first execution sequence** §8.3 (Placement → service atomic → other domain editors → segment relocation → annotation / EntityCard start).
2. For each session: plan tasks under **`/session-start`**, keep **§9.1 drift checklist** in session notes, prefer **feature flag or incremental rollout** only if product requires it (default: ship behind existing admin routes).
3. **Copy and labels:** Replace user-facing **differential-role** explanations with **placement / segment** language where §8.3 applies; keep internal `differentialRoleUtils` usage only where it is derived from placement (document in task if confusing).
4. **Testing:** Suspended project-wide — rely on **lint**, **typecheck**, and **manual admin smoke** per Definition of Done.
5. After phase-end: update **phase-20.3-guide** checkboxes, **phase log**, **handoff** for **20.4** (booking pipeline).

## Checkpoint

- **Before `/accepted-plan`:** Phase **20.2** is complete and pushed; this plan’s **Decomposition** matches §8.3 order.
- **Per session:** §9.1 drift checklist; no new server booking calculator; shapes vs instances separation preserved in UI.
- **Before `/phase-end 20.3`:** All sessions **20.3.x** closed; guide objectives checked; handoff lists **20.4** context.

## Deliverables

- **Placement-focused editor(s)** for event **shapes** (`placementKind` / `anchorEdge`) meeting §8.3 item 1 (named or equivalent to **PlacementTypeEditor**).
- **Service atomic convergence editor** (§8.3 item 2) for service-instance orchestration UX.
- **Remaining domain editors** (§8.3 item 3) for instance-level orchestration where product requires, using validity-constrained selection.
- **Segment manager** UX relocated into **event block-instance** editing context (§8.3 item 4); reduced reliance on standalone “events” island where replaced.
- **Annotation-only metadata narrowing** and **first EntityCard replacement** slice (§8.3 item 5 + §6.3 rollout discipline).
- Updated **phase-20.3-guide**, **phase-20.3-log**, **phase-20.3-handoff**; **DOMAIN_REWRITE_WORKLOG** checkpoint when material.

## Acceptance Criteria

- [ ] Orchestration UI copy and controls reflect **validity-constrained selection** (orchestrator selects among **valid** downstream instances, does not redefine structure).
- [ ] **Shapes** tab / event **shape** flows remain **structural** (valid relationships, templates); instance three-property flags edited in **instance** contexts, not on shapes.
- [ ] **Event** admin flows emphasize **segments** (event instances), **placement types**, and **part-instance** ties per §8.3 acceptance checks.
- [ ] At least one **EntityCard** call site replaced or narrowed per §6.3 “smallest high-confidence first,” or documented deferral with reason in phase log.
- [ ] Client + server **lint** clean; app starts; no new `@audit-allow` without justification.

---

## Session 20.3.1 (source: session-20.3.1-planning.md)

### Story

**This session delivers** a dedicated **placement** editing experience on **event shape** admin surfaces and placement-forward copy **so that** configurators reason in **FEATURE_20** terms (placement → calendar ordering / scheduling semantics) without legacy differential-role-first labeling on **shape** templates.
**Estimated size:** M

---

### Analysis

- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
- **Boundaries:** **Client admin only** for this session; **no** server PartFinalizer or booking pipeline changes. **Shared** imports only where already used (`@shared/utils/eventPlacementUtils`, sanitizers).
- **Patterns:** Thin Vue components; composable for pairing logic if non-trivial; reuse `ENTITY_FIELD` / display config patterns; follow COMPONENT/COMPOSABLE playbooks.
- **Risks:** Over-building a new form system — prefer one focused component + map registration. Regression on `anchorEdge` null sentinel — preserve existing select resolution behavior.
- **Alternatives:** Leave generic text fields — **rejected** (fails §8.3 #1). Full EntityCard replacement — **out of scope** for 20.3.1 (later §8.3 items).

### Goal

Ship **PlacementTypeEditor** (or equivalent named component) for **eventShape** so admins set **placementKind** and **anchorEdge** with correct coupling (**primary** clears anchor), and refresh **shape-surface** copy so **placement** is primary; tighten **eventShapeDisplays** and the differential **override** matrix caption to **placement-forward** language where it describes template event shapes.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.3, `.project-manager/ARCHITECTURE.md` §8–9
- **PM:** `sessions/session-20.3.1-guide.md`, `phases/phase-20.3-guide.md`
- **Implementation (primary):** `client/src/components/admin/generic/fields/` (new or extended editor), `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts` (if custom render), `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, optional small composable under `client/src/composables/admin/`

### Approach

1. **Task 20.3.1.1:** Implement grouped placement UI (kind + anchor) with disabled/null anchor for **primary**; integrate into event shape field rendering path without breaking save payload shape.
2. **Task 20.3.1.2:** Update display strings and **DifferentialEventRoleOverridesField** helper text / per-row caption to emphasize **placement** (and derived scheduling effect), not “differential role” as the lead concept on template rows.
3. Verify **Shapes → Event shapes** flow manually; run **client lint** + **vue-tsc** on touched paths; grep for user-visible “differential” on **event shape** templates and fix stragglers in scope.

### Checkpoint

- After **20.3.1.1:** Saving an event shape persists **placementKind** / **anchorEdge** consistent with server rules; UI blocks incoherent anchor when **primary**.
- After **20.3.1.2:** No task-level placeholder strings remain in session guide; copy review done for touched components.
- Before **session-end:** Phase **20.3** session checkbox for **20.3.1** ready to mark complete in `phase-20.3-guide.md`.

### Deliverables

- Registered **placement** editor (or equivalent) on **eventShape** admin edit path.
- Updated **`eventShapeDisplays.ts`** (and any related select labels) for clarity.
- **DifferentialEventRoleOverridesField** (and/or matrix helper) uses **placement-forward** explanations where it references template event shapes.
- Session **log** + **handoff** after `session-end`; optional **DOMAIN_REWRITE_WORKLOG** note if material.

---

---

## Session 20.3.2 (source: session-20.3.2-planning.md)

### Story

**This session delivers** a **service block-instance atomic / convergence editor** (VCard + tabular part rows) **so that** admins see and edit **all work-item part instances** for a service in one place—matching FEATURE_20 **§3.6** / **§8.3** item 2 and proving the **inline part-row** pattern before time/price/event atomic editors.
**Estimated size:** M

---

### Analysis

- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side resolution. **Shapes** tab stays structural; this editor lives on **Instances** for **service** `blockInstance` only. **Orchestrator / composite / wizardVisible** stay on the existing EntityCard fields—only add the **atomic parts** table (or explicitly defer three-property toggles if already sufficient in metadata).
- **Grounding:** Reuse **`usePartsTotals` / `blockInstancePartsTotalsResolution`** lineage—same part rows the fee preview uses—so admin and booking share one notion of “parts under this block.”
- **Child-tier patterns:** Thin **ServiceAtomicEditor.vue**; composable for row resolution + optional save orchestration; explicit return types; logger on catch per project rules.
- **Risks:** Wide table on mobile—use **horizontal scroll** + compact density. Accidental edits—confirm save path matches **partInstance** entity mutations. **Mitigation:** start with read-only columns if wiring is unclear, then enable edits in 20.3.2.2.
- **Alternatives:** Only link to **PartInstanceList** — **rejected** (fails §3.6 convergence goal). Full **EntityCard** replacement — **out of scope** for this session (additive panel first).

### Goal

Ship **ServiceAtomicEditor** for **service** `blockInstance`: a **VCard + VDataTable** (or equivalent) listing **all part instances** under the instance (via `partAssignments`), showing **convergence-relevant** columns (at minimum **name**, **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart**; extend with per-unit columns if already on `PartInstanceEntity`). **User-facing copy** describes **work items / convergence**, not generic “rows.” **Session 20.3.1** placement work is **not** repeated here.

### Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §4 / §7; `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §3.6, §8.3, §9.1 drift checklist; `.project-manager/ARCHITECTURE.md` §8–9
- **PM:** `sessions/session-20.3.2-guide.md`, `phases/phase-20.3-guide.md`, `sessions/session-20.3.1-handoff.md`
- **Implementation (primary):** `client/src/utils/admin/blockInstancePartsTotalsResolution.ts` (reuse/extend), `client/src/composables/admin/` (new composable, e.g. `useServiceAtomicPartRows.ts`), `client/src/components/admin/generic/ServiceAtomicEditor.vue` (new), `client/src/components/admin/generic/EntityCardContent.vue` (conditional mount for service instances), optional `client/src/components/admin/generic/EntityCard.vue` props pass-through; reference `PartInstanceBulkEditModal.vue` for field semantics

### Approach

1. **Task 20.3.2.1:** Implement **composable** (and small pure helpers if needed) that returns **typed rows** for a **service** block instance’s part instances + **part shape** labels; gate on `blockShape.type === 'service'`; no UI beyond dev-only smoke optional.
2. **Task 20.3.2.2:** Add **ServiceAtomicEditor** UI: Vuetify **VDataTable** (or VTable) inside **VCard**; wire **save** to existing **partInstance** update path; insert into **EntityCardContent** above sub-panels or below fee preview per layout review; **lint + vue-tsc**; manual: Instances → **service** block → table matches parts under card.
3. Run **§9.1 drift checklist** in session notes before **session-end**.

### Checkpoint

- **After 20.3.2.1:** Composable returns stable row DTO for at least one real service instance in dev data; unit clarity documented in file header.
- **After 20.3.2.2:** Table visible only for **service** instances; editing one scalar persists and reloads from store; no new server endpoints.
- **Before session-end:** Phase objective **“Service atomic”** in `phase-20.3-guide.md` ready to check when product agrees.

### Deliverables

- Composable (or approved extension) resolving **service atomic** part rows from **`partAssignments` + `partInstance`** store.
- **ServiceAtomicEditor.vue** integrated into **block instance** card for **`blockShape.type === 'service'`**.
- Placement-forward / convergence-oriented **labels** (card title, column headers, empty state).
- Client **lint** + **typecheck** clean on touched paths.

### Acceptance Criteria

- [ ] **Service-only:** Editor does not mount for non-service block instances.
- [ ] **Row completeness:** Table lists the same part instances as **`usePartsTotals`** / resolution helpers for that parent (no orphan rows).
- [ ] **Columns:** At least **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart** surfaced (read or read/write per task 2 outcome).
- [ ] **Principles §4.8:** **Zeroed-out** parts remain visible in admin (no filter that hides `zeroOutPart` in this view).
- [ ] **No server booking math** added; **no** shape-level validity editing on this surface.
- [ ] **Lint + vue-tsc** pass for touched client files.

---

---

## Session 20.3.3 (source: session-20.3.3-planning.md)

### Story

**This session delivers** (1) **time** and **price** counterparts to the **service** convergence table pattern from **20.3.2**, and (2) clearer **event** block-instance admin copy and field framing aligned with **orchestrators as active assignment selectors** — **so that** §8.3 item **#3** is satisfied before **segment relocation (20.3.4)**.

**Estimated size:** M

---

### Analysis

- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment-island move (deferred to **20.3.4**).
- **Dependencies:** Reuse **`blockInstancePartsTotalsResolution`** + **`useEntityCrud('partInstance')`** patterns from **20.3.2**.
- **Risks:** Copy-heavy task (**20.3.3.2**) can sprawl — keep changes in **display metadata**, **tooltips**, or a **small** presentational component; avoid rewriting **RelationshipCollection** internals in this session.
- **Alternatives:** Single mega-composable for all shape types — **rejected** for readability; prefer **shared utility** + **thin per-type composable** or **parameterized** gate list if duplication is mechanical.

### Goal

Close **FEATURE_20 §8.3 #3** for this feature branch: deliver **time**- and **price**-shaped **block instance** part-ledger editors analogous to **ServiceAtomicEditor**, and improve **event** **block instance** admin **copy / field framing** for orchestration-related surfaces using **validity-constrained selection** language — **without** implementing **segment manager relocation** (session **20.3.4**).

### Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§3, §6, §8.3, §9.1), `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `phases/phase-20.3-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/views/admin/**`, `client/src/components/admin/**`, `client/src/composables/admin/**`, `client/src/configs/field/**`, `client/src/types/admin/**`, `client/src/types/entities.ts`, `client/src/utils/admin/**`, `client/src/utils/transformers/entityTransformers.ts`

### Approach

1. **Task 20.3.3.1:** Add **time** and **price** gated composables (or one parameterized composable) + **editor component(s)** mounted from **`EntityCardContent`** for **`blockInstance` && !isNew**, mirroring **ServiceAtomicEditor** (convergence / work-item copy adjusted per domain).
2. **Task 20.3.3.2:** **Event** `blockInstance` — targeted **label / description / display** updates (`blockInstanceDisplays`, optional small helper component) so **orchestrator** / **wizardVisible** / relationship UI reads as **choosing among shape-valid options**, not redefining structure.
3. Run **§9.1 drift checklist** at **session-end**; **lint + vue-tsc** per task; manual Instances-tab smoke for **time**, **price**, **event** shapes.

### Checkpoint

- **After 20.3.3.1:** **Time** and **price** service cards show editable part tables when shape type matches; **service** cards unchanged; **lint/type-check** clean.
- **After 20.3.3.2:** **Event** block instance cards show updated copy on agreed fields; no change to **eventShape** placement editor from **20.3.1**.
- **Before `/session-end 20.3.3`:** §9.1 checklist recorded in session notes; session log + handoff updated.

### Deliverables

- [ ] **Time** + **price** atomic / convergence part tables (composable + UI + **EntityCardContent** wiring).
- [ ] **Event** block-instance orchestration-related **admin copy** and display tweaks (scoped list in task plan).
- [ ] **§9.1** drift checklist completed in session log or handoff.
- [ ] No new server endpoints; PartFinalizer unchanged.

### Acceptance Criteria

- [ ] **Orchestration / atomic** language matches §8.3 acceptance: selectors, not validity definers, on touched surfaces.
- [ ] **Shapes** tab / shape editors remain **structural** — no instance-only business moved onto shape cards in this session.
- [ ] **Client** `npm run lint` and `npm run type-check` pass after tasks.
- [ ] Manual smoke: at least one **time**, one **price**, one **event** block instance card in admin shows expected new UX.

---

---

## Session 20.3.4 (source: session-20.3.4-planning.md)

### Story

**This session delivers** an **event block instance–scoped** segment (event instance) manager **so that** admins configure **calendar segments where the orchestration lives** (on the event block instance card), not on a separate **Instances → Events** island — matching FEATURE_20 **§8.3 #4** and keeping **Shapes** structural-only.

**Estimated size:** M (UI relocation + shared CRUD wiring + tab cleanup)

---

### Analysis

- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
- **Domain boundaries:** **Admin / config** client; **reuse** existing `eventInstance` entity CRUD and relationship routes from Phase **20.2** — **no** new booking math, **no** PartFinalizer changes. Server validation already treats **`parentBlockInstanceId`** as required on create; client must align.
- **Patterns:** Thin **EntityCard** slices + composables; reuse **`EventInstanceBuilderBody`**, **`EventInstanceListItem`**, template variable warnings, and drag/order patterns from `useInstancesTabEventInstanceDrag` where possible rather than duplicating templates.
- **Risks:** Shrinking **`InstancesTabContext`** or removing the Events tab without a clear **empty state** may confuse admins — mitigate with copy + link to open the right block shape tab. Drag-and-drop refs (`eventInstancesContainer`) are tied to Instances tab today; **20.3.4.1** must re-bind or replace with a card-local container.
- **Alternatives considered:** (a) Keep global Events tab as read-only aggregate — **optional** fallback if product needs a bird’s-eye list; default per phase guide is **relocate**. (b) New server endpoints for “segments by block” — **rejected**; filter client global entities + existing relationships.

### Goal

Finish FEATURE_20 **§8.3 #4** on this branch: **embed** event-segment (**`eventInstance`**) management under **event-shaped block instance** cards and **remove or replace** the redundant **Instances tab → Events** workflow, while staying aligned with **20.2** APIs and **§9** (instances hold orchestration behavior; shapes stay structural).

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§8.3), `.project-manager/ARCHITECTURE.md` (§8–§10)
- **PM / harness:** `phases/phase-20.3-guide.md`, `sessions/session-20.3.3-handoff.md` (prior context)
- **Implementation (expected hotspots):** `client/src/views/admin/tabs/InstancesTab.vue`; `client/src/composables/admin/useInstancesTab.ts`; `client/src/views/admin/tabs/components/EventInstancesSection.vue`; `client/src/composables/admin/useInstancesTabEventInstance.ts`; `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts`; `client/src/components/admin/generic/EntityCardContent.vue`; new composable(s) under `client/src/composables/admin/`; optional new presentational component(s) under `client/src/components/admin/generic/`; `client/src/types/admin/adminInjectionKeys.ts` (only if context is refactored); `client/src/types/entities.ts` / transformers if field plumbing is missing for `parentBlockInstanceId` in create payloads

### Approach

1. **20.3.4.1 — Segment panel on event block instance card:** Resolve block shape type for the open card; when **`event`**, render a **Segments** sub-panel (list + create + delete + reorder) scoped to **`parentBlockInstanceId === entityId`**. Ensure **create** sends **`parentBlockInstanceId`** per `eventInstanceEntityValidation`. Extract shared logic from Instances-tab composables into reusable modules to avoid duplication.
2. **20.3.4.2 — Instances tab cleanup:** Remove or replace the **`Events (n)`** tab and `EventInstancesSection` mount with a short **guidance** surface (“Segments are edited on each event block instance”) or a **read-only** aggregate if we keep minimal visibility; delete dead context fields only after call sites are gone; run **regression** on Instances + Shapes tabs.
3. **Quality:** After each task: `cd client && npm run lint` + `npm run type-check`; manual smoke on one **event** block instance card and remaining Instances navigation.
4. **§9.1 drift:** Record checklist notes in **`session-20.3.4-log.md`** at **`/session-end`**.

### Checkpoint

- **After 20.3.4.1:** Editing an **event** block instance shows segment list; create/delete/order works; payloads include valid **`parentBlockInstanceId`**.
- **After 20.3.4.2:** Instances tab no longer duplicates full segment editor (per chosen UX); no broken imports; lint/type-check clean.
- **Before `/session-end 20.3.4`:** Session log + handoff updated; phase-20.3 guide **Segments** objective ready to check.

### Deliverables

- [ ] **Event block instance** UI: embedded **segment / `eventInstance`** manager (scoped by block instance id).
- [ ] **Client** create/update paths aligned with server **`parentBlockInstanceId`** rules (Phase **20.2** contract).
- [ ] **Instances tab** Events island removed, replaced, or reduced to non-duplicative UX (document which in task **20.3.4.2**).
- [ ] **§9.1** drift notes captured at session-end.
- [ ] Lint + vue-tsc clean; manual smoke documented.

### Acceptance Criteria

- [ ] **§8.3 #4:** Segment / **`eventInstance`** editing is available in **event block instance** context (not only the global Events tab).
- [ ] **API alignment:** Create/update flows respect server rules (**`parentBlockInstanceId`** on create; no ad-hoc endpoints contradicting Phase **20.2**).
- [ ] **Shapes remain structural:** No new shape-level editors for segment templates beyond existing **20.3.1** placement work; this session does not move validity definition onto instance cards.
- [ ] **No duplicate primary UX:** After **20.3.4.2**, admins are not required to use two full segment editors for the same operation (document if a **read-only** aggregate remains).
- [ ] **Quality:** Client **lint** + **type-check** pass; manual smoke on Instances + at least one **event** block instance card.

---

---

## Session 20.3.5 (source: session-20.3.5-planning.md)

### Story

**This session delivers** (1) tighter **annotation** metadata surfacing in admin configs/modals and (2) a **first** `EntityCard` replacement at a **single, high-confidence** call site **so that** the admin UI aligns with FEATURE_20 **§8.3** item **#5** and phase **20.6** has an explicit debt list — without deleting the shared `EntityCard` tree yet.
**Estimated size:** M (metadata audit + one replacement + documentation)

---

### Analysis

- **Why now:** Phase **20.3** sequence (§8.3) places annotation metadata narrowing and the start of EntityCard replacement **after** placement, service atomic, other domain editors, and segment relocation — those are done through **20.3.4**.
- **Domains:** Admin/config client only; **no** booking math or PartFinalizer changes. Annotations remain **wizard presentation** metadata (see ARCHITECTURE.md domain map).
- **Boundaries:** Do not remove the shared `EntityCard` component or composable tree in this session; one **call-site** replacement + **docs** for **20.6**.
- **Patterns:** Prefer extracting a **`AnnotationShape*` focused card** (or reusing subcomponents from `EntityCardContent` / field renderers) over forking generic metadata for all entities.
- **Risks:** Drag-and-drop ordering for annotation shapes must stay wired (`draggable-annotation-shape`, `useShapesTab` refs). Save/delete parity with current `EntityCard` events (`@saved`, `@delete`).
- **Alternatives considered:** (a) Replace `ShapeCreationForm` first — **rejected** for wave 1: multi-`entityKey` generic surface, lower confidence. (b) Replace `ShapesTabAnnotationPanel` loop only — **selected**: fixed entity type, clear boundary. (c) Metadata-only session with no UI card — **rejected**: §8.3 #5 asks for both narrowing **and** start of EntityCard replacement.

### Goal

Execute FEATURE_20 **§8.3 #5** on `feature/domain-architecture-alignment`: **narrow** annotation-related metadata exposure where the plan allows, **replace** the `EntityCard` usage in **`ShapesTabAnnotationPanel`** for existing **annotationShape** rows with a **focused** component, and **document** remaining `EntityCard` debt for **20.6** (path list or worklog section). Capture **§9.1** drift notes at session-end if UI copy or behavior touches instance three-property semantics.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§6.3, §6.3a, §8.3), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §7, `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `sessions/session-20.3.5-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md` (or new `ENTITY_CARD_DEBT_20.6.md` under feature folder if preferred)
- **Implementation (likely):** `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue`, `client/src/composables/admin/useShapesTab.ts`, `client/src/components/admin/**` (new focused card), `client/src/configs/**` / `client/src/constants/entities.ts` / field metadata as needed for **20.3.5.1**

### Approach

1. **20.3.5.1:** Inventory configs / field metadata / modal wiring for `annotationShape` and `annotationInstance`; remove or hide **non-annotation** generic metadata that §6.3 says should not drive annotation editors; keep `AnnotationContentEditor` path intact.
2. **20.3.5.2:** Add a focused **annotation shape** card component; swap the `v-for` in `ShapesTabAnnotationPanel` from `EntityCard` to that component; preserve expansion, drag handle class, save/delete, and `@saved` / `@delete` behavior; run lint + type-check + manual Shapes → Annotations smoke.
3. **Documentation:** Add a concise **EntityCard remaining call sites** list (repo-relative paths) targeted for **20.6**, linked from worklog or feature guide.
4. **Testing:** Suspended — **lint**, **vue-tsc**, manual admin smoke only.

### Checkpoint

- **Before `/accepted-plan`:** Decomposition covers metadata narrowing + one EntityCard replacement + debt doc; recon paths recorded above.
- **Per task:** No regressions on annotation shape reordering or CRUD; no removal of `AnnotationContentEditor` from instance editing flows.
- **Session-end:** §9.1 drift note if applicable; phase-20.3-guide checkbox for **20.3.5** when session completes.

### Deliverables

- [ ] **Metadata:** Annotation shape/instance admin surfaces only show metadata intended for annotations per FEATURE_20 §6.3 (document any deferred items referencing **20.6**).
- [ ] **UI:** `ShapesTabAnnotationPanel` no longer uses `EntityCard` for **existing** `annotationShape` rows; behavior parity (expand, drag, save, delete).
- [ ] **Debt doc:** Remaining `EntityCard` import sites listed for **20.6** (markdown under `.project-manager/features/domain-architecture-alignment/` or append to `DOMAIN_REWRITE_WORKLOG.md`).
- [ ] **Quality:** `client` lint + type-check clean; manual smoke: Shapes → Annotations tab.

### Acceptance Criteria

- [ ] **§8.3 #5:** Annotation metadata narrowed per FEATURE_20 §6.3 where feasible; no accidental removal of annotation instance content editing (`AnnotationContentEditor` contract preserved where still used).
- [ ] **EntityCard wave:** At least one **high-confidence** replacement shipped — **`ShapesTabAnnotationPanel`** existing-row loop uses a **domain-focused** component, not `EntityCard`.
- [ ] **20.6 debt:** Written inventory of **remaining** `EntityCard` consumer paths for later deletion pass.
- [ ] **Architecture:** No new booking-resolution logic; admin/config client only; shapes vs instances semantics unchanged unless §9.1 drift explicitly documented.
- [ ] **Quality:** Client lint + vue-tsc clean; manual smoke on Shapes → Annotations.

---

---
