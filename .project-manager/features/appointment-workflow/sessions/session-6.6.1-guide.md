## Phase intent (goals and context)

**Warning: Feature guide not found or phase 6.6 not listed.** Planning will proceed with minimal context.

- [ ] ### Session 6.6.1: Guide: Soft Delete vs Hard Delete

**Description:** 6.6

**Tasks:** [To be planned] [To be planned]
**Focus:**
- [To be identified during planning]

## Session intent from phase guide

- [ ] ### Session 6.6.1: Guide: Soft Delete vs Hard Delete

**Description:** 6.6

**Tasks:** [To be planned] [To be planned]
**Focus:**
- [To be identified during planning]

- [x] #### Task 6.6.1.1: Policy and documentation

**Goal:** Document policy for cancelled (soft, retain for audit) vs deleted (hard or soft-with-purge) and retention rules.

**Files:** Phase guide (phase-6.6-guide.md); optional dedicated doc for retention/audit policy.

**Approach:** Write policy section: cancelled vs deleted semantics, when to use each, retention rules. Add to phase guide or a short doc referenced by the phase guide.

**Checkpoint:** Policy and retention rules documented; phase guide or linked doc updated.

- [x] #### Task 6.6.1.2: Admin UI — soft delete and hard delete actions

**Goal:** Add admin UI actions for soft delete and hard delete where appropriate; thin components and composables per governance.

**Files:** Admin appointment UI (detail/actions); appointment CRUD/PATCH or status-handling composables; any new composable for delete actions.

**Approach:** Add soft delete and hard delete actions to admin appointment surfaces (e.g. detail view or table actions); wire to existing PATCH or delete endpoints; keep components thin, logic in composables.

**Checkpoint:** Admin can perform soft delete and hard delete; actions respect governance; session/phase guide updated.

<!-- end excerpt session -->