<!-- harness-planning-rollup tier=session id=20.2.4 consolidatedAt=2026-04-02T18:36:28.141Z -->

# Consolidated planning: session 20.2.4

## Session 20.2.4 (parent)

## Story

**This session delivers** aligned **appointment persistence** and **Google Calendar invite** behavior keyed to **event_instances** + **event_shapes** placement data, and strips remaining **differential-role** noise from the **event-shape entity** API surface, **so that** Phase **20.2** closes with FEATURE_20 **§5.1 / §5.2** satisfied (no server booking calculator; ownership via segments and shapes) and the repo is ready for **20.3** (client-heavy tranche).
**Estimated size:** M

---

## Analysis

- **Problem / why now:** Sessions **20.2.1–20.2.3** aligned entities, relationships, and preview to Phase **20.1** schema. FEATURE_20 **§5.1** still lists **appointment persistence** and **calendar event creation** as route areas that must use **raw rows + client payload**, and **§5.3** calls for removing **differential-role-specific** event-shape helpers. This session closes that gap and finishes **phase 20.2** checklist items before **`/phase-end 20.2`**.
- **Boundaries:** **Booking** (appointments, invites, Google Calendar) + **admin config** (event shapes) on the server; **no** PartFinalizer port; **no** conflation with **availability “differential”** (major/minor perspectives) unless an explicit alias to event-shape role is found.
- **Patterns to follow:** Keep persistence in repositories/routers **thin** — validate shape, ownership consistency, and required fields; reuse existing `appointmentIncludes` and invite normalization. Calendar code: extend **`inviteOrchestrationService`** / shared helpers rather than duplicating segment lookup.
- **Risks:** Multi-segment timing: today **one** slot drives **all** Google events — changing to per-segment windows may require **client** payload fields; if so, document and split minimal server read path only (still no resolution math).
- **Alternatives:** Key calendar events only by `eventInstanceId` (already true per loop); sort instances by `placementKind` / `anchorEdge` using `@shared` placement ordering helpers if present — prefer shared utility over ad hoc compares.

## Goal

Close **Phase 20.2** session **20.2.4**: (1) **Appointments + calendar** paths satisfy FEATURE_20 **§5.1** rows for appointment persistence and calendar services — segment identity from **`event_instances`**, placement policy from **`event_shapes`**, no server booking-total calculator; (2) **API cleanup** — event-shape **differential-role** keys/helpers removed or isolated per **§5.3** on **entity** routes; (3) **phase wrap-up** — drift checklist, **`phase-20.2-guide.md`** / **`DOMAIN_REWRITE_WORKLOG.md`** / handoff updates for **20.3**.

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§5.1–5.4**), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` (**§4–5**), `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `phases/phase-20.2-guide.md`, `phases/phase-20.2-planning.md`, `sessions/session-20.2.3-handoff.md`, `DOMAIN_REWRITE_WORKLOG.md` (or feature worklog path in use)
- **Implementation (this session — expect):** `server/src/routes/internal/appointments/**`, `server/src/services/invites/**`, `server/src/services/google/calendar/**`, `server/src/routes/internal/entities/eventShapeEntityValidation.ts`, `entitySanitizers.ts`, `entityConstants.ts`; optionally `shared/utils/eventPlacementUtils.ts` for ordering

## Approach

1. **Task 20.2.4.1:** Trace appointment create/update → stored fields vs FEATURE_20 **§5.1** “persist client-submitted resolved payload”; trace `createInvitesForAppointment` → ensure **segment + shape placement** are loaded and **used** where product requires (ordering, documented timing policy); adjust **`inviteAppointmentShared`** / **`linkStripSetForEventShape`** naming or typing if instance vs shape ownership is confusing — **no** new server calculator.
2. **Task 20.2.4.2:** Grep **`server/src/routes/internal/entities`** (and related serializers) for **`differentialRole` / `differential_role`**; remove dead constants or narrow to validation-only rejects; **do not** rip **availability** differential tables without a separate task.
3. Run **server + client lint** and **`server` `tsc`** on touched paths; update **phase-20.2-guide** session checkbox (already `[ ]` for 20.2.4 until tasks done), **phase log**, **phase handoff** stub, and worklog for **20.3** entry.

## Checkpoint

- **20.2.3** complete: preview uses **`eventInstanceId`**; relationships validate segment ownership.
- **Branch:** `feature/domain-architecture-alignment` (pushed after last session-end).
- **Before coding:** Re-read **`phase-20.2-guide.md` §8.2** acceptance checks (no server booking totals; placement-only event shapes).

## Deliverables

- Audited + adjusted **appointment** persistence and **invite/calendar** pipeline per **§5.1 / §5.2** (with any timing/placement behavior documented in code comments or worklog).
- **Entity** route cleanup for **event-shape differential-role** remnants per **§5.3** (safe scope).
- **Phase 20.2** documentation updates: guide objectives, log, handoff, worklog; ready for **`/session-end 20.2.4`** then **`/phase-end 20.2`**.

## Acceptance Criteria

- No new server route recomputes booking totals or duplicates PartFinalizer.
- Calendar invite creation uses **event instance** rows tied to appointment selections and reads **placement** fields from the related **event shape** (loaded and applied per task findings — at minimum **validated + ordered or documented**).
- **Event shape** write paths do not accept or emit legacy **`differentialRole`** as a supported field (existing reject/strip behavior preserved or tightened); no accidental removal of unrelated **availability** differential features.
- **`cd server && npx tsc --noEmit`**, **`cd server && npm run lint`**, **`cd client && npm run lint`** pass after changes (or unchanged if a task is docs-only — prefer one docs-only task-end at most).

---

## Task 20.2.4.1 (source: task-20.2.4.1-planning.md)

### Story

**This task changes** invite/calendar orchestration **so that** Google Calendar rows are created from **scoped segment rows** in **placement order** (shape-level policy), link-strip flags stay clearly **segment-owned**, and appointment persistence is **explicitly verified** as persistence-only — **because** Phase **20.2** must satisfy **§5.1–5.2** before **20.2.4.2** cleanup and phase-end.

---

### Analysis

- FEATURE_20 **§5.1:** appointment persistence + calendar services must use **raw storage + client payload**; calendar reads **segment identity** and **placement policy** from **`event_instances` / `event_shapes`**. **§5.2:** no alternate booking calculator on server.

### Goal

For **task 20.2.4.1** only: align **invite → Google Calendar** with FEATURE_20 **§5.1** by **applying** `event_shapes.placementKind` / `anchorEdge` to **segment processing order**, clarify **segment vs shape** naming for link-strip helpers, and **document/verify** appointment routes as **persistence-only** (no booking recomputation).

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§5.1–5.2**), `.project-manager/ARCHITECTURE.md` (**§10** booking boundary)
- **Implementation:** `shared/utils/eventPlacementUtils.ts`, `server/src/services/invites/inviteOrchestrationService.ts`, `server/src/services/invites/inviteAppointmentShared.ts`, `server/src/services/invites/eventInstancePreviewService.ts` (import rename if needed), optionally `server/src/routes/internal/appointments/appointmentHelpers.ts` or `appointmentCrudRouter.ts` (comment-only)

### Approach

1. Implement shared **placement sort** comparator + unit-safe ordering (pure function, explicit return type).
2. Wire sort into **`createInvitesForAppointment`** after dedupe.
3. Refactor link-strip helper naming + update **preview** import if export changes.
4. Add **timing WHY** comment(s) on slot extraction.
5. Appointment path **verification** + doc comment if no code change.
6. **`cd server && npx tsc --noEmit`** and **`cd server && npm run lint`** on touched paths (client lint if shared types trigger — usually not).

### Checkpoint

- Task **20.2.4.2** will handle differential-role entity cleanup and phase docs — do not mix into this PR unless trivial.

### Deliverables

- Shared **calendar-order** comparator + sorted invite iteration.
- Clearer **link-strip** API naming (alias preserved).
- **Comments** documenting shared **single-slot** timing and **persistence-only** appointments.

### Acceptance Criteria

- **`createInvitesForAppointment`** creates Google events in **non-arbitrary** order derived from **`event_shapes.placementKind`** / **`anchorEdge`** (stable tie-breaks).
- **No** server-side recomputation of booking totals; appointment mutations unchanged in behavior except optional documentation.
- **`linkStripSetForEventShape`** callers still work; new name documents **instance** link flags.
- Server **`tsc`** + **`eslint`** pass for edited files.

### Design

1. Add **`compareEventSegmentsForCalendarOrder(a, b)`** in **`shared/utils/eventPlacementUtils.ts`**: rank `placementKind` **`primary` < `secondary` < `marginal` < `floating`**; tie-break **`anchorEdge`** (`start` before `end` before null); final tie-break stable string compare on **`eventInstance.id`**. Document that this mirrors **scheduling presentation order**, not duration math.
2. **`inviteOrchestrationService.ts`**: after building `uniqueInstances`, sort with the comparator (instances need nested `eventShape` — ensure type allows access). Optional **`logger.debug`** listing ordered segment ids + placement (low volume).
3. **`inviteAppointmentShared.ts`**: add **`linkStripSetForSegmentLinkFlags`** as the canonical name; implement **`linkStripSetForEventShape`** as a thin deprecated alias calling it (or reverse: keep export name for minimal diff — **prefer** new name + alias to satisfy clarity without breaking imports in **eventInstancePreviewService**). Actually preview service passes `segment` with instance flags — same helper. Plan: rename internal implementation to `linkStripSetForSegmentLinkFlags`, export both names.
4. **`extractStartTime` / `extractEndTime`** (or `createEventForInstance` header): **WHY** comment — all segments share the **first** wizard slot until per-segment times exist on **`appointments`**.
5. **Appointment persistence:** Read-through `appointmentCrudRouter` mutation path; if already persistence-only, add a **short comment** near create/update handler or in **`appointmentHelpers`** module doc pointing to ARCHITECTURE **§10** / FEATURE_20 **§4.5** (no server finalizer). **No behavior change** unless a concrete gap is found.

---

## Task 20.2.4.2 (source: task-20.2.4.2-planning.md)

### Story

**This task changes** server entity-layer **constants and file layout** so legacy **`differentialRole`** keys are **only** referenced as **event-shape legacy strip/reject** concerns, and updates **phase 20.2** PM artifacts **because** Feature 20 pass 2 must be **closed with traceable drift notes** before **Phase 20.3** (client/admin UX tranche).

---

### Analysis

- Session **20.2.4** closes Phase **20.2** API alignment. **§5.3:** remove or isolate differential-role-specific **route** surface for **event shapes**; **20.2.4.2** finishes docs so **`/phase-end 20.2`** / **20.3** can proceed.

### Goal

Finish **session 20.2.4** and **Phase 20.2** documentation: isolate **event-shape** legacy **`differentialRole`** API handling per **§5.3**, and record phase completion for **20.3** startup.

### Files

- **Server:** `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts` (new), `eventShapeEntityValidation.ts`, `entitySanitizers.ts`, `entityConstants.ts`
- **PM:** `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`, `phase-20.2-log.md`, `phase-20.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md`, `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`
- **Canonical refs:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` **§5.3**, **§8.2**, `phase-20.2-planning.md` Definition of Done

### Approach

1. Implement legacy-key module + wire three entity files; **`grep`** confirms no orphan **`FIELD_NAMES.DIFFERENTIAL`**.
2. Update phase/session guides, log, handoff, worklog per **Design**.
3. **`cd server && npx tsc --noEmit && npm run lint`** (entity-only code changes).

### Checkpoint

- After this task: **`/session-end 20.2.4`** then **`/phase-end 20.2`** (user-driven); next phase **`/phase-start 20.3`** per ladder.

### Deliverables

- Isolated legacy key constants + **unchanged** reject/strip behavior.
- **Phase 20.2** guide/log/handoff + **worklog** entry reflect completion and **20.3** handoff.
- Session **20.2.4** guide task **20.2.4.2** checked.

### Acceptance Criteria

- **`eventShape`** create/update still rejects body keys **`differentialRole`** / **`differential_role`** with the same user-facing guidance (placement fields).
- Sanitizers still **delete** those keys for **`eventShape`**.
- **`FIELD_NAMES`** no longer exports **`DIFFERENTIAL_ROLE`** (grep clean).
- **`phase-20.2-guide.md`** objectives and session **20.2.4** reflect completion; **`phase-20.2-handoff.md`** has real **Next Phase 20.3** context.
- Server **`tsc`** + **`eslint`** pass.

### Design

1. Add **`server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts`** exporting **`EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_CAMEL`** and **`..._SNAKE`** (const strings + short WHY).
2. **`eventShapeEntityValidation.ts`**: import keys; replace **`FIELD_NAMES.DIFFERENTIAL_*`** usages.
3. **`entitySanitizers.ts`**: import keys; replace deletes.
4. **`entityConstants.ts`**: remove **`DIFFERENTIAL_ROLE`** entries from **`FIELD_NAMES`**.
5. **`phase-20.2-guide.md`**: mark **Overview Status** **Complete** (or equivalent); check **objectives** and session **20.2.4** complete; fix **Status** line if still “Not Started”.
6. **`phase-20.2-log.md`**: append **Session 20.2.4** completion (dedupe duplicate **20.2.2** log blocks only if trivial one-line fix — **optional**, avoid large unrelated edits).
7. **`phase-20.2-handoff.md`**: replace template with **Phase 20.2 → 20.3** real paths under **`domain-architecture-alignment`**, **Current Status**, **Next Action**, **Transition Context**.
8. **`DOMAIN_REWRITE_WORKLOG.md`**: add **Checkpoint 8** (or next) bullet: Phase **20.2** API pass closed — legacy differential-role keys isolated; calendar/appointments alignment from **20.2.4**; next **20.3** per **`FEATURE_20`** pass order.
9. **`session-20.2.4-guide.md`**: mark task **20.2.4.2** complete if present as checkbox.

---
