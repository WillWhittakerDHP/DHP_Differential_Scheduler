# Planning: task 6.5.2.3 -- 6.5.2.3

## Goals of this tier
Availability bypass — server excludes rescheduling appointment from overlap: Verify end-to-end: add reschedulingAppointmentId to computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents so its time and drive buffers do not block slots.

## How we build the tierDown to achieve them
**Create/add (from Goal/Approach):**
- Run reschedule flow from admin or Reschedule action; confirm slot grid does not treat current appointment as blocking; confirm calendar still shows it. Fix any remaining wiring or edge cases.

Then run task-end and cascade to next task or session-end.

## Loaded Context
Below: 1) Goal (must satisfy), 2) Context policy (reference), 3) Governance (must satisfy), 4) Inventory (consult for reuse/adapt before creating new), 5) Continuity (handoff), 6) Reference (guide).

- **Scope:** 6.5.2.3

- **Context source policy:** tierUp only. Guide from session guide; handoff from task (tierUp + tierAcross previous sibling); log from task (previous sibling). TierDown docs for this unit are produced by this run, not read as input.

### Goal (must satisfy)

**What we are planning:**

**Explicit coding goal:** Verify end-to-end: add reschedulingAppointmentId to computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents so its time and drive buffers do not block slots.


**Proposed approach:**

**Approach:** Run reschedule flow from admin or Reschedule action; confirm slot grid does not treat current appointment as blocking; confirm calendar still shows it. Fix any remaining wiring or edge cases.
Add pseudocode steps and key snippets in the Design Before Execute section, then approve to begin coding.

### Governance (must satisfy — thresholds and findings)

- No governance findings were extracted from current output.

Full governance context is in the run output below.

### Inventory (reference — reuse: consult to see if we have anything built that could be directly used or adapted)

For this tier, consult the inventory below to see if we already have structures, composables, utils, or types that could be directly used or adapted before introducing new code.

No task files specified — inventory skipped.

### Continuity (handoff — where we left off)

## Transition Context (tierUp: session)

# Session 6.5.2 Handoff: Availability Bypass

**Purpose:** Minimal transition context between sessions (~100-200 lines)

**Tier:** Session (Tier 2 - Medium-Level)

**Last Updated:** [Date]
**Session Status:** In Progress
**Next Session:** 6.5.3

---

## Current Status

**Last Completed:** Task (none yet)
**Next Session:** Session 6.5.3
**Git Branch:** (current branch)
**Last Updated:** [Date]

---

## Next Action

Start Session 6.5.3 (Original-Inspection UI) or continue with Task 6.5.2.3.

---

## Transition Context

**Where we left off:**
Session 6.5.2 — Availability Bypass. `reschedulingAppointmentId` in computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents.

**What you need to start:**
- Review session guide tasks (6.5.2.1, 6.5.2.2, 6.5.2.3)
- Phase 6.5 guide: `phases/phase-6.5-guide.md`

### Reference (tierUp guide excerpt — do not treat as task list)

Task context (from session guide)

- [ ] #### Task 6.5.2.3: Availability bypass — server excludes rescheduling appointment from overlap
**Goal:** Verify end-to-end: add reschedulingAppointmentId to computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents so its time and drive buffers do not block slots.
**Files:**
- Same as 6.5.2.1 and 6.5.2.2; plus any integration tests or manual test steps
**Approach:** Run reschedule flow from admin or Reschedule action; confirm slot grid does not treat current appointment as blocking; confirm calendar still shows it. Fix any remaining wiring or edge cases.
**Checkpoint:** Reschedule flow works: user can select a different slot; current appointment does not block; calendar display unchanged.

---


## Design Before Execute

### Coding Goal
Verify end-to-end: add reschedulingAppointmentId to computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents so its time and drive buffers do not block slots.

### Files
- Same as 6.5.2.1 and 6.5.2.2; plus any integration tests or manual test steps

### Pseudocode
1. Run reschedule flow from admin or Reschedule action; confirm slot grid does not treat current appointment as blocking; confirm calendar still shows it. Fix any remaining wiring or edge cases.

### Snippets (scaffold)
[Add key signatures or code shapes in planning doc]

### Acceptance / Test Intent
- Reschedule flow works: user can select a different slot; current appointment does not block; calendar display unchanged.



## Decisions Made
[Populated as conversation progresses]

## Insight / Proposal / Decisions
### 1. Insight / Proposal / Decision

**What the docs indicate:** Task context: Availability bypass — server excludes rescheduling appointment from overlap. Goal/Files/Approach from the session guide inform the design.

**Proposed path:** We'll create a task planning doc (Design Before Execute) and use it as the single source of truth. Discuss in chat, then run /accepted-code when ready to begin coding.

**Decision needed:** What do you want to lock in or adjust before we begin coding?

*Where you and the agent talk about the task plan.*

**Options:** Let's discuss in chat | I'm ready to lock the design and begin coding
