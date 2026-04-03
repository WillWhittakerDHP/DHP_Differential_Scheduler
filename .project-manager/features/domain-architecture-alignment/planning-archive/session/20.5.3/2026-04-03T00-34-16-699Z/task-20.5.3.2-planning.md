# Plan: task 20.5.3.2 — 20.5.3.2

## Contract
- **Tier:** task | **ID:** 20.5.3.2
- **Scope:** 20.5.3.2
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
- [ ] #### Task 20.5.3.2: **§8.5 sign-off + phase handoff** — worklog **`### FEATURE_20 §8.5 acceptance`** + **`phase-20.5-handoff.md`**; optional **`phase-20.5-guide.md`** session **20.5.3** checkbox.

## Parent context (session planning — Analysis excerpt)

- **Why now:** **20.5.1–20.5.2** documented **sequence** and **baseline routing**; **20.5.3** is the **closure** pass: map **legacy assumptions** to **replacements** and prove **§8.5** is satisfied before **20.6** deletes code.
- **Boundaries:** **`.project-manager/analysis/`** + **`phase-20.5-handoff.md`** only unless a guide checkbox must flip; **no** `client/` / `server/` prod… _(truncated)_

## Story
**This task records FEATURE_20 §8.5 Pass 5 acceptance in the worklog and updates the phase handoff** **because** **20.5.3.1** closed **§0.2 / §2** traceability — **§8.5** must now **map to headings** (not chat-only) and **phase 20.5** must hand off to **20.6**.

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

- **Paths reviewed:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` **§8.5 Pass 5** (three acceptance checks); `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (after **`### Legacy assumption closure`** — append **§8.5** next); `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-handoff.md` (template sections).
- **Patterns:** §8.5 scope bullets (sequence, seed expectations) are already satisfied across **Checkpoint 9**, **§9.5 crosswalk**, **Baseline placement**, **Legacy closure**; the new **`###`** is a **traceability index** only.
- **Gaps / unknowns:** None if **20.5.3.1** is merged; if not, block and complete **20.5.3.1** first.

## Analysis
- **Dependency:** Requires **`### Legacy assumption closure (session 20.5.3)`** in the worklog (**20.5.3.1**).
- **Boundaries:** **`DOMAIN_REWRITE_WORKLOG.md`**, **`phase-20.5-handoff.md`**, optional **`phase-20.5-guide.md`** — **no** `client/` / `server/`.

## Design
1. Append **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** after **`### Legacy assumption closure`** with markdown table:
   - Row 1: *Migration notes describe how baseline event routing is established explicitly* → **`### Baseline placement & event routing`**, **`#### FEATURE_20 §9.6 mitigation`**, **`#### Addressed (session 20.5.2)`**, **§9.5** crosswalk **Notes**.
   - Row 2: *Legacy assumptions listed in section 2 are either removed or mapped* → **`### Legacy assumption closure`** (**§0.2** + **§2** tables).
   - Row 3: *No migration step depends on undocumented implicit defaults* → **`#### Migration implicit-default audit`** + **Checkpoint 9** narrative.
2. **`phase-20.5-handoff.md`:** Set **Last Updated**, **Session / phase status** (20.5 doc pass complete), **Next Action** **`/phase-start 20.6`**, **Transition Context** (pointer to worklog §8.5 + legacy closure).
3. **`phase-20.5-guide.md`:** Change **Session 20.5.3** checkbox from `[ ]` to `[x]` if still open.

## Goal
1. Add **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** (three-row table) to **`DOMAIN_REWRITE_WORKLOG.md`**.
2. Update **`phases/phase-20.5-handoff.md`** for **`/phase-start 20.6`**.
3. Mark **Session 20.5.3** complete in **`phases/phase-20.5-guide.md`** when applicable.

## Files
- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§8.5), `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md`, `phases/phase-20.5-guide.md` (checkbox only)

## Approach
1. Append **§8.5** **`###`** at end of worklog legacy-closure block (after **implicit-default audit**).
2. Edit **phase handoff** minimal sections per **Design**.
3. Tick **20.5.3** in **phase-20.5-guide.md**.

## Checkpoint
- **`/accepted-code`** → implement → **`/task-end 20.5.3.2`** → **`/session-end 20.5.3`**.

## Deliverables
- **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** in worklog.
- Updated **`phase-20.5-handoff.md`** + **20.5.3** checkbox in **`phase-20.5-guide.md`**.

## Acceptance Criteria
- [ ] Table has **exactly three** rows aligned to **FEATURE_20** §8.5 acceptance list.
- [ ] Each row’s **satisfied by** column names **real** worklog **`###` / `####`** headings.
- [ ] **phase-20.5-handoff** **Next Action** is **`/phase-start 20.6`** with accurate transition text.
- [ ] **Do not** re-edit **`### Legacy assumption closure`** body unless a broken cross-reference is found.

## Decomposition
**Leaf** — three markdown files, doc-only.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
