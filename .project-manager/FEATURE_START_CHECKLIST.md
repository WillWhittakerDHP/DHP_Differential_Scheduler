# Feature Start Command Checklist

**Purpose:** Quick reference checklist to verify `feature-start` command executes correctly.

**Last Updated:** 2025-02-01

---

## When Running `/feature-start [name]`

Use this checklist to verify the command executes in the correct order:

### ✅ Step 1: Git Branch Creation
- [ ] Git branch `feature/[name]` is created
- [ ] Git branch `feature/[name]` is checked out
- [ ] Working directory is on the new branch

### ✅ Step 2: Feature Directory Creation
- [ ] Directory `project-manager/features/[name]/` exists
- [ ] Directory is empty (or contains only new files)

### ✅ Step 3: Feature Plan Template Creation
- [ ] File `project-manager/features/[name]/feature-plan.md` exists
- [ ] File has template structure (may be minimal initially)

### ✅ Step 4: README Template Creation
- [ ] File `project-manager/features/[name]/README.md` exists
- [ ] File has template structure (may be minimal initially)

### ✅ Step 5: Feature Plan Execution (CRITICAL)
- [ ] `/feature-plan` command is called (automatically or explicitly)
- [ ] `feature-plan.md` is populated with actual content:
  - [ ] Overview and objectives section has content
  - [ ] Phase breakdown section lists phases (high-level)
  - [ ] Success criteria section has content
  - [ ] Dependencies section (if applicable)
  - [ ] Key files section (if applicable)
- [ ] `README.md` is populated with actual content:
  - [ ] Feature status and description
  - [ ] Key objectives listed
  - [ ] Phase list references
  - [ ] Related documents section

### ✅ Step 6: Research Phase (if required)
- [ ] Research phase conducted (if feature requires research)
- [ ] Research findings documented
- [ ] Feature plan updated with research insights

### ✅ Step 7: Validation
- [ ] Feature docs validated as complete (not just templates)
- [ ] All required sections present in feature-plan.md
- [ ] All required sections present in README.md
- [ ] Documents have substantial content (not just placeholders)

### ✅ Step 8: Context Setup (After Validation)
- [ ] Feature context loaded
- [ ] Initial checkpoint created
- [ ] Phase planning commands are available

### ❌ Step 9: Phase Work (Should NOT Happen Automatically)
- [ ] Phase 1.1 is **NOT** started automatically
- [ ] Phase documents are **NOT** created automatically
- [ ] System waits for explicit phase planning command

---

## Common Issues

### Issue: Phase 1.1 Starts Immediately
**Symptom:** After `feature-start`, phase 1.1 work begins automatically.

**Fix:** Ensure step 5 (feature-plan) executes and step 9 (phase work) does NOT execute automatically.

### Issue: Documents Are Empty Templates
**Symptom:** `feature-plan.md` and `README.md` exist but contain only template/placeholder content.

**Fix:** Ensure step 5 (feature-plan) is called to populate documents with actual content.

### Issue: Feature-Plan Step Is Skipped
**Symptom:** Documents are created but never populated, phase work starts anyway.

**Fix:** Ensure step 5 is mandatory and validation (step 7) checks for populated content, not just file existence.

---

## Verification After Feature Start

After running `/feature-start [name]`, verify:

1. **Git Status:**
   ```bash
   git branch
   # Should show: * feature/[name]
   ```

2. **File Existence:**
   ```bash
   ls project-manager/features/[name]/
   # Should show: feature-plan.md, README.md
   ```

3. **File Content:**
   ```bash
   # Check feature-plan.md has content (not just template)
   grep -c "Phase" project-manager/features/[name]/feature-plan.md
   # Should return: > 0
   
   # Check README.md has content (not just template)
   grep -c "Status\|Description" project-manager/features/[name]/README.md
   # Should return: > 0
   ```

4. **No Phase Work Started:**
   ```bash
   ls project-manager/features/[name]/phases/
   # Should return: No such file or directory (or empty directory)
   ```

---

## Related Documents

- **Workflow Guide:** `WORKFLOW_IMPLEMENTATION_GUIDE.md` - Complete implementation logic
- **Validation Checklist:** `FEATURE_VALIDATION_CHECKLIST.md` - Pre-phase planning validation requirements

---

**Last Updated:** 2025-02-01





























