# Phase 6.17 Handoff

**Purpose:** Transition context for Generalized Dependency-Aware Delete Wizard

**Tier:** Phase (Tier 1 - High-Level)

**Last Updated:** 2026-03-23  
**Phase Status:** Not Started  
**Next Phase:** _(TBD after 6.17 complete — see feature guide)_

---

## Current Status

**Phase 6.17:** Not Started  
**Last Completed Session:** —  
**Planning artifacts:** `phase-6.17-guide.md`, `phase-6.17-planning.md`

---

## Transition Context

**Where we left off:**  
Phase 6.17 registered in feature guide and PROJECT_PLAN; scope and five-session breakdown documented in `phase-6.17-guide.md`.

**What you need to start Session 6.17.1:**

- Read `phase-6.17-guide.md` (policy categories, integration seam file list, out-of-scope).
- Skim current delete flow: `useEntityCrud`, `entityListDelete`, `entityCrudRouter`.
- Confirm no reliance on long-running DELETE during UI (architecture section).

---

## Phase Summary

**Sessions Planned:** 6.17.1 — 6.17.5 (see phase guide)  
**Key deliverables:** Typed contracts → server infrastructure → client wizard → wire entry points → policy rollout for partShape / blockShape / annotationShape.

---

## Related Documents

- Phase Guide: `phases/phase-6.17-guide.md`
- Phase Planning: `phases/phase-6.17-planning.md`
- Feature Guide: `feature-appointment-workflow-guide.md`

---

## Next Action

Run `/phase-start 6.17` when ready to open phase branch and create phase planning workflow artifacts; then `/session-add` / `/session-start 6.17.1` per tier workflow.

<!-- harness-across-ladder:start -->
## Across ladder (harness)

_Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._

- **Feature:** `appointment-workflow` · **Source:** phase_end · **Derived:** 2026-04-01T23:27:17.424Z
- **Phases on disk (17):** 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15, 6.16, 6.17, 6.18
- **Focus phase:** `6.17` · **Next phase across:** `6.18` → `/phase-start 6.18`
- **Manifest:** `.project-manager/features/appointment-workflow/across-ladder.json`
<!-- harness-across-ladder:end -->
