# Planning: session 6.5.1 -- Guide: Rescheduling Flow

## Loaded Context
- **Scope:** 6.5.1

- **Context source policy:** tierUp only. Phase guide (session entry) and phase handoff only. Session handoff, session guide, and session log are excluded.


### What We Are Planning (from context)

Session 6.5.1 is focused on Guide: Rescheduling Flow per current docs.


### Proposed Implementation Plan

- Confirm concrete task scope and acceptance criteria from the session docs.
- Identify touched files (components/composables/utilities) before execute mode.
- Implement in small steps with governance checks after each change.


## Session: 6.5.1 - Guide: Rescheduling Flow
**Date:** 2026-03-01
**Duration:** [Estimated]
**Status:** In Progress
**Agent:** Current

### Session intent (from phase guide)

## Phase intent (goals and context)

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

*(excerpt truncated)*

### Governance Context (audit digest)

## Governance Context (Session)


### Function Governance
Clean — no violations detected.

**Thresholds:**
| Concern | Threshold |
|---------|-----------|
| Nesting depth | ≤ 3 levels |
| Branch count | ≤ 8 / function |
| Length (branchy) | ≤ 50 lines |
| Script setup | ≤ 100 lines |
| Params / returns | ≤ 4 each |
| Return type | Explicit on exported/boundary |

### Component Governance
Clean — no violations detected.

**Thresholds:**
| Concern | Threshold |
|---------|-----------|
| Prop count | ≤ 8 (or config object) |
| Emit count | ≤ 8 (or grouped) |
| Component coupling | ≤ 5 direct imports |
| Template directive depth | ≤ 3 |
| Template size | ≤ 200 lines |
| Complex expression | ≤ 80 chars |

1. Exceeds prop/emit/coupling/template thresholds? → decompose or extract
2. Orchestrator / allowlisted wrapper? → confirm allowlist entry
3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)

### Composable Governance
**Health findings (3):**
- `client/src/composables/admin/tables/useAppointmentsTableModel.ts` — oversized-return: Return surface has 11 properties; decompose into focused composables
- `client/src/composables/admin/useBaseCollectionField.ts` — oversized-return: Return surface has 12 properties; decompose into focused composables
- `client/src/composables/formFields/useFormFields.ts` — excessive-composable-imports: High composable fan-out (6 imports); consider decomposing or using a focused facade
**Logic hotspots (2):**
- `client/src/composables/booking/useMoveablePartsScheduling.ts` (score: 33)
- `client/src/composables/fieldContext/useFieldContextState.ts` (score: 20)

**Thresholds:**
| Concern | Threshold |
|---------|-----------|
| Return surface | < 10 properties |
| Composable imports | < 6 per file |
| 

*(excerpt truncated)*

- **Governance highlights:** Loaded 4 governance highlights from current audits.

### Governance Findings

- Clean — no violations detected.
- Clean — no violations detected.
- 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
- **Logic hotspots (2):**

### Reuse Opportunities

- `client/src/composables/admin/tables/useAppointmentsTableModel.ts` — oversized-return: Return surface has 11 properties; decompose into focused composables
- `client/src/composables/admin/useBaseCollectionField.ts` — oversized-return: Return surface has 12 properties; decompose into focused composables
- `client/src/composables/formFields/useFormFields.ts` — excessive-composable-imports: High composable fan-out (6 imports); consider decomposing or using a focused facade
- `client/src/composables/booking/useMoveablePartsScheduling.ts` (score: 33)
- `client/src/composables/fieldContext/useFieldContextState.ts` (score: 20)




## Goal

Deliver **rescheduling entry and status transitions** for Phase 6.5: (1) ensure status `rescheduling` and transitions confirmed → rescheduling → submitted are valid and used; (2) expose a Reschedule action for confirmed appointments that sets wizard mode and loads the appointment at step 3; (3) when in reschedule mode, wizard submit shows "Update appointment" and calls the update path (reuse quote/dev load flow). Admin pre-wizard entry (Start new | Edit quote | Reschedule + dropdown) is in scope as the entry point for admins. **Client-facing entry** (links in calendar invites or confirmation/quote emails) is deferred to **Session 6.5.4** — see `sessions/session-6.5.4-planning.md` and `phases/phase-6.5-guide.md`.

## Files

- **Status/transitions:** `client/src/constants/appointmentConstants.ts` (or equivalent) — `VALID_STATUS_TRANSITIONS`, status enum or type if extended.
- **Wizard mode and load:** `client/src/composables/booking/useBookingWizard.ts`, `useWizardAppointmentManagement.ts` (or equivalent) — wizard mode `reschedule`, load-at-step-3, `loadedAppointmentId`.
- **Reschedule action / entry:** Where confirmed appointments are listed (admin appointments table or booking UI) — component(s) that add "Reschedule" and set mode + load; admin entry pre-wizard (step 0) — new or existing component for "Start new | Edit quote | Reschedule" and dropdown of non-completed inspections.
- **Submit and API:** Confirmation/submit step component — label "Update appointment" when mode is reschedule; call to update (PATCH) appointment instead of create; any API or composable that performs appointment update.
- **Types:** Shared wizard-mode and appointment types (e.g. `WizardMode`, appointment status type) if new values are added.

## Approach

1. **Transitions first:** Verify or add `rescheduling` to the appointment status model and ensure `VALID_STATUS_TRANSITIONS` allows confirmed → rescheduling and rescheduling → submitted (and any other needed transitions). No UI for status field required; transitions are used when user starts reschedule and when they submit.
2. **Wizard mode and load path:** Add `reschedule` to wizard mode type/state. When entering reschedule flow (from Reschedule action or admin dropdown), set mode to `reschedule` and set `loadedAppointmentId`; wizard loads that appointment and lands at step 3 (Availability), reusing existing quote/dev load-at-step-3 logic.
3. **Reschedule action and admin entry:** Add "Reschedule" action for confirmed appointments (admin list and/or client surface). Implement admin entry: step 0 or pre-wizard with "Start new | Edit quote | Reschedule" and a dropdown of non-completed inspections (filter by status + optional admin-configured time window); selection sets wizard mode and `loadedAppointmentId`.
4. **Submit in reschedule mode:** In the submit/confirmation step, when mode is `reschedule`, show primary action "Update appointment" and call the existing update path (PATCH) instead of create. Ensure success/error handling and any post-submit navigation or notifications are consistent.
5. **Governance:** Keep components thin; put mode/load/update logic in composables; reuse existing load-at-step-3 and update APIs where possible.

## Checkpoint

- Status transitions confirmed → rescheduling → submitted are defined and used when starting reschedule and on submit.
- Reschedule action and (for admin) pre-wizard entry with dropdown set wizard mode and load appointment at step 3.
- In reschedule mode, submit shows "Update appointment" and updates the appointment via the update path; no duplicate create.
- Lint and typecheck pass; existing quote/dev load flow still works.

---

## Tasks

Itemized tasks to achieve the session goal. Complete in order unless dependencies allow parallel work.

- [ ] **Task 6.5.1.1 — Status and transitions**  
  Ensure appointment status `rescheduling` exists (client + server if applicable) and that `VALID_STATUS_TRANSITIONS` (or equivalent) allows: `confirmed` → `rescheduling`, `rescheduling` → `submitted`. Verify transition guards are used when entering reschedule flow and on submit. No UI for raw status required.

- [ ] **Task 6.5.1.2 — Wizard mode and load-at-step-3**  
  Add wizard mode `reschedule` to types/state. When mode is set to reschedule with a `loadedAppointmentId`, wizard loads that appointment and lands at step 3 (Availability), reusing existing quote/dev load-at-step-3 logic. Ensure `loadedAppointmentId` and mode are set by entry points (next tasks).

- [ ] **Task 6.5.1.3 — Reschedule action for confirmed appointments**  
  Add a "Reschedule" action wherever confirmed appointments are listed (e.g. admin appointments table or booking confirmation). Action sets wizard mode to `reschedule` and `loadedAppointmentId` to the selected appointment, then opens/navigates to the wizard at step 3.

- [ ] **Task 6.5.1.4 — Admin entry: Start new | Edit quote | Reschedule**  
  Implement admin-only step 0 or pre-wizard: choices "Start new" | "Edit quote" | "Reschedule". For Edit quote and Reschedule, show a dropdown of non-completed inspections (filter by status; optional time window). Each row: Address, Client name, Agent name (or minimal identifiers). Selection sets wizard mode and `loadedAppointmentId` and proceeds to wizard (step 3 for Reschedule/quote load).

- [ ] **Task 6.5.1.5 — Submit: "Update appointment" and update path**  
  In the confirmation/submit step, when wizard mode is `reschedule`, show primary button label "Update appointment" and call the appointment update (PATCH) path instead of create. Reuse existing update API and success/error handling; ensure no duplicate create and that status transition to `submitted` (or desired end state) is applied.

- [ ] **Task 6.5.1.6 — Verification and docs**  
  Run lint and typecheck; smoke-test: start reschedule from admin entry and from Reschedule action, change slot, submit; confirm update and that quote/dev load flow is unchanged. Update session guide or handoff with completed tasks and any open follow-ups (e.g. Session 6.5.4 client-facing links, 6.5.2 availability bypass).

---

## Decisions Made
[Populated as conversation progresses]

## Insight / Proposal / Decisions
### 1. Insight / Proposal / Decision

**What the docs indicate:** Session intent: "Guide: Rescheduling Flow".

**Proposed path:** We'll plan all necessary items for this goal and follow governance (thin components, composables, reuse). This is the place to lock in or adjust what we're building.

**Decision needed:** After reading the planning doc and context, what do you want to lock in or adjust before we proceed?

*Where you and the agent talk about the plan.*

**Options:** Let's discuss in chat | I'm ready to lock the plan as-is

---

### 2. Insight / Proposal / Decision

**What the docs indicate:** 

**Proposed path:** We'll plan all necessary items for this goal so execute mode has clear scope.

**Decision needed:** Any of these (or other edge cases) to include in this session's plan?

*What to lock in before we start.*

**Options:** Include all relevant; discuss if unsure | I'll specify in chat

---

### 3. Insight / Proposal / Decision

**What the docs indicate:** We'll follow governance (thin components, composables, reuse). No option to relax for speed.

**Proposed path:** We'll enforce governance on touched files and prefer reuse over new ad-hoc patterns.

**Decision needed:** Any specific UX or integration boundaries for Guide: Rescheduling Flow?

*Domain constraints only.*

**Options:** I'll describe in chat | None in mind
