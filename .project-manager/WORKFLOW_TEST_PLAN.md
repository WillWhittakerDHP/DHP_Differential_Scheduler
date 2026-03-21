# Workflow Test Plan

**Purpose:** Test plan for validating that `/feature-start` command creates feature-level docs before phase docs, and that validation prevents premature phase planning.

**Last Updated:** 2025-02-01

---

## Test Objectives

1. Verify `/feature-start` creates `feature guide` before any phase docs
2. Verify `/feature-start` creates `README.md` before any phase docs
3. Verify phase planning only allowed after feature docs complete
4. Verify validation prevents premature phase planning
5. Verify clear error messages when validation fails

---

## Test Cases

### Test Case 1: Correct Feature Start Workflow

**Objective:** Verify `/feature-start` creates feature-level docs in correct order

**Steps:**
1. Call `/feature-start test-feature-1 "Test feature for validation"`
2. Observe file creation order
3. Verify files exist and have content
4. Attempt phase planning

**Expected Results:**
- ✅ `project-manager/features/test-feature-1/feature-test-feature-1-guide.md` created FIRST
- ✅ `project-manager/features/test-feature-1/README.md` created SECOND
- ✅ Both files have required content sections
- ✅ Phase planning allowed after feature docs complete
- ✅ Git branch `feature/test-feature-1` created
- ✅ Initial checkpoint created

**Validation:**
- Check file timestamps to confirm order
- Read file contents to verify required sections
- Verify no `phases/` directory exists until feature docs complete

---

### Test Case 2: Premature Phase Planning (Missing feature guide)

**Objective:** Verify validation blocks phase planning when `feature guide` is missing

**Steps:**
1. Create feature directory: `project-manager/features/test-feature-2/`
2. Create only `README.md` (do NOT create `feature guide`)
3. Call `/phase-create 1.1 "Test phase"`
4. Observe system response

**Expected Results:**
- ❌ Phase creation BLOCKED
- ✅ Clear error message shown:
  ```
  Error: Feature-level planning document missing
  
  The feature guide file must be created before phase planning can begin.
  
  Required path: project-manager/features/test-feature-2/feature-test-feature-2-guide.md
  
  Please complete the feature planning first using /feature-create or /feature-start.
  ```
- ✅ No phase documents created
- ✅ No `phases/` directory created

**Validation:**
- Verify error message is clear and actionable
- Verify no phase files were created
- Verify system suggests completing feature docs first

---

### Test Case 3: Premature Phase Planning (Missing README.md)

**Objective:** Verify validation blocks phase planning when `README.md` is missing

**Steps:**
1. Create feature directory: `project-manager/features/test-feature-3/`
2. Create only feature guide (feature-{name}-guide.md) (do NOT create `README.md`)
3. Call `/plan-phase 1.1 "Test phase"`
4. Observe system response

**Expected Results:**
- ❌ Phase planning BLOCKED
- ✅ Clear error message shown:
  ```
  Error: Feature README missing
  
  The README.md file must be created before phase planning can begin.
  
  Required path: project-manager/features/test-feature-3/README.md
  
  Please complete the feature planning first using /feature-create or /feature-start.
  ```
- ✅ No phase documents created

**Validation:**
- Verify error message is clear and actionable
- Verify no phase files were created

---

### Test Case 4: Incomplete Feature Plan (Missing Sections)

**Objective:** Verify validation blocks phase planning when `feature guide` is incomplete

**Steps:**
1. Create feature directory: `project-manager/features/test-feature-4/`
2. Create `feature guide` with only Overview section (missing Phase breakdown, Success criteria)
3. Create `README.md` with all required sections
4. Call `/phase-create 1.1 "Test phase"`
5. Observe system response

**Expected Results:**
- ❌ Phase creation BLOCKED
- ✅ Clear error message listing missing sections:
  ```
  Error: Feature plan incomplete
  
  The feature guide file exists but is missing required sections:
  - Phase breakdown section
  - Success criteria section
  
  Please complete the feature plan before proceeding with phase planning.
  ```
- ✅ No phase documents created

**Validation:**
- Verify error message lists specific missing sections
- Verify no phase files were created

---

### Test Case 5: Incomplete README (Missing Sections)

**Objective:** Verify validation blocks phase planning when `README.md` is incomplete

**Steps:**
1. Create feature directory: `project-manager/features/test-feature-5/`
2. Create `feature guide` with all required sections
3. Create `README.md` with only Status section (missing Description, Objectives)
4. Call `/plan-phase 1.1 "Test phase"`
5. Observe system response

**Expected Results:**
- ❌ Phase planning BLOCKED
- ✅ Clear error message listing missing sections:
  ```
  Error: Feature README incomplete
  
  The README.md file exists but is missing required sections:
  - Description section
  - Objectives section
  
  Please complete the README before proceeding with phase planning.
  ```
- ✅ No phase documents created

**Validation:**
- Verify error message lists specific missing sections
- Verify no phase files were created

---

### Test Case 6: Complete Feature Docs (Validation Passes)

**Objective:** Verify phase planning succeeds when feature docs are complete

**Steps:**
1. Call `/feature-start test-feature-6 "Complete test feature"`
2. Complete `feature guide` with all required sections:
   - Overview
   - Phase breakdown
   - Success criteria
   - Dependencies
3. Complete `README.md` with all required sections:
   - Status
   - Description
   - Objectives
   - Phase list
4. Call `/phase-create 1.1 "Test phase"`
5. Observe system response

**Expected Results:**
- ✅ Validation PASSES
- ✅ Phase documents created successfully
- ✅ `phases/` directory created
- ✅ Phase guide/log/handoff files created

**Validation:**
- Verify phase documents exist
- Verify phase documents have correct structure
- Verify no error messages shown

---

### Test Case 7: Feature Start with Research Phase

**Objective:** Verify research phase completes before phase planning allowed

**Steps:**
1. Call `/feature-start test-feature-7 "Feature requiring research"`
2. Complete research phase (30+ questions)
3. Document research findings in feature guide/log
4. Update `feature guide` with research insights
5. Attempt phase planning before research complete
6. Complete research phase
7. Attempt phase planning after research complete

**Expected Results:**
- ❌ Phase planning BLOCKED before research complete
- ✅ Clear message: "Research phase must be completed before phase planning"
- ✅ Phase planning ALLOWED after research complete
- ✅ Research findings documented in feature docs

**Validation:**
- Verify research phase completion is checked
- Verify research findings are in feature docs
- Verify phase planning only allowed after research

---

## Test Execution Checklist

Before running tests:

- [ ] Test environment set up (feature directories can be created)
- [ ] Test feature names don't conflict with existing features
- [ ] Clean up test features after testing

During tests:

- [ ] Execute each test case in order
- [ ] Document actual results vs expected results
- [ ] Capture error messages if validation fails
- [ ] Verify file creation order (check timestamps)
- [ ] Verify file content completeness

After tests:

- [ ] Clean up test features: `test-feature-1` through `test-feature-7`
- [ ] Document any discrepancies between expected and actual results
- [ ] Update implementation if issues found

---

## Success Criteria

All tests pass if:

1. ✅ `/feature-start` always creates `feature guide` before phase docs
2. ✅ `/feature-start` always creates `README.md` before phase docs
3. ✅ Phase planning commands validate feature docs before proceeding
4. ✅ Validation blocks phase creation when feature docs incomplete
5. ✅ Error messages are clear and actionable
6. ✅ Phase planning succeeds when feature docs are complete

---

## Related Documents

- **Validation Checklist:** `FEATURE_VALIDATION_CHECKLIST.md` - Complete validation requirements
- **Implementation Guide:** `WORKFLOW_IMPLEMENTATION_GUIDE.md` - Implementation logic
- **Workflow Order:** `PROJECT_MANAGER_HANDOFF.md` - Feature Creation Workflow Order section

---

**Last Updated:** 2025-02-01

