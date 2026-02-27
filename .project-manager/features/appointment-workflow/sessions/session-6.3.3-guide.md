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



- [x] #### Task 6.3.3.1: Log: Confirmation Notifications & Documentation