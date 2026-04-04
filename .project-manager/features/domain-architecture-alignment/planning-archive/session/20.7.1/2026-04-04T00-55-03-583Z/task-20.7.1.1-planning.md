# Plan: task 20.7.1.1 — Canonical close-out plan file + link normalization

## Contract
- **Tier:** task | **ID:** 20.7.1.1
- **Scope:** Add committed **`architecture-alignment-closeout-master-plan.md`** under Feature **20** and replace every broken **`.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** pointer under **`.project-manager/features/domain-architecture-alignment/`** with that path.
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

Session **20.7.1** accepted; first executable slice is this task. **20.7.1.2** (handoff/guide copy) and **20.7.1.3** (tombstones) are **out of scope** here.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Without a **stable in-repo** sequencing anchor and aligned **Next Action** text, cascades and handoffs keep re-anchoring on **`/phase-start 20.7`** or vague “master plan” paths while the linked **`.cursor/plans/…`** file is absent.
- **Domains:** **Docs / harness only** — touches `.project-manager/features/domain-architecture-alignment/**` and possibly root markdown pointers; does **not** change **`client/`** unless we add a one-line README tombstone (prefer `.project-manager` first).
- **Child tasks:** Thin **task** plans: one for **canonical plan file + link normalization**, one for **feature handoff/guide + phase handoff stub updates**, one for **tombstone grep + targeted edits**.
- **Risks:** Over-editing historical archives; mitigate by **banner + link** rather than deleting content. Duplicating huge plan text in two places — mitigate with **one canonical `.project-manager/...` file** and relative links from feature/phase guides.

## Story

**This task changes** harness documentation **because** several Feature **20** guides and handoffs link to a **Cursor plan path that does not exist in git**, so agents hit dead links when adopting the close-out ladder.

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
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
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

This task is **documentation under `.project-manager/features/domain-architecture-alignment/`** only — no `client/` / `server/` / `shared/` product code.

- **Paths reviewed (grep):** `feature-domain-architecture-alignment-guide.md`; `phases/phase-20.7-guide.md`, `phase-20.7-handoff.md`, `phase-20.8-guide.md`, `phase-20.9-guide.md`, `phase-20.10-guide.md` — all reference **`/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** or equivalent; that path is **not** in the repo.
- **Patterns:** Relative links from feature/phases use `../../../.cursor/plans/...` or backtick-only paths; they need a **stable sibling** under the feature directory.
- **Gaps:** Other repos or local **Cursor** plan exports may hold the long-form narrative; this task adds an **in-repo index** so harness docs never 404. Deeper narrative can be appended later without changing link targets again.

## Analysis

- **Problem:** Agents follow links to a non-existent **`.cursor/plans/...`** file; tier-start output and phase handoffs repeat that path.
- **Boundary:** Feature **20** harness markdown only for **this** task; handoff prose refresh waits for **20.7.1.2**.
- **Approach lock:** One new markdown file + mechanical link replacement in files that currently cite the missing plan path (within this feature folder).
- **Risk:** Wrong relative depth when linking from nested `phases/` — use **`../architecture-alignment-closeout-master-plan.md`** from `phases/` and **`./architecture-alignment-closeout-master-plan.md`** from feature root files.

## Design

1. **New file** `architecture-alignment-closeout-master-plan.md` at feature root:
   - Title + **Purpose** (canonical sequencing surface for phases **20.7–20.13**).
   - **Conflict rule** (align with `phase-20.7-guide.md`: analysis docs > this doc for architecture truth; this doc > informal forks for **order**).
   - Table or list: phase **20.x** → link to `./phases/phase-20.x-guide.md` for **x = 7..13**.
   - Pointers to `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md`.
   - Short **Phase 0 / preflight** reminder (one paragraph) so the file is useful even before a long Cursor export is pasted.
2. **Link sweep:** In every file under the grep result set, replace the **`.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** bullet/link with a link to **`../architecture-alignment-closeout-master-plan.md`** (from `phases/`) or **`./architecture-alignment-closeout-master-plan.md`** (from feature root), matching each file’s location.

## Goal

Ship a **committed** canonical close-out plan document and update **all** Feature **20** harness references that pointed at the missing Cursor plan so they resolve in-repo.

## Files

- **Create:** `.project-manager/features/domain-architecture-alignment/architecture-alignment-closeout-master-plan.md`
- **Edit (link normalization):** `feature-domain-architecture-alignment-guide.md`, `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.8-guide.md`, `phases/phase-20.9-guide.md`, `phases/phase-20.10-guide.md`  
- **Optional same-task:** `sessions/session-20.7.1-planning.md` / `phase-20.7-planning.md` prose that still says “glob not found” may be tightened to “see `architecture-alignment-closeout-master-plan.md`” **only if** touched while verifying links (keep scope minimal).

## Approach

1. Add **`architecture-alignment-closeout-master-plan.md`** with structure above.
2. Replace broken master-plan links in the six (or seven) harness files identified in recon.
3. Open each edited link in preview (relative path sanity) from `phases/` vs feature root.

## Checkpoint

- `rg 'architecture_alignment_closeout_master_plan|\.cursor/plans/architecture_alignment'` under **`.project-manager/features/domain-architecture-alignment/`** returns **no** hits (or only historical mentions inside the new file’s “replaced path” note if you add one).

## Deliverables

- New **master plan index** markdown file committed under the feature.
- Updated markdown links across Feature **20** harness docs so the close-out plan URL is always the new file.

## Acceptance Criteria

- [x] `architecture-alignment-closeout-master-plan.md` exists and links to **`phase-20.7-guide.md` … `phase-20.13-guide.md`**.
- [x] No remaining **harness** link in this feature folder targets **`/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** (historical prose may remain in session/task planning artifacts and in the new file’s “Replaces” note).
- [ ] `npm run start:dev` still runs (docs-only change; not re-run at task-end — run before push if you want the smoke check on record).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [x] Lint passes (`cd client && npm run lint` — client only at task wrap; `cd server && npm run lint` not run)
- [x] Governance score maintained or improved (docs-only)
- [x] Session guide task status updated (via **`/task-end`**)

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
