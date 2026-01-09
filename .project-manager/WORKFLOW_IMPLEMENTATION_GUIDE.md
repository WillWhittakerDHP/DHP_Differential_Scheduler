# Workflow Implementation Guide

**Purpose:** Implementation logic for enforcing feature-level document creation before phase planning.

**Last Updated:** 2025-02-01

---

## Overview

This guide documents the implementation logic that should be used in Cursor rules/prompts to enforce the correct order: feature-level planning documents (`feature-plan.md`, `README.md`) must be created before any phase planning documents.

---

## Implementation Logic for `/feature-start` Command

### CRITICAL: Correct Execution Order

When `/feature-start [name]` is called, execute in this **EXACT** order. **DO NOT skip steps or proceed to phase work until all steps are complete.**

### Step-by-Step Process

1. **Create Git Branch FIRST**
   ```
   Action: Create and checkout git branch
   Command: git checkout -b feature/[feature-name]
   Note: This ensures we're working on the correct branch from the start
   ```

2. **Create Feature Directory**
   ```
   Path: project-manager/features/[feature-name]/
   Action: Create directory if it doesn't exist
   ```

3. **Create feature-plan.md with Template Structure**
   ```
   Path: project-manager/features/[feature-name]/feature-plan.md
   Action: Create file with template structure (may be minimal initially)
   Required Sections (template):
   - Feature overview and objectives
   - Phase breakdown (high-level, not detailed phase plans)
   - Success criteria
   - Dependencies
   - Key files and architecture notes
   Note: File may start as a template - will be populated by feature plan step
   ```

4. **Create README.md with Template Structure**
   ```
   Path: project-manager/features/[feature-name]/README.md
   Action: Create file with template structure (may be minimal initially)
   Required Sections (template):
   - Feature status and description
   - Key objectives
   - Phase list (references, not full plans)
   - Related documents
   Note: File may start as a template - will be populated by feature plan step
   ```

5. **Call `/feature-plan` Command**
   ```
   Action: Execute feature planning process
   Purpose: Populate feature-plan.md and README.md with actual content
   Process:
   - Review feature requirements and objectives
   - Break down into phases (high-level)
   - Document dependencies and key files
   - Populate both feature-plan.md and README.md with complete content
   - This is a parallel process to phase planning (same tier structure)
   ```

6. **Research Phase** (if required)
   ```
   Action: Conduct research phase (if feature requires research)
   - Present 30+ questions covering 6 categories
   - Document findings in feature guide/log
   - Update feature-plan.md with research insights
   Note: May be part of feature-plan step or separate step
   ```

7. **Validation Check**
   ```
   Action: Verify feature docs are complete and populated
   - Check feature-plan.md exists and has substantial content (not just template)
   - Check README.md exists and has substantial content (not just template)
   - Verify feature plan includes phase breakdown with actual phases
   - Verify research phase completed (if required)
   - Verify documents were populated by feature-plan (not just templates)
   ```

8. **Only After Validation Passes:**
   ```
   - Load feature context
   - Create initial checkpoint
   - NOW allow phase planning commands
   - DO NOT automatically start phase 1.1
   - Wait for explicit phase planning command
   ```

### Critical Rules

**DO NOT:**
- Skip the `feature-plan` step (step 5)
- Start phase 1.1 immediately after creating templates
- Proceed to phase work until feature docs are fully populated
- Create phase documents until feature docs are validated

**MUST:**
- Create git branch first
- Create document templates
- Call `feature-plan` to populate documents
- Validate documents are complete (not just templates)
- Only then allow phase planning commands

### Critical Rules

**DO NOT create phase planning documents until feature-plan.md and README.md are complete and validated.**

**DO NOT start phase 1.1 immediately after `feature-start` - this command is for feature-level setup only.**

**MUST call `feature-plan` to populate documents before allowing any phase work.**

### Parallel Process Note

The `feature-start` → `feature-plan` process is parallel to the `phase-start` → `phase-plan` process:
- **Feature tier:** `feature-start` creates structure → `feature-plan` populates documents → then phase work can begin
- **Phase tier:** `phase-start` creates structure → `phase-plan` populates documents → then session work can begin

Both follow the same pattern: create structure first, populate documents second, validate third, then proceed to next tier.

---

## Implementation Logic for Phase Planning Commands

### `/plan-phase [N] [description]` Command

Before creating any phase documents, execute validation:

```pseudocode
function validateFeatureDocs(featureName):
    // Check feature-plan.md exists
    if not fileExists("project-manager/features/[feature-name]/feature-plan.md"):
        return ERROR: "feature-plan.md missing"
    
    // Check README.md exists
    if not fileExists("project-manager/features/[feature-name]/README.md"):
        return ERROR: "README.md missing"
    
    // Read and validate feature-plan.md content
    planContent = readFile("project-manager/features/[feature-name]/feature-plan.md")
    if not hasSection(planContent, "Overview"):
        return ERROR: "Feature plan missing Overview section"
    if not hasSection(planContent, "Phase breakdown"):
        return ERROR: "Feature plan missing Phase breakdown section"
    if not hasSection(planContent, "Success criteria"):
        return ERROR: "Feature plan missing Success criteria section"
    
    // Read and validate README.md content
    readmeContent = readFile("project-manager/features/[feature-name]/README.md")
    if not hasSection(readmeContent, "Status"):
        return ERROR: "README missing Status section"
    if not hasSection(readmeContent, "Description"):
        return ERROR: "README missing Description section"
    
    return SUCCESS
```

**If validation fails:**
- Block phase creation
- Show clear error message listing missing items
- Suggest completing feature docs first using `/feature-create` or `/feature-start`

**If validation passes:**
- Proceed with phase document creation
- Create `phases/` subdirectory if it doesn't exist
- Create phase-specific guide/log/handoff files

### `/phase-create [N] [description]` Command

Same validation logic as `/plan-phase`. Must validate before creating phase structure.

---

## Validation Function Implementation

### Required Validation Checks

1. **File Existence Checks**
   - `feature-plan.md` exists at correct path
   - `README.md` exists at correct path

2. **Content Validation**
   - `feature-plan.md` has minimum required sections:
     - Overview/Objectives
     - Phase breakdown (high-level)
     - Success criteria
   - `README.md` has minimum required sections:
     - Status
     - Description
     - Objectives or Phase list

3. **Directory Structure**
   - Feature directory exists
   - No premature `phases/` directory (or it's empty)

### Error Message Format

When validation fails, provide clear, actionable error messages:

```
Error: Feature-level planning documents incomplete

The following items must be completed before phase planning can begin:

Missing or Incomplete:
- [ ] feature-plan.md (missing Overview section)
- [ ] README.md (missing Description section)

Required Paths:
- project-manager/features/[feature-name]/feature-plan.md
- project-manager/features/[feature-name]/README.md

Next Steps:
1. Complete feature-plan.md with required sections
2. Complete README.md with required sections
3. Run validation again before creating phase documents

See FEATURE_VALIDATION_CHECKLIST.md for complete requirements.
```

---

## Integration with Cursor Rules

### Rule Structure

When implementing in Cursor rules, use this pattern:

```markdown
## Feature Start Command Rule

When `/feature-start [name]` is called, execute in EXACT order:

1. Create git branch: `git checkout -b feature/[name]`
2. Create feature directory: `project-manager/features/[name]/`
3. Create `feature-plan.md` with template structure (may be minimal)
4. Create `README.md` with template structure (may be minimal)
5. **CRITICAL:** Call `/feature-plan` command to populate both documents
   - This populates feature-plan.md with actual content
   - This populates README.md with actual content
   - This is a parallel process to phase planning
6. Conduct research phase (if required)
7. Validate feature docs are complete (not just templates)
8. Only then: Load feature context, create checkpoint
9. **DO NOT** automatically start phase 1.1
10. **DO NOT** allow phase planning until feature docs are validated

## Feature Plan Command Rule

When `/feature-plan` is called (or as part of feature-start):

1. Review feature requirements and objectives
2. Break down feature into phases (high-level, not detailed)
3. Document dependencies and key files
4. Populate feature-plan.md with complete content:
   - Overview and objectives
   - Phase breakdown (high-level)
   - Success criteria
   - Dependencies
   - Key files and architecture notes
5. Populate README.md with complete content:
   - Feature status and description
   - Key objectives
   - Phase list (references)
   - Related documents
6. Ensure documents are substantial (not just templates)

## Phase Planning Command Rule

When `/plan-phase [N]` or `/phase-create [N]` is called:

1. Check if `feature-plan.md` exists
2. Check if `README.md` exists
3. Validate content has required sections AND is populated (not just template)
4. If validation fails: Block phase creation, show error, suggest completing feature docs
5. If validation passes: Proceed with phase document creation
```

### Common Mistakes to Avoid

**Mistake 1: Skipping feature-plan step**
- ❌ Wrong: Create templates → immediately start phase 1.1
- ✅ Correct: Create templates → call feature-plan → validate → then allow phase work

**Mistake 2: Starting phase work immediately**
- ❌ Wrong: `feature-start` → checkout branch → start phase 1.1
- ✅ Correct: `feature-start` → checkout branch → create docs → call feature-plan → validate → wait for phase command

**Mistake 3: Not populating documents**
- ❌ Wrong: Create empty templates → proceed to phase work
- ✅ Correct: Create templates → populate via feature-plan → validate populated content → proceed

---

## Troubleshooting

### Issue: `feature-start` Skips Document Creation and Starts Phase 1.1 Immediately

**Symptoms:**
- `feature-start` checks out git branch ✓
- `feature-start` starts work on phase 1.1 immediately ✗
- `feature-start` does NOT call `feature-plan` ✗
- `feature-start` does NOT create/populate docs ✗

**Root Cause:**
The command is skipping steps 3-7 and jumping directly to phase work.

**Fix:**
Ensure `feature-start` follows the exact order:
1. Create git branch
2. Create feature directory
3. Create feature-plan.md template
4. Create README.md template
5. **Call feature-plan to populate documents** ← This step is being skipped
6. Validate documents are populated
7. **DO NOT start phase 1.1** ← This should not happen automatically
8. Wait for explicit phase planning command

**Validation:**
After `feature-start` completes, verify:
- [ ] Git branch `feature/[name]` exists and is checked out
- [ ] `project-manager/features/[name]/feature-plan.md` exists and has substantial content (not just template)
- [ ] `project-manager/features/[name]/README.md` exists and has substantial content (not just template)
- [ ] Phase 1.1 has NOT been started automatically
- [ ] Phase planning commands are available but phase work has not begun

## Testing the Implementation

### Test Case 1: Correct Order

1. User calls `/feature-start test-feature`
2. System creates git branch `feature/test-feature`
3. System creates `feature-plan.md` template
4. System creates `README.md` template
5. **System calls `/feature-plan` to populate documents**
6. System validates both files exist and have substantial content
7. System does NOT start phase 1.1 automatically
8. System allows phase planning commands (but doesn't execute them)

**Expected Result:** Feature docs created and populated, validation passes, phase work waits for explicit command

### Test Case 2: Premature Phase Planning

1. User calls `/phase-create 1.1 "Test phase"` without feature docs
2. System checks for `feature-plan.md` - not found
3. System blocks phase creation
4. System shows error message

**Expected Result:** Phase creation blocked, clear error message shown

### Test Case 3: Incomplete Feature Docs

1. User creates `feature-plan.md` but it's missing Overview section
2. User calls `/phase-create 1.1 "Test phase"`
3. System validates content - Overview section missing
4. System blocks phase creation
5. System shows error listing missing sections

**Expected Result:** Phase creation blocked, specific error about missing sections

### Test Case 4: Template-Only Documents (Current Bug)

1. User calls `/feature-start test-feature`
2. System creates templates but doesn't populate them
3. System tries to start phase 1.1 immediately
4. **System should:** Block phase work, call feature-plan, populate docs, then allow phase work

**Expected Result:** Feature docs populated before phase work begins

---

## Related Documents

- **Validation Checklist:** `FEATURE_VALIDATION_CHECKLIST.md` - Complete validation requirements
- **Workflow Order:** `PROJECT_MANAGER_HANDOFF.md` - Feature Creation Workflow Order section
- **Command Documentation:** `PROJECT_MANAGER_HANDOFF.md` - Standard Commands section

---

**Last Updated:** 2025-02-01 (Updated to fix feature-start skipping feature-plan step)

