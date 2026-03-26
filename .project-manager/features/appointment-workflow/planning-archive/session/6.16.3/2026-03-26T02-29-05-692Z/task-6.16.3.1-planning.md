# Plan: task 6.16.3.1 — E2E verification and downstream inventory

## Contract
- **Tier:** task | **ID:** 6.16.3.1
- **Scope:** Manual verification of margin + multi-minimizer scheduling in the booking wizard; written downstream inventory (persistence, API, confirmation UX, calendar/invite touchpoints); short documentation of Google Calendar event split behavior or explicit gaps.
- **Governance:** Governance Context (Task)

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
Session **6.16.3** started; this is the first task. Prior sessions **6.16.1** (margin + pipeline) and **6.16.2** (multi-segment minimizer composable + orchestrator) are complete.

---

## Parent context (session planning — Analysis excerpt)

Phase 6.16.3 closes **integration honesty**: downstream surfaces (persistence, calendar, API, copy) must be inventoried and calendar split behavior **documented** or **gapped**. Rename/migration closure is **task 6.16.3.2**.

---

## Story
**This task changes** project documentation and the session log **because** stakeholders need a traceable checklist of how margin and multi-minimizer data flows through save paths, APIs, and integrations before rename tranches are finalized in 6.16.3.2.

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
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Phase 6.18) |
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

## Analysis

- **Problem:** Phase guide success criteria require knowing whether margin + multi-minimizer selections survive **save**, appear in **API** contracts, and how **calendar** would split events—without guessing from code spelunking each time.
- **Boundaries:** Read-only inventory across `client` booking transformers, `server` appointment routes/models, and `server` Google/calendar services; **no** new tests (suspended); **no** production DB migration in this task.
- **Patterns:** Follow existing appointment/wizard transformers; cite file paths in the inventory table.
- **Risks:** Calendar behavior may be partially unimplemented—document **gap** rather than invent behavior.
- **Alternatives:** Full calendar implementation—**out of scope**; this task is inventory + documentation only.

## Design

1. **Inventory artifact:** Add or extend **`.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md`** with a table: **Surface** | **Path / entrypoint** | **Notes** | **Status (verified / gap / N/A)** covering:
   - Wizard → persisted appointment payload (fields carrying `PartFinal`, minimizer scheduling, contingency).
   - Internal API routes used on confirm or autosave.
   - User-facing confirmation copy that references minimizer/margin (grep-driven list of strings).
   - Google Calendar / invite pipeline: which module builds events, whether multiple minimizer segments map to multiple events vs one block (document **current behavior** or **not wired**).
2. **Session log:** Update **`session-6.16.3-log.md`** with **### Task 6.16.3.1** completed, date, and pointer to the inventory file.
3. **Verification narrative:** In the inventory doc, include a short **Manual wizard check** subsection: expected steps to see multi-segment duration + margin path without silent collapse (references `useMinimizerPartsScheduling` / orchestrator behavior from 6.16.2).
4. **Code exploration:** Use repository search to list concrete files; no behavioral code changes unless a **documentation-only** comment is needed (avoid scope creep).

## Goal

- Produce a **single downstream inventory document** plus **session log** update that satisfies session **6.16.3** acceptance criteria for inventory and calendar documentation (or explicit gaps).
- Confirm **multi-segment + margin** behavior is **not silently reduced** to first segment only in the client pipeline (cite code paths—already implemented in 6.16.2; this task **verifies by reference**, not rewrites).

## Files (expected touch set)

| Area | Paths |
|------|--------|
| New / updated docs | `.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md` (create), `session-6.16.3-log.md` (update) |
| Read-only references (cite in inventory) | `client/src/utils/transformers/` (appointment ↔ wizard), `client/src/composables/booking/useAvailabilityOrchestrator*.ts`, `server/src/routes/internal/appointments/`, `server/src/services/google/` or calendar invite code, `shared/types` for appointment payloads |

## Approach

1. Search and read persistence/transform paths for appointment creation/update and minimizer-related fields.
2. Draft the inventory markdown with evidence-based rows.
3. Add manual verification bullets aligned with 6.16.2 composable behavior.
4. Update session log; run **client + server lint** if any TS/MD-adjacent edits are not applicable—**docs-only** task: lint only if touched code.

## Checkpoint

Inventory file exists and is linked from session log; session guide task checkbox can move to **in progress** / **done** at task-end.

## Deliverables

- **`session-6.16.3-downstream-inventory.md`** with downstream table + manual check narrative + calendar/invite subsection.
- **`session-6.16.3-log.md`** updated with task 6.16.3.1 completion summary.

## Acceptance Criteria

- [ ] Inventory covers **persistence**, **API**, **confirmation copy**, and **calendar/invite** with honest **verified** vs **gap** labels.
- [ ] Multi-segment minimizer **not** silently collapsed to first shape only is **addressed** (reference to existing code or explicit gap if missing).
- [ ] Session log reflects task 6.16.3.1 completion.
- [ ] No unauthorized migration or test files added.

## Definition of Done

- [ ] App starts (`npm run start:dev`) — unchanged if docs-only; spot-check not required for docs-only task.
- [ ] Lint passes for any touched code files (`cd client && npm run lint`, `cd server && npm run lint`) — N/A if zero code changes; if any, lint clean.
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated at task-end

---

## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.16.3-guide.md`
- Session planning: `.project-manager/features/appointment-workflow/sessions/session-6.16.3-planning.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
