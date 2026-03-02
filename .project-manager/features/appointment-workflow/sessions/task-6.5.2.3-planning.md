# Planning: task 6.5.2.3 — Availability bypass (server excludes rescheduling appointment from overlap)

## Goals of this tier

**Task 6.5.2.3:** Add `reschedulingAppointmentId` to computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents so its time and drive buffers do not block slots.

## How we build the tierDown to achieve them

Single deliverable (no child tier). Implement this task; then run task-end and cascade to next task or session-end.

## Loaded Context

- **Scope:** 6.5.2.3
- **Context source policy:** tierUp only. Session guide (task section) and session handoff excerpt only.

### Goal (must satisfy)

[To be filled from session guide or planning conversation]

### Continuity (handoff — where we left off)

[Session 6.5.2 handoff content]

### Reference (tierUp guide excerpt)

[Session 6.5.2 guide task block]

## Design Before Execute

### Coding Goal

[Add reschedulingAppointmentId to availability request; server excludes that appointment from overlap list used in slot computation while still returning it in calendarEvents.]

### Files

- [To be filled — e.g. availability API client, server computed-availability/slot route]
- [To be filled]

### Approach

[To be filled]

### Checkpoint

[What needs to be verified — e.g. reschedule flow can pick a new slot without current appointment blocking it; calendar still shows current appointment.]

## Decisions Made

[To be filled when decisions are made]

## Insight / Proposal / Decisions

[To be filled during planning]
