# Plan: task 20.4.2.2 — Slot shape, time axis, perspective, minimizer (placement-first)

## Contract
- **Tier:** task | **ID:** 20.4.2.2
- **Scope:** Placement-first event shape selection for slot differential offsets, perspective major/minor pair resolution, and minimizer segment listing; reduce booking reliance on `major`/`minor` role string lookups. Preserve empty-override behavior; no server PartFinalizer.
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
Task **20.4.2.1** complete (`dfd18ce8`); session log updated. Implement **20.4.2.2** per session guide.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase **20.4** session **20.4.1** documented the pipeline and removed only confirmed dead code. Session **20.4.2** is the first **behavioral** step toward FEATURE_20 **§4.3**: stop treating “differential role” as a separate enrichment pass on finals; express scheduling/placement from **event instances + placement data** and grouping, preserving **lineage*… _(truncated)_

## Story
**This task changes** how booking picks **primary vs secondary** (and **minimizer/floating**) event shapes for **differential offsets**, **perspective**, and **minimizer grids** **because** FEATURE_20 requires **placement_kind** to drive layout, not **differential role** strings layered on top of placement.

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

- **Paths reviewed:** `client/src/utils/booking/partFinalizerSlotShape.ts` (**`calculateSlotShape`** → helpers), `partFinalizerSlotShapeHelpers.ts` (**`computeDifferentialOffsetsFromMaps`** uses **`getEventShapeByRoleWithOverrides`** with **`'major'` / `'minor'`**), `perspectiveResolver.ts` (**`resolveEventShapes`** → **`resolveDifferentialMajorMinorFromEventShapes`** in `eventAttendeeUtils.ts`), `appointmentSlotBuilder.ts` (**`applyShapeToTime`** — major/minor time ranges), `minimizerEventShapes.ts` (**`eventShapeDifferentialRoleFromPlacementFields`** + **`effectiveDifferentialRole`** to detect minimizer segments), `minimizerSchedulingBounds.ts` (**`resolveEventShapes`** for “major” end time). `shared/utils/eventPlacementUtils.ts` — **`EventPlacementKind`**, **`differentialRoleFromPlacement`**, **`eventShapeDifferentialRoleFromPlacementFields`** (primary→major, secondary→minor, floating→minimizer). `client/src/types/entities.ts` — **`EventShapeEntity.placementKind`**.
- **Patterns / call sites:** Differential **offsets** and **perspective** still **select event shapes by derived scheduling role** (`major` / `minor`) via **`getEventShapeByRoleWithOverrides`**, which internally maps **placement → role** then compares. FEATURE_20 **§4.3** / **§8.4** ask for **placement-native** selection (primary/secondary/floating) so booking does not depend on the **role string** as the primary key.
- **Gaps / unknowns:** Multiple shapes with same **placement_kind** — preserve **first-match** semantics consistent with current **`Array.find`**. **Non-empty** **`differentialEventRoleOverrides`** (future) may still need **`effectiveDifferentialRole`**; task preserves override behavior where it exists today.

## Analysis
- **Problem / why now:** **20.4.2.1** removed **`PartFinal`** role ternaries and enrichment. Downstream slot/perspective/minimizer still **name** and **select** shapes using **`major` / `minor`** roles. This task aligns **§4.2** steps **6–10** inputs with **placement_kind / anchor_edge** as the explicit scheduling dimensions.
- **Boundaries:** **Client booking** + **`@shared/eventPlacementUtils`** (small pure helpers acceptable if both admin and booking need them; prefer **client-local** helpers unless a second consumer appears in the same change set).
- **Risks:** Changing selection order or tie-breaks could shift which shape wins when data is ambiguous — keep **deterministic** ordering (e.g. same array order as today). **Minimizer** path must still exclude **marginal** (margin) segments from **floating/minimizer** completion grid semantics.
- **Alternatives:** Rename all UI/API strings from “major/minor” to “primary/secondary” in one task — **deferred** (large blast radius); keep external **`ResolvedEventShapes`** field names **`majorEventName`** / **`minorEventName`** unless a follow-up explicitly renames (internal logic uses placement).

## Design
1. **Shared selection helper (client):** Add a small pure module or functions (e.g. in `eventAttendeeUtils.ts` or `partFinalizerSlotShapeHelpers.ts`) that, given **`EventShapeEntity[]`** candidates and optional **`mergedRoleOverrides`**, returns **primary** (**`placementKind === 'primary'`** or default) and **secondary** (**`placementKind === 'secondary'`**) shapes using **placement fields first**, applying **`effectiveDifferentialRole`** only where overrides require parity with today’s behavior.
2. **`computeDifferentialOffsetsFromMaps`:** Replace **`getEventShapeByRoleWithOverrides(..., 'major'/'minor')`** with the placement-based helper (same duration math).
3. **`resolveDifferentialMajorMinorFromEventShapes`:** Reimplement to use the same placement-based selection so **`resolveEventShapes`** / **`applyShapeToTime`** stay consistent with slot offsets.
4. **`minimizerEventShapes`:** Prefer **`placementKind === 'floating'`** (with existing override/effective-role rules for edge cases) instead of **`effective === 'minimizer'`** as the primary filter, documenting equivalence when overrides are empty.
5. **`calculateSlotShape` / `applyShapeToTime`:** Adjust only if signatures or call sites require; avoid server-side resolution.
6. **Dead imports:** Remove **`DifferentialRole`** / role-only imports in touched files when no longer referenced; **§6.2** shared deletes only if **booking** grep is clean (admin may still import **`differentialRoleUtils`**).

## Goal
Rewrite booking **slot differential offsets**, **perspective resolution**, and **minimizer segment discovery** to select **event shapes by `placement_kind` / `anchor_edge`** (and overrides where required), not by **`'major'` / `'minor'` role string lookups** as the primary mechanism — preserving behavior for empty **`differentialEventRoleOverrides`** and existing wizard flows.

## Files
- `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`
- `client/src/utils/eventAttendeeUtils.ts`
- `client/src/utils/booking/minimizerEventShapes.ts`
- `client/src/utils/booking/perspectiveResolver.ts` (only if re-exports or thin wrappers need updates)
- `client/src/utils/booking/partFinalizerSlotShape.ts` (only if **`calculateSlotShape`** signature / imports simplify)
- Optional: `shared/utils/eventPlacementUtils.ts` — only if a **shared** pure helper reduces duplication without pulling Vue types

## Approach
1. Introduce placement-first selection used by **both** **`computeDifferentialOffsetsFromMaps`** and **`resolveDifferentialMajorMinorFromEventShapes`** (single source of truth).
2. Update **minimizer** segment listing to **placement-first** filtering; run **`cd client && npm run lint`**.
3. **Grep** **`client/src/utils/booking`** for **`getEventShapeByRoleWithOverrides`** and **`'major'`** / **`'minor'`** string literals in slot/perspective/minimizer paths; remove or narrow to tests/admin boundaries.
4. Manual smoke (advisory): availability step with differential + minimizer grid if time permits.

## Checkpoint
- Slot **differential offsets** and **perspective** pair derive from **primary/secondary** placement (or documented equivalent with overrides).
- **`minimizerEventShapes`** does not rely solely on derived role **`=== 'minimizer'`** for the default path.
- **`npm run lint`** (**`client/`**) passes.

## Deliverables
- Code updates in the files above; concise comments **WHY** placement-first (FEATURE_20 / §4.3).
- Short note in **task-end** if any behavioral nuance changed (unlikely with empty overrides).

## Acceptance Criteria
- **AC1:** **`computeDifferentialOffsetsFromMaps`** does not call **`getEventShapeByRoleWithOverrides`** with **`'major'`** / **`'minor'`** for the default selection path (placement-based selection used).
- **AC2:** **`resolveDifferentialMajorMinorFromEventShapes`** (or its replacement) uses **placement_kind**-first logic consistent with **AC1**.
- **AC3:** **Minimizer** segment enumeration uses **placement-first** rule (**`floating`**) aligned with **`differentialRoleFromPlacement`**, with overrides handled if still required.
- **AC4:** **`cd client && npm run lint`** exits 0.

## Implementation Orders

1. Add **placement-first** helper(s) for **primary** + **secondary** event shape selection among candidates (shared with **`computeDifferentialOffsetsFromMaps`** and **`resolveDifferentialMajorMinorFromEventShapes`**).
2. Refactor **`partFinalizerSlotShapeHelpers.computeDifferentialOffsetsFromMaps`** to use the helper; verify offset math unchanged for typical primary+secondary templates.
3. Refactor **`eventAttendeeUtils.resolveDifferentialMajorMinorFromEventShapes`** (and **`getEventShapeByRoleWithOverrides`** call sites in this vertical slice if redundant).
4. Refactor **`minimizerEventShapes.ts`** to select minimizer segments by **`placementKind === 'floating'`** (preserve override/margin exclusions).
5. **`grep`** + lint **`client/`**; fix any stragglers in **`perspectiveResolver`** / **`partFinalizerSlotShape.ts`** imports only.


## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
