# Session 20.6.3 Handoff

**Session:** 20.6.3 — Legacy differential-role and event-shape remnants  
**Last Updated:** 2026-04-03  
**Status:** Complete

---

## Current Status

**Last Completed:** Task **20.6.3.2** (booking/types + `eventAttendeeUtils` placement-only; shared `differentialRoleUtils` trim)  
**Follow-on:** Session **20.6.4** — review gate, docs, feature closeout  
**Git Branch:** `feature/domain-architecture-alignment`

## Next Action

Continue with **`session-20.6.4-planning.md`** / **`/session-start 20.6.4`** workflow (handoff for **20.6.4** is authoritative once that session is started).

## Transition Context

**Delivered:** Removed block-instance **`differentialEventRoleOverrides`** from admin and booking; **`AppointmentShape`** no longer carries the override map; **`eventAttendeeUtils`** uses **`placement_kind`** only; dead shared override helpers removed. **`DOMAIN_REWRITE_WORKLOG.md`** documents **Pass 6 / 20.6.3.2**.

**Canonical routing:** **`placement_kind` + `anchor_edge`** + relational **`event_assignments`** — do not conflate with wizard availability “differential perspectives.”

<!-- harness-across-ladder:start -->
## Across ladder (harness)

_Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._

- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-03T15:32:31.335Z
- **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
- **Focus phase:** `20.6` · **Next phase across:** _(none — after phase-end use /feature-end if last)_
- **Focus session:** `20.6.3` · **Session 3/4 in phase** · **Next session across:** `20.6.4` → `/session-start 20.6.4`
- **Tasks in session (detected):** 2 · **Next task across:** `20.6.3.1` → `/task-start` / cascade
- **Manifest:** `.project-manager/features/domain-architecture-alignment/across-ladder.json`
<!-- harness-across-ladder:end -->
