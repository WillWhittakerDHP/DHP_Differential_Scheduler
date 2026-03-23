# Plan: task 6.14.3.3 — Docs, Phase 3.0 resolver checklist, quality gate

## Contract
- **Tier:** task | **ID:** 6.14.3.3
- **Scope:** Documentation + lint verification for session **6.14.3** closeout — **no** new/modified test files (`TEST_ENABLED=false` until Phase 3.0).
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** documentation_and_verification
- **Scope shape:** docs_plus_lint
- **Planning artifact action:** update

## Where we left off
Tasks **6.14.3.1** (exhaustive audit table in `phase-6.14-handoff.md`) and **6.14.3.2** (org-default chips on Grid + Duration rounding; org load on calendar/constraints/org) are complete. This task **closes the session** from a docs/quality perspective and aligns `phase-6.14-guide.md` success criteria with reality.

## Goal
1. Update **`phases/phase-6.14-guide.md`**: set Success Criteria checkboxes to match **delivered** 6.14.3 work (exhaustive audit, optional badges, documented test deferral); refresh Overview/Status lines so they do not still say “6.14.3 in progress” once this task is done.
2. Add a **Phase 3.0 resolver test checklist** (bullet list only — no test files): e.g. missing org keys, zero vs unset overrides, hold clamping, calendar numeric overrides partial merge, confirmation `driveTimeFee` merge path. Place in `phase-6.14-guide.md` (new subsection) **or** extend existing bullets in `phase-6.14-handoff.md` — one canonical location, cross-reference the other in one line.
3. Update **`sessions/session-6.14.3-handoff.md`** (Current Status, Next Action, Transition Context, Last Updated) for session close readiness.
4. Append a short line to **`phases/phase-6.14-log.md`** if that file is the phase log used for milestones (session 6.14.3 doc/quality closeout).
5. **Quality gate:** `cd client && npm run lint`, `cd server && npm run lint` (both exit 0). Dev server already running is acceptable verification; if not, note “start:dev verified in prior session” only if true — otherwise start once.

## Files
- `phases/phase-6.14-guide.md` — success criteria, status, Phase 3.0 checklist subsection.
- `phases/phase-6.14-handoff.md` — optional one-line cross-ref if checklist lives only in guide.
- `sessions/session-6.14.3-handoff.md` — session handoff sections.
- `phases/phase-6.14-log.md` — log entry if used by project convention.

## Approach
1. Read current `phase-6.14-guide.md` Success Criteria; mark **Exhaustive resolver coverage** checked with pointer to audit table in `phase-6.14-handoff.md` §6.14.3.1.
2. Mark **Optional legacy affordances** checked with pointer to 6.14.3.2 (Grid + Rounding chips; drive fee deferred per handoff).
3. Add **Phase 3.0 — proposed automated tests** as a short checklist (no code).
4. Set **Resolver automated tests** row to “documented for Phase 3.0; no tests added” (checkbox style: document as `[ ]` tests implemented with note, or add sub-bullet per project style).
5. Run client + server lint; fix any issues introduced by doc-only edits (unlikely).

## Checkpoint
- Phase guide reflects 6.14.3 outcomes honestly.
- Session handoff has Current Status / Next Action / Transition Context / Last Updated filled.
- Client + server lint pass.

## Design Before Execute
```
phase-6.14-guide.md:
  Success Criteria:
    [x] exhaustive audit → see handoff 6.14.3.1 table
    [x] optional badges → 6.14.3.2 (+ defer note for drive fee)
    [ ] automated resolver tests → Phase 3.0 checklist below (not implemented)
  New: ## Phase 3.0 — Resolver tests (checklist)
    - bullets...

session-6.14.3-handoff.md: fill required sections

lint: client; server
```

---

## Reference
- `sessions/session-6.14.3-guide.md` (task 6.14.3.3)
- `phases/phase-6.14-handoff.md` (audit table 6.14.3.1, badges 6.14.3.2)
- `LAUNCH_CHECKLIST.md` or project test policy if needed for Phase 3.0 wording
