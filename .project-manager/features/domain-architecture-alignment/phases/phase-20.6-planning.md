<!-- harness-planning-rollup tier=phase id=20.6 consolidatedAt=2026-04-03T15:49:18.013Z -->

# Consolidated planning: phase 20.6

## Phase 20.6 (parent)

## Story

**As a** maintainer completing Feature 20, **I want** Pass 6 (**§8.6**) executed as ordered sessions—metadata DDL teardown, **EntityCard** deletion, differential-role/event-shape legacy cleanup, and doc review gates—**so that** the codebase matches the **replacement-first** acceptance checks and the admin stack no longer carries the DB-driven metadata pipeline.

**Estimated size:** **L** (multiple cross-cutting deletes across server, client, and migrations; order-sensitive).

---

## Analysis

- **Problem / why now:** Phases **20.1–20.5** aligned schema, API, admin UX, booking pipeline, and **documented** migration/metadata retirement. **§8.6** is the **final** pass: remove infrastructure that violates the target architecture (metadata pipeline, **EntityCard** generic shell, legacy differential-role paths) **without** reversing “replacement first.”
- **Boundaries:** Crosses **admin** (Vue + composables), **server** (routes, models, migrations), and **shared** (validators/types touched by metadata). **Booking** must remain **PartFinalizer-on-client**; no server-side recomputation of wizard totals as part of cleanup.
- **Patterns:** Follow **§6.3a** inventory and **`ENTITY_CARD_CONSUMERS_20.6.md`**; use **explicit domain components** already introduced in Pass 3–4 instead of preserving metadata-driven renderers. Migrations obey **DB_HOST** policy (localhost only for execute).
- **Risks:** Deleting metadata **before** last consumer is cut over breaks admin screens; order must match **DOMAIN_REWRITE_WORKLOG** narrative. **EntityCard** internal tree is large—delete only when import graph is zero.
- **Alternatives:** “Big bang” single PR — **rejected**; phased sessions **20.6.1–20.6.4** match cleanup grouping and rollback clarity.

## Goal

Complete **Phase 20.6 (Pass 6 — Rollout and cleanup)** per **`FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.6** and **`phases/phase-20.6-guide.md`**: prove **replacement-first** cleanup of admin metadata (full stack), **EntityCard** tree removal, differential-role / event-shape remnants listed in the plan, and closeout docs/review gates as scoped in **§9.3–§9.4** when applicable.

**Feature-wide:** Finishing **20.6** is the last numbered pass in Feature 20; after it, run **`/feature-end`** when the feature guide and **PROJECT_PLAN** say the feature is complete.

## Files

- **Canonical (read-only intent):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6, §9.3–§9.5**), `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `feature-domain-architecture-alignment-guide.md` (now includes **`## Phase 20.6`** for tier context), `phases/phase-20.6-guide.md`, `ENTITY_CARD_CONSUMERS_20.6.md`, `ANNOTATION_METADATA_DEFERRALS_20.6.md`, `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md`
- **Implementation hotspots (Pass 6):** `server/src/routes/internal/admin-metadata/**`, `server/src/db/models/admin/**` (metadata models), `server/src/routes/internal/index.ts`, `client/src/components/admin/generic/EntityCard*.vue`, `client/src/components/admin/**` (consumers in inventory), `client/src/composables/admin/**` (entity-card composables), client services calling **`/admin-metadata`**

## Approach

1. **Session order:** **20.6.1** metadata server/client API removal → **20.6.2** EntityCard → **20.6.3** differential-role / event-shape remnants → **20.6.4** docs and review gate. Adjust only if a dependency discovery forces it; document in session logs.
2. **Replacement first:** Each session starts with a **consumer check** (grep + smoke admin paths); no DDL or bulk delete until the prior replacement is proven in the guide’s sense (**§8.6** acceptance).
3. **Migrations:** Author migration files in-repo; **execute** only when **`DB_HOST`** is local per project rule; shared environments consume migrations from the host.
4. **Verification:** After each session, **`npm run start:dev`**, **`cd client && npm run lint`**, **`cd server && npm run lint`** (per Definition of Done); regen typecheck audit if tier-end complains about stale JSON.
5. **Coordination:** If **Feature 6** surfaces overlap (booking), cite **ARCHITECTURE.md** booking boundary; do not expand scope into new product behavior.

## Checkpoint

- **`/accepted-plan`:** Confirms decomposition **20.6.1–20.6.4** covers **§8.6** scope and **§6.3a** inventory paths.
- **Per session:** **§9.1 / §9.1a** drift checklist at start and end; update **`DOMAIN_REWRITE_WORKLOG.md`** when retirement steps land.
- **Branch:** Stay on **`feature/domain-architecture-alignment`** for implementation (already standard for this feature).

## Deliverables

- **Code:** Admin metadata **routes, models, and client callers** removed or detached per **§6.3a**; **EntityCard** tree deleted; listed **differential-role** / **event-shape** remnants removed per **§8.6** grouping.
- **Migrations:** DDL for metadata tables (or equivalent) authored and documented; execution per **DB_HOST** policy.
- **Docs:** **`ARCHITECTURE.md`**, feature/phase handoffs, and **`DOMAIN_REWRITE_WORKLOG.md`** updated to describe **end state**; **§9.3–§9.4** artifacts if doc promotion is in scope for **20.6.4**.
- **Guides:** `phase-20.6-guide.md` session checkboxes advanced; session guides/logs for **20.6.x** created via harness.

## Acceptance Criteria

- [ ] **§8.6 — Cleanup follows replacement, not the reverse** (no metadata or EntityCard delete while required consumers remain).
- [ ] **§8.6 — Review gate artifacts** complete before any redesign doc promotion / filename consolidation (if attempted this phase).
- [ ] **§6.3a — Full metadata stack** removed from server + client (no orphan **`/admin-metadata`** mount or prefetch).
- [ ] **EntityCard —** zero imports of **`EntityCard.vue`** and internal tree removed per inventory.
- [ ] **Lint / app start —** Definition of Done satisfied at phase end.
- [ ] **Phase guide** status and **phase-20.6-handoff** **`## Next Action`** point to **`/feature-end`** or explicit follow-up.

---

## Session 20.6.1 (source: session-20.6.1-planning.md)

### Story

**This session delivers** removal of the **admin metadata HTTP stack** (client prefetch/mutations + server **`/admin-metadata`** routers/models) **so that** admin UI no longer depends on DB-driven field-metadata rows and **Pass 6** can proceed to **EntityCard** deletion in **20.6.2** without a live metadata API.

**Estimated size:** **L** (router prefetch, many composables, **FieldRenderer** / metadata editors, server models, migration).

---

### Analysis

- **Problem / why now:** **§8.6** / **§6.3a** require **full** metadata infrastructure removal. **20.5** documented retirement **ordering**; **20.6.1** executes **client + API + server model** teardown for the metadata stack (DDL in same session or follow-up task if split for safety).
- **Boundaries:** **Admin** client + **server internal routes** + **DB models**; must **not** change booking **PartFinalizer** or appointment submit payloads.
- **Patterns:** Prefer **explicit** field definitions and existing **entity** admin patterns from Pass **20.3**; avoid new generic metadata abstractions.
- **Risks:** Stripping prefetch before replacements **breaks admin screens**; mitigate with ordered tasks and smoke checks. **Remote DB:** author migrations only; run locally when **DB_HOST** is localhost.
- **Alternatives:** Leave API stub returning empty — **rejected** (plan requires **full** removal).

### Goal

**Session 20.6.1:** Remove the **admin metadata** feature from the **client and server**: no **`/admin-metadata`** or **`/admin-metadata/batch`** callers, no **TanStack** `adminMetadata` cache, no metadata **Sequelize** models in active use, and a **migration** to drop the relevant tables (authored in-repo; execute per **DB_HOST** policy). Admin screens must remain usable via **non-metadata** configuration paths agreed in task implementation orders.

**Phase context:** This session owns only the **metadata stack** slice of **§8.6**; **EntityCard** is **20.6.2**.

### Files

- **Canonical:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6**), `DOMAIN_REWRITE_WORKLOG.md` (**admin metadata retirement** subsection)
- **Harness:** `phases/phase-20.6-guide.md` (**### Session 20.6.1**), `sessions/session-20.6.1-guide.md`
- **Client (expected touch):** `client/src/router/index.ts`, `client/src/utils/api/adminMetadataApi.ts`, `client/src/composables/admin/useMetadataCache.ts`, `client/src/composables/admin/useAdminMetadataMutations.ts`, `client/src/utils/admin/adminMetadataSaveRequest.ts`, `client/src/components/admin/metadata/**`, `client/src/components/admin/generic/fields/FieldRenderer.vue`, `client/src/utils/forms/formFieldsMetadataWarningResolution.ts`, call sites invalidating **`adminMetadata`** queries
- **Server (expected touch):** `server/src/routes/internal/index.ts`, `server/src/routes/internal/admin-metadata/**`, related **primitive/relationship** metadata routes if still mounted, `server/src/db/models/admin/adminMetadata*.ts`, `server/src/routes/schemas/adminMetadata*.ts`, model `index` / associations, **new** `server/src/db/migrations/*` for table drops

### Approach

1. **Task 20.6.1.1:** Client cutover — remove or replace every **runtime** dependency on **`/admin-metadata`** (prefetch, hooks, **FieldRenderer** metadata requirement, primitive metadata editor flows) so admin builds without metadata API calls.
2. **Task 20.6.1.2:** Server + DB — remove routers, Joi validators tied only to metadata, Sequelize models/associations; add migration to **drop** metadata tables; remove **`metadataValidatorFactory`** only if no remaining internal callers.
3. After each task: **client + server lint**, **app start** smoke on key admin routes; log decisions in **`session-20.6.1-log.md`** at session-end.

### Checkpoint

- **`/accepted-code`** then **implementation** per task orders; **`/task-end`** after each task; **`/session-end 20.6.1`** when both tasks complete.
- Run **§9.1 / §9.1a** drift checklist at session end; note metadata removal in **`DOMAIN_REWRITE_WORKLOG.md`** if not already reflected.

### Deliverables

- No remaining **`fetch`** / **`apiClient`** calls to **`/admin-metadata`** from `client/src`.
- No **`['adminMetadata']`** query cache population in router or composables (remove or replace with non-metadata data sources).
- Server: **`/admin-metadata`** router unmounted; metadata models removed from runtime graph; migration file(s) to drop tables listed in **§6.3a**.
- **`session-20.6.1-guide.md`** objectives checked; **`session-20.6.1-handoff.md`** updated with **Next Action** → **`/session-start 20.6.2`** (or **`/session-end`** then next session).

### Acceptance Criteria

- [ ] Admin app loads and critical entity admin paths work without metadata API (define smoke list in task planning).
- [ ] `cd client && npm run lint` and `cd server && npm run lint` pass.
- [ ] No references to removed routes in client; server `tsc` / build clean.
- [ ] Migration authored for metadata table drops; execution only on allowed **DB_HOST**.

---

---

## Session 20.6.2 (source: session-20.6.2-planning.md)

### Story

**This session delivers** removal of the generic **`EntityCard.vue`** component tree and replacement of every **direct/async import** listed in **`ENTITY_CARD_CONSUMERS_20.6.md`** with **domain editors** (or thin domain shells that compose **`EntityCardContent`** + existing **`useEntityCard*`** composables without keeping the **`EntityCard`** SFC), **so that** Pass **§6.3a / §8.6** can mark the admin UI free of the legacy generic instance shell and **20.6.3** can focus on differential-role / event-shape remnants only.

**Estimated size:** **L** (many call sites + `RelationshipCollection` + large composable surface).

---

### Analysis

- **Problem / why now:** **20.6.1** removed the server metadata stack and aligned **code-first** metadata on the client. The admin UI still mounts the **generic `EntityCard.vue`** shell at every inventory call site. **§6.3a** requires **deleting** that tree once replacements exist; inner behavior (**`EntityCardContent`**, **`FieldRenderer`**, **`useEntityCard*`** wiring) is already the “domain editor” — this session **re-homes** it under **domain-named parents** and drops the **`EntityCard`** SFC.
- **Domain boundaries:** **Client admin only** (`client/src/components/admin`, `views/admin`, `composables/admin`, `types/admin`, `utils/admin`). **No** booking **PartFinalizer** or new server routes.
- **Grounding:** See **## Codebase recon** and **`ENTITY_CARD_CONSUMERS_20.6.md`**; **`ARCHITECTURE.md`** for admin vs booking split.
- **Shared shell decision:** Do **not** promote **`AnnotationShapeListCard`** as the universal shell. Prefer **domain-named expansion-panel parents** that **compose** **`EntityCardContent`**, sub-panels, and existing composables. Optional **one** thin shared layout SFC mid-session if duplication is painful — **must not** reintroduce the name **`EntityCard`**.
- **Risks:** **RelationshipCollection** async child rows and **bulk/modal** flows are the highest regression risk; **governance** may flag large composable return surfaces — address only when a task edits that file materially.
- **Alternatives:** Keep **`EntityCard`** indefinitely — **rejected** by **§8.6**.

### Goal

**Session 20.6.2 only:** Eliminate **all** imports of **`EntityCard.vue`** (including **`defineAsyncComponent`**), refactor **`AnnotationShapeListCard`** so it does **not** wrap **`EntityCard`**, then **delete** **`EntityCard.vue`**, coupled **`EntityCard*.vue`** children, and **orphan** **`useEntityCard*`** / **`entityCard*`** modules **after** `rg EntityCard` shows **zero** consumer imports. Update **`ENTITY_CARD_CONSUMERS_20.6.md`** to reflect **retirement**. **Out of scope for 20.6.2:** **20.6.3** differential-role / event-shape remnants, **20.6.4** doc closeout — only **note** handoff if discovery forces a follow-up task.

### Files

- **Canonical (read-only):** `ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6**), `ARCHITECTURE.md`
- **Harness / PM:** `feature-domain-architecture-alignment-guide.md`, `phases/phase-20.6-guide.md`, **`ENTITY_CARD_CONSUMERS_20.6.md`**, `DOMAIN_REWRITE_WORKLOG.md`, `session-20.6.2-guide.md`
- **Implementation (this session):**
  - **Consumers:** `client/src/views/admin/tabs/components/BlockInstancesGroup.vue`, `ShapesTabEventPanel.vue`, `ShapesTabPartPanel.vue`, `ShapeCardList.vue`, `ShapeCreationForm.vue`, `BulkEditModal.vue`, `BlockInstanceCreateModal.vue`, `AnnotationShapeListCard.vue`, `RelationshipCollection.vue` (under `components/admin/generic/` or adjacent paths per repo layout)
  - **Tree to delete (last):** `EntityCard.vue`, `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`
  - **Composables / types / utils:** `client/src/composables/admin/useEntityCard*.ts`, `client/src/types/admin/entityCard*.ts`, `client/src/utils/admin/entityCard*.ts`, related constants/persistence modules **if** unused after delete

### Approach

1. **Consumer wave (Task 20.6.2.1):** For each **direct** importer and **`AnnotationShapeListCard`**, replace **`EntityCard`** with a **domain parent** that preserves **expansion**, **title row**, **save/delete**, and **field grid** behavior by composing **`EntityCardContent`** (and sub-panels) + existing composables. Run **`rg '\bEntityCard\b'`** after each cluster; smoke **Shapes**, **Instances**, **Annotations**, **modals**.
2. **RelationshipCollection + teardown (Task 20.6.2.2):** Remove **`defineAsyncComponent`** **`EntityCard`** usage; embed the same **inner** editing surface for nested rows / create placeholders. When **no** file imports **`EntityCard.vue`**, **delete** the SFC tree and **prune** dead **`useEntityCard*`** / types / utils; refresh **`ENTITY_CARD_CONSUMERS_20.6.md`** (empty or “retired” section).
3. **Verification:** **`npm run start:dev`**, **`cd client && npm run lint`**, **`cd server && npm run lint`**, **`vue-tsc` / `tsc`** as used in this repo after substantive TS edits; no new tests (project rule).

### Checkpoint

- **`/accepted-plan`:** Confirms **two tasks** cover **every** path in **`ENTITY_CARD_CONSUMERS_20.6.md`** plus **`RelationshipCollection`** and **teardown**.
- **After 20.6.2.1:** Zero **direct** `EntityCard` imports except **`RelationshipCollection`** (and any stragglers caught by grep).
- **After 20.6.2.2:** **`EntityCard.vue`** absent; inventory doc updated; **`DOMAIN_REWRITE_WORKLOG.md`** entry for EntityCard retirement.

### Deliverables

- **Replaced** all **`EntityCard`** consumer sites per inventory; **`AnnotationShapeListCard`** no longer wraps **`EntityCard`**.
- **Removed** **`EntityCard.vue`** and dependent generic SFCs; **pruned** unused composables/types/utils in the **`useEntityCard` / `entityCard`** cluster.
- **Updated** **`ENTITY_CARD_CONSUMERS_20.6.md`** and session **log / handoff** with smoke notes.

### Acceptance Criteria

- **`rg`** / project search: **no** `import ... EntityCard` or `from '.../EntityCard.vue'` and **no** `defineAsyncComponent(() => import('...EntityCard` in **`client/src`**.
- **Admin smoke:** Shapes tab (block / part / event panels), instances block group, annotations list, **bulk edit** and **block instance create** modals — **expand**, **edit field**, **save** (and **delete** where applicable) without console errors.
- **Lint / typecheck** green per Definition of Done.
- **Inventory doc** matches repo reality (no stale “still imports EntityCard” rows).

---

## Session 20.6.3 (source: session-20.6.3-planning.md)

### Story

**This session delivers** removal of **superseded differential-event-role override** wiring and related **event-shape / event-instance** legacy paths that conflict with **placement_kind + anchor_edge** + relational **event_assignments**, **so that** Pass **§8.6** cleanup grouping is satisfied before **20.6.4** doc/review closeout — **without** changing **PartFinalizer** resolution rules or inventing server-side booking math.

**Estimated size:** **M** (admin field stack + appointment/transformer touchpoints; two-task split).

---

### Analysis

- **Problem / why now:** **20.6.1–20.6.2** removed metadata + generic **EntityCard**. **DB** migration **000059** already drops the overrides column; **client** still carries **matrix field**, **display config**, **appointment** optional overrides, and **attendee utils** branches — dead or misleading vs **placement-first** architecture.
- **Boundaries:** **Client** admin + booking transformers/types; **server** only if dead validators/helpers remain. **Do not** alter **PartFinalizer** core contract or add server recomputation of booking totals (**ARCHITECTURE.md** / plan §4).
- **Task order:** **Admin/UI + primitives first** (stop surfacing overrides), then **booking + shared** simplification once no product path persists overrides.
- **Risks:** **False positive deletion** if any environment has not applied **000059** — prefer **grep + typecheck** over silent runtime failure; **availability differential** naming collision — avoid touching **`useBusinessControlsTab` / `WizardConfigPanel`** differential sub-step unless scoped.
- **Alternatives:** Keep overrides field read-only “for debug” — **rejected** by FEATURE_20 removal list.

### Goal

**Session 20.6.3 only:** Eliminate **legacy differential-event-role override** surfaces and **stray types/transformer** branches aligned to **FEATURE_20** placement model; trim **event-instance admin** paths that are clearly superseded by the **segment-manager** narrative **only where** code is provably unused or redundant after grep + typecheck. **Out of scope:** **20.6.4** documentation/review gate; **feature-end**; wholesale rename of **`DifferentialRole`** shared types if still used for **placement-derived** roles.

### Files

- **Canonical (read-only):** `ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§2.2, §3.6, §8.6**), `ARCHITECTURE.md` (**§5 event placement**)
- **Harness / PM:** `phases/phase-20.6-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`, `session-20.6.2-handoff.md`
- **Implementation (expected hotspots):**
  - `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`
  - `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`
  - `client/src/utils/admin/differentialRoleMatrixRows.ts`
  - `client/src/constants/primitives.ts` (**`GlobalFieldKey` / map types**)
  - `client/src/types/appointmentModels.ts`
  - `client/src/utils/eventAttendeeUtils.ts`
  - `client/src/utils/transformers/entityTransformers.ts`
  - `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts` (retain if still needed for API rejection; delete only if redundant)
  - **Field wiring:** `FieldRenderer.vue` / `PrimitiveInputs.vue` / `codeFirstMetadataCache.ts` — only if **`differentialEventRoleOverrides`** still registered
  - **Event instance UI:** `client/src/views/admin/tabs/components/EventInstanceEditor.vue`, `EventInstanceBuilderBody.vue`, `EventInstanceListItem.vue`, `EventInstanceTemplateFields.vue`, `EventInstancePreviewPanel.vue`, `EventInstanceCalendarSettings.vue`, `EventInstanceVariableChips.vue`; composables under `composables/admin/useInstancesTab*`

### Approach

1. **Task 20.6.3.1:** **Grep** `differentialEventRoleOverrides` / **`DifferentialEventRoleOverrides`** / matrix component; remove **admin** field component + **blockInstance** display row + **matrix rows** util if orphaned; tighten **`primitives.ts`** / **FieldRenderer** wiring so the property cannot render; smoke **Instances** tab block instance form (**Events** panel / field groups).
2. **Task 20.6.3.2:** Remove **`differentialEventRoleOverrides`** from **appointment** types and booking helpers; simplify **`eventAttendeeUtils`** to **placement + event_shape** template role only (drop override map branches when always empty); audit **`entityTransformers`** deletes; remove dead **shared** imports on client; **optional:** thin **event-instance** standalone editor remnants if grep shows no route/consumers — document in handoff if deferred.
3. **Verification:** `npm run start:dev`; `cd client && npm run lint`; `cd server && npm run lint`; `vue-tsc` / `tsc` as in repo; **no new tests** (project rule).

### Checkpoint

- **`/accepted-plan`:** Two tasks cover **admin removal** then **booking/shared**; **no PartFinalizer** file churn unless a task explicitly needs import cleanup only.
- **After 20.6.3.1:** Zero **admin** references to **`differentialEventRoleOverrides`** field component / display config (grep).
- **After 20.6.3.2:** **`appointmentModels`** and **attendee** utilities carry **no** override map; **`DOMAIN_REWRITE_WORKLOG.md`** one-line note for **20.6.3** retirement.

### Deliverables

- **Removed or unreachable** **block-instance differential event role overrides** UI and config.
- **Booking/types** no longer model **appointment-level** override map (if fully dead).
- **Worklog** updated; session **log/handoff** with smoke notes.
- **Grep audit** saved in session log (commands + “before/after” hit counts optional).

### Acceptance Criteria

- **`rg differentialEventRoleOverrides`** across **`client/src`** shows **no** functional references (comments acceptable only if explaining removal).
- **Admin:** Block instance editor does not show **differential role matrix**; no runtime errors on Instances / Shapes event flows touched.
- **Lint + vue-tsc** (client) and **server lint** green per DoD.
- **No** changes to **PartFinalizer** business logic beyond **type/import** cleanup **unless** a dead branch is removed with identical behavior for placement-only paths.

---

## Session 20.6.4 (source: session-20.6.4-planning.md)

### Story

**This session delivers** auditable **§8.6** acceptance notes, drift checklist evidence (**§9.1 / §9.1a**), and updated phase/feature PM artifacts **so that** Feature **20** can end cleanly with **`/phase-end 20.6`** then **`/feature-end`** without stale handoffs or undocumented residual risk.
**Estimated size:** **S–M** (documentation and verification; small code/doc fixes only if a checklist item fails).

---

### Analysis

- **Problem / why now:** Phase **20.6** execution sessions are done; without **20.6.4**, **§8.6** acceptance and ladder/handoff state stay ambiguous and **`phase-20.6-handoff.md`** misleads the next agent.
- **Boundaries:** **`.project-manager/`** docs plus optional tiny **`ARCHITECTURE.md`** / worklog edits; **no** booking or server behavior change unless a checklist failure forces a minimal fix (then document in log).
- **Patterns:** Follow existing feature PM style (`session-*-log.md`, `*-handoff.md`, `across-ladder.json`); cite **FEATURE_20** §**8.6** acceptance bullets when stating completion.
- **Risks:** Over-scoping **§9.4** into a full redesign-file replacement without explicit approval; **mitigation:** record **deferred** with reason. Residual **`EntityCard*`** filenames may look incomplete — **mitigation:** classify as renamed shell vs §**8.6** debt in the log.
- **Alternatives:** Single mega-task for all docs — **rejected**; split **evidence/hygiene** vs **phase closeout** for clearer **`task-end`** boundaries.

### Goal

Close **Session 20.6.4** per **`phase-20.6-guide.md`**: run **§9.1 / §9.1a** drift checklist on the **final** branch state; capture **§8.6** acceptance narrative in **`DOMAIN_REWRITE_WORKLOG.md`** / session log as needed; refresh **`phase-20.6-handoff.md`** and **20.6.3**/**20.6.4** handoffs so **Next Action** points to **`/phase-end 20.6`** then **`/feature-end`**; record **§9.3–9.4** outcome (**complete / deferred / N/A**). **Out of scope unless explicitly added:** replacing **`DOMAIN_ARCHITECTURE_REDESIGN.md`** or **`ARCHITECTURE_PRINCIPLES.md`** files on disk.

### Files

- **Read / update:** `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.4-planning.md` (this doc), `session-20.6.4-guide.md`, `session-20.6.4-log.md`, `session-20.6.4-handoff.md` (create/update at **`/task-start`** / **`/session-end`** as harness expects), `sessions/session-20.6.3-handoff.md` (hygiene), `phases/phase-20.6-handoff.md`, `phases/phase-20.6-guide.md` (session checkbox at **`/session-end`**), `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/PROJECT_PLAN.md` (Feature **20** status if playbook requires), `.project-manager/ARCHITECTURE.md` (only if drift vs implementation)
- **Reference (verification):** `FEATURE_20_ARCHITECTURE_REDESIGN.md` §**8.6**, §**9.1–9.4**; `feature-domain-architecture-alignment-guide.md`

### Approach

1. **Task 20.6.4.1:** Evidence + doc hygiene — checklists, grep log, worklog/session-20.6.3-handoff cleanup, optional **ARCHITECTURE.md** touch.
2. **Task 20.6.4.2:** Phase/feature runway — **`phase-20.6-handoff.md`**, **20.6.4** handoff/log, **§9.3–9.4** statement, **`PROJECT_PLAN`** alignment, explicit **`/phase-end`** / **`/feature-end`** next steps.
3. **Harness:** After each task, **`/task-end`**; after **20.6.4.2**, **`/session-end 20.6.4`** (user-run); then **`/phase-end 20.6`** when ready.

### Checkpoint

- **`/accepted-plan`:** Decomposition covers **20.6.4** goal; user runs harness acceptance.
- **Before `/session-end`:** DoD lint/start where applicable; session log lists completed tasks with ids.
- **Branch:** `feature/domain-architecture-alignment`

### Deliverables

- **§9.1 / §9.1a** drift checklist completed and recorded (session log or appendix in handoff).
- **Grep audit** recorded: `admin-metadata` / `differentialEventRoleOverrides` / other §**8.6** symbols as listed in task plan (commands + outcome).
- **`DOMAIN_REWRITE_WORKLOG.md`** updated if **§8.6** closure needs an explicit “Pass 6 complete” line beyond existing **20.6.3.2** note.
- **`phase-20.6-handoff.md`** reflects sessions **20.6.1–20.6.4** and **Next Action** → **`/phase-end 20.6`** (then **`/feature-end`**).
- **`session-20.6.3-handoff.md`** repaired: no empty “Last Completed: Task”, no duplicate **Across ladder** sections.
- **§9.3–9.4** outcome documented (**complete / deferred / N/A** with one-line rationale).
- **`session-20.6.4-handoff.md`** + **`session-20.6.4-log.md`** updated for **`/session-end`**.

### Acceptance Criteria

- Checklist and grep evidence exist under **`.project-manager/features/domain-architecture-alignment/sessions/`** for **20.6.4**.
- Stale **phase-20.6-handoff** “active 20.6.1” text is corrected.
- **Next Action** chain is unambiguous: **`/phase-end 20.6`** → **`/feature-end`** (unless user adds follow-up phase).
- No unintended **`client/`** / **`server/`** product refactors; any code change is tied to a logged checklist failure.

---

---
