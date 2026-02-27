# Session Guide - Key Sections

## Session Structure

### Session Labeling Format

Each session should start with:
```

*[Note: Section extracted from template - consider adding to session guide]*


## Learning Checkpoints

### Purpose

Learning checkpoints ensure understanding before moving forward. They're integrated into the unified checkpoint system.

### When to Use Learning Checkpoints

- **Complex tasks:** New concepts, architectural changes, framework transitions
- **Simple tasks:** Quick checkpoint (quality only) - learning optional

### Learning Checkpoint Process

After completing a task (especially complex ones), pause to:

1. **Review What Was Learned**
   - What patterns were used?
   - How does this differ from previous approaches?
   - What concepts need clarification?

2. **Verify Understanding**
   - Can you explain what was accomplished?
   - Do you understand the implementation?
   - Are there questions before continuing?

3. **Document Decisions**
   - Why was this approach chosen?
   - What alternatives were considered?
   - What might change later?

### Learning Checkpoint Format

Included in full checkpoint format:
```
**Learning:** (Optional - for complex tasks)
- [Key concepts/patterns learned]
- [Framework differences if applicable]
- [Questions answered]
```

---


*[Note: Section extracted from template - consider adding to session guide]*


## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task [SESSION_ID].N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]
- [Learning goals if complex task]

**Learning Focus:** (Optional - for complex tasks)
- [Concept 1 to understand]
- [Concept 2 to understand]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Concepts Learned:**
- **[Concept]**: [Explanation]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Learning Checkpoint:**
- [x] [Checkpoint] ✅

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---


*[Note: Section extracted from template - consider adding to session guide]*



- [x] #### Task 6.4.2.1: Define Session 6.4.2 scope and Phase 6.4 verification

**Goal:** Define Session 6.4.2 scope and document Task 6.4.2.1 by reviewing Phase 6.4 success criteria and updating the session guide with a clear objective and checkpoint.

**Files:**
- `.project-manager/features/appointment-workflow/sessions/session-6.4.2-guide.md`
- `.project-manager/features/appointment-workflow/phases/phase-6.4-guide.md`

**Approach:**
1. Review Phase 6.4 success criteria and Session 6.4.1 completed work
2. Document Session 6.4.2 scope (follow-up verification or remaining Phase 6.4 items)
3. Add Goal, Approach, Checkpoint for Task 6.4.2.1 in this guide
4. Optionally verify codebase state against phase criteria and note gaps

**Checkpoint:**
- Session guide has a defined Task 6.4.2.1 with Goal/Approach/Checkpoint
- Session 6.4.2 scope is documented (what this session will accomplish)
- Phase 6.4 success criteria have been reviewed and status noted

---

## Session 6.4.2 scope (Task 6.4.2.1 output)

**Scope:** Session 6.4.2 covers follow-up to Session 6.4.1: defining this session’s objectives, verifying Phase 6.4 success criteria against the codebase, and documenting any remaining work.

**Phase 6.4 success criteria – verification note (as of task 6.4.2.1):**
- `pre_closing` / `preClosing`: Not yet present in server `BlockInstance` model or client types; Phase 6.4 migration and type flow still to be implemented or verified.
- MoveablePartsModal and differential logic: Present in client (`MoveablePartsModal.vue`, `useAvailabilityStepHandlers.ts`, `useAvailabilityLogic.ts`, `useMoveablePartsScheduling.ts`); modal may still be disabled; differential consolidation per phase objectives to be verified.
- Session 6.4.1 completed the planning and task 6.4.1.1; implementation of preClosing full-stack and modal re-enable may extend into this session or be tracked as follow-up tasks.

**Next:** Task 6.4.2.2 implements the Phase 6.4 objectives below.

---

- [ ] #### Task 6.4.2.2: Implement Phase 6.4 — preClosing full-stack and MoveablePartsModal

**Goal:** Implement Phase 6.4 objectives: add `pre_closing`/`preClosing` full-stack (migration, model, types, transformer), consolidate differential to one canonical `isDifferentialBooking`, gate MoveablePartsModal on `preClosing`, re-enable the modal and optionally soften UX.

**Files:**
- Server: migration for `block_instances`/`block_instance_versions`, BlockInstance model, any block-instance APIs
- Client: types (e.g. BlockInstanceEntity, booking API types), transformers (block/booking)
- Client: `useAvailabilityLogic.ts`, `useAvailabilityStepHandlers.ts`, `useMoveablePartsScheduling.ts`, `MoveablePartsModal.vue`

**Approach:**
1. DB + server: Add `pre_closing` column (migration), add to BlockInstance (and block_instance_versions if present), expose on model/APIs
2. Client: Add `preClosing` to types and transformer pipeline (BlockInstanceEntity, booking transformers)
3. Differential: Consolidate to one canonical `isDifferentialBooking` in useAvailabilityLogic; use it in orchestrator and consumers; gate modal on `preClosing`
4. Modal: Gate MoveablePartsModal on `preClosing`; show time grid only when closing date set; allow passthrough; re-enable modal and remove disable comments; optionally soften UX (size, delay, transitions)

**Checkpoint:**
- `pre_closing` column exists and `preClosing` flows server → client
- One canonical `isDifferentialBooking` used everywhere
- Modal opens only for `preClosing: true`; re-enabled; lint and app start pass