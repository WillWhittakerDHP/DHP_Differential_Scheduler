# Phase 6 Session 6.5 Guide: User-Specific Descriptions - API Types & Transformers

**Feature:** Vue Migration  
**Purpose:** Session-level guide for fetching descriptions as associations and transforming them to blockInstance properties

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.5 - User-Specific Descriptions - API Types & Transformers
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.5
**Session Name:** User-Specific Descriptions - API Types & Transformers
**Description:** Fetch descriptions as Sequelize associations when fetching blockInstance entities, then transform them to a simple string property on blockInstance (filtered by user type). Descriptions remain independent from the core entity/relationship system to avoid breaking transformer logic.

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 6.4 complete (Database Schema & Models)

---

## ⚠️ Architectural Decision: Descriptions as Supporting Data

**Why:** Descriptions should NOT be added to `ENTITY_KEYS` or `RELATIONSHIP_KEYS` because:
- Transformers expect only 4 core entity types (blockInstance, blockShape, partInstance, partShape)
- Adding descriptions as entities would require transformer logic changes that could break existing functionality
- Descriptions are supporting data, not core entities that need to be processed by transformers

**Strategy:** Fetch descriptions as Sequelize associations (similar to how `blockShape` is included), then transform them to a simple string property on `blockInstance` during entity transformation.

**Pattern:** Similar to `blockShape` denormalization:
- Fetch `blockInstance` with `blockShape` included → transform to `blockInstance.blockShape` (string name)
- Fetch `blockInstance` with `descriptions` included → transform to `blockInstance.description` (string, filtered by user type)

---

## Session Objectives

- Modify `fetchAll` in `dataController.ts` to include descriptions association for blockInstance
- Update `fetchToGlobalTransformer.ts` to transform descriptions from associations to string property
- Filter descriptions by user type during transformation
- Update `globalToBookingTransformer.ts` to use transformed description property
- Ensure descriptions remain independent from entity/relationship constants
- Test transformer output includes descriptions correctly

---

## Key Deliverables

- Modified `fetchAll` to include descriptions association for blockInstance
- Updated `fetchToGlobalTransformer` to transform descriptions
- Updated `globalToBookingTransformer` to use description property
- Descriptions included in scheduler data as simple string property
- No changes to `ENTITY_KEYS` or `RELATIONSHIP_KEYS`

---

## Detailed Task Breakdown

### Task 6.5.1: Modify fetchAll to Include Descriptions Association

**File:** `server/src/routes/helpers/dataController.ts`

**Steps:**
1. Modify `fetchAll` function to accept optional includes parameter
2. For blockInstance, include Description association with through-table attributes
3. Include user_type, order_index, is_default from BlockInstanceDescription through-table

**Code:**
```typescript
const fetchAll = async <T extends Model>(
  Entity: ModelStatic<T>,
  includes?: any[]
): Promise<T[]> => {
  const options: any = {};
  if (includes && includes.length > 0) {
    options.include = includes;
  }
  return await Entity.findAll(options);
};
```

**Note:** Will need to check if Entity is BlockInstance and add descriptions include accordingly.

---

### Task 6.5.2: Update Entity Router to Use Includes

**File:** `server/src/routes/internal/entities/entityRouter.ts`

**Steps:**
1. Import Description and BlockInstanceDescription models
2. When fetching blockInstance, include descriptions association
3. Include through-table attributes (user_type, order_index, is_default)

**Code:**
```typescript
// In GET /entities/:entityType route
if (entityConfig.model.name === 'blockInstance') {
  const data = await fetchAll(entityConfig.model, [
    {
      model: Description,
      as: 'descriptions',
      through: {
        attributes: ['user_type', 'order_index', 'is_default']
      }
    }
  ]);
  res.json(data);
} else {
  const data = await fetchAll(entityConfig.model);
  res.json(data);
}
```

---

### Task 6.5.3: Transform Descriptions in fetchToGlobalTransformer

**File:** `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts`

**Steps:**
1. In `transformApiEntity`, detect if entity has descriptions association
2. Filter descriptions by user type (if provided)
3. Sort by orderIndex
4. Select default description (isDefault=true) or first description
5. Attach as `description` string property on blockInstance

**Code:**
```typescript
// In transformApiEntity function, after field mapping:
if (entityKey === 'blockInstance' && rawEntity.descriptions) {
  const descriptions = rawEntity.descriptions as Array<{
    text: string;
    userType: string | null;
    BlockInstanceDescription?: {
      userType: string | null;
      orderIndex: number;
      isDefault: boolean;
    };
  }>;
  
  // Filter by user type (if provided in context)
  // Sort by orderIndex
  // Select default or first
  const selectedDescription = descriptions
    .filter(desc => {
      // Filter logic: use BlockInstanceDescription.userType if set, else Description.userType
      const effectiveUserType = desc.BlockInstanceDescription?.userType ?? desc.userType;
      // Match user type or generic (null)
      return effectiveUserType === userType || effectiveUserType === null;
    })
    .sort((a, b) => {
      const aOrder = a.BlockInstanceDescription?.orderIndex ?? 0;
      const bOrder = b.BlockInstanceDescription?.orderIndex ?? 0;
      return aOrder - bOrder;
    })
    .find(desc => desc.BlockInstanceDescription?.isDefault) 
    ?? descriptions[0];
  
  transformed.description = selectedDescription?.text || '';
}
```

**Note:** User type filtering will need to be passed as context (from booking wizard state).

---

### Task 6.5.4: Update Scheduler Transformer

**File:** `client-vue/src/utils/transformers/globalToBookingTransformer.ts`

**Steps:**
1. Verify `description` property is already on blockInstance (from fetchToGlobalTransformer)
2. Use `blockInstance.description` directly (already a string)
3. No changes needed if description is already transformed to string

**Code:**
```typescript
// In transformBlockInstance method:
// description is already a string from fetchToGlobalTransformer
description: blockInstanceWithProps.description || '',
```

---

### Task 6.5.5: Add User Type Context (Future Enhancement)

**File:** `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts`

**Steps:**
1. Add optional `userType` parameter to `stageForHydration` method
2. Pass user type through transformation chain
3. Use user type for filtering descriptions

**Note:** This may be deferred to Session 6.7 when user type is available in booking wizard.

---

## Important Notes

- **Descriptions are NOT entities:** Do NOT add "description" to `ENTITY_KEYS`
- **Descriptions are NOT relationships:** Do NOT add "descriptions" to `RELATIONSHIP_KEYS`
- **Fetch as associations:** Descriptions are fetched via Sequelize associations, not separate API calls
- **Transform to property:** Descriptions are transformed to a simple string property on blockInstance
- **User type filtering:** Filtering happens during transformation, not at fetch time
- **Backward compatibility:** Existing `description` field on blockInstance remains supported

---

## Success Criteria

- [ ] `fetchAll` modified to support includes parameter
- [ ] Entity router includes descriptions association for blockInstance
- [ ] `fetchToGlobalTransformer` transforms descriptions to string property
- [ ] Descriptions filtered by user type during transformation
- [ ] `globalToBookingTransformer` uses description property correctly
- [ ] No changes to `ENTITY_KEYS` or `RELATIONSHIP_KEYS`
- [ ] Transformer output tested with descriptions
- [ ] Ready for Session 6.6 (Admin Portal)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`



