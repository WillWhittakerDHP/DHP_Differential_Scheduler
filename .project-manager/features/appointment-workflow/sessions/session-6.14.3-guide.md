# Session 6.14.3 Guide: Org-default UX polish, resolver audit, and test policy alignment

**Purpose:** Session-level guide for Phase 6.14 follow-up work deferred from session 6.14.2 (badges, exhaustive audit, Phase 3.0 test alignment).

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

**Session ID:** 6.14.3  
**Session Name:** Org-default UX polish, resolver audit, and test policy alignment  
**Description:** Close remaining Phase 6.14 success criteria: exhaustive resolver wiring audit (wire or document), optional “using org default” affordances on legacy admin panels, and documented Phase 3.0 resolver-test checklist — without adding test files unless project test policy is unblocked. Full scope: `sessions/session-6.14.3-planning.md`.

**Depends on:** Sessions 6.14.1 and 6.14.2 complete (primary merge paths aligned).

### Tasks

- [x] #### Task 6.14.3.1: Exhaustive grep audit — wire or document exceptions

**Goal:** Inventory remaining server and client call sites that read numeric policy from org + availability + calendar; ensure each uses the shared resolver contract or has an explicit, written exception in code + `phases/phase-6.14-handoff.md`.

**Files:** Grep targets under `server/src/`, `client/src/composables/booking/`, `client/src/utils/booking/`; `organizationNumericPolicyService.ts`, related routes.

**Approach:** Structured grep list; prioritize fee, slot, hold, and validation paths; no silent “close enough” reads.

**Checkpoint:** Handoff contains an audit table or bullet list: site → resolved / exempt + rationale.

- [x] #### Task 6.14.3.2: Optional “using org default” badges on legacy Calendar / Availability panels

**Goal:** Where product value is clear, add minimal badges or helper text indicating a field is using the organization default vs an explicit override — without duplicating the Organization defaults tab.

**Files:** Admin calendar/availability components (see grep during task); reuse styling patterns from org-defaults / Business Controls sections.

**Approach:** Small, consistent chip or caption; avoid clutter on every field.

**Checkpoint:** Badges present where agreed, or deferral noted in handoff with reason.

- [ ] #### Task 6.14.3.3: Docs, Phase 3.0 test checklist, quality gate

**Goal:** Update `phases/phase-6.14-guide.md` success criteria; document resolver edge cases for Phase 3.0 (do not add test files per current project policy unless explicitly unblocked). Run client and server lint; verify app start.

**Files:** `phases/phase-6.14-handoff.md`, `phases/phase-6.14-guide.md`, `sessions/session-6.14.3-handoff.md`, `phases/phase-6.14-log.md` as needed.

**Approach:** Honest checkboxes; list deferred automated tests as Phase 3.0 follow-up.

**Checkpoint:** Lint passes; phase guide reflects 6.14.3 outcomes.

---

## Session Workflow

### Before starting

1. Confirm branch workflow: use **`/session-start 6.14.3`** (feature `appointment-workflow`) when ready so the harness creates `session-6.14.3`.
2. Read `sessions/session-6.14.3-planning.md` and `phases/phase-6.14-handoff.md` → *Session 6.14.2 closeout* (deferrals).
3. Work tasks **6.14.3.1** → **6.14.3.3** in order unless a dependency forces a swap (document in session handoff).

### During the session

1. One task at a time; checkpoint after each task.
2. Catch blocks: use `createLogger` per project standards.
3. **Testing:** Do not create or modify test files until Phase 3.0 policy allows; document the intended resolver test cases instead.

### After the session

1. `cd client && npm run lint` and `cd server && npm run lint`.
2. Verify app starts (`npm run start:dev` or project script).
3. Run **`/session-end 6.14.3`** when scope is complete; then **`/phase-end 6.14`** if phase success criteria are fully satisfied.

---

## Related Documents

- **Planning (authoritative scope):** `sessions/session-6.14.3-planning.md`
- **Prior closeout:** `phases/phase-6.14-handoff.md` → *Session 6.14.2 closeout*
- **Phase:** `phases/phase-6.14-guide.md`

<!-- end excerpt session -->
