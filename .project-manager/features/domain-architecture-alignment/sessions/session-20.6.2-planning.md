# Plan: session 20.6.2 — EntityCard tree and façade consumers

## Contract
- **Tier:** session | **ID:** 20.6.2
- **Scope:** EntityCard tree and façade consumers
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
- Session **20.6.1** complete: client code-first metadata + server metadata stack removed + drop migration authored.
- Session **20.6.2** started — this planning doc is the execute gate for EntityCard teardown.

## Story
**This session delivers** removal of the generic **`EntityCard.vue`** component tree and replacement of every **direct/async import** listed in **`ENTITY_CARD_CONSUMERS_20.6.md`** with **domain editors** (or thin domain shells that compose **`EntityCardContent`** + existing **`useEntityCard*`** composables without keeping the **`EntityCard`** SFC), **so that** Pass **§6.3a / §8.6** can mark the admin UI free of the legacy generic instance shell and **20.6.3** can focus on differential-role / event-shape remnants only.

**Estimated size:** **L** (many call sites + `RelationshipCollection` + large composable surface).

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — domain-specific editors for shapes/instances, wizard settings, availability rules, integrations (target: **no** DB-driven admin metadata pipeline; see `FEATURE_20_ARCHITECTURE_REDESIGN.md` §6.3).

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Until the metadata stack is removed (Feature 20 Pass 6), some admin routes may still prefetch legacy metadata — treat that as **transitional**, not the end state.

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata` (legacy until removed), `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
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
- **Depends on** admin configuration data (wizard blocks, availability rules) served as **entities and settings** — document cross-domain deps in planning **Analysis** (booking must not assume a permanent admin-metadata-row model).
- **Scheduling rules:** Block instances, part ledger, PartFinalizer, event placement, and invariants are defined in **§8–§14** below.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Domain-specific editors + `EntityBase` / `ENTITY_CONFIGS` where generic CRUD remains; **target** is direct Vuetify forms per entity, not DB field-metadata-driven renderers (Principles §7.1, plan §6.3a).
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
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:**
  - **Inventory:** `.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md` (authoritative consumer list + façade note).
  - **Generic shell:** `client/src/components/admin/generic/EntityCard.vue` (orchestrates `EntityCardContent`, `EntityCardSubPanels`, `EntityCardPrimaryTitleRow`, parts/fee previews, expansion).
  - **Coupled SFCs:** `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`.
  - **Façade:** `client/src/components/admin/generic/AnnotationShapeListCard.vue` → wraps `EntityCard` for `annotationShape`.
  - **Direct `EntityCard` imports:** `BlockInstancesGroup.vue`, `ShapesTabEventPanel.vue`, `ShapesTabPartPanel.vue`, `ShapeCardList.vue`, `ShapeCreationForm.vue`, `BulkEditModal.vue`, `BlockInstanceCreateModal.vue`; **Annotations tab** uses **`AnnotationShapeListCard`** only (not `EntityCard` directly).
  - **Async nested use:** `RelationshipCollection.vue` → `defineAsyncComponent(() => import('../EntityCard.vue'))` for child rows / create rows.
  - **Composable cluster (prefix `useEntityCard`):** e.g. `useEntityCardForm`, `useEntityCardSaveAndActions`, `useEntityCardMetadata`, `useEntityCardFormSetup`, `useEntityCardFieldContextAndVisibility`, `useEntityCardExpansion`, `useEntityCardSubPanels`, `useEntityCardStoreSync`, `useEntityCardActions`, `useEntityCardSaveHandlers`, `useEntityCardSaveState`, `useEntityCardPrimaryTitleModels`, `useEntityCardAnnotationComposedMetadata`, `useEntityCardFieldConfiguration` — plus `types/admin/entityCard*.ts`, `utils/admin/entityCard*.ts`, `entityCardActionsPersistence.ts`, `entityCardConstants`.
- **Patterns / call sites:** **`FieldRenderer`** + **`EntityCardContent`** remain the field-rendering path inside the shell; **`useEntityCardForm`** wires vee-validate + store sync. **RelationshipCollection** is the heaviest consumer (dynamic children + create placeholders).
- **Gaps / unknowns:** Exact **split** between reusing **`EntityCardContent`** vs fully inlining per consumer is **task-level**; governance may require **`useEntityCardSaveAndActions`** return surface decomposition (pre-existing audit note) — schedule only if a task touches that file heavily.

## Analysis
- **Problem / why now:** **20.6.1** removed the server metadata stack and aligned **code-first** metadata on the client. The admin UI still mounts the **generic `EntityCard.vue`** shell at every inventory call site. **§6.3a** requires **deleting** that tree once replacements exist; inner behavior (**`EntityCardContent`**, **`FieldRenderer`**, **`useEntityCard*`** wiring) is already the “domain editor” — this session **re-homes** it under **domain-named parents** and drops the **`EntityCard`** SFC.
- **Domain boundaries:** **Client admin only** (`client/src/components/admin`, `views/admin`, `composables/admin`, `types/admin`, `utils/admin`). **No** booking **PartFinalizer** or new server routes.
- **Grounding:** See **## Codebase recon** and **`ENTITY_CARD_CONSUMERS_20.6.md`**; **`ARCHITECTURE.md`** for admin vs booking split.
- **Shared shell decision:** Do **not** promote **`AnnotationShapeListCard`** as the universal shell. Prefer **domain-named expansion-panel parents** that **compose** **`EntityCardContent`**, sub-panels, and existing composables. Optional **one** thin shared layout SFC mid-session if duplication is painful — **must not** reintroduce the name **`EntityCard`**.
- **Risks:** **RelationshipCollection** async child rows and **bulk/modal** flows are the highest regression risk; **governance** may flag large composable return surfaces — address only when a task edits that file materially.
- **Alternatives:** Keep **`EntityCard`** indefinitely — **rejected** by **§8.6**.

## Goal
**Session 20.6.2 only:** Eliminate **all** imports of **`EntityCard.vue`** (including **`defineAsyncComponent`**), refactor **`AnnotationShapeListCard`** so it does **not** wrap **`EntityCard`**, then **delete** **`EntityCard.vue`**, coupled **`EntityCard*.vue`** children, and **orphan** **`useEntityCard*`** / **`entityCard*`** modules **after** `rg EntityCard` shows **zero** consumer imports. Update **`ENTITY_CARD_CONSUMERS_20.6.md`** to reflect **retirement**. **Out of scope for 20.6.2:** **20.6.3** differential-role / event-shape remnants, **20.6.4** doc closeout — only **note** handoff if discovery forces a follow-up task.

## Files
- **Canonical (read-only):** `ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6**), `ARCHITECTURE.md`
- **Harness / PM:** `feature-domain-architecture-alignment-guide.md`, `phases/phase-20.6-guide.md`, **`ENTITY_CARD_CONSUMERS_20.6.md`**, `DOMAIN_REWRITE_WORKLOG.md`, `session-20.6.2-guide.md`
- **Implementation (this session):**
  - **Consumers:** `client/src/views/admin/tabs/components/BlockInstancesGroup.vue`, `ShapesTabEventPanel.vue`, `ShapesTabPartPanel.vue`, `ShapeCardList.vue`, `ShapeCreationForm.vue`, `BulkEditModal.vue`, `BlockInstanceCreateModal.vue`, `AnnotationShapeListCard.vue`, `RelationshipCollection.vue` (under `components/admin/generic/` or adjacent paths per repo layout)
  - **Tree to delete (last):** `EntityCard.vue`, `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`
  - **Composables / types / utils:** `client/src/composables/admin/useEntityCard*.ts`, `client/src/types/admin/entityCard*.ts`, `client/src/utils/admin/entityCard*.ts`, related constants/persistence modules **if** unused after delete

## Approach
1. **Consumer wave (Task 20.6.2.1):** For each **direct** importer and **`AnnotationShapeListCard`**, replace **`EntityCard`** with a **domain parent** that preserves **expansion**, **title row**, **save/delete**, and **field grid** behavior by composing **`EntityCardContent`** (and sub-panels) + existing composables. Run **`rg '\bEntityCard\b'`** after each cluster; smoke **Shapes**, **Instances**, **Annotations**, **modals**.
2. **RelationshipCollection + teardown (Task 20.6.2.2):** Remove **`defineAsyncComponent`** **`EntityCard`** usage; embed the same **inner** editing surface for nested rows / create placeholders. When **no** file imports **`EntityCard.vue`**, **delete** the SFC tree and **prune** dead **`useEntityCard*`** / types / utils; refresh **`ENTITY_CARD_CONSUMERS_20.6.md`** (empty or “retired” section).
3. **Verification:** **`npm run start:dev`**, **`cd client && npm run lint`**, **`cd server && npm run lint`**, **`vue-tsc` / `tsc`** as used in this repo after substantive TS edits; no new tests (project rule).

## Checkpoint
- **`/accepted-plan`:** Confirms **two tasks** cover **every** path in **`ENTITY_CARD_CONSUMERS_20.6.md`** plus **`RelationshipCollection`** and **teardown**.
- **After 20.6.2.1:** Zero **direct** `EntityCard` imports except **`RelationshipCollection`** (and any stragglers caught by grep).
- **After 20.6.2.2:** **`EntityCard.vue`** absent; inventory doc updated; **`DOMAIN_REWRITE_WORKLOG.md`** entry for EntityCard retirement.

## Deliverables
- **Replaced** all **`EntityCard`** consumer sites per inventory; **`AnnotationShapeListCard`** no longer wraps **`EntityCard`**.
- **Removed** **`EntityCard.vue`** and dependent generic SFCs; **pruned** unused composables/types/utils in the **`useEntityCard` / `entityCard`** cluster.
- **Updated** **`ENTITY_CARD_CONSUMERS_20.6.md`** and session **log / handoff** with smoke notes.

## Acceptance Criteria
- **`rg`** / project search: **no** `import ... EntityCard` or `from '.../EntityCard.vue'` and **no** `defineAsyncComponent(() => import('...EntityCard` in **`client/src`**.
- **Admin smoke:** Shapes tab (block / part / event panels), instances block group, annotations list, **bulk edit** and **block instance create** modals — **expand**, **edit field**, **save** (and **delete** where applicable) without console errors.
- **Lint / typecheck** green per Definition of Done.
- **Inventory doc** matches repo reality (no stale “still imports EntityCard” rows).

## Decomposition
- **Task 20.6.2.1 — List surfaces, modals, and annotation façade**
  - **Goal:** Remove **`EntityCard`** from **`BlockInstancesGroup`**, **`ShapesTabEventPanel`**, **`ShapesTabPartPanel`**, **`ShapeCardList`**, **`ShapeCreationForm`**, **`BulkEditModal`**, **`BlockInstanceCreateModal`**, and refactor **`AnnotationShapeListCard`** to compose **`EntityCardContent`** / composables **without** importing **`EntityCard.vue`**.
  - **Files:** Consumer Vue files above; possibly **new** thin `*EditorCard.vue` or inline templates in-place — **minimal** new abstraction unless duplication is clear.
  - **Checkpoint:** `rg EntityCard` shows **only** **`RelationshipCollection`** (and **internal** generic files not yet deleted) as remaining references to the **SFC**.

- **Task 20.6.2.2 — RelationshipCollection + delete tree**
  - **Goal:** Replace async **`EntityCard`** embedding in **`RelationshipCollection`** with the same editing UX using **composed** inner pieces; then **delete** **`EntityCard*.vue`**, **orphan** composables/types/utils, update **`ENTITY_CARD_CONSUMERS_20.6.md`**, final grep + smoke.
  - **Files:** `RelationshipCollection.vue`; full **`EntityCard*`** tree; `useEntityCard*` / `entityCard*` modules as proven dead.
  - **Checkpoint:** **Zero** **`EntityCard.vue`** on disk; **inventory** and **worklog** updated; DoD checks pass.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
