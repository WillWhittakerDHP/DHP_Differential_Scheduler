# Plan: task 7.4.4.1 — Internal API enactment matrix (GC-7-E1)

## Contract
- **Tier:** task | **ID:** 7.4.4.1
- **Scope:** Inventory client calls to `/api/v1/internal` (booking wizard vs admin); publish **router-level enactment matrix** for **task 7.4.4.2** to implement `requireAuth` / `requireRole` without breaking anonymous wizard flows.
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
Session **7.4.4** accepted; cascade landed on this task. Parent session defers **middleware changes** to **7.4.4.2**; this task delivers the **written matrix** only.

## Parent context (session planning — Analysis excerpt)

- **Problem:** `InternalRouter` has **no** global `requireAuth`; wizard uses **anonymous session** + **CSRF** on mutating routes. Admins need identity on sensitive paths. Without a matrix, **7.4.4.2** risks wrong gates.
- **Canonical order (mutations):** `csrfProtection` → `requireAuth` → `requireRole(…)` → `checkOwnership(…)` when applicable.

## Story
**This task publishes** a single **source-of-truth matrix** (which internal subtrees allow anonymous browser sessions vs require authenticated staff/admin) **because** **task 7.4.4.2** must apply `requireAuth` / `requireRole` **selectively** aligned with real **Vue `apiClient`** usage and **Express** mount points.

---

## Architecture context (harness-injected)

_(Unchanged harness injection — see original block in file history if needed.)_

---

## Analysis
- **Problem:** Client `apiClient` uses `baseURL` **`/api/v1/internal`** (`apiClientCore.ts`). Booking and admin share the same mount; product rule is **wizard-first anonymous**, **admin staff** for configuration and sensitive lists.
- **Boundaries:** Docs under `server/docs/` + optional one-line pointer in `SECURITY_STUBS.md`. No production code **required** in 7.4.4.1 if matrix is delivered as markdown only; **7.4.4.2** edits `server/src/routes/internal/**`.
- **Patterns:** Matrix columns: **path prefix**, **methods**, **caller** (wizard / admin / both), **anonymous OK?**, **recommended role** if not, **notes** (CSRF, ownership, follow-up).
- **Risks:** Matrix wrong → wizard 401 or admin data exposed. **Mitigation:** trace **grep** `apiClient` + `get*Endpoint` helpers; spot-check `server/src/routes/internal/index.ts` mounts.
- **Open questions:** Exact staff role string (`agent` vs `admin`) per route — align with `USER_ROLE_*` / `requireRole` usage in **7.4.4.2**.

## Design

### Client inventory (relative to `/api/v1/internal`)

| Area | Representative paths / helpers | Typical caller |
|------|----------------------------------|----------------|
| Appointments | `GET/POST/PATCH /appointments`, `GET/PATCH /appointments/:id`, `GET /appointments/:id/versions` (`appointmentApi.ts`, booking composables) | **Wizard** + **admin** business data |
| Admin entry list | `GET /appointments/list-for-admin-entry` (`useListForAdminEntry.ts`) | **Admin** only (sensitive aggregate) |
| Availability | `POST /availability/computed-data` (`calendarApiService.ts`) | **Wizard** |
| Properties / users | `getPropertyEndpoint`, `getUserEndpoint`, CRUD via entity composables | **Wizard** reads + **admin** mutations |
| Entities / relationships | `/entities/...`, `/relationships/...`, batch, order_index, bulk patch | **Admin** + **wizard** read-heavy global transformer |
| Settings (read-many) | `GET /wizard-settings`, `GET /calendar-settings`, `GET /organization-defaults`, `GET /business-settings/availability_settings` | **Wizard** + **admin** |
| Settings (mutations) | `PUT /wizard-settings`, `PUT /calendar-settings`, `PUT /organization-defaults`, `PUT /business-settings/availability_settings` | **Admin** |
| Admin metadata | `adminMetadataApi` / save helpers | **Admin** |
| Business rules | `businessRulesApi` | **Admin** |
| Beta | `betaFeedbackApi` | **Beta** view |
| Event preview | `POST /event-instance-preview` (helper) | **Wizard** / admin tooling |
| Property mappings | `propertyMappingsApi` | **Admin** |
| Auth (separate mount) | `/api/v1/internal/auth/*` (e.g. `session/me`) — **not** under `InternalRouter` only; see `routes/index.ts` | **Admin** gating / login |
| Dev | `/dev/status` (dev panel) | **Dev** only |

### Enactment matrix v1 (for 7.4.4.2)

Paths are **Express** segments under `v1Router.use("/internal", InternalRouter)` unless noted.

| Mount prefix | Anonymous session OK? | Role / gate (if not) | Notes |
|--------------|------------------------|----------------------|--------|
| `/availability` (POST `/computed-data`) | **Yes** (wizard) | — | Already `csrfProtection` + Joi |
| `/appointments` (CRUD + versions) | **Yes** with **`checkOwnership`** where enforced | — | `requireAuth` **not** globally; ownership uses `req.user` when present — align **7.4.4.2** with appointment policy |
| `/appointments/list-for-admin-entry` | **No** | **Staff/admin** (`requireAuth` + `requireRole`) | Currently unauthenticated — **high priority** in 7.4.4.2 |
| `/properties` | Mixed | Wizard reads/mutations per ownership rules; staff for admin-only ops | Validate per-method in CRUD router |
| `/users` | **No** for admin CRUD | **Staff/admin** | Wizard rarely calls directly — confirm grep |
| `/entities`, `/relationships`, `/admin-metadata`, metadata CRUD | **No** for mutating admin config | **Staff/admin** | Wizard may **GET** for global transformer — **7.4.4.2** may split by method |
| `/*-settings`, `/organization-defaults`, `/business-settings` | **GET** often **yes** for wizard; **PUT/PATCH/DELETE** **no** | **Staff/admin** on mutations | Matches product: public reads for booking UX |
| `/beta-feedback` | TBD | Likely **authenticated** for submit | Confirm product |
| `/event-instance-preview` | **Yes** if only wizard preview | — | Confirm CSRF on POST |
| `/property-mappings` | **No** | **Staff/admin** | Admin integration |
| `/appointment-fee-summaries` | TBD | Ownership / staff | Check router |
| `/dev` | Dev-only | Optional auth or env gate | Non-prod |
| `/auth/*` | Per-route (magic link, `session/me` needs auth) | See `authRouter.ts` | Outside `InternalRouter` aggregation |

### Deliverable file

Create **`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`** with this table + **“How to use”** (order: CSRF → auth → role → ownership). Add a one-line link under **`server/docs/SECURITY_STUBS.md`** pointing to the matrix.

## Goal

1. Finalize **inventory** (grep-backed) and **matrix v1** above, adjusting rows after one pass over `server/src/routes/internal/**/*.ts` method-level.
2. Write **`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`** and link from **`SECURITY_STUBS.md`**.
3. Leave **no** `requireAuth` / `requireRole` behavior change in this task (deferred to **7.4.4.2**).

## Files

- **New:** `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`
- **Update:** `server/docs/SECURITY_STUBS.md` (link only)
- **Read-only for inventory:** `client/src/utils/api/**/*.ts`, `client/src/services/calendarApiService.ts`, `client/src/composables/booking/**/*.ts`, `server/src/routes/internal/index.ts`, key routers under `server/src/routes/internal/`

## Approach

1. Run targeted **ripgrep** for `apiClient` and endpoint helpers; reconcile with **`InternalRouter`** mounts.
2. Draft matrix in doc; mark **TBD** rows explicitly for **7.4.4.2** follow-up if unsure.
3. Add **SECURITY_STUBS** pointer; run **`cd server && npm run lint`** only if TS touched (unlikely); doc-only change is fine.

## Checkpoint

- Matrix lists **every** `InternalRouter` child prefix from `internal/index.ts` with a **default policy** cell.
- **`list-for-admin-entry`** flagged **staff/admin required**.
- Wizard **`POST /availability/computed-data`** remains **anonymous OK** in matrix.

## Deliverables

- `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md` committed-ready content
- `server/docs/SECURITY_STUBS.md` cross-link

## Acceptance Criteria

- [ ] Matrix file exists and is readable by **7.4.4.2** without opening this planning doc
- [ ] At least one **explicit** “anonymous OK” row for wizard (**computed-data** + general appointment flow)
- [ ] At least one **explicit** “staff/admin required” row (**list-for-admin-entry**)
- [ ] **SECURITY_STUBS** references the matrix

## Definition of Done

- [ ] App starts (`npm run start:dev`) — N/A if docs-only; still quick smoke optional
- [ ] Lint passes if any `.ts` edited
- [ ] Session guide task **7.4.4.1** checkbox ready for **task-end** after user runs **`/accepted-code`** and agent implements

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.4.4-guide.md`
- Session planning: `.project-manager/features/authentication/sessions/session-7.4.4-planning.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
