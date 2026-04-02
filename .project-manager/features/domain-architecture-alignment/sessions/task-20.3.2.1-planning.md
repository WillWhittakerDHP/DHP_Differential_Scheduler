# Plan: task 20.3.2.1 — 20.3.2.1

## Contract
- **Tier:** task | **ID:** 20.3.2.1
- **Scope:** 20.3.2.1
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
- [ ] #### Task 20.3.2.1: Service atomic row model (composable) **Goal:** Resolve typed **part-instance rows** for a **service** `blockInstance` using existing `partAssignments` resolution (`blockInstancePartsTotalsResolution` / same lineage as `usePartsTotals`); gate on `blockShape.type === 'service'`. **Files:** - `client/src/utils/admin/blockInstancePartsTotalsResolution.ts` (reuse) - `client/src/composables/admin/useServiceAtomicPartRows.ts` (new, or agreed name) - `client/src/types/admin/` (optional row DTO type file) **Approach:** Pure composable + explicit return type; document column m (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side r… _(truncated)_

## Story
This task adds a **focused composable** that exposes **typed part-instance rows** for a **service** `blockInstance`, reusing the same **partAssignments → ordered child IDs → partInstance entities** pipeline as `usePartsTotals`. **20.3.2.2** will mount **ServiceAtomicEditor** on top of this data; without the composable, the editor would duplicate relationship resolution and logging.

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
  - `client/src/utils/admin/blockInstancePartsTotalsResolution.ts` — `blockShapeAllowsParts`, `activeChildIdsForBlockParent`, `resolvePartInstancesByChildIds`
  - `client/src/composables/admin/usePartsTotals.ts` — `useRelationshipCrud('partAssignments')`, `useEntityCrud('partInstance')`, `useGlobal()` for `blockInstance` + `blockShape`; duplicate/missing logging
  - `client/src/constants/blockShapeTypes.ts` — `BLOCK_SHAPE_TYPES.SERVICE` vs `blockShapeAllowsParts` (non-`user` only)
  - `client/src/types/entities.ts` — `PartInstanceEntity` fields (`baseTime`, `baseFee`, `rateOverBaseTime`, `rateOverBaseFee`, `zeroOutPart`, `partShapeRef`, …)
  - `client/src/types/admin/partsTotals.ts` — `UsePartsTotalsReturn` pattern (explicit return type, `ComputedRef` reads)
  - `client/src/components/admin/generic/EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue` — consumers of `usePartsTotals`
- **Patterns / call sites:** Resolution is **client admin store** only: relationships named **`partAssignments`** with `parentId` = block instance id, `childId` = part instance id; order preserved via `activeChildIdsForBlockParent` then `resolvePartInstancesByChildIds`. Totals use `calculatePartsTotals` in `usePartsTotals`; this task returns **per-row view data**, not aggregates.
- **Gaps / unknowns:** **Part shape display names** for table columns: resolve via `getGlobalEntityById('partShape', row.partShapeRef)` in composable or leave to **20.3.2.2** if we only expose `partShapeRef` + raw `PartInstanceEntity` in rows — prefer including **resolved part shape `name`** in row DTO to keep UI thin.

## Analysis
- **Problem / why now:** Session **20.3.2** needs a **convergence table** for **service** instances. **20.3.2.1** isolates **data shaping + service gate** so **20.3.2.2** stays a thin **VDataTable** + save wiring.
- **Boundaries:** **Client admin only** (`client/src/composables/admin/`, `client/src/types/admin/`). No new API routes; uses existing global entity + relationship CRUD composables (same as `usePartsTotals`).
- **Alignment:** Reuse **`blockInstancePartsTotalsResolution`** helpers; add **`blockShape.type === BLOCK_SHAPE_TYPES.SERVICE`** gate (stricter than `blockShapeAllowsParts`, which allows time/event/price shapes too — **atomic editor is service-only** per §8.3 #2).
- **Child tier (20.3.2.2):** Import composable; render rows; persist via existing **partInstance** update flows (`PartInstanceBulkEditModal` patterns).
- **Risks:** Duplicate logic vs `usePartsTotals` — mitigate by calling the **same pure helpers** and mirroring logging patterns (`createLogger`, warn on duplicates/missing ids).
- **Alternatives:** Extend `usePartsTotals` with a `rows` export — **rejected** to avoid widening a totals-focused API and to keep **service-only** semantics explicit in a dedicated composable.

## Design
**New file:** `client/src/composables/admin/useServiceAtomicPartRows.ts`

**Public API (sketch):**
- `useServiceAtomicPartRows(blockInstanceId: string)` with explicit return type, e.g. `UseServiceAtomicPartRowsReturn`.
- **Computed flags:** `isServiceBlockInstance` (true when entity is `blockInstance`, shape exists, `shape.type === 'service'`).
- **Computed rows:** `ServiceAtomicPartRow[]` — empty when not a service instance.

**Row DTO** (`client/src/types/admin/serviceAtomicPartRows.ts` or co-located type + export):
- `partInstance: PartInstanceEntity` (or pick fields) + `partShapeName: string` (resolved label; fallback empty string + `logger.debug` if shape missing).
- Document mapping to **convergence columns**: `name` (part instance `name`), `baseTime`, `baseFee`, `rateOverBaseTime`, `rateOverBaseFee`, `zeroOutPart`.

**Internals (pseudocode):**
1. `useGlobal`, `useRelationshipCrud('partAssignments')`, `useEntityCrud('partInstance')` — same as `usePartsTotals`.
2. Resolve `blockInstance` + `blockShape`; if missing or type !== `service` → empty rows.
3. `activeChildIdsForBlockParent(partAssignments, blockInstanceId)` → `resolvePartInstancesByChildIds` — same order as totals.
4. Optional: `hadDuplicates` / `missingIds` → `logger.warn` with same metadata shape as `usePartsTotals`.
5. Map each `PartInstanceEntity` to row + resolve part shape name.

**Out of scope for 20.3.2.1:** Vue components, `EntityCardContent`, mutations (handled in **20.3.2.2**).

## Goal
Implement **`useServiceAtomicPartRows`** (or agreed name) that returns **typed, ordered rows** of part instances for a **`blockInstance`** whose **`blockShape.type` is `service`**, using the same **`partAssignments` resolution** as `usePartsTotals` (`blockInstancePartsTotalsResolution` helpers). Rows must be sufficient for **20.3.2.2** to render **convergence** columns without re-deriving relationships.

## Files
- **New:** `client/src/composables/admin/useServiceAtomicPartRows.ts`
- **New (optional but preferred):** `client/src/types/admin/serviceAtomicPartRows.ts` — `ServiceAtomicPartRow`, `UseServiceAtomicPartRowsReturn`
- **Reuse (no behavioral change unless a tiny shared export is needed):** `client/src/utils/admin/blockInstancePartsTotalsResolution.ts`
- **Reference only:** `client/src/composables/admin/usePartsTotals.ts`, `client/src/constants/blockShapeTypes.ts`, `client/src/types/entities.ts` (`PartInstanceEntity`)

## Approach
1. Add row + return types with **explicit exported return type** on the composable (`Composable` governance).
2. Gate with **`BLOCK_SHAPE_TYPES.SERVICE`**; return empty rows and `isServiceBlockInstance: false` for non-service or missing entities.
3. Reuse **`activeChildIdsForBlockParent`** + **`resolvePartInstancesByChildIds`**; mirror **`usePartsTotals`** logging for duplicates and missing instances.
4. Resolve **part shape `name`** per row via `getGlobalEntityById('partShape', …)`; log missing shapes at **warn** or **debug** per frequency (prefer **debug** for shape, **warn** for missing instance ids).
5. Do **not** add UI files in this task.

## Checkpoint
- Composable is importable; **vue-tsc** clean for new files.
- For a dev **service** `blockInstance` with `partAssignments`, `rows` length matches ordered part instances; for **non-service** shapes, `rows` is `[]`.

## Deliverables
- [ ] `useServiceAtomicPartRows` composable with documented row ↔ `PartInstanceEntity` column mapping (file header or types file).
- [ ] Typed `ServiceAtomicPartRow` (and return interface) in `client/src/types/admin/` if not inlined.
- [ ] No new server or shared-package changes.

## Acceptance Criteria
- [ ] **`isServiceBlockInstance`** is true only when the instance exists and **`blockShape.type === 'service'`**.
- [ ] **Row order** matches **`partAssignments`** child order (after dedupe), consistent with **`usePartsTotals`**.
- [ ] Each row exposes convergence fields needed for the table: at minimum **instance `name`**, **`baseTime`**, **`baseFee`**, **`rateOverBaseTime`**, **`rateOverBaseFee`**, **`zeroOutPart`**, plus **part shape label** (or documented placeholder).
- [ ] **Logger** used on recoverable anomalies (duplicate/missing ids; optional missing part shape), not silent catches.
- [ ] **`cd client && npm run lint`** passes for touched files.

## Implementation Orders

**Implement the task now** (write code per Goal/Files/Approach). When complete, run **`/task-end 20.3.2.1`**. Do not run task-end until code changes are done.

1. Add **`client/src/types/admin/serviceAtomicPartRows.ts`** with `ServiceAtomicPartRow` and `UseServiceAtomicPartRowsReturn` (flat, testable surface; prefer `< 10` public properties per composable governance).
2. Implement **`useServiceAtomicPartRows(blockInstanceId: string)`** in **`client/src/composables/admin/useServiceAtomicPartRows.ts`**: inject global + partAssignments + partInstance stores; service gate; reuse resolution helpers from **`blockInstancePartsTotalsResolution`**; build rows with part shape names; `createLogger('useServiceAtomicPartRows')` on anomaly paths.
3. Run **`cd client && npm run lint`** and fix any new issues.
4. **Optional:** Add a one-line **dev-only** import or comment in **`EntityCardContent.vue`** is **out of scope** — no UI in this task.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
