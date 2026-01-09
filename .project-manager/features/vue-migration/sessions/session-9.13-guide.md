# Phase 9 Session 9.13 Guide: UI Component Updates - Service Selection & Entity Cards

**Feature:** Vue Migration  
**Purpose:** Update service selection and entity card components to use new naming conventions (Shape/Instance/Kind) and updated relationship structure (Cascade/Constituent/Composition)

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.13 - UI Component Updates - Service Selection & Entity Cards
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 9.13
**Session Name:** UI Component Updates - Service Selection & Entity Cards
**Description:** 
- Update ServiceSelectionStep.vue to use new naming conventions (blockShape, blockInstance, partShape, partInstance)
- Update EntityCard.vue to use new naming conventions and relationship keys (activeCascades, activeConstituents, validCascades, validConstituents)
- Update GroupedEntityCard.vue to use new naming conventions
- Update component comments and documentation to reflect new naming
- Ensure components work correctly with updated relationship structure
- Verify components access relationships correctly (via relationships.activeCompositions, etc.)
- Test components work correctly with transformed data
- Ensure no functionality is lost during updates

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 9.12 (Composable Updates) must be complete

---

## Session Objectives

- Update ServiceSelectionStep.vue to use new naming conventions
- Update EntityCard.vue to use new naming conventions and relationship keys
- Update GroupedEntityCard.vue to use new naming conventions
- Update component comments and documentation
- Ensure components work correctly with updated relationship structure
- Verify components access relationships correctly
- Test components work correctly with transformed data
- Ensure no functionality is lost during updates
- Verify type safety is preserved

---

## Key Deliverables

- ServiceSelectionStep.vue updated with new naming conventions
- EntityCard.vue updated with new naming conventions and relationship keys
- GroupedEntityCard.vue updated with new naming conventions
- Component comments and documentation updated
- Components work correctly with updated relationship structure
- Components tested and verified
- No functionality lost
- Type safety preserved

---

## Detailed Task Breakdown

### Task 9.13.1: Review Service Selection Component

**Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/composables/useBookingWizard.ts` (verify it uses correct naming)

**Steps:**
1. **Review ServiceSelectionStep.vue:**
   - Check for references to old naming conventions (blockType, blockProfile, partType, partProfile)
   - Check for references to old relationship keys (activeBlocks, activeParts, validBlocks, validParts)
   - Verify it uses correct entity keys (blockShape, blockInstance, partShape, partInstance)
   - Verify it uses correct relationship keys (activeCascades, activeConstituents, validCascades, validConstituents)
   - Check comments for outdated references
   - Verify it accesses relationships correctly (via relationships.activeCompositions, etc.)

2. **Review useBookingWizard.ts:**
   - Verify it uses correct naming conventions
   - Verify it accesses relationships correctly
   - Check if it needs updates based on new naming

3. **Document changes needed:**
   - List specific references to update
   - Note any relationship access patterns to update
   - Identify any comments to update

**Output:**
- List of references to update in ServiceSelectionStep.vue
- List of references to update in useBookingWizard.ts (if needed)
- List of comments to update
- Any relationship access patterns to update

---

### Task 9.13.2: Update Service Selection Component

**Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/composables/useBookingWizard.ts` (if needed)

**Steps:**
1. **Update entity key references:**
   - Replace `blockType` → `blockShape` (if used)
   - Replace `blockProfile` → `blockInstance` (if used)
   - Replace `partType` → `partShape` (if used)
   - Replace `partProfile` → `partInstance` (if used)

2. **Update relationship key references:**
   - Replace `activeBlocks` → `activeCascades` (if used)
   - Replace `activeParts` → `activeConstituents` (if used)
   - Replace `validBlocks` → `validCascades` (if used)
   - Replace `validParts` → `validConstituents` (if used)

3. **Update relationship access:**
   - Verify relationships are accessed via `relationships.activeCompositions` (if compositions are used)
   - Verify relationships are accessed via `relationships.activeCascades` (if cascades are used)
   - Verify relationships are accessed via `relationships.activeConstituents` (if constituents are used)

4. **Update comments:**
   - Update LEARNING/WHY/PATTERN comments to reference correct naming
   - Update any references to old naming conventions
   - Add references to new relationship structure if needed

5. **Verify functionality:**
   - Test component still works correctly
   - Verify service selection works as expected
   - Check type safety
   - Ensure no functionality is lost

**Key Changes:**
- Update entity key references (blockShape, blockInstance, partShape, partInstance)
- Update relationship key references (activeCascades, activeConstituents, validCascades, validConstituents)
- Update comments to reflect new naming

---

### Task 9.13.3: Review Entity Card Components

**Files:**
- `client-vue/src/components/admin/generic/EntityCard.vue`
- `client-vue/src/components/admin/generic/GroupedEntityCard.vue`

**Steps:**
1. **Review EntityCard.vue:**
   - Check for references to old naming conventions (BlockProfile, BlockType, PartProfile, PartType)
   - Check for references to old relationship keys (activeBlocks, activeParts, validBlocks, validParts)
   - Verify it uses correct entity keys (blockShape, blockInstance, partShape, partInstance)
   - Verify it uses correct relationship keys (activeCascades, activeConstituents, validCascades, validConstituents)
   - Check comments for outdated references (especially LEARNING comments mentioning BlockProfile, BlockType, etc.)
   - Verify it accesses relationships correctly (via relationships.activeCompositions, etc.)
   - Check aggregation logic uses correct naming

2. **Review GroupedEntityCard.vue:**
   - Check for references to old naming conventions
   - Check for references to old relationship keys
   - Verify it uses correct entity keys
   - Verify it uses correct relationship keys
   - Check comments for outdated references
   - Verify it accesses relationships correctly

3. **Document changes needed:**
   - List specific references to update
   - Note any relationship access patterns to update
   - Identify any comments to update (especially LEARNING comments)

**Output:**
- List of references to update in EntityCard.vue
- List of references to update in GroupedEntityCard.vue
- List of comments to update
- Any relationship access patterns to update

---

### Task 9.13.4: Update Entity Card Components

**Files:**
- `client-vue/src/components/admin/generic/EntityCard.vue`
- `client-vue/src/components/admin/generic/GroupedEntityCard.vue`

**Steps:**
1. **Update entity key references:**
   - Replace `blockType` → `blockShape` (if used)
   - Replace `blockProfile` → `blockInstance` (if used)
   - Replace `partType` → `partShape` (if used)
   - Replace `partProfile` → `partInstance` (if used)

2. **Update relationship key references:**
   - Replace `activeBlocks` → `activeCascades` (if used)
   - Replace `activeParts` → `activeConstituents` (if used)
   - Replace `validBlocks` → `validCascades` (if used)
   - Replace `validParts` → `validConstituents` (if used)

3. **Update string references in comments and display text:**
   - Replace `'BlockProfile'` → `'BlockInstance'` (in comments and display text)
   - Replace `'BlockType'` → `'BlockShape'` (in comments and display text)
   - Replace `'PartProfile'` → `'PartInstance'` (in comments and display text)
   - Replace `'PartType'` → `'PartShape'` (in comments and display text)

4. **Update aggregation logic:**
   - Verify aggregation logic uses correct naming (blockInstance, partInstance)
   - Verify aggregation logic accesses relationships correctly
   - Update aggregation comments to reference correct naming

5. **Update relationship access:**
   - Verify relationships are accessed via `relationships.activeCompositions` (if compositions are used)
   - Verify relationships are accessed via `relationships.activeCascades` (if cascades are used)
   - Verify relationships are accessed via `relationships.activeConstituents` (if constituents are used)

6. **Update comments:**
   - Update LEARNING comments to reference correct naming (BlockInstance, BlockShape, PartInstance, PartShape)
   - Update WHY comments to reference correct naming
   - Update PATTERN comments to reference correct naming
   - Remove references to old naming conventions

7. **Verify functionality:**
   - Test components still work correctly
   - Verify entity cards display correctly
   - Verify aggregation indicators work correctly
   - Check type safety
   - Ensure no functionality is lost

**Key Changes:**
- Update entity key references (blockShape, blockInstance, partShape, partInstance)
- Update relationship key references (activeCascades, activeConstituents, validCascades, validConstituents)
- Update string references in comments and display text (BlockProfile → BlockInstance, BlockType → BlockShape, etc.)
- Update LEARNING/WHY/PATTERN comments to reference correct naming

---

### Task 9.13.5: Verify Naming Conventions Are Consistent

**Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/admin/generic/EntityCard.vue`
- `client-vue/src/components/admin/generic/GroupedEntityCard.vue`

**Steps:**
1. **Check entity key names:**
   - Verify all components use `blockShape` (not `blockType`)
   - Verify all components use `blockInstance` (not `blockProfile`)
   - Verify all components use `partShape` (not `partType`)
   - Verify all components use `partInstance` (not `partProfile`)

2. **Check relationship key names:**
   - Verify all components use `activeCascades` (not `activeBlocks`)
   - Verify all components use `activeConstituents` (not `activeParts`)
   - Verify all components use `validCascades` (not `validBlocks`)
   - Verify all components use `validConstituents` (not `validParts`)
   - Verify all components use `activeCompositions` (in relationships, not separate field)

3. **Check string references:**
   - Verify all components use `'BlockInstance'` (not `'BlockProfile'`)
   - Verify all components use `'BlockShape'` (not `'BlockType'`)
   - Verify all components use `'PartInstance'` (not `'PartProfile'`)
   - Verify all components use `'PartShape'` (not `'PartType'`)

4. **Check relationship kind names:**
   - Verify all components use `relationshipKind` (not `relationshipType`)
   - Verify relationship kinds match constants

5. **Document any inconsistencies:**
   - List any naming inconsistencies found
   - Fix inconsistencies immediately
   - Verify fixes work correctly

**Output:**
- Verification that all naming conventions are consistent
- List of any fixes made
- Confirmation that components use correct names

---

### Task 9.13.6: Test Component Functionality

**Files:**
- All updated component files
- Test files (if they exist)

**Steps:**
1. **Test ServiceSelectionStep:**
   - Verify service selection works correctly
   - Verify user type selection works
   - Verify base service selection works
   - Verify additional service selection works
   - Test with sample data
   - Verify relationships are accessed correctly

2. **Test EntityCard:**
   - Verify entity cards display correctly
   - Verify aggregation indicators work correctly
   - Verify relationship access works correctly
   - Test with sample data
   - Verify CRUD operations work correctly

3. **Test GroupedEntityCard:**
   - Verify grouped entity cards display correctly
   - Verify grouping works correctly
   - Verify relationship access works correctly
   - Test with sample data

4. **Compare before/after:**
   - Compare component behavior before and after updates
   - Verify no functionality is lost
   - Verify output format is unchanged
   - Verify relationships are accessed correctly

5. **Document any issues:**
   - List any issues found
   - Fix issues immediately
   - Verify fixes work

**Output:**
- Test results showing components work correctly
- Verification that output format matches expected format
- Confirmation that no functionality is lost

---

### Task 9.13.7: Update Documentation and Comments

**Files:**
- All updated component files
- README or documentation files

**Steps:**
1. **Update component comments:**
   - Document use of new naming conventions
   - Update LEARNING/WHY/PATTERN comments
   - Add references to new relationship structure
   - Remove references to old naming conventions

2. **Update relationship structure documentation:**
   - Document that relationships are accessed via `relationships.activeCompositions`, etc.
   - Document that all relationships use `GlobalRelationship[]` format
   - Document use of relationship transformer utilities (if used)

3. **Update README or documentation:**
   - Document component architecture
   - Explain use of new naming conventions
   - Provide examples of component usage
   - Note any breaking changes (if any)

---

## Success Criteria

- [ ] ServiceSelectionStep.vue updated with new naming conventions
- [ ] EntityCard.vue updated with new naming conventions and relationship keys
- [ ] GroupedEntityCard.vue updated with new naming conventions
- [ ] Component comments and documentation updated
- [ ] Components work correctly with updated relationship structure
- [ ] Components access relationships correctly (via relationships.activeCompositions, etc.)
- [ ] Components tested and verified
- [ ] No functionality lost during updates
- [ ] Type safety preserved
- [ ] Naming conventions consistent across all components

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md` (if exists)
- Session 9.12 Summary: `project-manager/features/vue-migration/sessions/session-9.12-summary.md`
- Session 9.12 Guide: `project-manager/features/vue-migration/sessions/session-9.12-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

---

## Notes

- **Naming Conventions:**
  - Use `blockShape` (not `blockType`)
  - Use `blockInstance` (not `blockProfile`)
  - Use `partShape` (not `partType`)
  - Use `partInstance` (not `partProfile`)
  - Use `activeCascades` (not `activeBlocks`)
  - Use `activeConstituents` (not `activeParts`)
  - Use `validCascades` (not `validBlocks`)
  - Use `validConstituents` (not `validParts`)
  - Use `'BlockInstance'` (not `'BlockProfile'`) in string references
  - Use `'BlockShape'` (not `'BlockType'`) in string references
  - Use `'PartInstance'` (not `'PartProfile'`) in string references
  - Use `'PartShape'` (not `'PartType'`) in string references

- **Relationship Structure:**
  - Compositions are in `relationships.activeCompositions` as `GlobalRelationship[]`
  - All relationships use the same structure and transformation pipeline
  - Access relationships via `relationships.activeCompositions`, `relationships.activeCascades`, etc.

- **Testing:**
  - Test components with sample data
  - Verify output format matches expected format
  - Compare before/after to ensure no functionality is lost
  - Test with relationships to ensure they work correctly

---

## Learning Checkpoints

### What We'll Learn
- Updating UI components to use new naming conventions
- Ensuring components work with updated relationship structure
- Maintaining component functionality while updating naming
- Testing components after naming updates

### Why These Patterns Matter
- Consistent naming improves code maintainability
- Updated relationship structure ensures components work correctly
- Proper testing ensures no functionality is lost
- Clear documentation helps future developers

### How This Relates to Existing Code
- Builds on Session 9.12 (Composable Updates)
- Uses updated transformers from Session 9.11
- Uses updated relationship structure from Session 9.10
- Prepares for Session 9.14 (UI Component Updates - Select Fields & Form Configs)

---

## Potential Issues and Solutions

### Issue 1: Component Not Using Updated Naming
**Solution:** Search for old naming conventions and replace with new ones. Update comments and display text.

### Issue 2: Relationship Access Not Updated
**Solution:** Verify components access relationships via `relationships.activeCompositions`, etc. Update if needed.

### Issue 3: Functionality Lost
**Solution:** Compare before/after behavior. Verify no functionality is lost. Fix any issues immediately.

### Issue 4: Type Safety Lost
**Solution:** Use proper types from updated type system. Preserve type information.

### Issue 5: String References Not Updated
**Solution:** Search for string references (e.g., `'BlockProfile'`) and update to new naming (e.g., `'BlockInstance'`).

---

## Session Start Checklist

Before starting this session, verify:
- [ ] Session 9.12 is complete (Composable Updates)
- [ ] Composables are updated and working
- [ ] Transformers are updated and working
- [ ] TypeScript compilation passes
- [ ] Application starts successfully

---

## Next Session

**Session 9.14:** UI Component Updates - Select Fields & Form Configs
- Update select fields and form configs to use new naming conventions
- Update form configs to use updated relationship structure
- Ensure form configs work correctly with transformed data

---

## Files to Review and Update

### Component Files:
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` (update naming conventions)
- `client-vue/src/components/admin/generic/EntityCard.vue` (update naming conventions and relationship keys)
- `client-vue/src/components/admin/generic/GroupedEntityCard.vue` (update naming conventions)

### Composable Files (if needed):
- `client-vue/src/composables/useBookingWizard.ts` (verify naming conventions)

### Patterns to Replace:

**Entity Key References:**
- `blockType` → `blockShape`
- `blockProfile` → `blockInstance`
- `partType` → `partShape`
- `partProfile` → `partInstance`

**Relationship Key References:**
- `activeBlocks` → `activeCascades`
- `activeParts` → `activeConstituents`
- `validBlocks` → `validCascades`
- `validParts` → `validConstituents`

**String References:**
- `'BlockProfile'` → `'BlockInstance'`
- `'BlockType'` → `'BlockShape'`
- `'PartProfile'` → `'PartInstance'`
- `'PartType'` → `'PartShape'`

