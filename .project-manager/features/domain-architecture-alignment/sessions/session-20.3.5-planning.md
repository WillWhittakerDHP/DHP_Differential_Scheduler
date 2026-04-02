# Plan: session 20.3.5 — Annotation metadata + EntityCard wave (FEATURE_20 §8.3 #5)

## Contract
- **Tier:** session | **ID:** 20.3.5
- **Scope:** Narrow non-annotation metadata exposure where the plan allows; replace the **lowest-risk** `EntityCard` usage with a focused domain component; document remaining `EntityCard` debt for phase **20.6** (full deletion per FEATURE_20 §6.3a — out of scope here).
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/admin/useEntityCardSaveAndActions.ts` — oversized-return: Return surface has 14 properties; decompose into focused composables
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Re
  - … _(truncated)_

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture, booking
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Session **20.3.4** shipped event segment editing on event block instance cards and removed the redundant Instances → Events island; branch pushed. <!-- harness-across-ladder:start -->

## Story
**This session delivers** (1) tighter **annotation** metadata surfacing in admin configs/modals and (2) a **first** `EntityCard` replacement at a **single, high-confidence** call site **so that** the admin UI aligns with FEATURE_20 **§8.3** item **#5** and phase **20.6** has an explicit debt list — without deleting the shared `EntityCard` tree yet.
**Estimated size:** M (metadata audit + one replacement + documentation)

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
| **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |

---

## 3. Data flow

Canonical path:

1. **Vue view** → **presentational component**
2. **Composable** (state + orchestration; thin components)
3. **Client HTTP**
   - **Default:** `utils/api/apiClient` — relative paths, same-origin API.
   - **Integrations:** `services/*ApiService` — full-base-URL axios (calendar, maps, enrichment).
4. **Express route** (`routes/internal/*` or `routes/external/*`)
5. **Service** (`server/src/services/`)
6. **Repository** (`server/src/repositories/`) or direct Sequelize access
7. **Sequelize model** (`server/src/db/models/`)

Cross-cutting: **transformers** (e.g. global → booking), **injection keys** for wizard scope, **TanStack Query** keys + invalidation for mutations.

**Booking resolution boundary:** The server serves **configuration and raw storage rows** (e.g. part instances, relationships) plus appointment-scoped inputs such as `property_details`. **PartFinalizer** on the **client** resolves wizard time, fee, and segment placement for the live booking flow. On submit, the client sends a **full appointment payload**; the server **persists** it and does **not** re-run PartFinalizer to recompute or “verify” those totals. Do not introduce a second booking calculator on the server for the same contract (see §10).

---

## 4. Type boundaries

| Layer | Location | Use when |
|-------|----------|----------|
| **Shared contracts** | Repo `shared/`, imported as `@shared/types/...` | Types needed by **both** client and server (API shapes, branded IDs, shared enums). |
| **Client-only** | `client/src/types/<domain>/` | UI-only: injection keys, wizard step types, transformer helpers, form field types. **Never** imported by server. |
| **Server-only** | `server/src/types/` | Handler params, repository types, internal DTOs. **Never** imported by client. |

**Rule:** If both sides need it → `@shared`. If only one side → keep it local.

**Reactivity boundaries:** Prefer `ComputedRef<T>` for read-only consumer APIs; `Ref<T>` for internal mutable state; avoid leaking `Ref | ComputedRef` unions at public composable boundaries (see type governance rule + TYPE_AUTHORING_PLAYBOOK).

---

## 5. Per-domain conventions

### Booking / wizard

- **Composable prefixes:** `useBooking*`, `useAvailability*`, `useWizard*`, `useAppointment*`, `useProperty*` (orchestrators such as `useAvailabilityOrchestrator`, `useBookingWizardSetup`).
- **Components:** under `components/booking/` (steps in `components/booking/steps/`).
- **Depends on** admin metadata (wizard blocks, availability rules) — document cross-domain deps in planning **Analysis**.
- **Scheduling rules:** Block instances, part ledger, PartFinalizer, event placement, and invariants are defined in **§8–§14** below.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Generic admin components + config objects + transformers.
- **Shape vs instance:** Structural validity (`valid_*` relationships) is edited on the **shapes** side; orchestration editors **select** active assignments from that universe — they do not redefine structural possibility (see §9).

### Auth

- **Emerging domain;** keep route and model changes aligned with `routes/internal/auth` and `db/models/auth`. Consumed by all domains via middleware/guards over time.

### Users / `user_role`

- **`users.user_role`** is a **small closed set** (PostgreSQL ENUM + Joi + client types). **Delivered (Feature 6 Session 6.18.1):** **`@shared`** exports **`USER_ROLE_VALUES`** and per-role constants; server and client **import** that list. Product vocabulary uses **`owner`** (not `seller`) end-to-end, including wizard **`additionalContacts[].role`** and contact-step field names (`ownerInfo`, `showOwner`). **Note:** Older saved wizard or step snapshots that used `seller` / `sellerInfo` are not migrated client-side; users re-enter contacts or clear stored state if needed.
- **User-type block instances** (state-control shapes) drive scheduling/display semantics; **`getUserTypeBlockIdForRole`** maps **DB role** → block instance. **Session 6.18.2** adds **admin-persisted alignment** (role → `block_instance_id`) so mappings are configurable without code edits where product allows. See `features/appointment-workflow/phases/phase-6.18-guide.md`.
- **Feature 7 Enactment** exposes role to the client using the **same** shared vocabulary as the API.

### Integrations

- Prefer **dedicated services** and **external routes**; avoid mixing full-URL axios into `apiClient` call sites without reason.

### Beta

- Isolated feedback capture; keep `beta` paths grouped under composables/views/components/beta.

---

---

## (from ARCHITECTURE.md — domain rules §8+)

## 8. Domain model (block shape types)

The system has five block shape **types**. Each owns one scheduling concern. All five participate in the three-property instance model (§9).

| Type | Domain | What it owns |
|------|--------|----------------|
| `user` | Identity | User identity and wizard state. User instances drive cascades and annotations. |
| `service` | Structure | Work items (part instances), active downstream assignments per service context. **Base** time/fee defaults and floors live only on **service orchestrator** part instances. |
| `event` | Event | Part-instance calendar segment assignments and time-axis patterns. |
| `time` | Duration | Part-instance duration contributions from property characteristics (rates × inputs). |
| `price` | Fee | Part-instance fee contributions and rollups from rates and cascades. |

**Domain separation:** Each domain writes only its own concern on part instances. Domains **compose**; they do not overwrite each other’s values.

**Legacy names:** During migrations, stored enums or code may still reference older labels (`property` / `coupon` / `option`); target names are **`time`**, **`price`**, **`event`** aligned to this table.

---

## 9. Block instances: three-property model and layering

### 9.1 Three orthogonal properties (instance storage only)

Every **block instance** has three independent booleans (not on block **shapes**):

| Property | Axis | Question |
|----------|------|----------|
| `orchestrator` | Behavior | Root of an active assignment graph across other shapes? |
| `composite` | Structure | Owns child block instances of the **same** shape? |
| `wizardVisible` | Presentation | Appears in the booking wizard when cascades permit? |

Any combination is valid. Compositeness is **same-shape** hierarchy; orchestration is **cross-shape** active selection from the shape-level validity graph.

### 9.2 Layering

```
Block shape (template — type, domain, valid shape-level relationships)
  └─ Block instance (runtime — carries composite / orchestrator / wizardVisible)
       └─ Part instance (value ledger per block instance)
```

- **Shapes** define what is structurally possible (`valid_*` tables). They do **not** store the three booleans.
- **Block instances** store the three booleans and create part instances.
- **Orchestrator instances** choose which downstream instances are **active** from the options the shape graph allows — they do **not** redefine validity.

---

## 10. Part instances, PartFinalizer, and resolution

### 10.1 Per-block-instance ledger

Each block instance owns its own part instances via `part_assignments` (including user block instances). No instance writes another instance’s part rows.

**Two resolution tiers on part rows:**

| Tier | Who | Columns |
|------|-----|---------|
| **Base** | Service orchestrator only | `baseTime`, `baseFee` (floor + starting values) |
| **PerUnit** | Time / price atomics | `timePerUnit`, `feePerUnit` |

**Events:** Routed via relational **`event_assignments`** (event instance ↔ part instance), not scalar default/override columns on part instances.

### 10.2 PartFinalizer (client)

Part instances are storage. **PartFinalizer** (booking client pipeline) aggregates:

- `resolvedTime` = service base + Σ(timePerUnit × input) for time atomics in the same **lineage** bucket.
- `resolvedFee` = service base + Σ(feePerUnit × input) and percentage passes.
- `resolvedEvent` = event profile override **else** event orchestrator baseline assignment **per part instance**.

Base acts as a **floor** until zero-out. **Correlation:** bucket by lineage to the atomic service / line item — **forbidden** to resolve by `part_shape` alone when multiple work items could collide.

### 10.3 Resolution order (per part)

1. Per-block-instance part records exist.  
2. Resolve part-level time (base + time atomics using `property_details` inputs).  
3. Resolve part-level fee (base + price atomics).  
4. Resolve part-level event assignment (override ?? baselin

_(Excerpt truncated.)_

## Codebase recon (agent-led — required)

- **Paths reviewed:**
  - `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue` — lists `annotationShape` rows via `EntityCard` (expand, drag class, save/delete); “new shape” row is already a plain `VExpansionPanel` + `VTextField` (no EntityCard).
  - `client/src/views/admin/tabs/components/ShapeCreationForm.vue` — generic `<EntityCard :is-new="true">` used from shape creation flows (multi-entity-key).
  - `client/src/components/admin/generic/EntityCard.vue` + `EntityCardContent.vue` — metadata-driven fields; `AnnotationContentEditor` gated for `entityKey === 'annotationInstance'` (keep per §6.3).
  - `client/src/components/admin/generic/collections/RelationshipCollection.vue` — heavy `EntityCard` usage (valid children / new child) — **not** first-wave target (higher coupling).
  - `client/src/views/admin/tabs/components/BlockInstancesGroup.vue`, `ShapeCardList.vue`, `ShapesTabEventPanel.vue`, `ShapesTabPartPanel.vue` — other `EntityCard` call sites; event/part panels already carry domain editors from earlier 20.3 sessions.
  - `client/src/composables/admin/useShapesTab.ts` — annotation shape list, drag handlers, CRUD for annotation shapes (context for panel replacement).
  - FEATURE_20 `§6.3` / `§6.3a` — metadata shrinks to annotations-only long term; `AnnotationContentEditor` **keep**; full EntityCard tree deletion is **20.6**.

- **Patterns / call sites:** Replacement should follow **thin SFC + composable** patterns from **20.3.1–20.3.4** (domain-specific surface, reuse `useEntityCrud`, existing save/delete utilities where possible). Avoid rewriting `RelationshipCollection` or generic `ShapeCreationForm` in this session unless task scope explicitly expands.

- **Gaps / unknowns:** Exact field set for `annotationShape` in `ENTITY_CONFIGS` / field displays — verify during **20.3.5.1** before changing visibility. Server-side annotation models unchanged unless a bug is found.

## Analysis

- **Why now:** Phase **20.3** sequence (§8.3) places annotation metadata narrowing and the start of EntityCard replacement **after** placement, service atomic, other domain editors, and segment relocation — those are done through **20.3.4**.
- **Domains:** Admin/config client only; **no** booking math or PartFinalizer changes. Annotations remain **wizard presentation** metadata (see ARCHITECTURE.md domain map).
- **Boundaries:** Do not remove the shared `EntityCard` component or composable tree in this session; one **call-site** replacement + **docs** for **20.6**.
- **Patterns:** Prefer extracting a **`AnnotationShape*` focused card** (or reusing subcomponents from `EntityCardContent` / field renderers) over forking generic metadata for all entities.
- **Risks:** Drag-and-drop ordering for annotation shapes must stay wired (`draggable-annotation-shape`, `useShapesTab` refs). Save/delete parity with current `EntityCard` events (`@saved`, `@delete`).
- **Alternatives considered:** (a) Replace `ShapeCreationForm` first — **rejected** for wave 1: multi-`entityKey` generic surface, lower confidence. (b) Replace `ShapesTabAnnotationPanel` loop only — **selected**: fixed entity type, clear boundary. (c) Metadata-only session with no UI card — **rejected**: §8.3 #5 asks for both narrowing **and** start of EntityCard replacement.

## Goal

Execute FEATURE_20 **§8.3 #5** on `feature/domain-architecture-alignment`: **narrow** annotation-related metadata exposure where the plan allows, **replace** the `EntityCard` usage in **`ShapesTabAnnotationPanel`** for existing **annotationShape** rows with a **focused** component, and **document** remaining `EntityCard` debt for **20.6** (path list or worklog section). Capture **§9.1** drift notes at session-end if UI copy or behavior touches instance three-property semantics.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§6.3, §6.3a, §8.3), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §7, `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `sessions/session-20.3.5-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md` (or new `ENTITY_CARD_DEBT_20.6.md` under feature folder if preferred)
- **Implementation (likely):** `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue`, `client/src/composables/admin/useShapesTab.ts`, `client/src/components/admin/**` (new focused card), `client/src/configs/**` / `client/src/constants/entities.ts` / field metadata as needed for **20.3.5.1**

## Approach
1. **20.3.5.1:** Inventory configs / field metadata / modal wiring for `annotationShape` and `annotationInstance`; remove or hide **non-annotation** generic metadata that §6.3 says should not drive annotation editors; keep `AnnotationContentEditor` path intact.
2. **20.3.5.2:** Add a focused **annotation shape** card component; swap the `v-for` in `ShapesTabAnnotationPanel` from `EntityCard` to that component; preserve expansion, drag handle class, save/delete, and `@saved` / `@delete` behavior; run lint + type-check + manual Shapes → Annotations smoke.
3. **Documentation:** Add a concise **EntityCard remaining call sites** list (repo-relative paths) targeted for **20.6**, linked from worklog or feature guide.
4. **Testing:** Suspended — **lint**, **vue-tsc**, manual admin smoke only.

## Checkpoint
- **Before `/accepted-plan`:** Decomposition covers metadata narrowing + one EntityCard replacement + debt doc; recon paths recorded above.
- **Per task:** No regressions on annotation shape reordering or CRUD; no removal of `AnnotationContentEditor` from instance editing flows.
- **Session-end:** §9.1 drift note if applicable; phase-20.3-guide checkbox for **20.3.5** when session completes.

## Acceptance Criteria

- [ ] **§8.3 #5:** Annotation metadata narrowed per FEATURE_20 §6.3 where feasible; no accidental removal of annotation instance content editing (`AnnotationContentEditor` contract preserved where still used).
- [ ] **EntityCard wave:** At least one **high-confidence** replacement shipped — **`ShapesTabAnnotationPanel`** existing-row loop uses a **domain-focused** component, not `EntityCard`.
- [ ] **20.6 debt:** Written inventory of **remaining** `EntityCard` consumer paths for later deletion pass.
- [ ] **Architecture:** No new booking-resolution logic; admin/config client only; shapes vs instances semantics unchanged unless §9.1 drift explicitly documented.
- [ ] **Quality:** Client lint + vue-tsc clean; manual smoke on Shapes → Annotations.

## Deliverables

- [ ] **Metadata:** Annotation shape/instance admin surfaces only show metadata intended for annotations per FEATURE_20 §6.3 (document any deferred items referencing **20.6**).
- [ ] **UI:** `ShapesTabAnnotationPanel` no longer uses `EntityCard` for **existing** `annotationShape` rows; behavior parity (expand, drag, save, delete).
- [ ] **Debt doc:** Remaining `EntityCard` import sites listed for **20.6** (markdown under `.project-manager/features/domain-architecture-alignment/` or append to `DOMAIN_REWRITE_WORKLOG.md`).
- [ ] **Quality:** `client` lint + type-check clean; manual smoke: Shapes → Annotations tab.

## Decomposition

- **Task 20.3.5.1 — Annotation metadata narrowing** — Audit and narrow field/metadata/config exposure for `annotationShape` / `annotationInstance` admin (Shapes tab metadata modals, `ENTITY_CONFIGS`, field displays); exclude unrelated generic metadata where §6.3 allows; log deferred scope for 20.6.

- **Task 20.3.5.2 — Annotation shape card + EntityCard debt** — Introduce focused component for annotation shape rows; replace `EntityCard` loop in `ShapesTabAnnotationPanel.vue`; verify drag + save/delete; write **EntityCard debt** path list for phase 20.6.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
