# Plan: task 20.3.2.2 — 20.3.2.2

## Contract
- **Tier:** task | **ID:** 20.3.2.2
- **Scope:** 20.3.2.2
- **Governance (harness snapshot):**
  - Governance Context (Task)
  - File-Scoped Violations
  - No existing violations in task files.
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
- [ ] #### Task 20.3.2.2: ServiceAtomicEditor UI + EntityCard integration **Goal:** **VCard + VDataTable** (or equivalent) mounted from `EntityCardContent` for **service** instances only; surface convergence columns; save via existing **partInstance** update path; convergence-oriented labels. **Files:** - `client/src/components/admin/generic/ServiceAtomicEditor.vue` (new) - `client/src/components/admin/generic/EntityCardContent.vue` - (reference) `client/src/components/admin/PartInstanceBulkEditModal.vue`, `client/src/components/admin/generic/EntityCardFeePreview.vue` **Approach:** Conditional (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side r… _(truncated)_

## Story
This task adds **ServiceAtomicEditor** (VCard + VDataTable) so admins see and edit **work items** (part instances) for **service** block instances **inside the same EntityCard** they already use. **20.3.2.1** supplies rows; this task wires **UI + `useEntityCrud('partInstance').update`** so convergence fields persist without new APIs.

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
  - `client/src/composables/admin/useServiceAtomicPartRows.ts` + `client/src/types/admin/serviceAtomicPartRows.ts` — row DTO + service gate (task **20.3.2.1**)
  - `client/src/components/admin/generic/EntityCard.vue` — wraps **EntityCardFeePreview** then **EntityCardContent** for `blockInstance`; **EntityCardPartsTotals** in expansion title
  - `client/src/components/admin/generic/EntityCardContent.vue` — main form body; already has `entityKey`-conditional **EventInstanceTemplateRef** / **AnnotationContentEditor**
  - `client/src/components/admin/PartInstanceBulkEditModal.vue` — part field semantics (`baseTime`, `rateOverBaseTime`, `baseFee`, `rateOverBaseFee`); uses **useEntityCrud** / **useGlobal** for assignments
  - `client/src/composables/entityCrud/useEntityCrud.ts` — **`update(partial, id)`** for **`partInstance`**
  - `client/src/views/admin/tabs/components/*TableDataGrid.vue` — **VDataTable** + slots patterns (editable admin grids)
- **Patterns / call sites:** Instance cards use **VExpansionPanel** + inner content div (not nested VCard). **Fee preview** sits in **EntityCard**, not **EntityCardContent**; placing the atomic table **at the top of EntityCardContent** keeps it with form context and matches session “mount from EntityCardContent.” **Persist:** same **`useEntityCrud('partInstance').update`** as elsewhere — partial payload per field.
- **Gaps / unknowns:** Row **name** editing — if metadata marks `name` as sensitive, still allow update via API for admin; use **number** inputs for numeric columns with validation aligned to **PartInstanceEntity** types.

## Analysis
- **Problem / why now:** Completes **§8.3 #2** UX: a **convergence-first** ledger per **service** instance, reusing **20.3.2.1** data.
- **Boundaries:** **Client admin UI only**; **no** server routes; **no** PartFinalizer changes (ARCHITECTURE.md booking boundary).
- **Dependencies:** **`useServiceAtomicPartRows`** must stay the single source of row order and service gating; editor is **presentational + save orchestration**.
- **Risks:** **Component/script size** — if **ServiceAtomicEditor** approaches thresholds, extract **`useServiceAtomicEditorActions`** (save, loading, error toast) to a composable with explicit return type.
- **Alternatives:** Mount in **EntityCard.vue** below **EntityCardFeePreview** — **rejected** for this task to match agreed **EntityCardContent** integration and keep **EntityCard.vue** coupling lower.

## Design

**1. `ServiceAtomicEditor.vue` (new)**  
- **Props:** `blockInstanceId: string` (required when mounted).  
- **Behavior:** Call **`useServiceAtomicPartRows(blockInstanceId)`**. Render **nothing** unless **`isServiceBlockInstance`** (composable already enforces service shape).  
- **Layout:** **VCard** (variant tonal, class for spacing) → **VCardTitle** + **VCardText** with **VDataTable**  
  - **Title / subtitle copy:** convergence-oriented (e.g. “Work items” / “Per-part time and fee for this service”).  
  - **Table:** `items` = `rows`; `item-value` = `partInstance.id`; **dense** + **horizontal scroll** wrapper (`overflow-x-auto`) for narrow panels.  
  - **Columns:** Part shape (text), Work item name (editable or read-only — prefer editable **VTextField** density compact), **baseTime**, **rateOverBaseTime**, **baseFee**, **rateOverBaseFee**, **zeroOutPart** (**VCheckbox**).  
- **Save:** On blur or small “Apply” per row — prefer **debounced blur** or **explicit row save** to avoid N mutations per keystroke; minimal viable: **@update:model-value** with **throttle** or **save on blur** per cell. **Implementation choice:** **blur-to-save** per field to limit API chatter.  
- **Persistence:** `useEntityCrud('partInstance').update({ [field]: value }, partInstance.id)`; **createLogger** on failure; no empty catch.  
- **Loading/disabled:** optional `isSaving` ref during `update` promise.

**2. `EntityCardContent.vue`**  
- After **EventInstanceTemplateRef** (or top of stacked content), add:  
  `ServiceAtomicEditor` when **`entityKey === 'blockInstance' && !isNew`** with **`:block-instance-id="entity.id"`**.

**3. Out of scope**  
- Bulk apply across rows (use existing **PartInstanceBulkEditModal**).  
- **eventInstance** / placement UI (**20.3.1**).

## Goal
Add **ServiceAtomicEditor.vue** (**VCard + VDataTable**) and mount it from **EntityCardContent** for **existing** **`blockInstance`** cards. Show **convergence** columns (**part shape**, **work item name**, **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart**) sourced from **`useServiceAtomicPartRows`**. **Persist** edits via **`useEntityCrud('partInstance').update`**. **Copy** uses **work items / convergence** language. **No** new server endpoints.

## Files
- **New:** `client/src/components/admin/generic/ServiceAtomicEditor.vue`
- **Modify:** `client/src/components/admin/generic/EntityCardContent.vue` (conditional import + mount)
- **Reuse:** `client/src/composables/admin/useServiceAtomicPartRows.ts`, `client/src/types/admin/serviceAtomicPartRows.ts`
- **Reference:** `PartInstanceBulkEditModal.vue`, `EntityCardFeePreview.vue`, `*TableDataGrid.vue` (VDataTable patterns)
- **PM / canon:** `session-20.3.2-guide.md`, `task-20.3.2.1-handoff.md`, `ARCHITECTURE.md` §8–9

## Approach
1. Implement **ServiceAtomicEditor** with thin script: composable for rows + **update** calls; template = VCard + VDataTable + slots.
2. Integrate at top of **EntityCardContent** body for **`blockInstance` && !isNew**.
3. **Lint + vue-tsc**; manual smoke: Instances → **service** block → table appears; **non-service** → no table; edit one number → reload reflects change.

## Checkpoint
- Table **only** when composable **`isServiceBlockInstance`** (and card is not new).
- At least one field **persists** through **`partInstance` update** and visible after global data refresh.

## Deliverables
- [ ] `ServiceAtomicEditor.vue` with convergence-oriented titles and documented column semantics (brief header comment).
- [ ] `EntityCardContent.vue` integration for `blockInstance` / `!isNew`.
- [ ] No new API routes; logger on failed updates.

## Acceptance Criteria
- [ ] **Service-only:** Non-service `blockInstance` cards show **no** atomic editor (composable gate).
- [ ] **New instance:** No editor when **`isNew`** (no stable part ledger UX until saved).
- [ ] **Columns** match **20.3.2.1** row fields + editable persistence for numeric/fee/time + **zeroOutPart**.
- [ ] **`cd client && npm run lint`** and **`npm run type-check`** pass.

## Implementation Orders

**Implement the task now** (write code per Goal/Files/Approach). When complete, run **`/task-end 20.3.2.2`**. Do not run task-end until code changes are done.

1. Create **`ServiceAtomicEditor.vue`**: props `blockInstanceId`; use **`useServiceAtomicPartRows`** + **`useEntityCrud('partInstance')`**; VCard + VDataTable; blur or controlled update per field; **`createLogger`** on errors.
2. Update **`EntityCardContent.vue`**: register component; **`v-if="entityKey === 'blockInstance' && !isNew"`** pass **`entity.id`**.
3. Run **`cd client && npm run lint`** and **`npm run type-check`**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
