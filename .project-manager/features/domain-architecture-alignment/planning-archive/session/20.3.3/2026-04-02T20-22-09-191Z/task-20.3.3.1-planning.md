# Plan: task 20.3.3.1 — 20.3.3.1

## Contract
- **Tier:** task | **ID:** 20.3.3.1
- **Scope:** 20.3.3.1
- **Governance (harness snapshot):**
  - Governance Context (Task)
  - File-Scoped Violations
  - Thresholds (Quick Reference)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [ ] #### Task 20.3.3.1: Time & price atomic part editors (mirror 20.3.2) **Goal:** Part-ledger VCard + table for **time** and **price** `blockInstance`, same resolution/update pattern as **ServiceAtomicEditor**. **Files:** - `client/src/composables/admin/` (composable(s)) - `client/src/components/admin/generic/` (editor component(s)) - `client/src/components/admin/generic/EntityCardContent.vue` **Approach:** Reuse or generalize **20.3.2** patterns; explicit types; logger on failed updates. **Checkpoint:** Lint + type-check; manual smoke on Instances tab for time + price shapes.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment… _(truncated)_

## Story
This task adds **time**- and **price**-shaped **block instance** part ledgers in admin (**VCard + VDataTable**) by **generalizing** the **20.3.2** composable + editor pattern, **because** §8.3 #3 requires parity with **service** convergence UX without triplicating resolution, drafts, and **`partInstance` update** wiring.

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

## Codebase recon (agent-led — required)
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:**
  - `client/src/composables/admin/useServiceAtomicPartRows.ts` — **SERVICE** gate + `partAssignments` / `resolvePartInstancesByChildIds` pipeline
  - `client/src/components/admin/generic/ServiceAtomicEditor.vue` — drafts map, blur-save, **`useEntityCrud('partInstance').update`**
  - `client/src/components/admin/generic/EntityCardContent.vue` — **`ServiceAtomicEditor`** mount (`blockInstance` && `!isNew`)
  - `client/src/constants/blockShapeTypes.ts` — **`TIME`**, **`PRICE`**, **`SERVICE`**
  - `client/src/types/admin/serviceAtomicPartRows.ts` — **`ServiceAtomicPartRow`** / return type (reusable for all atomic ledgers)
- **Patterns / call sites:** **20.3.2** split concerns: **composable** = shape gate + ordered rows; **component** = table + persistence. **Time/price** share the **same** row shape and columns as **service** today (`PartInstanceEntity` scalars).
- **Gaps / unknowns:** Future **per-unit** columns (ARCHITECTURE §10) are **out of scope** until types/API expose them; this task stays on current fields only.

## Analysis
- **Problem / why now:** **Service** instances already have **ServiceAtomicEditor**; **time** / **price** orchestration domains need the **same** part-ledger visibility for admins (session **20.3.3**).
- **Boundaries:** **Client admin** only; **no** server or PartFinalizer changes; **no** **event** copy work here (**20.3.3.2**).
- **Approach constraint:** **DRY** — extract a **parameterized** composable (allowed `blockShape.type` set) and a **single** table component with **title/subtitle** props; keep **`useServiceAtomicPartRows`** as a thin **SERVICE**-only wrapper for stable imports.
- **Risks:** Refactor regression on **ServiceAtomicEditor** — mitigate with **unchanged** service mount path and **lint + type-check** after refactor.
- **Alternatives:** Copy-paste **ServiceAtomicEditor** twice — **rejected** (governance + drift).

## Design

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

## Goal
Deliver **time** and **price** **`blockInstance`** part-ledger editors (**VCard + VDataTable**, same **`partAssignments`** resolution and **`partInstance` update** behavior as **20.3.2**) by **generalizing** the existing service implementation; **service** UX remains correct after refactor.

## Files
- **New:** `client/src/composables/admin/useAtomicPartLedgerRows.ts` (or merge into existing module if preferred), `client/src/components/admin/generic/AtomicPartLedgerEditor.vue`, `client/src/components/admin/generic/TimePriceAtomicPartLedgerEditor.vue` (thin wrapper)
- **Modify:** `useServiceAtomicPartRows.ts`, `ServiceAtomicEditor.vue`, `EntityCardContent.vue`
- **Optional:** `client/src/types/admin/serviceAtomicPartRows.ts` — only if return type / interface names need a neutral **`AtomicPartLedger`** alias
- **Reference:** `blockInstancePartsTotalsResolution.ts`, `session-20.3.3-guide.md`

## Approach
1. Implement **`useAtomicPartLedgerRows`** + refactor **`useServiceAtomicPartRows`**; add **`useTimePriceAtomicPartRows`** (or inline allowed-types in wrapper only).
2. Extract table UI to **`AtomicPartLedgerEditor`**; slim **`ServiceAtomicEditor`**; add **time/price** wrapper + **`EntityCardContent`** mount.
3. **`cd client && npm run lint`** and **`npm run type-check`**; manual Instances tab: one **time** and one **price** shape show the new card; **service** card still shows **ServiceAtomicEditor** only.

## Checkpoint
- Refactor leaves **service** behavior unchanged (smoke).
- **Time** / **price** instances show the new editor; **event** / **user** instances show **neither** service nor time/price ledger cards.

## Deliverables
- [ ] Parameterized composable + **time/price** entry point.
- [ ] Shared **AtomicPartLedgerEditor** + **TimePrice** wrapper + **EntityCardContent** wiring.
- [ ] **Service** path still works; **lint** + **vue-tsc** clean.

## Acceptance Criteria
- [ ] **`blockShape.type === 'time'`** or **`'price'`** → time/price ledger visible (when `!isNew`); **`service`** → only service editor; other types → no atomic ledger from this task.
- [ ] Row order and **`partInstance`** persistence match **20.3.2** semantics (blur/checkbox patterns preserved).
- [ ] **`npm run lint`** and **`npm run type-check`** pass in **`client/`**.

## Implementation Orders

**Implement the task now** (write code per Goal/Files/Approach). When complete, run **`/task-end 20.3.3.1`**. Do not run task-end until code changes are done.

1. Add **`useAtomicPartLedgerRows`** with **`allowedShapeTypes`**; refactor **`useServiceAtomicPartRows`** to use it; add **`useTimePriceAtomicPartRows`** (or equivalent).
2. Extract **`AtomicPartLedgerEditor.vue`** from **ServiceAtomicEditor** logic; make **ServiceAtomicEditor** a thin **SERVICE**-typed wrapper.
3. Add **`TimePriceAtomicPartLedgerEditor.vue`** and mount in **`EntityCardContent.vue`** for **`blockInstance` && !isNew`**.
4. Run **`npm run lint`** and **`npm run type-check`** in **`client/`**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
