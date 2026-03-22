# Session 1.3.9.2 Guide: Backend Model and API Updates

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9.2 - Backend Model and API Updates  
**Status:** Not Started  
**Priority:** High (Required for API to work with new schema)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.9.2  
**Session Name:** Backend Model and API Updates  
**Description:** Update backend Appointment model and API routes to use JSONB array fields instead of FK columns. Remove old FK relationships and update request validation.

**Dependencies:** Session 1.3.9.1 (Database Migration) ✅ Complete

---

---

## Objectives

- Update Appointment model (remove FK fields, add array fields)
- Update model relationships in `models/index.ts`
- Update appointment router request validation
- Update appointment creation/update logic

---

## Tasks

### Task 1.3.9.2.1: Update Appointment Model

**Goal:** Replace FK fields with JSONB array fields in Appointment model.

**Steps:**
1. **Remove FK Fields:**
   - Remove `baseServiceId: ForeignKey<string> | null`
   - Remove `dwellingAdjustmentId: ForeignKey<string> | null`

2. **Add Array Fields:**
   - Add `selectedServiceIds: DataTypes.JSONB | null`
   - Add `selectedDwellingAdjustmentIds: DataTypes.JSONB | null`
   - Set nullable: `true` to match database schema

3. **Update Field Mappings:**
   - Map `selectedServiceIds` to `selected_service_ids` column
   - Map `selectedDwellingAdjustmentIds` to `selected_dwelling_adjustment_ids` column

4. **Update TypeScript Types:**
   - Update model attributes type to reflect array fields
   - Change from `string | null` to `string[] | null`

**Key Files:**
- `server/src/db/models/booking/appointment.ts`

**Checkpoint:** Verify model compiles and types are correct.

---

### Task 1.3.9.2.2: Update Model Relationships

**Goal:** Remove FK-based relationships, note that relationships now handled via JSONB lookups.

**Steps:**
1. **Remove BlockInstance.hasMany Relationships:**
   - Remove `BlockInstance.hasMany(Appointment, { foreignKey: 'base_service_id' })`
   - Remove `BlockInstance.hasMany(Appointment, { foreignKey: 'dwelling_adjustment_id' })`

2. **Remove Appointment.belongsTo Relationships:**
   - Remove `Appointment.belongsTo(BlockInstance, { foreignKey: 'base_service_id' })`
   - Remove `Appointment.belongsTo(BlockInstance, { foreignKey: 'dwelling_adjustment_id' })`

3. **Add Comments:**
   - Document that relationships now handled via JSONB array lookups
   - Note that includes/joins need to be done manually if needed

**Key Files:**
- `server/src/db/models/index.ts`

**Checkpoint:** Verify relationships removed and model still works.

---

### Task 1.3.9.2.3: Update API Request Validation

**Goal:** Update appointment router to validate array fields instead of FK fields.

**Steps:**
1. **Update Request Schema:**
   - Change `baseServiceId: string | null` → `selectedServiceIds: string[] | null`
   - Change `dwellingAdjustmentId: string | null` → `selectedDwellingAdjustmentIds: string[] | null`

2. **Add Array Validation:**
   - Validate that arrays contain only strings (IDs)
   - Validate that arrays are not empty if provided (or allow empty arrays?)
   - Handle null/undefined arrays gracefully

3. **Update Validation Middleware:**
   - Update validation rules for POST/PUT/PATCH endpoints
   - Ensure backward compatibility during transition (if needed)

**Key Files:**
- `server/src/api/routes/appointmentRouter.ts`

**Checkpoint:** Verify validation works correctly for arrays.

---

### Task 1.3.9.2.4: Update Appointment Creation Logic

**Goal:** Update appointment creation to handle array fields.

**Steps:**
1. **Update Create Endpoint:**
   - Map `selectedServiceIds` array to JSONB column
   - Map `selectedDwellingAdjustmentIds` array to JSONB column
   - Handle empty arrays (convert to null or keep as empty array?)

2. **Update Data Transformation:**
   - Ensure arrays are stored as JSONB correctly
   - Handle null/undefined arrays appropriately

3. **Update Response:**
   - Return arrays in response (not single values)
   - Ensure response format matches new schema

**Key Files:**
- `server/src/api/routes/appointmentRouter.ts`

**Checkpoint:** Verify appointment creation works with arrays.

---

### Task 1.3.9.2.5: Update Appointment Update Logic

**Goal:** Update appointment update endpoints to handle array fields.

**Steps:**
1. **Update Update Endpoint:**
   - Support partial updates (can update just services or just dwelling adjustments)
   - Handle array updates correctly
   - Preserve existing arrays if not provided in update

2. **Update Patch Logic:**
   - Allow updating arrays independently
   - Handle null arrays (clear selection)
   - Handle empty arrays (clear selection or keep empty?)

**Key Files:**
- `server/src/api/routes/appointmentRouter.ts`

**Checkpoint:** Verify appointment updates work with arrays.

---

### Task 1.3.9.2.6: Update Query Logic (if needed)

**Goal:** Update any queries that relied on FK relationships.

**Steps:**
1. **Review Query Patterns:**
   - Find queries that used FK joins
   - Update to use JSONB array queries instead

2. **Update Array Queries:**
   - Use `WHERE 'id' = ANY(selected_service_ids)` for filtering
   - Use GIN indexes for efficient queries
   - Handle null arrays appropriately

3. **Update Includes/Joins:**
   - If includes were used, update to manual lookups
   - Or remove includes if not needed

**Key Files:**
- `server/src/api/routes/appointmentRouter.ts`
- Any query utilities that reference appointments

**Checkpoint:** Verify queries work correctly with JSONB arrays.

---

## Key Files

### Backend
- `server/src/db/models/booking/appointment.ts`
- `server/src/db/models/index.ts`
- `server/src/api/routes/appointmentRouter.ts`

---

## Success Criteria

- ✅ Appointment model updated with JSONB array fields
- ✅ Old FK relationships removed from models/index.ts
- ✅ API request validation updated for arrays
- ✅ Appointment creation works with arrays
- ✅ Appointment updates work with arrays
- ✅ Queries updated to work with JSONB arrays
- ✅ All backend tests pass

---

## Implementation Notes

- **Array Handling:** Store arrays as JSONB, handle null/empty arrays consistently
- **Validation:** Validate arrays contain strings (IDs), handle empty arrays appropriately
- **Backward Compatibility:** Consider if needed during transition period
- **Query Performance:** Use GIN indexes for efficient JSONB array queries
- **Type Safety:** Ensure TypeScript types reflect array fields correctly

---

## Related Documents

- **Parent Session Guide**: `session-1.3.9-guide.md`
- **Previous Sub-Session**: `session-1.3.9.1-guide.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`

---

**Next Sub-Session:** Session 1.3.9.3 - Frontend Type and Wizard State Updates
