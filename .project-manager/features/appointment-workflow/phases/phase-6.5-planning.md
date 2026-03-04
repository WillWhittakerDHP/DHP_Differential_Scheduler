# Planning: phase 6.5 -- 6.5

## Loaded Context
- **Scope:** 6.5

- **Context source policy:** tierUp only. Feature guide (phase descriptor) and feature handoff only. Phase guide and phase handoff files are excluded.

### Transition context (handoff)

## Transition Context (tierUp: feature)

# Feature appointment-workflow Handoff

**Purpose:** Transition context between features (large-scale concerns only)

**Tier:** Feature (Tier 0 - Highest Level)

**Last Updated:** 2026-02-27
**Feature Status:** In Progress
**Current Session:** Session 6.4.2 or 6.4.3 (see Next Action)
**Next Session:** Session 6.4.3 (Moveable Modal — Shared Time-Slot Grid) — after 6.4.2
**Next Phase:** Phase 6.5 (Rescheduling Flow) — after Phase 6.4 completes
**Other planned phases (can run in parallel):** Phase 6.10 (Fee Preview & Coupon Visibility) — Sessions 6.10.1 (admin toggle and settings), 6.10.2 (Availability-step fee bar and popover). See [phases/phase-6.10-guide.md](phases/phase-6.10-guide.md). Phase 6.11 (Drive Time Fee Line Item) — Session 6.11.1 (settings, calculation, line item). See [phases/phase-6.11-guide.md](phases/phase-6.11-guide.md).

---

## Current Status

**Feature appointment-workflow:** In Progress
**Current Phase:** Phase 6.4 (Moveable Modal & preClosing Property) — Session 6.4.1 not started
**Current Session:** Session 6.4.2 / next: 6.4.3
**Next Action:** Start Session 6.4.3 (Moveable Modal — Shared Time-Slot Grid). See `sessions/session-6.4.3-guide.md`.
**Next Phase:** P

*(excerpt truncated)*

### Phase intent (from feature guide)

## Phase intent from feature guide

Phase 6.5: Rescheduling Flow
**Description:** Reschedule confirmed appointments using the same flow as quote and dev-mode load: appointment loads at step 3 (Availability); user adjusts and reschedules. The current appointment stays on the calendar but is temporarily excluded from availability constraints so its time and drive buffers do not block slots; the original inspection slot has a distinct UI indicator (e.g. different color or overlay).
**Sessions:** 2–3 (see phase guide: 6.5.1 entry/transitions, 6.5.2 availability bypass, 6.5.3 original-inspection UI)
**Dependencies:** Phase 6.3 (transition guards: confirmed → rescheduling → submitted)
**Success Criteria:**
- Reschedule action available for confirmed appointments; wizard reuses load-at-step-3 and update path (same as quote/dev load)
- `reschedulingAppointmentId` in computed-availability request; server excludes that appointment’s calendar event from overlap while keeping it in calendarEvents
- Original-inspection slot visually distinct (e.g. `appointment-slot-btn--original-inspection`) but still selectable
- Wizard mode set to `reschedule` when loading for reschedule; submit shows “Update appointment” and calls update path
- Admin entry: step 0 or pre-wizard (admin-only) — Start new | Edit quote | Reschedule; dropdown of non-completed inspections when Edit quote or Reschedule; selection sets wizard mode and loadedAppointmentId
- Status transitions: confirmed → rescheduling → submitted
**See:** `phases/phase-6.5-guide.md` for implementation details, session breakdown, and relation to Phase 6.8 (allowedExceptions)

- [ ] ### Phase 6.6: Soft Delete vs Hard Delete
**Description:** Policy and UI for cancelled vs deleted; retention rules; audit trail.
**Sessions:** To be planned
**Success Criteria:**
- Clear policy for cancelled vs deleted appointments
- Admin UI for soft delete and hard delete actions
- Retention and audit behavior documented

- [ ] ### Phase 6.7: Scheduled By Auto-Population
**Description:** Set `scheduled_by_id` from logged-in user on appointment creation.
**Sessions:** To be planned
**Dependencies:** Feature 7 (Authentication) — requires `req.user`
**Success Criteria:**
- `scheduled_by_id` populated from authenticated user on create
- Displayed in admin appointment details

- [ ] ### Phase 6.8: Admin Force-Create & Constraint Overrides
**Description:** Force-create appointments bypassing blockers; `constraint_overrides` table; reschedule with exceptions.
**Sessions:** 4 (6.8.1–6.8.4)
**Dependencies:** Feature 7 (Authentication) — requires `req.user` for `authorized_by_id`
**Success Criteria:**
- Force-create route creates appointment + override record
- Admin UI shows blocked slots with force-create option
- Reschedule flow respects override exceptions
- Override constraints and Force schedule visibility gated by **user role** (admin); wizard may be in `reschedule` or other modes when those actions are shown; block-level `agentPermissions` (when added) respected for tooltips and permissions
- Full architecture, data model, and implementation details in phase guide

- [ ] ### Phase 6.9: Availability Step Mini-Wizard
**Description:** Re

*(excerpt truncated)*

### Governance Context (audit digest)

## Governance Context (Phase)


### Type Inventory Issues
- 12 mixed type+constant files
- 62 inline types in composables
- 5 duplicate type names

### Duplication Hotspots (top 4)
- **create** pattern across 33 files
- **use** pattern across 240 files
- **get** pattern across 75 files
- **update** pattern across 5 files

### Import Graph
- **2** fan-in violations: `client/src/constants/entities` (157), `client/src/types/entities` (136)
- **5** composable chain depth violations (max depth exceeded)

### Governance Dashboard

| Domain | Score |
|--------|-------|
| Function governance | 89/100 |
| Component governance | 99/100 |
| Composable governance | 94/100 |
| Type inventory | 0/100 |


*Type playbook:* `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`

- **Governance highlights:** Loaded 2 governance highlights from current audits.

### Governance Findings

- - **2** fan-in violations: `client/src/constants/entities` (157), `client/src/types/entities` (136)
- - **5** composable chain depth violations (max depth exceeded)

- **Related code:** No inventory reuse hints were extracted from current output.



## Goal
[To be refined during discussion]

## Files
[To be refined during discussion]

## Approach
[To be refined during discussion]

## Checkpoint
[To be refined during discussion]


## Decisions Made
[Populated as conversation progresses]

## Insight / Proposal / Decisions
### 1. Insight / Proposal / Decision

**What the docs indicate:** Phase: "Guide: Rescheduling Flow".

**Proposed path:** We'll plan all necessary sessions and follow governance. This is the place to lock in or adjust what we're building.

**Decision needed:** After reading the planning doc and context, what do you want to lock in or adjust before we proceed?

*Where you and the agent talk about the plan.*

**Options:** Let's discuss in chat | I'm ready to lock the plan as-is

---

### 2. Insight / Proposal / Decision

**What the docs indicate:** We'll follow governance (session order, session/task audits). No option to relax for speed.

**Proposed path:** We'll follow the session order and apply governance.

**Decision needed:** Any specific constraints or priorities for Guide: Rescheduling Flow?

*Domain constraints only.*

**Options:** I'll describe in chat | None in mind
