# Plan: task 6.14.2.3 — Docs, handoff, quality gate

## Contract
- **Tier:** task | **ID:** 6.14.2.3
- **Scope:** Close session **6.14.2** documentation and quality checks; no new product features unless a handoff gap blocks honesty.
- **Governance:** Project session checklist (lint, app start); handoff docs stay accurate.

## Work Profile
- **Execution intent:** implement
- **Action type:** integration
- **Scope shape:** cross_cutting
- **Governance domains:** docs, client, server
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** light

## Where we left off
Tasks **6.14.2.1** (server hold/timeout + validation alignment) and **6.14.2.2** (client merged duration rounding via `useAppointmentShape`) are complete. Optional admin “org default” badges were deferred in phase handoff. This task finishes the paper trail and gates.

## Goal
1. **Phase handoff** — Update `phases/phase-6.14-handoff.md` with **session 6.14.2** summary: what shipped (6.14.2.1–6.14.2.2), what remains optional (badges), and any **documented exceptions** to full resolver coverage.
2. **Session artifacts** — Update `sessions/session-6.14.2-handoff.md` (Current Status, Next Action, Transition Context per `REQUIRED_DOC_SECTIONS` if applicable) and append session log entries if the project uses `sessions/session-6.14.2-log.md` or phase log pattern.
3. **Phase log** — Add a concise **6.14.2** completion block to `phases/phase-6.14-log.md` (or session log file used by harness).
4. **Success criteria alignment** — In `phases/phase-6.14-guide.md`, mark items **delivered vs deferred** honestly (e.g. optional badges, Phase 3.0 tests).
5. **Quality gate** — `cd client && npm run lint`, `cd server && npm run lint`; confirm dev app still starts (existing `npm run start:dev` is fine if already running).

## Files
- `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- `.project-manager/features/appointment-workflow/phases/phase-6.14-log.md`
- `.project-manager/features/appointment-workflow/sessions/session-6.14.2-handoff.md`
- `.project-manager/features/appointment-workflow/phases/phase-6.14-guide.md` (success criteria checkboxes only)
- Optional: `sessions/session-6.14.2-planning.md` if session-level status line needed

## Approach
1. Read current handoffs and **6.14.2.1 / 6.14.2.2** outcomes; draft a short “Session 6.14.2” paragraph for phase handoff (no duplicate of full code lists—reference tasks).
2. Update session handoff **Next Action**: e.g. `/session-end 6.14.2` when user is ready.
3. Phase guide: tick **resolved numeric policy** path items that are now true; leave **optional badges** unchecked with note in handoff, or tick if deferred explicitly.
4. Run linters; fix only issues introduced in this task’s doc edits (none expected) or pre-existing blockers noted in handoff.
5. Do **not** expand scope into new resolver wiring—that was 6.14.2.1–6.14.2.2.

## Design before execute (checklist)
```
1. Draft handoff bullets from session guide tasks 6.14.2.1–6.14.2.3.
2. Patch markdown files in order: phase handoff → session handoff → phase log → phase guide checkboxes.
3. npm run lint (client + server).
4. Note app start: OK / skipped with reason.
```

## Checkpoint
- Handoff and logs state **delivered vs deferred** without silent gaps.
- Client and server lint pass.
- Phase guide success criteria reflect reality; optional items explicitly deferred or done.

---
## Reference (read before execute — governance and inventory compliance is required)
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.14.2-guide.md` (Task 6.14.2.3)
- Session planning: `.project-manager/features/appointment-workflow/sessions/session-6.14.2-planning.md`
- Session handoff template: align **Current Status**, **Next Action**, **Transition Context** with `sessions/session-6.14.2-handoff.md`
- Prior task handoff: `sessions/task-6.14.2.2-handoff.md` (if present)
