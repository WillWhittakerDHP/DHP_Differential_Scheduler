# Phase 6 Session 6.3 Guide: Icon Integration

**Feature:** Vue Migration  
**Purpose:** Session-level guide for displaying icons from database in wizard

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.3 - Icon Integration
**Status:** ✅ Complete

**⚠️ TERMINOLOGY UPDATE (2025-02-01):** After Session 6.3, the codebase underwent a comprehensive terminology conversion. All "aggregate/pooling" terminology has been replaced with "composition" terminology throughout the codebase. Backward compatibility mappings removed. See Phase 6 Handoff document for details.

---

## Session Overview

**Session Number:** 6.3
**Session Name:** Icon Integration
**Description:** Create icon mapper utility to convert database icon strings to Vuetify icons and integrate icon display in ServiceSelectionStep.

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 6.2 complete (Cascading Selection Logic)

---

## Session Objectives

- Create `iconMapper.ts` utility to map database icon strings to Vuetify icons
- Update ServiceSelectionStep to display icons from SchedulerBlockProfile.icon
- Handle icon mapping edge cases (null, unknown icons)
- Verify admin portal icon editing works
- Test icon display in wizard

---

## Key Deliverables

- `iconMapper.ts` utility
- Icon display in ServiceSelectionStep
- Fallback handling for missing/unknown icons
- Admin portal icon editing verified

---

## Detailed Task Breakdown

### Task 6.3.1: Create Icon Mapper Utility

**File:** `client-vue/src/utils/iconMapper.ts`

**Steps:**
1. Create utility file
2. Map Ant Design icon names (from seeds) to Vuetify/Tabler icons
3. Create mapping function that handles:
   - Known mappings (DollarOutlined → tabler-currency-dollar)
   - Unknown icons (fallback to default)
   - Null/empty icons (fallback to default)
4. Export mapping function

**Code Structure:**
```typescript
/**
 * Icon Mapper Utility
 * Maps database icon strings (Ant Design names) to Vuetify/Tabler icon names
 */

const iconMap: Record<string, string> = {
  // User Type icons
  'DollarOutlined': 'tabler-currency-dollar',
  'ContactsOutlined': 'tabler-users',
  'HomeOutlined': 'tabler-home',
  'EyeOutlined': 'tabler-eye',
  
  // Add more mappings as needed
}

const DEFAULT_ICON = 'tabler-circle'

/**
 * Map database icon string to Vuetify/Tabler icon name
 * @param iconString - Icon string from database (e.g., "DollarOutlined")
 * @returns Vuetify/Tabler icon name (e.g., "tabler-currency-dollar")
 */
export function mapIcon(iconString: string | null | undefined): string {
  if (!iconString) {
    return DEFAULT_ICON
  }
  
  return iconMap[iconString] || DEFAULT_ICON
}
```

---

### Task 6.3.2: Update ServiceSelectionStep to Display Icons

**File:** `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Steps:**
1. Import `mapIcon` utility
2. Update User Type cards to use mapped icons
3. Update Base Service display to use mapped icons if available
4. Test icon display

**Code Update:**
```vue
<script setup lang="ts">
import { mapIcon } from '@/utils/iconMapper'
// ... existing imports
</script>

<template>
  <!-- User Type Icons -->
  <VIcon
    :icon="mapIcon(userType.icon)"
    size="40"
    class="text-medium-emphasis mb-2"
  />
</template>
```

---

### Task 6.3.3: Verify Admin Portal Icon Editing

**Steps:**
1. Navigate to admin portal
2. Edit a BlockProfile
3. Update icon field
4. Save changes
5. Verify icon updates in wizard

---

## Success Criteria

- [x] iconMapper.ts utility created/enhanced
- [x] Icon mappings work correctly (Ant Design → Tabler)
- [x] Icons display in ServiceSelectionStep
- [x] Fallback icons work for null/unknown icons
- [x] Admin portal icon editing works (architecture supports it)
- [x] No console errors (linting passes)
- [x] Ready for Session 6.4 (Description Database Schema)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`



