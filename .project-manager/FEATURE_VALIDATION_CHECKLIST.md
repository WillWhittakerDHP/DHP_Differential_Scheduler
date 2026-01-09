# Feature Validation Checklist

**Purpose:** Validation checks that must pass before phase planning can begin for a feature.

**Last Updated:** 2025-02-01

---

## Overview

Before any phase planning documents can be created, feature-level planning documents must be complete. This checklist ensures the hierarchical structure is maintained: Feature → Phase → Session → Task.

---

## Pre-Phase Planning Validation Checklist

The following checks MUST pass before allowing phase planning:

### Required Documents

- [ ] **`feature-plan.md` exists**
  - File path: `project-manager/features/[feature-name]/feature-plan.md`
  - File must exist and be non-empty

- [ ] **`README.md` exists**
  - File path: `project-manager/features/[feature-name]/README.md`
  - File must exist and be non-empty

### Feature Plan Content Validation

- [ ] **Feature overview section present**
  - Must contain feature description and objectives

- [ ] **Phase breakdown section present**
  - Must include high-level phase list (e.g., "Phase 1.1: ...", "Phase 1.2: ...")
  - Phase breakdown should be high-level, not detailed phase plans

- [ ] **Success criteria section present**
  - Must define how feature completion is measured

- [ ] **Dependencies section present** (if applicable)
  - Must list any dependencies on other features or phases

### README Content Validation

- [ ] **Feature status present**
  - Must indicate current status (e.g., "Planning", "In Progress", "Complete")

- [ ] **Feature description present**
  - Must provide overview of what the feature accomplishes

- [ ] **Key objectives listed**
  - Must list main objectives for the feature

- [ ] **Phase list present**
  - Must reference phases (can be simple list, not full plans)
  - Should reference `feature-plan.md` for detailed plans

### Research Phase Validation (if required)

- [ ] **Research phase completed** (if feature requires research)
  - Research findings documented in feature guide/log
  - Research insights incorporated into `feature-plan.md`

### Directory Structure Validation

- [ ] **Feature directory created**
  - Path: `project-manager/features/[feature-name]/`
  - Directory must exist

- [ ] **No premature phase directories**
  - `phases/` subdirectory should not exist before feature docs complete
  - If `phases/` exists, verify it's empty or contains only placeholder files

---

## Validation Process

### When Validation Runs

Validation checks run automatically when:
- `/plan-phase [N] [description]` is called
- `/phase-create [N] [description]` is called
- Any phase planning command is executed

### Validation Failure Behavior

If validation fails:
1. **Block phase creation** - Do not create phase documents
2. **Show clear error message** - Explain which checks failed
3. **Suggest next steps** - Guide user to complete missing feature docs
4. **List missing items** - Provide specific list of what needs to be completed

### Validation Success Behavior

If validation passes:
1. **Allow phase planning** - Proceed with phase document creation
2. **Create phases directory** - Create `phases/` subdirectory if it doesn't exist
3. **Create phase documents** - Create phase-specific guide/log/handoff files

---

## Error Messages

### Missing feature-plan.md

```
Error: Feature-level planning document missing

The feature-plan.md file must be created before phase planning can begin.

Required path: project-manager/features/[feature-name]/feature-plan.md

Please complete the feature planning first using /feature-create or /feature-start.
```

### Missing README.md

```
Error: Feature README missing

The README.md file must be created before phase planning can begin.

Required path: project-manager/features/[feature-name]/README.md

Please complete the feature planning first using /feature-create or /feature-start.
```

### Incomplete feature-plan.md

```
Error: Feature plan incomplete

The feature-plan.md file exists but is missing required sections:
- [List of missing sections]

Please complete the feature plan before proceeding with phase planning.
```

### Incomplete README.md

```
Error: Feature README incomplete

The README.md file exists but is missing required sections:
- [List of missing sections]

Please complete the README before proceeding with phase planning.
```

### Premature phase directory

```
Warning: Phase directory exists before feature docs complete

The phases/ directory exists but feature-level planning documents are incomplete.

Please complete feature-plan.md and README.md before creating phase documents.
```

---

## Implementation Notes

### For Cursor Rules/Prompts

When implementing validation in Cursor rules or prompts:

1. **Check file existence first** - Use file system checks to verify files exist
2. **Read file content** - Parse file content to verify required sections
3. **Provide helpful errors** - Give specific guidance on what's missing
4. **Block gracefully** - Don't create partial phase docs, wait for feature docs

### For Automated Validation

If implementing automated validation:

1. **Create validation function** - `validateFeatureDocs(featureName)`
2. **Return structured results** - List of passed/failed checks
3. **Integrate with commands** - Call validation before phase creation
4. **Log validation results** - Track when validation passes/fails

---

## Related Documents

- **Feature Creation Workflow:** See `PROJECT_MANAGER_HANDOFF.md` section "Feature Creation Workflow Order"
- **Command Documentation:** See `PROJECT_MANAGER_HANDOFF.md` section "Standard (Composite) Commands"
- **Feature Structure:** See `README.md` section "Directory Structure"

---

**Last Updated:** 2025-02-01

