# Feature Booking Calculations Guide

**Purpose:** Feature-level guide for planning and tracking major initiatives

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** Booking Calculations
**Description:** Extract and implement fee and time calculation logic. Create shared calculation composable for booking wizard and admin preview. This feature may involve extracting logic from React codebase OR improving/fixing existing Vue.js implementations.

**Target:** Shared calculation composable that can be used by both booking wizard and admin preview panel.

---
**Status:** Planning - Needs Audit

**Duration:** [To be determined]
**Started:** 2025-02-01
**Completed:** 2025-02-01 (if complete)

---

## Research Phase

**Status:** [Not Started / In Progress / Complete]

### Research Findings

[Summary of research findings - see research question template for details]

**Key Decisions:**
- [Decision 1]
- [Decision 2]
- [Decision 3]

**Technology Choices:**
- [Technology 1] - [Rationale]
- [Technology 2] - [Rationale]

**Architecture:**
[High-level architecture description]

**Risks Identified:**
- [Risk 1] - [Mitigation]
- [Risk 2] - [Mitigation]

**Research Documentation:**
- Research Questions: `.cursor/workflow-manager/features/[name]/research-questions.md`
- External Research: [Links to research sources]

---

## Feature Objectives

- Audit existing calculation logic
- Create shared calculation composable
- Integrate into booking wizard

---

## Phases Breakdown

- [ ] ### Phase 3.0: Calculation & Availability Audit (NEW)
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion]

- [ ] ### Phase 3.1: Extract Calculation Logic from React
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion]

- [ ] ### Phase 3.2: Create Shared Calculation Composable
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion]

- [ ] ### Phase 3.3: Integrate into Booking Wizard
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion]

- [ ] ### Phase 3.4: Add Calculation Tests
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion]

- [ ] ### Phase 3.5: Moveable Scheduling Fix (POTENTIAL)
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion]

- [ ] ### Phase 3.6: Soft Hold Warning System (POTENTIAL)
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion]

- [ ] ### Phase [N+1]: [Phase Name]
**Description:** [What this phase accomplishes]
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion 1]
- [Criterion 2]

---

## Dependencies

**Prerequisites:**
- Feature 0: Vue.js Migration (Core Complete) ✅
- Feature 1: Data Flow Alignment (recommended for proper data flow) ✅ (mostly complete)
- Feature 2: Google APIs Integration (for real calendar data) 🔄 In Progress

**Downstream Impact:**
- [How this feature affects other features/work]

**External Dependencies:**
- [External dependency 1]
- [External dependency 2]

---

## Success Criteria

- [ ] Audit complete with clear scope definition
- [ ] Calculation logic working correctly (extracted or improved)
- [ ] Shared calculation composable created and working
- [ ] Calculations integrated into booking wizard
- [ ] Comprehensive test coverage
- [ ] Performance: < 50ms per calculation
- [ ] (If applicable) Moveable scheduling fixed
- [ ] (If applicable) Soft hold warnings implemented

---

## Git Branch Strategy

**Branch Name:** `feature/booking-calculations`
**Branch From:** `develop`
**Merge To:** `develop`

**Branch Management:**
- Created: 2025-02-01 (at feature start)
- Merged: 2025-02-01 (at feature end)
- Deleted: 2025-02-01 (after merge)

---

## End of Feature Workflow

**CRITICAL: Prompt before ending feature**

After completing all phases in a feature, **prompt the user** before running `/feature-end`:

```
## Ready to End Feature?

All phases complete. Ready to merge feature branch?

**This will:**
- Generate feature summary
- Merge booking-calculations → develop
- Delete feature branch
- Finalize documentation

**Proceed with /feature-end?** (yes/no)
```

**If user says "yes":**
- Run `/feature-end` command automatically
- Complete all feature-end steps (verify completion, update docs, generate summary)
- **After all checks pass and docs are updated, prompt for commit/merge/push:**
  ```
  ## Ready to Commit, Merge, and Push?
  
  All feature-end checks completed successfully:
  - ✅ Feature summary generated
  - ✅ Feature documentation closed
  - ✅ All documentation updated
  
  **Ready to commit, merge, and push all changes?**
  
  This will:
  - Commit all changes with feature completion message
  - Merge booking-calculations → develop
  - Delete feature branch
  - Push to remote repository
  
  **Proceed with commit, merge, and push?** (yes/no)
  ```
- **If user says "yes" to commit/merge/push:** Execute git commit, merge, delete branch, and push, then end feature
- **If user says "no" to commit/merge/push:** End feature without committing (user can commit and merge manually later)

**If user says "no" to feature-end:**
- Address any requested changes
- Re-prompt when ready

After completing all phases in a feature:

1. **Verify feature completion** - All phases complete, success criteria met
2. **Update feature status** - Mark feature as Complete
3. **Update feature handoff** - Document feature completion and transition context
4. **Generate feature summary** - Create completion summary
5. **PROMPT USER FOR COMMIT/MERGE/PUSH** - After all checks pass and docs are updated, prompt user before git operations
6. **Merge feature branch** - Merge to develop (after user approval)
7. **Delete feature branch** - Clean up branch (after merge)
8. **Workflow Feedback** (Optional - only if issues encountered):
   - Were there any problems managing this feature workflow or issues with results?
   - Note any sticking points, inefficiencies, or workflow friction for future improvement
   - Consider if feature-level issues suggest improvements needed at phase, session, or task level

---

## Notes

[Feature-specific notes, decisions, blockers]

---

## Related Documents

- Feature Log: `.cursor/workflow-manager/features/[name]/feature-[name]-log.md`
- Feature Handoff: `.cursor/workflow-manager/features/[name]/feature-[name]-handoff.md`
- Phase Guides: `.cursor/workflow-manager/features/[name]/phases/phase-[N]-guide.md`
- Research Questions: `.cursor/workflow-manager/features/[name]/research-questions.md`

