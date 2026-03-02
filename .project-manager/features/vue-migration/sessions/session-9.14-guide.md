# Phase 9 Session 9.14 Guide: UI Component Updates - Select Fields & Form Configs

**Feature:** Vue Migration  
**Purpose:** Update select fields and form configs to use new naming conventions (Shape/Instance/Kind) and updated relationship structure (Cascade/Constituent/Composition)

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.14 - UI Component Updates - Select Fields & Form Configs
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 9.14
**Session Name:** UI Component Updates - Select Fields & Form Configs
**Description:** 
- Update selectableFieldConfig.ts to use new naming conventions (TypeSelectEnum.BlockShape, TypeSelectEnum.PartShape)
- Update selectableDisplayConfig.ts to use new naming conventions
- Update display configs (blockInstanceDisplays.ts, blockShapeDisplays.ts) to use new naming conventions
- Update string references in tooltips and placeholders (BlockType → BlockShape, BlockProfiles → BlockInstances)
- Ensure form configs work correctly with updated naming
- Verify SelectInputs component (formerly SelectFields) works correctly with updated configs
- Test form configs work correctly

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 9.13 (UI Component Updates - Service Selection & Entity Cards) must be complete

---

## Session Objectives

- Update selectableFieldConfig.ts to use new naming conventions
- Update selectableDisplayConfig.ts to use new naming conventions
- Update display configs to use new naming conventions
- Update string references in tooltips and placeholders
- Ensure form configs work correctly with updated naming
- Verify SelectInputs component (formerly SelectFields) works correctly
- Test form configs work correctly
- Ensure no functionality is lost during updates
- Verify type safety is preserved

---

## Key Deliverables

- selectableFieldConfig.ts updated with new naming conventions
- selectableDisplayConfig.ts updated with new naming conventions
- Display configs updated with new naming conventions
- String references updated in tooltips and placeholders
- Form configs work correctly with updated naming
- SelectInputs component (formerly SelectFields) works correctly
- No functionality lost
- Type safety preserved

---

## Detailed Task Breakdown

### Task 9.14.1: Review Select Fields and Form Configs

**Files:**
- `client-vue/src/configs/field/form/selectableFieldConfig.ts`
- `client-vue/src/configs/field/display/selectableDisplayConfig.ts`
- `client-vue/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`
- `client-vue/src/configs/field/display/appliedDisplay/blockShapeDisplays.ts`
- `client-vue/src/types/entity/formDataEnums.ts` (verify enum values)

**Steps:**
1. **Review selectableFieldConfig.ts:**
   - Check for references to old naming conventions (TypeSelectEnum.BlockType, TypeSelectEnum.PartType)
   - Verify enum values exist (TypeSelectEnum.BlockShape, TypeSelectEnum.PartShape)
   - Check comments for outdated references

2. **Review selectableDisplayConfig.ts:**
   - Check for references to old naming conventions (TypeSelectEnum.BlockType, TypeSelectEnum.PartType)
   - Check display labels and placeholders for old naming
   - Check comments for outdated references

3. **Review display configs:**
   - Check blockInstanceDisplays.ts for old naming in tooltips
   - Check blockShapeDisplays.ts for old naming in placeholders and tooltips
   - Check for string references to old naming

4. **Verify enum values:**
   - Check TypeSelectEnum has BlockShape and PartShape (not BlockType and PartType)
   - Verify enum values match expected naming

**Output:**
- List of references to update in selectableFieldConfig.ts
- List of references to update in selectableDisplayConfig.ts
- List of references to update in display configs
- Verification that enum values are correct

---

### Task 9.14.2: Update selectableFieldConfig.ts

**Files:**
- `client-vue/src/configs/field/form/selectableFieldConfig.ts`

**Steps:**
1. **Update TypeSelectEnum references:**
   - Replace `TypeSelectEnum.BlockType` → `TypeSelectEnum.BlockShape`
   - Replace `TypeSelectEnum.PartType` → `TypeSelectEnum.PartShape`

2. **Update comments:**
   - Update any comments referencing old naming conventions
   - Ensure comments reflect new naming

3. **Verify functionality:**
   - Check TypeScript compilation
   - Verify enum values exist
   - Ensure no breaking changes

**Key Changes:**
- Update TypeSelectEnum references (BlockType → BlockShape, PartType → PartShape)
- Update comments to reflect new naming

---

### Task 9.14.3: Update selectableDisplayConfig.ts

**Files:**
- `client-vue/src/configs/field/display/selectableDisplayConfig.ts`

**Steps:**
1. **Update TypeSelectEnum references:**
   - Replace `TypeSelectEnum.BlockType` → `TypeSelectEnum.BlockShape`
   - Replace `TypeSelectEnum.PartType` → `TypeSelectEnum.PartShape`

2. **Update display labels:**
   - Check if labels need updating (e.g., "Block Type" → "Block Shape")
   - Update placeholders if needed

3. **Update comments:**
   - Update any comments referencing old naming conventions
   - Ensure comments reflect new naming

4. **Verify functionality:**
   - Check TypeScript compilation
   - Verify enum values exist
   - Ensure no breaking changes

**Key Changes:**
- Update TypeSelectEnum references (BlockType → BlockShape, PartType → PartShape)
- Update display labels if needed
- Update comments to reflect new naming

---

### Task 9.14.4: Update blockInstanceDisplays.ts

**Files:**
- `client-vue/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`

**Steps:**
1. **Update tooltip references:**
   - Replace `"BlockType"` → `"BlockShape"` in tooltip text
   - Update aggregatedParticles tooltip

2. **Update comments:**
   - Update any comments referencing old naming conventions

3. **Verify functionality:**
   - Check TypeScript compilation
   - Ensure tooltip displays correctly

**Key Changes:**
- Update tooltip text (BlockType → BlockShape)

---

### Task 9.14.5: Update blockShapeDisplays.ts

**Files:**
- `client-vue/src/configs/field/display/appliedDisplay/blockShapeDisplays.ts`

**Steps:**
1. **Update placeholder references:**
   - Replace `"BlockProfiles"` → `"BlockInstances"` in placeholder text

2. **Update tooltip references:**
   - Replace `"BlockProfiles"` → `"BlockInstances"` in tooltip text

3. **Update comments:**
   - Update any comments referencing old naming conventions

4. **Verify functionality:**
   - Check TypeScript compilation
   - Ensure placeholder and tooltip display correctly

**Key Changes:**
- Update placeholder text (BlockProfiles → BlockInstances)
- Update tooltip text (BlockProfiles → BlockInstances)

---

### Task 9.14.6: Verify Naming Conventions Are Consistent

**Files:**
- All updated config files
- SelectInputs component (formerly SelectFields)

**Steps:**
1. **Check enum references:**
   - Verify all configs use `TypeSelectEnum.BlockShape` (not `BlockType`)
   - Verify all configs use `TypeSelectEnum.PartShape` (not `PartType`)

2. **Check string references:**
   - Verify all tooltips use `"BlockShape"` (not `"BlockType"`)
   - Verify all placeholders use `"BlockInstances"` (not `"BlockProfiles"`)

3. **Check SelectFields component:**
   - Verify SelectInputs component (formerly SelectFields) works correctly with updated configs
   - Verify selectType checks work correctly

4. **Document any inconsistencies:**
   - List any naming inconsistencies found
   - Fix inconsistencies immediately
   - Verify fixes work correctly

**Output:**
- Verification that all naming conventions are consistent
- List of any fixes made
- Confirmation that configs use correct names

---

### Task 9.14.7: Test Form Configs Work Correctly

**Files:**
- All updated config files
- SelectInputs component (formerly SelectFields)
- Form components using configs

**Steps:**
1. **Test form field configs:**
   - Verify form field configs load correctly
   - Verify selectType values are correct
   - Test with sample data

2. **Test display configs:**
   - Verify display configs load correctly
   - Verify labels and placeholders display correctly
   - Test tooltips display correctly

3. **Test SelectFields component:**
   - Verify SelectInputs component (formerly SelectFields) works with updated configs
   - Verify selectType checks work correctly
   - Test with sample data

4. **Compare before/after:**
   - Compare config behavior before and after updates
   - Verify no functionality is lost
   - Verify output format is unchanged

5. **Document any issues:**
   - List any issues found
   - Fix issues immediately
   - Verify fixes work

**Output:**
- Test results showing configs work correctly
- Verification that output format matches expected format
- Confirmation that no functionality is lost

---

## Success Criteria

- [ ] selectableFieldConfig.ts updated with new naming conventions
- [ ] selectableDisplayConfig.ts updated with new naming conventions
- [ ] Display configs updated with new naming conventions
- [ ] String references updated in tooltips and placeholders
- [ ] Form configs work correctly with updated naming
- [ ] SelectFields component works correctly
- [ ] Configs tested and verified
- [ ] No functionality lost during updates
- [ ] Type safety preserved
- [ ] Naming conventions consistent across all configs

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md` (if exists)
- Session 9.13 Summary: `project-manager/features/vue-migration/sessions/session-9.13-summary.md`
- Session 9.13 Guide: `project-manager/features/vue-migration/sessions/session-9.13-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

---

## Notes

- **Naming Conventions:**
  - Use `TypeSelectEnum.BlockShape` (not `TypeSelectEnum.BlockType`)
  - Use `TypeSelectEnum.PartShape` (not `TypeSelectEnum.PartType`)
  - Use `"BlockShape"` (not `"BlockType"`) in string references
  - Use `"BlockInstances"` (not `"BlockProfiles"`) in string references

- **Enum Values:**
  - TypeSelectEnum already has BlockShape and PartShape (not BlockType and PartType)
  - Configs need to be updated to use correct enum values

- **Testing:**
  - Test configs with sample data
  - Verify output format matches expected format
  - Compare before/after to ensure no functionality is lost
  - Test SelectFields component with updated configs

---

### Why These Patterns Matter
- Consistent naming improves code maintainability
- Updated enum values ensure configs work correctly
- Proper testing ensures no functionality is lost
- Clear documentation helps future developers

### How This Relates to Existing Code
- Builds on Session 9.13 (UI Component Updates - Service Selection & Entity Cards)
- Uses updated naming conventions from Phase 9
- Prepares for Session 9.15 (Configuration Updates)
- Completes UI component updates for select fields and form configs

---

## Potential Issues and Solutions

### Issue 1: Enum Values Don't Match
**Solution:** Verify TypeSelectEnum has BlockShape and PartShape. Update configs to use correct enum values.

### Issue 2: String References Not Updated
**Solution:** Search for string references (e.g., `"BlockType"`, `"BlockProfiles"`) and update to new naming (e.g., `"BlockShape"`, `"BlockInstances"`).

### Issue 3: Functionality Lost
**Solution:** Compare before/after behavior. Verify no functionality is lost. Fix any issues immediately.

### Issue 4: Type Safety Lost
**Solution:** Use proper types from updated type system. Preserve type information.

### Issue 5: SelectFields Component Not Working
**Solution:** Verify SelectFields component checks selectType correctly. Update if needed.

---

## Session Start Checklist

Before starting this session, verify:
- [ ] Session 9.13 is complete (UI Component Updates - Service Selection & Entity Cards)
- [ ] Entity cards are updated and working
- [ ] TypeScript compilation passes
- [ ] Application starts successfully

---

## Next Session

**Session 9.15:** Configuration Updates
- Update configuration files to use new naming conventions
- Update entity registry and relationship configs
- Ensure configuration works correctly with updated naming

---

## Files to Review and Update

### Config Files:
- `client-vue/src/configs/field/form/selectableFieldConfig.ts` (update TypeSelectEnum references)
- `client-vue/src/configs/field/display/selectableDisplayConfig.ts` (update TypeSelectEnum references)
- `client-vue/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` (update tooltip text)
- `client-vue/src/configs/field/display/appliedDisplay/blockShapeDisplays.ts` (update placeholder and tooltip text)

### Patterns to Replace:

**Enum References:**
- `TypeSelectEnum.BlockType` → `TypeSelectEnum.BlockShape`
- `TypeSelectEnum.PartType` → `TypeSelectEnum.PartShape`

**String References:**
- `"BlockType"` → `"BlockShape"`
- `"BlockProfiles"` → `"BlockInstances"`
