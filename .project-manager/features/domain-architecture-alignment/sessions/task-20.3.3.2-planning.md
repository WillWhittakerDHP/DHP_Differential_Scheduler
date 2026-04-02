# Plan: task 20.3.3.2 — 20.3.3.2

## Contract
- **Tier:** task | **ID:** 20.3.3.2
- **Scope:** 20.3.3.2
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
- [ ] #### Task 20.3.3.2: Event block instance — orchestration copy & display **Goal:** Validity-constrained **orchestration** language on **event** block instance cards (labels/descriptions/display metadata). **Files:** - `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` - Optional small presentational component under `client/src/components/admin/generic/` **Approach:** Display/metadata-first; avoid RelationshipCollection core refactors. **Checkpoint:** Manual smoke on an **event** block instance card; lint clean. ---

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment… _(truncated)_

## Story
**This task changes** admin-facing **labels and tooltips** for **block instance** fields that express **orchestration** and **wizard visibility** (`orchestrator`, `wizardVisible`, and optionally **`composite`**) **because** FEATURE_20 §8.3 #3 calls for **parity** and **plain-language framing** on scheduling cards—especially **event** block instances—so admins understand they are **choosing among shape-valid options**, not redefining structure. **No** RelationshipCollection refactors and **no** segment relocation (20.3.4).

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

- **Paths reviewed:** `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` (has `composite`, `differentialEventRoleOverrides`, no `orchestrator` / `wizardVisible` yet); `client/src/configs/field/display/fullFieldDisplayConfig.ts` (merges `blockInstanceDisplays`); `client/src/configs/field/display/appliedDisplay/baseEntityDisplays.ts` (generic `id` only); `client/src/types/entities.ts` (`BlockInstanceEntity`: `orchestrator`, `wizardVisible`, `composite` with inline JSDoc); `client/src/constants/entityFieldConstants.ts` (`FIELD_NAMES`, `DEFAULT_VALUES`); `client/src/components/admin/generic/EntityCardContent.vue` (atomic editors + `FieldRenderer` by metadata—no shape-specific orchestration hint today).
- **Patterns / call sites:** Display copy flows from **`DisplayFieldType`** entries (`label`, `placeholder`, `tooltip`, layout) consumed by field rendering; boolean toggles use the same path as other block instance fields. Improving **`blockInstanceDisplays`** updates **all** block instance cards (service, time, price, event)—aligned with shared orchestration semantics; event cards benefit without a separate RelationshipCollection path.
- **Gaps / unknowns:** Whether **`description`** on block instances is surfaced via metadata on event cards (if not, optional follow-up is event-only hint component gated by resolved `blockShape.type === 'event'`—**out of scope** unless copy-testing shows a gap).

## Analysis
- **Problem / why now:** After **20.3.3.1**, time/price part ledgers match service UX; **event** instances still rely on generic boolean labels unless we add **display metadata** for orchestration fields—this closes the “opaque toggles” gap for §8.3 #3 at the **card** layer.
- **Domain boundaries:** **Admin / config** client only; **no** API or Sequelize changes; **no** PartFinalizer or booking math; types on `BlockInstanceEntity` stay authoritative—copy must **not** contradict JSDoc in `entities.ts`.
- **Patterns to follow:** Match existing **`blockInstanceDisplays`** style (`DISPLAY_LABELS`, `ENTITY_STATUS`, `satisfies Partial<Record<GlobalFieldKey<"blockInstance">, …>>`); keep tooltips **short** and **validity-focused** (orchestrator = hub among **allowed** cascades; wizardVisible = booking/wizard surfacing, not structure).
- **Risks:** Over-long tooltips hurt mobile admin; avoid duplicating **20.3.1** event placement copy in field tooltips.
- **Alternatives:** (a) Event-only `VAlert` in `EntityCardContent`—rejected as **primary** path (extra coupling to shape resolution); **fallback** if product wants event-only banner later. (b) Metadata-only label overrides in DB—rejected (repo-owned copy is easier to review and aligns with FEATURE_20).

## Design
1. **Extend** `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`:
   - **`orchestrator`:** Human label (e.g. “Assignment hub” or “Orchestrator”) + **tooltip**: marks this instance as the **selector** among downstream options **already allowed** on the block shape / relationships—not a free-form structural editor.
   - **`wizardVisible`:** Label + **tooltip**: controls whether this instance appears as a **main wizard-visible** line vs add-on style; clarify it does **not** change which relationships are valid.
   - **`composite`:** Add **`tooltip`** (keep label): same-shape composition vs orchestrator hub (one sentence, matches `BlockInstanceEntity` JSDoc spirit).
2. **Pseudocode (display entries):**
   ```ts
   orchestrator: { label: '…', placeholder: '', tooltip: '…', inline: true, stacked: false, width: 'auto', align: 'left' }
   wizardVisible: { label: '…', tooltip: '…', … }
   composite: { …existing…, tooltip: '…' }
   ```
3. **Optional (defer unless requested):** `EventBlockInstanceOrchestrationHint.vue` + mount in `EntityCardContent` when shape type is `event`—only if field tooltips are insufficient after smoke.

## Goal
For **block instance** admin cards (including **event**), provide **validity-constrained orchestration language** via **display metadata** for **`orchestrator`**, **`wizardVisible`**, and clarified **`composite`** help—**without** RelationshipCollection core refactors or **20.3.4** segment work.

## Files
- **Implementation:** `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` (primary)
- **Reference:** `client/src/types/entities.ts` (`BlockInstanceEntity` JSDoc), `client/src/configs/field/display/fullFieldDisplayConfig.ts`
- **Optional:** `client/src/components/admin/generic/EventBlockInstanceOrchestrationHint.vue` + `EntityCardContent.vue` (only if needed)

## Approach
1. Add **`orchestrator`** and **`wizardVisible`** display blocks with labels + tooltips; add **`tooltip`** on **`composite`**.
2. Run **`cd client && npm run lint`** and **`npm run type-check`**.
3. **Manual smoke:** open an **event** block instance in Admin Instances (and one non-event) and confirm labels/tooltips read clearly in the field chrome.

## Checkpoint
- **After 20.3.3.2:** Orchestration-related toggles on block instance cards show the new copy; **lint + vue-tsc** clean; no regressions to **20.3.1** event placement UI.

## Deliverables
- Updated **`blockInstanceDisplays.ts`** with **`orchestrator`**, **`wizardVisible`**, and enhanced **`composite`** metadata.
- Optional small component + mount **only** if smoke shows an event-only gap.

## Acceptance Criteria
- [ ] `blockInstanceDisplays` includes typed entries for **`orchestrator`** and **`wizardVisible`** (`satisfies` still holds).
- [ ] Tooltips state that choices respect **shape-valid** / **configured** relationships (no implication that toggles invent new structure).
- [ ] **`composite`** has a concise tooltip distinct from orchestrator semantics.
- [ ] Client **lint** and **type-check** pass.
- [ ] Manual check: at least one **event** block instance card shows updated strings.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
