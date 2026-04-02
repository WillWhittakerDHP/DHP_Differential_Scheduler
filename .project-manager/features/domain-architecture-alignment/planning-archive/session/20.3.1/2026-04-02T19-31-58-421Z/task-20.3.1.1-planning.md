# Plan: task 20.3.1.1 — PlacementTypeEditor integration (eventShape)

## Contract
- **Tier:** task | **ID:** 20.3.1.1
- **Scope:** 20.3.1.1
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
Session **20.3.1** accepted; first coding task is **20.3.1.1** (placement editor only). Task **20.3.1.2** (copy / `DifferentialEventRoleOverridesField`) is a separate task-end cycle.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
- **Boundaries:** **Client admin only** for this session; **no** … _(truncated)_

## Story
**This task changes** the **event shape** admin field pipeline **because** placement must be edited as one coupled concern (**placementKind** + **anchorEdge**) matching server rules, instead of two disconnected inputs.

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

- **Paths reviewed:** `client/src/utils/forms/fieldComponentDispatcher.ts` + `fieldComponentResolve.ts` (maps metadata → `FieldComponent` union: `primitive` | `select` | …); `client/src/types/forms/fieldComponent.ts`; `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts` (maps type → Vue component); `client/src/components/admin/generic/fields/FieldRenderer.vue`; `client/src/composables/admin/useEntityCardFormSetup.ts` + `useEntityCardFieldConfiguration.ts` (builds `finalFieldKeys` from metadata keys); `client/src/utils/transformers/entityTransformers.ts` (eventShape placement sanitize); `shared/utils/eventPlacementUtils.ts` (`sanitizeEventPlacementKindInput`, `sanitizeEventAnchorEdgeInput`, pairing rules documented on server in Phase 20.2).
- **Patterns / call sites:** Event shape fields are **metadata-driven**; each key gets a `FieldRenderer` + `SelectInputs` / `PrimitiveInputs` today. There is **no** existing grouped custom type in the dispatcher map — extend the **closed** `FieldComponent` union and map, and **omit** `anchorEdge` from the rendered key list for `eventShape` so it is not double-rendered.
- **Gaps / unknowns:** Confirm `FieldContextTypeGrouped` exposes enough to write **both** keys (or read sibling context from `form` / entity model) inside the new component; verify save path uses the same `form` object EntityCard mutates.

## Analysis
- **Problem:** Two separate fields make it easy to set **anchorEdge** when **placementKind** is **primary** (invalid per §5.1 / server validation). UX should mirror **primary ⇒ null anchor** and non-primary ⇒ anchor required.
- **Boundaries:** **Client admin only**; reuse `@shared` sanitizers for consistency with `entityTransformers`.
- **Risks:** Forgetting to filter **`anchorEdge`** would duplicate controls or show “unknown” if we return `unknown` for that key. **Mitigation:** filter in `useEntityCardFieldConfiguration` when `entityKey === 'eventShape'`.
- **Alternatives:** Keep two selects + only `conditionalFieldVisibility` — weaker coupling and does not meet “grouped” session goal.

## Design

### New field component type
1. Extend `FieldComponent` with `{ type: 'eventShapePlacement'; reason: 'eventShapePlacement' }`.
2. In `getFieldComponent`: if `entityKey === 'eventShape'` and `fieldKey === 'placementKind'`, return `eventShapePlacement` (still require `fieldMetadataEntry` as today for display config).
3. Register in `createFieldRendererComponentMap()` → new Vue component, e.g. `EventShapePlacementFields.vue`.

### Hide standalone `anchorEdge`
4. In `useEntityCardFieldConfiguration`, when `entityKey === 'eventShape'`, compute `finalFieldKeys` that **excludes** `'anchorEdge'` so only the grouped control edits it.

### Component behavior (pseudocode)
```
onPlacementKindChange(kind):
  set placementKind = kind
  if kind === 'primary': set anchorEdge = null (and disable anchor UI)
  else: ensure anchorEdge is 'start' | 'end' (default 'start' if empty)

onAnchorEdgeChange(edge):
  set anchorEdge = edge
```
Use shared sanitizers when normalizing before emit if needed.

### Wiring
- Props: same as other field inputs — `field-context` for **placementKind** plus access to entity/form for **anchorEdge** (follow `SelectInputs.vue` / field context actions pattern; if insufficient, pass entity via existing inject from EntityCard — verify during implement).

### Out of scope for 20.3.1.1
- **`eventShapeDisplays.ts`** copy polish and **`DifferentialEventRoleOverridesField.vue`** → reserved for task **20.3.1.2**.

## Goal
Deliver a **grouped placement control** on **eventShape** EntityCard/edit flows: **placementKind** + **anchorEdge** with **primary ⇒ null anchor** and no duplicate **anchorEdge** row.

## Files
- `client/src/types/forms/fieldComponent.ts`
- `client/src/utils/forms/fieldComponentDispatcher.ts`
- `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts`
- `client/src/components/admin/generic/fields/EventShapePlacementFields.vue` (new)
- `client/src/composables/admin/useEntityCardFieldConfiguration.ts`
- Touch only if types require: `client/src/composables/admin/useFieldRendererComponent.ts` / `FieldRenderer.vue` (if map typing tight)

## Approach
1. Add `FieldComponent` variant + dispatcher branch + map entry + new Vue component (thin template, logic in small composable if > threshold).
2. Filter `anchorEdge` from `eventShape` `finalFieldKeys`.
3. Manual: Shapes tab → create/edit event shape → verify PATCH payload and UI for primary vs secondary.

## Checkpoint
- Saving **primary** shape sends **null**/`undefined` anchor per existing API expectations.
- Saving **non-primary** requires visible anchor; no duplicate anchor field.

## Deliverables
- Working **EventShapePlacementFields** (or **PlacementTypeEditor**) registered on **`placementKind`** for **`eventShape`**.
- **`anchorEdge`** excluded from standalone field list for **`eventShape`**.
- **Client lint** + **vue-tsc** clean on touched files.

## Acceptance Criteria
- [ ] Event shape card shows one grouped **Placement** control (kind + anchor), not two unrelated rows for kind and anchor.
- [ ] Choosing **primary** clears/disables **anchor**; choosing non-primary enables anchor (**start** / **end**).
- [ ] No regression: entity save still succeeds; transformer/sanitizer path unchanged aside from values set by UI.
- [ ] **20.3.1.2** copy work not required for this task to pass.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
