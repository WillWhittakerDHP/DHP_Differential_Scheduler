# Plan: task 20.3.1.2 — 20.3.1.2

## Contract
- **Tier:** task | **ID:** 20.3.1.2
- **Scope:** 20.3.1.2
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
- [ ] #### Task 20.3.1.2: Placement-forward copy cleanup **Goal:** `eventShapeDisplays` + **DifferentialEventRoleOverridesField** captions/help use **placement** vocabulary; grep stragglers on shape surfaces. **Files:** - `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts` - `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` **Approach:** Rewrite labels/help; matrix row secondary line explains placement-derived effect without leading with “differential role.” **Checkpoint:** Lint/typecheck clean; manual read of Shapes → Event shapes + block (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
- **Boundaries:** **Client admin only** for this session; **no** … _(truncated)_

## Story
**This task changes** admin **copy** on event-shape surfaces and the block-instance **scheduling overrides** matrix **because** Feature 20 makes **placement** the source of truth; user-visible text should not lead with “differential role” or pipe-delimited enums when a short placement sentence is clearer.

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

- **Paths reviewed:** `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts` (labels/placeholders for shape fields); `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` (help text, empty state, matrix row caption `Template: {{ row.templateRole }}`, inherit option copy); `client/src/utils/admin/differentialRoleMatrixRows.ts` (rows: `name`, `templateRole` from `eventShapeDifferentialRoleFromPlacementFields`); `@shared/utils/eventPlacementUtils.ts` + `@shared/constants/differentialRoleMappings.ts` (placement → scheduling role, role labels); `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` (no entry today for `differentialEventRoleOverrides` — field label likely from server admin_metadata); grep of `client/src` for user-facing “differential role” strings (mostly code comments / internal names; primary UX strings are in `DifferentialEventRoleOverridesField.vue`).
- **Patterns / call sites:** Matrix rows already derive **scheduling role** from **placement** via `eventShapeDifferentialRoleFromPlacementFields`; the UI caption incorrectly frames it as “Template: Major|Minor|…”. `EventShapePlacementFields` / `eventShapeDisplays` already use “Placement kind” / “Anchor edge” but placeholders still look like raw enum pipes.
- **Gaps / unknowns:** If product wants the **block instance field title** itself renamed (e.g. away from DB label “Differential roles”), confirm whether `blockInstanceDisplays` can include `differentialEventRoleOverrides` without widening `GlobalFieldKey` typing — if not, scope stays **inside** `DifferentialEventRoleOverridesField` + `eventShapeDisplays` only.

## Analysis
- **Problem / why now:** 20.3.1.1 shipped the grouped placement editor + metadata migration. Remaining mismatch is **language**: block-instance overrides matrix still shows **`Template: Major`** (etc.), which sounds like the shape *stores* a scheduling role. In reality the template stores **placement**; scheduling role is **derived** (`eventShapeDifferentialRoleFromPlacementFields`).
- **Boundaries:** **Client admin copy only** — no API or persistence shape changes. Reuse `@shared` placement + role utilities for consistent wording. Align with **ARCHITECTURE.md** admin/metadata-driven forms: display config merges with metadata; custom field components own fallback strings (`defaultHelpText` in `DifferentialEventRoleOverridesField.vue`).
- **Patterns:** Keep **differentialRoleMatrixRows** pure; extend row DTO with a **placement-first summary string** (and keep `templateRole` for select values / secondary clause). Avoid renaming internal CSS classes or component file name (still maps JSON field `differentialEventRoleOverrides`).
- **Risks:** Over-long captions on narrow breakpoints — keep caption to two short clauses (placement line + scheduling effect). Select option labels still use `DIFFERENTIAL_ROLE_LABELS` (scheduling vocabulary) which is OK inside the **dropdown**; task targets **matrix caption** and **paragraph help**, not the storage enum labels.
- **Alternatives:** Only change help text (weak — caption still says “Template”); or server migration to rename admin_metadata label (out of scope unless we add `blockInstanceDisplays` override that typecheck accepts).

## Design
1. **`differentialRoleMatrixRows.ts`:** Extend `DifferentialRoleMatrixRow` with e.g. `placementCaption: string` built from `eventShape.placementKind` + `eventShape.anchorEdge` (human text: “Primary”, “Secondary · start”, “Floating · end”). Optionally `schedulingRoleLabel: string` from `DIFFERENTIAL_ROLE_LABELS[templateRole]` for a second clause.
2. **`DifferentialEventRoleOverridesField.vue`:** Replace `Template: {{ row.templateRole }}` with placement-first caption, e.g. **`{{ row.placementCaption }}`** and a muted second line **`Schedules as {{ scheduling label }}`** (exact wording locked at implement time — must not lead with “Differential role”).
3. **`defaultHelpText` + empty-state alert:** Rewrite to describe **placement templates** on each event shape and **per-instance override of scheduling behavior**, without “differential role” as the first noun. Keep “Inherit (use event shape template)” understandable — may shorten to “Inherit (use shape placement defaults)” if clearer.
4. **`eventShapeDisplays.ts`:** Replace pipe-style placeholders with short prose (e.g. primary vs secondary + anchor hint) so /admin-metadata-adjacent display hints match product language.
5. **`blockInstanceDisplays.ts` (optional):** If `GlobalFieldKey<'blockInstance'>` allows `differentialEventRoleOverrides`, add `label` + `tooltip` with placement-forward wording for the field title; if types block, skip and document under Gaps.
6. **Verification:** `cd client && npm run lint` && `npm run type-check`; manual: **Shapes → Event shapes** + **Instances → block** expanded field for overrides matrix.

## Goal
Refresh **placement-forward** admin copy: **`eventShapeDisplays`** placeholders and **`DifferentialEventRoleOverridesField`** (help text, empty state, **per-row caption**) so admins see **placement first** and **scheduling effect** second — not “Template: Major” as the lead. **20.3.1.1** (grouped placement UI) is **done**; this task is **copy + matrix row presentation** only.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5.1 / §8.3, `.project-manager/ARCHITECTURE.md` (admin / booking boundaries)
- **PM:** `sessions/session-20.3.1-guide.md`, `phases/phase-20.3-guide.md`
- **Implementation:** `client/src/utils/admin/differentialRoleMatrixRows.ts`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, optionally `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`

## Approach
1. Add **placement caption** (and optional scheduling label) to matrix row builder; unit-style pure formatting (no new composable unless logic exceeds ~15 lines — then `client/src/utils/admin/eventShapePlacementCaption.ts`).
2. Update **Vue** template + `defaultHelpText` + alert string.
3. Tighten **eventShapeDisplays** placeholders.
4. Optional **blockInstance** display override if types allow; else omit.
5. Lint, typecheck, quick grep for user-visible “Template:” / “differential role” in touched admin files.

## Checkpoint
- Captions read naturally on a real block instance with ≥2 active event shapes.
- No regression: override map still saves **DifferentialRole** keys/values unchanged.

## Deliverables
- Updated **`differentialRoleMatrixRows`** row shape + placement-first caption data.
- Updated **`DifferentialEventRoleOverridesField.vue`** strings and matrix secondary line.
- Updated **`eventShapeDisplays.ts`** placement/anchor placeholders.
- Client **lint** + **vue-tsc** clean on touched files.

## Acceptance Criteria
- [ ] Matrix row **secondary line** leads with **placement** (kind ± anchor), not raw scheduling enum; scheduling effect appears as a **following** clause (e.g. “Schedules as …”) using existing role labels.
- [ ] **Help paragraph** and **empty-state** alert in `DifferentialEventRoleOverridesField` do not use “differential role” as the opening concept.
- [ ] **`eventShapeDisplays`** `placementKind` / `anchorEdge` placeholders are prose-like, not only `a | b | c` pipes.
- [ ] **No behavior change** to override JSON shape or select values.
- [ ] **Lint + typecheck** pass for client on touched paths.

## Implementation Orders
1. **`client/src/utils/admin/differentialRoleMatrixRows.ts`** — For each active `EventShapeEntity`, compute `placementCaption` (and keep `templateRole` for logic). Use `sanitizeEventPlacementKindInput` / `sanitizeEventAnchorEdgeInput` from `@shared/utils/eventPlacementUtils` and format readable strings (title case kind; for non-primary append “· start” / “· end”).
2. **`DifferentialEventRoleOverridesField.vue`** — Bind caption to new row fields; add second line with `DIFFERENTIAL_ROLE_LABELS[row.templateRole]` prefixed by neutral wording (“Schedules as …”). Rewrite `defaultHelpText` and the “No active event shapes…” alert to placement-first vocabulary.
3. **`eventShapeDisplays.ts`** — Replace pipe placeholders with one-line prose hints.
4. **`blockInstanceDisplays.ts`** — If types allow, add `differentialEventRoleOverrides` with placement-forward `label`/`tooltip`; else skip.
5. **`cd client && npm run lint`**, **`npm run type-check`**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
