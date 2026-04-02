<!-- harness-planning-rollup tier=phase id=20.2 consolidatedAt=2026-04-02T18:38:34.155Z -->

# Consolidated planning: phase 20.2

## Phase 20.2 (parent)

## Story

**As a** platform maintainer, **I want** internal entity and relationship APIs to match Phase 20.1 schema (renamed block-shape types, instance three-property fields, event placement and segment ownership), **so that** admin and booking clients can rely on consistent contracts without the server re-implementing PartFinalizer or exposing removed differential-role fields.

**Estimated size:** M / L (touches generic entity CRUD, event flows, appointments, and preview)

---

## Analysis

- **Problem / why now:** Phase **20.1** landed DB + Sequelize models for renamed block-shape types, instance-level `composite` / `orchestrator` / `wizardVisible`, event placement columns, and relational segment/attendee tables. Without **API alignment**, admin batch loads and mutations can still send or expect legacy fields (`differential_role`, old shape-type tokens, unscoped event instances). This phase implements **FEATURE_20 §8.2** and **§5.1–5.4**.
- **Domain boundaries:** **Server** routes and validation only — responses remain **configuration + raw rows** for the **client PartFinalizer** (no server-side booking total resolution). **Shared** placement sanitizers already exist; extend **`@shared`** where both sides must agree on enums or DTOs.
- **Patterns to follow:** Keep using **`entitySanitizers`** + **`FIELD_NAMES`** for camel/snake parity; use **`sanitizeEventPlacementKindInput` / `sanitizeEventAnchorEdgeInput`** for event shapes; reject or strip **`differential_role`** on event shapes at the API boundary (sanitizer already deletes on patch/create). Relationship CRUD stays on Sequelize models defined in 20.1.
- **Risks:** Generic CRUD may accept unknown keys — ensure validators for `blockInstance` and `blockShape` enforce allowed `type` set and required event-instance parent. **Preview** and **calendar** paths must not grow server-side resolution logic.
- **Alternatives:** Per-entity bespoke routers instead of generic CRUD — rejected; plan assumes adapting the existing internal entity/relationship stack.

## Goal

Complete **Phase 20.2 — Pass 2: API alignment** per **`phase-20.2-guide.md`** verbatim **§8.2** scope: internal **entity and relationship** routes accept Phase 20.1 schema (renamed types, instance three-property fields, event placement, scoped event instances); **no** server-side booking-total resolution; **event shape** APIs expose **placement fields only** (no differential-role concepts). Align with **FEATURE_20 §5** acceptance checks (ownership via `parent_block_instance_id`, no resolution drift).

## Files

- **Canonical (read-only intent):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§5**, **§8.2**), `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `phases/phase-20.2-guide.md`, `phases/phase-20.1-handoff.md`, `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (this phase — server + shared contracts):** `server/src/routes/internal/entities/**`, `server/src/routes/internal/relationships/**`, `server/src/routes/internal/appointments/**`, `server/src/routes/internal/event-instance-preview/**`, `server/src/routes/external/calendar*` and calendar services under `server/src/services/google/calendar/`, `shared/utils/eventPlacementUtils.ts`, `shared/types/**` as needed for exported API shapes, Joi/schema modules colocated with routes

## Approach

1. Trace **§5.1** table row-by-row: for each route/module, list current validators and response shapes, then align with Phase 20.1 models (no new migrations in 20.2 unless a gap is found and documented).
2. **Block shapes / instances first** — enum `type` and three booleans on instances must round-trip through batch entity APIs used by admin prefetch.
3. **Event shapes** — only `placement_kind` + `anchor_edge` (+ existing identity fields); continue stripping differential-role at sanitization; document any breaking JSON key removals for downstream sessions.
4. **Event instances** — enforce **`parent_block_instance_id`** on create/update where required; scope list/query helpers used by preview and admin so segments are always owned by an event **block instance**.
5. **Appointments + calendar** — persistence-only: store client-submitted payload; calendar reads segment + placement policy from new columns/relations — **no** PartFinalizer port to server.
6. After each session: run **plan §9.1** drift checklist; update `DOMAIN_REWRITE_WORKLOG.md` with API decisions.
7. **Client/admin UI** consumption of new contracts is largely **20.3–20.4**; this phase may add minimal shared type exports so both sides compile.

## Checkpoint

- **20.1** is complete; branch **`feature/domain-architecture-alignment`** is the expected worktree.
- Before **`/session-start 20.2.x`:** re-read **`phase-20.2-guide.md`** acceptance checks and **§5.4**; confirm no server-side “resolved totals” endpoints are introduced.
- Coordinate with **Feature 6** only where appointment persistence contracts overlap; principles + FEATURE_20 remain authoritative.

## Deliverables

- Updated **internal entity** validation and sanitization for `blockShape`, `blockInstance`, `eventShape`, `eventInstance` consistent with Phase 20.1 schema.
- **Relationship** handling for `eventAssignments`, attendee rows on event instances, and `validEventCascades` validated for segment ownership and integrity.
- **Event-instance preview** (or equivalent) re-scoped to parent event block instance context per plan.
- **Appointment** and **calendar** integration paths persist client payload and read segment/placement data without server finalizer logic.
- Removal or deadening of **differential-role-specific** route helpers/schemas called out in **§5.3** (where safe without breaking 20.3 work — document any stragglers).
- **`@shared`** types or constants updated where API contracts are shared with the client.

## Acceptance Criteria

- [ ] Route payloads and validators match the **Phase 20.1** schema (renamed types, instance three-property fields, placement columns, `parent_block_instance_id` where required).
- [ ] **No** API path introduces server-side booking-total or PartFinalizer-equivalent resolution.
- [ ] **Event shape** APIs expose **placement** fields only; differential-role is not part of the public create/update contract.
- [ ] **§5.4** checks satisfied: no resolution drift in route descriptions; event instance ownership flows through `parent_block_instance_id`; shape-level validity remains separate from orchestrator selection.
- [ ] App starts; **client + server lint** pass (per Definition of Done).
- [ ] Phase guide **objectives** and handoff sections updated at **phase-end**.

---

## Session 20.2.1 (source: session-20.2.1-planning.md)

### Story

**This session delivers** server-side validation and sanitization alignment for **block shape `type`** and **block instance three-property fields** on internal entity routes **so that** later sessions (event APIs, booking) can assume consistent HTTP contracts matching `FEATURE_20` §5.1 and `ARCHITECTURE.md` §8–§9.

**Estimated size:** M

---

### Analysis

- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`client/src/constants/blockShapeTypes.ts`** / `ARCHITECTURE.md` §8. No booking resolution on server.
- **Patterns:** Extend **`sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate`** for `blockShape` (reject or map legacy type strings with clear 400 messaging if product requires); add **`sanitizeBlockInstancePrimitiveFields`** extensions for boolean coercion only where safe. Prefer **named helpers** in `entitySanitizers.ts` or a small `blockEntityValidation.ts` imported from router layer before `updateRecord` — keep **`entityCrudRouter`** branch count manageable per function governance.
- **Risks:** Breaking admin saves if clients still emit old type strings — document in task if migration/backfill is separate (20.5); prefer explicit 400 with message over silent map unless plan says otherwise.
- **Alternatives:** Per-route Joi only for `blockShape`/`blockInstance` — heavier duplication; rejected in favor of central sanitizer + optional thin Joi fragment keyed by `entityType` in middleware (evaluate in task 1).

### Goal

For **`blockShape`** and **`blockInstance`** entity keys on internal **`/internal/entities`** CRUD: reject invalid **`type`** and non-boolean / missing handling for **`composite`**, **`orchestrator`**, **`wizardVisible`** consistently with Sequelize models; keep responses as raw rows (no computed booking fields).

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5.1 (rows for block shape / block instance), `phase-20.2-guide.md` §8.2 acceptance checks, `.project-manager/ARCHITECTURE.md` §8–§9.
- **Implementation:** `server/src/routes/internal/entities/entitySanitizers.ts`, `entityCrudRouter.ts` (only if a pre-flight validation hook is needed), `server/src/routes/schemas/entitySchemas.ts` (optional stricter schema by `entityType` via dynamic validation — only if chosen in task), `server/src/db/models/admin/block_shape.ts`, `server/src/db/models/booking/block_instance.ts` (reference only unless model tweak required).

### Approach

1. Add **block shape `type`** allowlist validation (five strings) on create/update payloads; return **400** with stable error text for legacy tokens if we choose reject over map.
2. Extend **block instance** sanitization to ensure the three booleans are present as booleans when provided; strip or reject unknown keys only if project policy requires (default: rely on Sequelize + existing unknown keys in body already pass through — focus on the three fields + `agentPermissions` already handled).
3. Smoke: PUT/PATCH a block shape and block instance via existing patterns (or document manual Thunder Client) without introducing tests (project suspended).
4. Run **server lint**; note **FEATURE_20 §9.1** drift line in `DOMAIN_REWRITE_WORKLOG.md` when done.

### Checkpoint

- Confirm no change introduces **server-side** fee/time **resolution** endpoints.
- After **task 20.2.1.1**, shapes cannot persist illegal `type` values through the happy path.
- After **task 20.2.1.2**, instance three-property fields round-trip through entity CRUD used by admin.

### Deliverables

- Updated **`entitySanitizers.ts`** (and any small validation module) for `blockShape` + `blockInstance`.
- Optional **`entitySchemas.ts`** or route-level validation if decomposition chooses stricter Joi.
- Short note in **`DOMAIN_REWRITE_WORKLOG.md`** for session 20.2.1 API decisions.

### Acceptance Criteria

- [ ] `blockShape` create/update rejects `type` outside the five canonical domain types (or documents explicit legacy mapping if product chooses map over reject).
- [ ] `blockInstance` create/update accepts boolean `composite`, `orchestrator`, `wizardVisible` consistent with DB columns; invalid types yield 400 or Sequelize validation errors surfaced via existing `handleRouteError` path (no empty catches).
- [ ] No new server endpoints compute booking totals or PartFinalizer-equivalent aggregates.
- [ ] `cd server && npm run lint` passes after tasks.

---

---

## Session 20.2.4 (source: session-20.2.4-planning.md)

### Story

**This session delivers** aligned **appointment persistence** and **Google Calendar invite** behavior keyed to **event_instances** + **event_shapes** placement data, and strips remaining **differential-role** noise from the **event-shape entity** API surface, **so that** Phase **20.2** closes with FEATURE_20 **§5.1 / §5.2** satisfied (no server booking calculator; ownership via segments and shapes) and the repo is ready for **20.3** (client-heavy tranche).
**Estimated size:** M

---

### Analysis

- **Problem / why now:** Sessions **20.2.1–20.2.3** aligned entities, relationships, and preview to Phase **20.1** schema. FEATURE_20 **§5.1** still lists **appointment persistence** and **calendar event creation** as route areas that must use **raw rows + client payload**, and **§5.3** calls for removing **differential-role-specific** event-shape helpers. This session closes that gap and finishes **phase 20.2** checklist items before **`/phase-end 20.2`**.
- **Boundaries:** **Booking** (appointments, invites, Google Calendar) + **admin config** (event shapes) on the server; **no** PartFinalizer port; **no** conflation with **availability “differential”** (major/minor perspectives) unless an explicit alias to event-shape role is found.
- **Patterns to follow:** Keep persistence in repositories/routers **thin** — validate shape, ownership consistency, and required fields; reuse existing `appointmentIncludes` and invite normalization. Calendar code: extend **`inviteOrchestrationService`** / shared helpers rather than duplicating segment lookup.
- **Risks:** Multi-segment timing: today **one** slot drives **all** Google events — changing to per-segment windows may require **client** payload fields; if so, document and split minimal server read path only (still no resolution math).
- **Alternatives:** Key calendar events only by `eventInstanceId` (already true per loop); sort instances by `placementKind` / `anchorEdge` using `@shared` placement ordering helpers if present — prefer shared utility over ad hoc compares.

### Goal

Close **Phase 20.2** session **20.2.4**: (1) **Appointments + calendar** paths satisfy FEATURE_20 **§5.1** rows for appointment persistence and calendar services — segment identity from **`event_instances`**, placement policy from **`event_shapes`**, no server booking-total calculator; (2) **API cleanup** — event-shape **differential-role** keys/helpers removed or isolated per **§5.3** on **entity** routes; (3) **phase wrap-up** — drift checklist, **`phase-20.2-guide.md`** / **`DOMAIN_REWRITE_WORKLOG.md`** / handoff updates for **20.3**.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§5.1–5.4**), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` (**§4–5**), `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `phases/phase-20.2-guide.md`, `phases/phase-20.2-planning.md`, `sessions/session-20.2.3-handoff.md`, `DOMAIN_REWRITE_WORKLOG.md` (or feature worklog path in use)
- **Implementation (this session — expect):** `server/src/routes/internal/appointments/**`, `server/src/services/invites/**`, `server/src/services/google/calendar/**`, `server/src/routes/internal/entities/eventShapeEntityValidation.ts`, `entitySanitizers.ts`, `entityConstants.ts`; optionally `shared/utils/eventPlacementUtils.ts` for ordering

### Approach

1. **Task 20.2.4.1:** Trace appointment create/update → stored fields vs FEATURE_20 **§5.1** “persist client-submitted resolved payload”; trace `createInvitesForAppointment` → ensure **segment + shape placement** are loaded and **used** where product requires (ordering, documented timing policy); adjust **`inviteAppointmentShared`** / **`linkStripSetForEventShape`** naming or typing if instance vs shape ownership is confusing — **no** new server calculator.
2. **Task 20.2.4.2:** Grep **`server/src/routes/internal/entities`** (and related serializers) for **`differentialRole` / `differential_role`**; remove dead constants or narrow to validation-only rejects; **do not** rip **availability** differential tables without a separate task.
3. Run **server + client lint** and **`server` `tsc`** on touched paths; update **phase-20.2-guide** session checkbox (already `[ ]` for 20.2.4 until tasks done), **phase log**, **phase handoff** stub, and worklog for **20.3** entry.

### Checkpoint

- **20.2.3** complete: preview uses **`eventInstanceId`**; relationships validate segment ownership.
- **Branch:** `feature/domain-architecture-alignment` (pushed after last session-end).
- **Before coding:** Re-read **`phase-20.2-guide.md` §8.2** acceptance checks (no server booking totals; placement-only event shapes).

### Deliverables

- Audited + adjusted **appointment** persistence and **invite/calendar** pipeline per **§5.1 / §5.2** (with any timing/placement behavior documented in code comments or worklog).
- **Entity** route cleanup for **event-shape differential-role** remnants per **§5.3** (safe scope).
- **Phase 20.2** documentation updates: guide objectives, log, handoff, worklog; ready for **`/session-end 20.2.4`** then **`/phase-end 20.2`**.

### Acceptance Criteria

- No new server route recomputes booking totals or duplicates PartFinalizer.
- Calendar invite creation uses **event instance** rows tied to appointment selections and reads **placement** fields from the related **event shape** (loaded and applied per task findings — at minimum **validated + ordered or documented**).
- **Event shape** write paths do not accept or emit legacy **`differentialRole`** as a supported field (existing reject/strip behavior preserved or tightened); no accidental removal of unrelated **availability** differential features.
- **`cd server && npx tsc --noEmit`**, **`cd server && npm run lint`**, **`cd client && npm run lint`** pass after changes (or unchanged if a task is docs-only — prefer one docs-only task-end at most).

---

---
