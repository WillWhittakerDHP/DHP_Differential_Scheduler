# Phase 9 Session 9.8 Guide: API Layer Updates - Route Alignment & Field Name Consistency

**Feature:** Vue Migration  
**Purpose:** Update API routes to align with model layer changes and ensure consistent field naming

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.8 - API Layer Updates - Route Alignment & Field Name Consistency
**Status:** ✅ Complete (2025-11-29)

---

## Session Overview

**Session Number:** 9.8
**Session Name:** API Layer Updates - Route Alignment & Field Name Consistency
**Description:** 
- Update API routes to use consistent field names (entity_kind instead of entity_type where appropriate)
- Remove or document backward compatibility code
- Update validation and error messages to use new naming conventions
- Ensure all API routes align with model layer changes from Sessions 9.1-9.7
- Update route parameter names and query parameters for consistency
- Verify API responses match expected data structures

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 9.7 (Model Layer Updates - Field Mapping Cleanup & Schema Alignment) must be complete

---

## Session Objectives

- Review all API routes for field name consistency
- Update routes to use `entity_kind` instead of `entity_type` (where backward compatibility isn't needed)
- Update relationship route names to match new model names (Cascade/Constituent/Composition)
- Remove or document backward compatibility mappings
- Update validation messages to use consistent terminology
- Update route comments and documentation
- Verify all API routes work correctly with updated models
- Ensure API responses match frontend expectations

---

## Key Deliverables

- Updated API routes with consistent field naming
- Backward compatibility code removed or documented
- Updated validation and error messages
- Updated route comments and documentation
- Verified API routes work correctly
- Consistent terminology throughout API layer

---

## Detailed Task Breakdown

### Task 9.8.1: Review API Routes for Field Name Consistency

**Files:**
- `server/src/routes/internal/compositions/compositionRouter.ts`
- `server/src/routes/internal/entities/entityRouter.ts`
- `server/src/routes/internal/relationships/relationshipRouter.ts`
- `server/src/routes/helpers/dataController.ts` (if it references field names)

**Steps:**
1. Review all API routes for references to old field names:
   - `entity_type` → should use `entity_kind` (or support both for backward compatibility)
   - `pool_coordinator_id` → should use `aggregate_id` (or support both)
   - `member_id` → should use `particle_id` (or support both)
   - `base_service` / `additional_service` → should use `service`
   - Old relationship names → should use new names (Cascade/Constituent/Composition)
2. Document which routes need updates
3. Identify backward compatibility code that can be removed or should be kept

**Current State:**
- `compositionRouter.ts` supports both old and new field names (backward compatibility)
- `relationshipRouter.ts` has backward compatibility mapping for old relationship names
- Need to decide: keep backward compatibility or remove it?

---

### Task 9.8.2: Update Composition Router

**Files:**
- `server/src/routes/internal/compositions/compositionRouter.ts`

**Steps:**
1. Review backward compatibility code:
   - `entity_type` / `entity_kind` support (lines 73-75, 159-166)
   - `pool_coordinator_id` / `aggregate_id` support (lines 73-74, 152-164)
   - `member_id` / `particle_id` support (lines 152-165)
2. Decide on backward compatibility strategy:
   - **Option A:** Keep backward compatibility (safer, allows gradual migration)
   - **Option B:** Remove backward compatibility (cleaner, forces frontend update)
3. Update route parameter names:
   - `:entityType` → consider `:entityKind` (but keep route param name for URL stability)
   - Update internal variable names to use `entityKind` consistently
4. Update validation messages to use `entity_kind` terminology
5. Update comments to reflect current state
6. Verify all routes work correctly

**Key Updates:**
- Line 110: Route param `:entityType` - consider renaming to `:entityKind` or document that param name differs from internal variable
- Lines 73-75: Backward compatibility for `entity_type` / `entity_kind`
- Lines 152-166: Backward compatibility for old field names
- Update error messages to use consistent terminology

---

### Task 9.8.3: Update Entity Router

**Files:**
- `server/src/routes/internal/entities/entityRouter.ts`

**Steps:**
1. Review route parameter names:
   - `:entityType` → consider if this should be `:entityKind` (but route param name can stay for URL stability)
2. Update internal variable names to use `entityKind` consistently
3. Update validation messages to use `entity_kind` terminology
4. Update comments to reflect current state
5. Verify all routes work correctly

**Key Updates:**
- Line 47: Route param `:entityType` - document that param name differs from internal concept (entityKind)
- Line 27: Entity keys list - verify it matches current entity registry
- Update error messages to use consistent terminology

---

### Task 9.8.4: Update Relationship Router

**Files:**
- `server/src/routes/internal/relationships/relationshipRouter.ts`

**Steps:**
1. Review backward compatibility mapping:
   - `BACKWARD_COMPATIBILITY_MAP` (lines 84-91) - decide if this should be kept or removed
2. Update relationship kind names to match new model names:
   - Verify `RELATIONSHIP_REGISTRY` uses correct names (Cascade/Constituent/Composition)
3. Update validation messages to use consistent terminology
4. Update comments to reflect current state
5. Verify all routes work correctly

**Key Updates:**
- Lines 84-91: Backward compatibility mapping - decide on strategy
- Verify relationship kind names match model names
- Update error messages to use consistent terminology

---

### Task 9.8.5: Update Data Controller Helper (if needed)

**Files:**
- `server/src/routes/helpers/dataController.ts`

**Steps:**
1. Review helper functions for field name references
2. Update if they reference old field names
3. Ensure they work correctly with updated models

---

### Task 9.8.6: Update API Route Comments and Documentation

**Files:**
- All API route files

**Steps:**
1. Update route comments to reflect current field names
2. Update LEARNING/WHY/PATTERN comments where appropriate
3. Remove outdated comments about backward compatibility (if removed)
4. Add comments explaining backward compatibility (if kept)
5. Ensure all comments are accurate and helpful

---

### Task 9.8.7: Verify API Routes Work Correctly

**Steps:**
1. Test all API routes:
   - GET routes (list, by-id)
   - POST routes (create)
   - PATCH routes (update)
   - DELETE routes (delete)
2. Test with both old and new field names (if backward compatibility is kept)
3. Test validation and error messages
4. Verify API responses match expected data structures
5. Document any issues found

---

### Task 9.8.8: Update Error Messages and Validation

**Files:**
- All API route files

**Steps:**
1. Review all error messages for consistent terminology:
   - Use `entity_kind` instead of `entity_type` in messages
   - Use `aggregate_id` / `particle_id` instead of `pool_coordinator_id` / `member_id`
   - Use relationship kind names (Cascade/Constituent/Composition)
2. Update validation messages to match new naming conventions
3. Ensure error messages are clear and helpful
4. Verify error responses include correct field names

---

## Success Criteria

- [ ] All API routes reviewed for field name consistency
- [ ] Backward compatibility code removed or documented
- [ ] Route parameter names updated (or documented why they differ)
- [ ] Validation messages use consistent terminology
- [ ] Error messages use consistent terminology
- [ ] Route comments updated and accurate
- [ ] All API routes tested and working correctly
- [ ] API responses match expected data structures
- [ ] Consistent terminology throughout API layer

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md` (if exists)
- Session 9.7 Summary: `project-manager/features/vue-migration/sessions/session-9.7-summary.md`
- Session 9.6 Summary: `project-manager/features/vue-migration/sessions/session-9.6-summary.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

---

## Notes

- **Backward Compatibility Strategy:**
  - **Option A (Keep):** Maintain backward compatibility for gradual migration
    - Pros: Safer, allows frontend to migrate gradually
    - Cons: More code to maintain, potential confusion
  - **Option B (Remove):** Remove backward compatibility, force frontend update
    - Pros: Cleaner code, no confusion
    - Cons: Requires frontend update, potential breaking changes
  - **Recommendation:** Keep backward compatibility for now, document it, plan removal in future session

- **Route Parameter Names:**
  - Route parameter names (e.g., `:entityType`) can differ from internal variable names (e.g., `entityKind`)
  - URL structure stability is important - changing route params breaks existing clients
  - Internal variable names should use new conventions (`entityKind`)
  - Document the difference between route param name and internal concept

- **Field Name Consistency:**
  - API routes should use `entity_kind` in request/response bodies
  - Route parameters can use `entityType` for URL stability
  - Internal variables should use `entityKind` for clarity
  - Error messages should use `entity_kind` terminology

- **Relationship Names:**
  - API routes should use new relationship names (Cascade/Constituent/Composition)
  - Backward compatibility mapping can be kept for gradual migration
  - Document which old names map to which new names

---

## Learning Checkpoints

### What We'll Learn
- API route alignment patterns after model changes
- Backward compatibility strategies
- Route parameter naming conventions
- Field name consistency patterns
- API validation and error message patterns

### Why These Patterns Matter
- Consistent API naming improves developer experience
- Backward compatibility allows gradual migration
- Clear error messages help debugging
- Route parameter stability prevents breaking changes
- Consistent terminology reduces confusion

### How This Relates to Existing Code
- Builds on Session 9.7 (Model Layer Updates)
- Completes API layer alignment with model changes
- Prepares for Session 9.9 (Frontend Type System Updates)
- Ensures API routes work correctly with updated models

---

## Potential Issues and Solutions

### Issue 1: Backward Compatibility vs Clean Code
**Solution:** Keep backward compatibility for now, document it clearly, plan removal in future session. This allows gradual migration without breaking existing clients.

### Issue 2: Route Parameter Names vs Internal Variable Names
**Solution:** Route parameter names can differ from internal variable names. Use `:entityType` in URL for stability, but use `entityKind` internally. Document the difference.

### Issue 3: Frontend May Still Use Old Field Names
**Solution:** Keep backward compatibility in API routes until frontend is updated. Plan frontend update in Session 9.9.

### Issue 4: Error Messages May Confuse Users
**Solution:** Update all error messages to use consistent terminology. Ensure error messages are clear and helpful.

---

## Session Start Checklist

Before starting this session, verify:
- [ ] Session 9.7 is complete (Model Layer Updates - Field Mapping Cleanup & Schema Alignment)
- [ ] All models updated with correct field names
- [ ] TypeScript compilation passes
- [ ] Application starts successfully
- [ ] All API routes exist and are accessible

---

## Next Session

**Session 9.9:** Frontend Type System Updates
- Update frontend types to match API changes
- Update frontend constants and configurations
- Update frontend components to use new field names
- Remove backward compatibility code from frontend

---

## Final Session in Phase 9

**Session 9.19:** Branch Alignment & Merge - Phase 6 Work with Phase 9 Changes
- Align and merge Phase 6 branches with Phase 9 renaming and structural changes
- Resolve merge conflicts while preserving Phase 6 work
- Update Phase 6 code to use new naming conventions
- Ensure Phase 6 unfinished sessions can continue without merge conflicts

---

## API Route Analysis

### Routes That Need Updates:

1. **Composition Router** (`compositionRouter.ts`):
   - Backward compatibility for `entity_type` / `entity_kind` (lines 73-75, 159-166)
   - Backward compatibility for `pool_coordinator_id` / `aggregate_id` (lines 73-74, 152-164)
   - Backward compatibility for `member_id` / `particle_id` (lines 152-165)
   - Route param `:entityType` (line 110) - consider renaming or documenting
   - Error messages need consistency check

2. **Entity Router** (`entityRouter.ts`):
   - Route param `:entityType` (line 47) - consider renaming or documenting
   - Entity keys list (line 27) - verify matches entity registry
   - Error messages need consistency check

3. **Relationship Router** (`relationshipRouter.ts`):
   - Backward compatibility mapping (lines 84-91) - decide on strategy
   - Relationship kind names - verify match model names
   - Error messages need consistency check

### Field Name Mapping:

- `entity_type` → `entity_kind` (in request/response bodies)
- `pool_coordinator_id` → `aggregate_id` (in request/response bodies)
- `member_id` → `particle_id` (in request/response bodies)
- `base_service` / `additional_service` → `service` (if referenced in API)
- Old relationship names → New relationship names (Cascade/Constituent/Composition)

### Backward Compatibility Decision:

**Recommendation:** Keep backward compatibility for now, document it clearly, plan removal in Session 9.9 (Frontend Type System Updates) when frontend is updated.

