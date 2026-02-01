# TypeScript Repair Plan

Generated: 2026-02-01
Total Errors: 82
Files Affected: 31

## Priority Breakdown

- **P0 (Critical)**: 18 errors - Blocking issues that prevent compilation
- **P1 (High)**: 16 errors - Important type safety issues
- **P2 (Medium)**: 48 errors - Mostly unused variables/imports

---

## P0 Priority - Critical Issues

### 1. AppointmentsTable.vue - Deprecated Properties (18 errors)
**File**: `src/views/admin/tabs/components/AppointmentsTable.vue`

**Issue**: Using deprecated `clientId` and `agentId` properties that no longer exist on `AppointmentResponse` and `AppointmentRequest`. These were replaced with the `attendees` array.

**Errors**:
- Lines 154, 173: `clientId` and `agentId` on `AppointmentRequest`
- Lines 373-384, 435-446, 395, 457: `clientId` and `agentId` on `AppointmentResponse` and `Partial<AppointmentRequest>`

**Fix**: 
- Update form to use `attendees` array instead of `clientId`/`agentId`
- Update display logic to extract client/agent from `attendees` array
- Update edit payload mapping to use attendees structure

**Estimated Effort**: Medium (requires UI changes)

---

### 2. Missing Image Module Declarations (4 errors)
**File**: `src/layouts/components/NavBarNotifications.vue`

**Issue**: Missing type declarations for image imports

**Errors**:
- `@images/avatars/avatar-3.png`
- `@images/avatars/avatar-4.png`
- `@images/avatars/avatar-5.png`
- `@images/cards/paypal-rounded.png`

**Fix**: Add missing image type declarations to `vite-env.d.ts` or create proper module declarations

**Estimated Effort**: Low

---

### 3. Missing Vuetify Module Declarations (3 errors)
**File**: `src/@core/components/app-form-elements/AppDateTimePicker.vue`

**Issue**: Missing type declarations for Vuetify internal modules

**Errors**:
- `vuetify/lib/components/VField/VField`
- `vuetify/lib/components/VInput/VInput`
- `vuetify/lib/util/helpers`

**Fix**: Add module declarations or use public Vuetify API instead of internal paths

**Estimated Effort**: Low-Medium

---

## P1 Priority - High Priority Issues

### 4. SlotShape Property Name Errors (3 errors)
**Files**: 
- `src/utils/differentialScheduling.ts` (2 errors)
- `src/utils/booking/appointmentSlotBuilder.ts` (1 error)

**Issue**: Using deprecated property names

**Errors**:
- `differentialOffset` should be `roundedDifferentialOffset` (lines 161, 162 in differentialScheduling.ts)
- `totalDuration` doesn't exist on `SlotShape` (line 295 in appointmentSlotBuilder.ts) - should use `roundedDuration`

**Fix**: Update property names to match new SlotShape interface

**Estimated Effort**: Low

---

### 5. Missing Module Declarations (5 errors)
**Files**: Various

**Issues**:
- `shepherd.js` - `src/layouts/components/NavSearchBar.vue`
- `shiki` - `src/@core/components/cards/AppCardCode.vue`
- `@images/logo.svg?raw` - `themeConfig.ts`

**Fix**: Add module declarations or install missing type packages

**Estimated Effort**: Low

---

### 6. Plugins.ts Type Issues (4 errors)
**File**: `src/@core/utils/plugins.ts`

**Issue**: Type errors with dynamic imports

**Errors**:
- Line 5: Expected 0 type arguments, but got 1
- Lines 13-14: Property 'default' does not exist on dynamic import type

**Fix**: Fix type annotations for dynamic imports

**Estimated Effort**: Low-Medium

---

### 7. DevPanelsContainer.vue Type Error (1 error)
**File**: `src/components/booking/dev/DevPanelsContainer.vue`

**Issue**: Property 'value' does not exist on type 'never' (line 470)

**Fix**: Fix type inference issue

**Estimated Effort**: Low

---

## P2 Priority - Medium Priority (Cleanup)

### 8. Unused Variables/Imports (48 errors)
**Files**: Multiple files

**Common Issues**:
- Unused imports (TS6133)
- Unused type declarations (TS6196)
- Unused function parameters

**Key Files**:
- `src/utils/optimistic/annotationAssignmentsOptimistic.ts` (7 errors)
- `src/components/booking/steps/AvailabilityStep.vue` (5 errors)
- `src/utils/annotationUtils.ts` (5 errors)
- `src/utils/transformers/fetchToGlobalTransformer.ts` (3 errors)
- Many others with 1-2 unused variables each

**Fix**: Remove unused imports/variables or prefix with `_` if needed for interface compliance

**Estimated Effort**: Low (but many files)

---

### 9. RelationshipCollection.vue Type Issue (1 error)
**File**: `src/components/admin/generic/collections/RelationshipCollection.vue`

**Issue**: Unused variables (2 errors)

**Fix**: Remove or use the variables

**Estimated Effort**: Low

---

### 10. InstancesTab.vue DragAndDrop Issue (1 error)
**File**: `src/views/admin/tabs/InstancesTab.vue`

**Issue**: Property 'values' does not exist on type 'DragAndDrop<unknown>' (line 276)

**Fix**: Fix DragAndDrop type usage

**Estimated Effort**: Low-Medium

---

## Recommended Fix Order

1. **Phase 1 - Critical Blockers** (P0):
   - Fix AppointmentsTable.vue deprecated properties (18 errors)
   - Add missing image/Vuetify module declarations (7 errors)

2. **Phase 2 - Type Safety** (P1):
   - Fix SlotShape property names (3 errors)
   - Fix plugins.ts type issues (4 errors)
   - Fix remaining module declarations (5 errors)
   - Fix DevPanelsContainer type error (1 error)

3. **Phase 3 - Cleanup** (P2):
   - Remove unused variables/imports (48 errors)
   - Fix remaining type issues (3 errors)

---

## Quick Wins (Can be done immediately)

1. Fix `differentialOffset` → `roundedDifferentialOffset` (2 errors)
2. Fix `totalDuration` → `roundedDuration` (1 error)
3. Remove unused imports in annotationAssignmentsOptimistic.ts (7 errors)
4. Add image module declarations (4 errors)

**Total Quick Wins**: ~14 errors fixed quickly

---

## Notes

- Most P2 errors are unused variables that don't affect functionality
- The AppointmentsTable.vue errors are the most critical as they affect core functionality
- Some module declaration errors may require installing type packages or creating custom declarations
- Consider running `npm run lint -- --fix` to auto-fix some unused variable issues
