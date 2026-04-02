# Plan: task 20.4.4.1 — `perspectiveResolver`: single-arg `resolveEventShapes` + dedupe `derivePerspective`

## Contract
- **Tier:** task | **ID:** 20.4.4.1
- **Scope:** Remove the unused **`overrides`** parameter from **`resolveEventShapes`** / **`resolveEventShapesCore`** (placement-only booking). Refactor **`derivePerspective`** to call **`resolveEventShapes(slot.shape.slotShape.eventFinals)`** and reuse **`ResolvedEventShapes`** for **`derivePerspectiveWithResolved`**, preserving the **`!hasMajorMinorPair`** fallback (**`totalTimeRange`** vs **`derivePerspectiveNoEventFinals`**). **Touch only** `perspectiveResolver.ts` unless **`vue-tsc`** surfaces an external callsite (unexpected).
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
- [ ] #### Task 20.4.4.1: `perspectiveResolver` — dead `resolveEventShapes` overrides + dedupe `derivePerspective` **Goal:** Drop unused **`overrides`** param from **`resolveEventShapes`**; route **`derivePerspective`** through **`resolveEventShapes`** + **`derivePerspectiveWithResolved`**. **Files:** `client/src/utils/booking/perspectiveResolver.ts` (callers already single-arg) **Approach:** Refactor + **`vue-tsc`** / client lint. **Checkpoint:** Same perspective behavior for placement-only slots.

## Parent context (session planning — Analysis excerpt)

- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**;… _(truncated)_

## Story
**This task changes** **`perspectiveResolver`** public API and **`derivePerspective`** internals **because** **`overrides`** is dead after **20.4.3**, and duplicating **`resolveDifferentialMajorMinorFromEventShapes`** invites drift.

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

- **Paths reviewed:** `client/src/utils/booking/perspectiveResolver.ts` (full file); ripgrep **`resolveEventShapes(`** under `client/`, `.project-manager` excluded.
- **Patterns / call sites:** **`resolveEventShapes`** is called from **`appointmentSlotBuilder.applyShapeToTime`** and **`minimizerSchedulingBounds.extractInnerBoundary`** with **one argument** only. **`resolveEventShapes`** / **`resolveEventShapesCore`** still accept optional **`overrides`** — unused. **`derivePerspective`** calls **`resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)`** then **`resolvedShapesFromMajorMinorPair(pair)`** — duplicates the work inside **`resolveEventShapesCore`**.
- **Gaps / unknowns:** None expected; re-grep after edit for **`resolveEventShapes(`** arity.

## Analysis
- **Problem:** Dead parameter and duplicated major/minor resolution between **`resolveEventShapes`** and **`derivePerspective`**.
- **Boundaries:** **`client/src/utils/booking/perspectiveResolver.ts`** only for this task (**20.4.4.2** owns minimizer/shared).
- **Risks:** **`derivePerspective`** branch **`!pair.hasMajorMinorPair`** must stay behavior-identical: use **`resolved.majorEventShape == null`** (equivalent to no pair from **`resolvedShapesFromMajorMinorPair`**) before **`totalTimeRange`** fallback.

## Design
1. **`resolveEventShapesCore(eventFinals)`** — call **`resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)`** (single arg); remove **`overrides`** from signature.
2. **`resolveEventShapes(eventFinals)`** — single parameter; update JSDoc if any.
3. **`derivePerspective`:** `const resolved = resolveEventShapes(eventFinals)`; if **`!resolved.majorEventShape`** then **`return slot.totalTimeRange ?? derivePerspectiveNoEventFinals(...)`**; else **`derivePerspectiveWithResolved(slot, perspective, resolved)`**.
4. Remove unused **`DifferentialRole`** import if no longer referenced in this file.
5. **`npx vue-tsc -b`** (or project script) + **`cd client && npm run lint`**.

### Implementation Orders
1. Edit **`perspectiveResolver.ts`** per above.
2. Grep **`resolveEventShapes`**; fix any stale two-arg call (none expected).
3. Lint + typecheck.

## Goal
**Task 20.4.4.1 only:** **`resolveEventShapes`** is single-arg; **`derivePerspective`** uses it; no behavior change for placement-only slots.

## Files
- `client/src/utils/booking/perspectiveResolver.ts`

## Approach
Refactor in one file; verify with **grep**, **vue-tsc**, **eslint**.

## Checkpoint
- **`derivePerspective`** still returns **`totalTimeRange`** when there is no major+minor pair (non-differential / single-final cases).

## Deliverables
- Updated **`perspectiveResolver.ts`**; no **`DifferentialRole`** in this module unless still required.

## Acceptance Criteria
- **`resolveEventShapes`** has exactly **one** parameter (**`eventFinals`**).
- **`derivePerspective`** does not call **`resolveDifferentialMajorMinorFromEventShapes`** directly (only via **`resolveEventShapes`** chain).
- **Client** **lint** + **vue-tsc** clean.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
