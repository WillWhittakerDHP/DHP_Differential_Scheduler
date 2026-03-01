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



#### Task 6.4.4.1: Unified required confirmation modal shell

**Goal:** Unify required-confirmation modals under a single reusable shell based on MoveablePartsModal, with two shell principles: (1) Dynamic title — shell supports dynamic title; property modal uses e.g. "Confirm {blockInstance.name} details". (2) Progressive / mini-wizard — "answer a question, get a different response" as shell principle; shell supports step-wise content in body slot. MoveablePartsModal and PropertyConfirmationModal become thin consumers.

**Files:**
- New: Shell component (e.g. RequiredConfirmationModal.vue or WizardStepConfirmationModal.vue) — extracted from MoveablePartsModal.
- Refactor: MoveablePartsModal — use shell; move moveable-specific content into shell's default slot.
- Refactor: PropertyConfirmationModal — use shell; property summary in body slot; dynamic title (e.g. "Confirm {blockInstance.name} details").
- Reference: Phase 6.4 UX (max-width, delay, enter/exit transitions) in shell.

**Approach:**
1. Extract shell from MoveablePartsModal (VDialog + VCard, title bar, close, body slot, actions; Phase 6.4 styling/transitions). API: dynamic title (prop/slot), progressive body slot, optional actions (primary/secondary, canConfirm), emit confirm/cancel.
2. Refactor MoveablePartsModal to use shell; keep dynamic title and progressive flow.
3. Refactor PropertyConfirmationModal to use shell; dynamic title e.g. "Confirm {blockInstance.name} details".
4. Governance: thin components, slot-based content, logic in composables; no new ad-hoc patterns.

**Checkpoint:**
- Shell exists with v-model open, title prop/slot, default body slot, optional actions; Phase 6.4 UX.
- MoveablePartsModal uses shell; dynamic title and progressive behavior unchanged.
- PropertyConfirmationModal uses shell; dynamic title and existing props/emits preserved.
- Lint and session governance checks pass.