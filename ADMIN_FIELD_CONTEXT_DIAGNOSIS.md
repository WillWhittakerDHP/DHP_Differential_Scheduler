# Admin Field Context Diagnosis Report

## Problem Summary

Fields on admin pages are missing context because many metadata entries have `visibility = 'notConfigured'`, which prevents them from rendering properly.

## Database Analysis Results

### Metadata Entry Counts (Global Config Sentinel UUIDs)

| Entity Type | Entity ID | Field Count | Status |
|------------|----------|-------------|--------|
| blockShape | `00000000-0000-0000-0000-000000000001` | 6 | ✅ All fields configured |
| partShape | `00000000-0000-0000-0000-000000000002` | 4 | ⚠️ Only `name` visible |
| blockInstance | `00000000-0000-0000-0000-000000000004` | 14 | ❌ Only 3 fields visible |
| partInstance | `00000000-0000-0000-0000-000000000003` | 10 | ❌ Only 1 field visible |

### Visibility Breakdown

#### blockInstance (14 fields total)
- ✅ **WILL RENDER** (3 fields):
  - `active` (alwaysVisible)
  - `name` (alwaysVisible)
  - `visible` (expandedDirect)
  
- ❌ **WILL NOT RENDER** (11 fields with `notConfigured`):
  - `activeConstituents`
  - `allowMultiple`
  - `baseSqFt`
  - `bookingCascades`
  - `composite`
  - `dependent`
  - `dependentInstanceOptions`
  - `differential`
  - `icon`
  - `instanceComponents`
  - `requiresUnitNumber` (hidden - expected)

#### partInstance (10 fields total)
- ✅ **WILL RENDER** (1 field):
  - `active` (expandedDirect)
  
- ❌ **WILL NOT RENDER** (9 fields with `notConfigured`):
  - `baseFee`
  - `baseTime`
  - `clientPresent`
  - `moveable`
  - `name` ⚠️ **CRITICAL: name field not visible!**
  - `onSite`
  - `rateOverBaseFee`
  - `rateOverBaseTime`
  - `zeroOutPart`

#### blockShape (6 fields total)
- ✅ **ALL WILL RENDER** (6 fields):
  - `composable` (expandedDirect)
  - `constituable` (expandedDirect)
  - `name` (alwaysVisible)
  - `type` (expandedDirect)
  - `validCascades` (expandedPanel)
  - `validConstituents` (expandedPanel)

#### partShape (4 fields total)
- ✅ **WILL RENDER** (1 field):
  - `name` (alwaysVisible)
  
- 🔒 **HIDDEN** (3 fields - expected):
  - `entityKey` (hidden)
  - `id` (hidden)
  - `orderIndex` (hidden)

## Root Cause

The seed migration (`20260121_seed_all_fields_not_configured.mjs`) created metadata entries with `visibility = 'notConfigured'` as placeholders. These fields exist in the database but won't render until they're configured with proper visibility settings.

**The code doesn't filter out `notConfigured` fields** - they get contexts created, but the categorization/rendering logic may be checking visibility and skipping them, or the UI expects fields to have proper visibility to render.

## Critical Issues

1. **partInstance.name** has `visibility = 'notConfigured'` - this is a critical field that should be `alwaysVisible`
2. **Most blockInstance fields** are not configured - only 3 out of 14 render
3. **Most partInstance fields** are not configured - only 1 out of 10 renders

## Solution

### Option 1: Update Visibility Settings (Recommended)

Update the database to set proper visibility for critical fields:

```sql
-- Fix partInstance.name - should be alwaysVisible
UPDATE admin_input_metadata
SET visibility = 'alwaysVisible'
WHERE entity_type = 'partInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000003'
  AND field_key = 'name';

-- Fix blockInstance critical fields
UPDATE admin_input_metadata
SET visibility = 'expandedDirect'
WHERE entity_type = 'blockInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000004'
  AND field_key IN ('baseSqFt', 'icon', 'composite', 'differential', 'allowMultiple');

-- Fix partInstance critical fields
UPDATE admin_input_metadata
SET visibility = 'expandedDirect'
WHERE entity_type = 'partInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000003'
  AND field_key IN ('baseFee', 'baseTime', 'rateOverBaseFee', 'rateOverBaseTime', 'onSite', 'clientPresent', 'moveable');
```

### Option 2: Use Admin UI to Configure Fields

Use the `/admin-input-metadata` editor UI to configure visibility for each field:
1. Navigate to the metadata editor
2. Set visibility for each field:
   - `alwaysVisible` - Always shown (e.g., name)
   - `expandedDirect` - Shown when card is expanded (most fields)
   - `expandedPanel` - Shown in sub-panels (relationships, parts)
   - `hidden` - Never shown (system fields)

### Option 3: Create Migration Script

Create a new migration to set default visibility for all `notConfigured` fields based on field type and importance.

## Migration Applied ✅

**Migration:** `20260115_fix_field_visibility_settings.mjs`

### Results After Migration

#### blockInstance (14 fields total)
- ✅ **WILL RENDER** (13 fields):
  - `alwaysVisible` (2): active, name
  - `expandedDirect` (7): allowMultiple, baseSqFt, composite, dependent, differential, icon, visible
  - `expandedPanel` (4): activeConstituents, bookingCascades, dependentInstanceOptions, instanceComponents
- 🔒 **HIDDEN** (1): requiresUnitNumber (expected)

#### partInstance (10 fields total)
- ✅ **WILL RENDER** (10 fields):
  - `alwaysVisible` (1): name ✅ **FIXED!**
  - `expandedDirect` (9): active, baseFee, baseTime, clientPresent, moveable, onSite, rateOverBaseFee, rateOverBaseTime, zeroOutPart

### Summary
- ✅ **partInstance.name** now has `alwaysVisible` visibility
- ✅ **All blockInstance fields** now have proper visibility (13/14 render, 1 hidden as expected)
- ✅ **All partInstance fields** now have proper visibility (10/10 render)

## Next Steps

1. ✅ Database analysis complete
2. ✅ Update visibility settings for critical fields - **COMPLETED**
3. ⏭️ Test admin pages to verify fields render correctly
4. ⏭️ Verify field contexts are created properly

## SQL Queries for Verification

```sql
-- Check current visibility status
SELECT 
  entity_type,
  field_key,
  visibility,
  CASE 
    WHEN visibility = 'notConfigured' THEN 'WILL NOT RENDER'
    WHEN visibility = 'hidden' THEN 'HIDDEN'
    ELSE 'WILL RENDER'
  END as render_status
FROM admin_input_metadata
WHERE entity_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
)
ORDER BY entity_type, field_key;

-- Count fields by visibility
SELECT 
  entity_type,
  visibility,
  COUNT(*) as count
FROM admin_input_metadata
WHERE entity_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
)
GROUP BY entity_type, visibility
ORDER BY entity_type, visibility;
```
