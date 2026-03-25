# Phase 5 Session 5.2 Guide: Create Placeholder Steps & Routing

**Feature:** Vue Migration  
**Purpose:** Session-level guide for creating placeholder step components and setting up routing for the booking wizard

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 5 - Booking Wizard UI Shell (Static/Dead State)
**Session:** 5.2 - Create Placeholder Steps & Routing
**Status:** Not Started

---

## Session Overview

**Session Number:** 5.2
**Session Name:** Create Placeholder Steps & Routing
**Description:** Create minimal placeholder components for wizard steps 1-4 and set up routing configuration to access the booking wizard.

**Duration:** Estimated 1-2 hours
**Dependencies:** Session 5.1 complete (wizard layout and confirmation step)

---

## Session Objectives

- Create placeholder step components (ServiceSelection, PropertyDetails, Availability, Contacts)
- Update BookingWizard.vue to render placeholder steps
- Create BookingWizardView.vue route component
- Add `/booking` route to router configuration
- Verify complete wizard flow works

---

## Key Deliverables

- ServiceSelectionStep.vue placeholder
- PropertyDetailsStep.vue placeholder
- AvailabilityStep.vue placeholder
- ContactsStep.vue placeholder
- BookingWizardView.vue route component
- Router configuration updated
- Complete wizard accessible at `/booking`

---

## Detailed Task Breakdown

### Task 5.2.1: Create ServiceSelectionStep.vue Placeholder

**File:** `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Steps:**
1. Create ServiceSelectionStep.vue component in steps directory
2. Add basic component structure
3. Display step title and "Coming soon" message
4. Match visual style of ConfirmationStep (use VCard, VTypography)
5. Keep it minimal - just enough to show it's a placeholder

**Code Structure:**
```vue
<script setup lang="ts">
// Placeholder component - no logic, no data
// Will be implemented in Phase 6 with real data
</script>

<template>
  <div class="service-selection-step">
    <VCard>
      <VCardTitle>
        <VTypography variant="h4">
          Service Selection
        </VTypography>
      </VCardTitle>
      
      <VCardText>
        <VTypography variant="body1" color="text.secondary">
          This step will allow users to select their service type and additional services.
        </VTypography>
        
        <VAlert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          Coming soon - This step will be implemented in Phase 6
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.service-selection-step {
  // Minimal styling - matches ConfirmationStep spacing
}
</style>
```

---

### Task 5.2.2: Create PropertyDetailsStep.vue Placeholder

**File:** `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`

**Steps:**
1. Create PropertyDetailsStep.vue component
2. Match structure of ServiceSelectionStep
3. Update title and description for property details
4. Keep styling consistent

**Code Structure:**
```vue
<script setup lang="ts">
// Placeholder component - no logic, no data
// Will be implemented in Phase 6 with real data
</script>

<template>
  <div class="property-details-step">
    <VCard>
      <VCardTitle>
        <VTypography variant="h4">
          Property Details
        </VTypography>
      </VCardTitle>
      
      <VCardText>
        <VTypography variant="body1" color="text.secondary">
          This step will allow users to enter property type, address, and other property details.
        </VTypography>
        
        <VAlert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          Coming soon - This step will be implemented in Phase 6
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.property-details-step {
  // Minimal styling - matches ConfirmationStep spacing
}
</style>
```

---

### Task 5.2.3: Create AvailabilityStep.vue Placeholder

**File:** `client-vue/src/components/booking/steps/AvailabilityStep.vue`

**Steps:**
1. Create AvailabilityStep.vue component
2. Match structure of other placeholder steps
3. Update title and description for availability selection
4. Keep styling consistent

**Code Structure:**
```vue
<script setup lang="ts">
// Placeholder component - no logic, no data
// Will be implemented in Phase 6 with real data
</script>

<template>
  <div class="availability-step">
    <VCard>
      <VCardTitle>
        <VTypography variant="h4">
          Appointment Availability
        </VTypography>
      </VCardTitle>
      
      <VCardText>
        <VTypography variant="body1" color="text.secondary">
          This step will allow users to select appointment date and time slots.
        </VTypography>
        
        <VAlert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          Coming soon - This step will be implemented in Phase 6
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.availability-step {
  // Minimal styling - matches ConfirmationStep spacing
}
</style>
```

---

### Task 5.2.4: Create ContactsStep.vue Placeholder

**File:** `client-vue/src/components/booking/steps/ContactsStep.vue`

**Steps:**
1. Create ContactsStep.vue component
2. Match structure of other placeholder steps
3. Update title and description for contact information
4. Keep styling consistent

**Code Structure:**
```vue
<script setup lang="ts">
// Placeholder component - no logic, no data
// Will be implemented in Phase 6 with real data
</script>

<template>
  <div class="contacts-step">
    <VCard>
      <VCardTitle>
        <VTypography variant="h4">
          Personal Information
        </VTypography>
      </VCardTitle>
      
      <VCardText>
        <VTypography variant="body1" color="text.secondary">
          This step will allow users to enter agent and buyer contact information.
        </VTypography>
        
        <VAlert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          Coming soon - This step will be implemented in Phase 6
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.contacts-step {
  // Minimal styling - matches ConfirmationStep spacing
}
</style>
```

---

### Task 5.2.5: Update BookingWizard.vue to Render Placeholder Steps

**File:** `client-vue/src/components/booking/BookingWizard.vue`

**Steps:**
1. Import all placeholder step components
2. Update `getStepContent` method to return placeholder components
3. Verify step rendering works correctly
4. Test navigation between all steps

**Code Updates:**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ServiceSelectionStep from './steps/ServiceSelectionStep.vue'
import PropertyDetailsStep from './steps/PropertyDetailsStep.vue'
import AvailabilityStep from './steps/AvailabilityStep.vue'
import ContactsStep from './steps/ContactsStep.vue'
import ConfirmationStep from './steps/ConfirmationStep.vue'

// ... existing code ...

const getStepContent = (step: number) => {
  switch (step) {
    case 0:
      return ServiceSelectionStep
    case 1:
      return PropertyDetailsStep
    case 2:
      return AvailabilityStep
    case 3:
      return ContactsStep
    case 4:
      return ConfirmationStep
    default:
      return null
  }
}
</script>
```

---

### Task 5.2.6: Create BookingWizardView.vue Route Component

**File:** `client-vue/src/views/booking/BookingWizardView.vue`

**Steps:**
1. Create scheduler directory in views if it doesn't exist: `client-vue/src/views/booking/`
2. Create BookingWizardView.vue component
3. Check existing layouts (check AdminPanel.vue or other views for layout pattern)
4. Import BookingWizard component
5. Render BookingWizard in appropriate layout
6. Keep it simple - just a wrapper

**Code Structure:**
```vue
<script setup lang="ts">
import BookingWizard from '@/components/booking/BookingWizard.vue'

// No logic needed - just a route wrapper
// Check if AdminLayout or other layout is used in existing views
// If so, wrap BookingWizard in that layout
</script>

<template>
  <div class="booking-wizard-view">
    <!-- Check existing views to see if they use a layout wrapper -->
    <!-- For now, just render BookingWizard directly -->
    <BookingWizard />
  </div>
</template>

<style scoped lang="scss">
.booking-wizard-view {
  padding: 24px;
  
  // Match spacing from other views
  // Adjust based on existing view patterns
}
</style>
```

**Alternative with Layout (if needed):**
```vue
<script setup lang="ts">
import BookingWizard from '@/components/booking/BookingWizard.vue'
// Import layout if other views use one
// import AdminLayout from '@/layouts/AdminLayout.vue'
</script>

<template>
  <!-- If layout is needed -->
  <!-- <AdminLayout> -->
    <BookingWizard />
  <!-- </AdminLayout> -->
</template>
```

---

### Task 5.2.7: Add /booking Route to Router Configuration

**File:** `client-vue/src/router/index.ts`

**Steps:**
1. Open router configuration file
2. Add new route for booking wizard
3. Use lazy loading for the component
4. Verify route is accessible

**Code Changes:**
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/admin',
  },
  // ... existing routes ...
  
  // Booking wizard route
  {
    path: '/booking',
    name: 'booking-wizard',
    component: () => import('@/views/booking/BookingWizardView.vue'),
  },
  
  // ... other routes ...
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

---

### Task 5.2.8: Test Complete Wizard Flow

**Steps:**
1. Start dev server: `cd client-vue && npm run dev`
2. Navigate to `/booking` route
3. Verify all 5 steps display correctly:
   - Step 0: Service Selection (placeholder)
   - Step 1: Property Details (placeholder)
   - Step 2: Availability (placeholder)
   - Step 3: Contacts (placeholder)
   - Step 4: Summary (ConfirmationStep with hardcoded data)
4. Test step navigation:
   - Click stepper items to jump to steps
   - Use Previous/Next buttons
   - Verify Previous button disabled on first step
   - Verify Next button changes to Submit on last step
5. Test responsive design:
   - Desktop: stepper on left, content on right
   - Mobile: stepper on top, content below
6. Verify all placeholder steps show "Coming soon" message
7. Verify ConfirmationStep shows hardcoded data correctly
8. Test Submit button (should show alert)
9. Check browser console for errors

**Testing Checklist:**
- [ ] Route `/booking` is accessible
- [ ] All 5 steps render correctly
- [ ] Placeholder steps show "Coming soon" message
- [ ] ConfirmationStep displays hardcoded data
- [ ] Step navigation works (stepper clicks)
- [ ] Previous/Next buttons work correctly
- [ ] Previous button disabled on first step
- [ ] Submit button shows on last step
- [ ] Submit button shows alert (placeholder)
- [ ] Responsive layout works (mobile/desktop)
- [ ] No console errors
- [ ] Visual design consistent across all steps
- [ ] Ready for Phase 6 (Logic Integration)

---

## Vuetify/Vuexy Components Used

- `VCard` - Container for placeholder steps
- `VCardTitle` - Step title
- `VCardText` - Step content
- `VTypography` - Text styling
- `VAlert` - "Coming soon" message
- `VRow` / `VCol` - Layout (in BookingWizard)
- `VStepper` / `VStepperItem` - Step navigation
- `VBtn` - Navigation buttons

---

## File Structure Created

```
client-vue/src/
├── components/
│   └── scheduler/
│       ├── BookingWizard.vue (UPDATED - imports placeholder steps)
│       └── steps/
│           ├── ServiceSelectionStep.vue (NEW)
│           ├── PropertyDetailsStep.vue (NEW)
│           ├── AvailabilityStep.vue (NEW)
│           ├── ContactsStep.vue (NEW)
│           └── ConfirmationStep.vue (from Session 5.1)
└── views/
    └── scheduler/
        └── BookingWizardView.vue (NEW)
```

---

## Success Criteria

- [ ] All placeholder step components created
- [ ] BookingWizard.vue updated to render all steps
- [ ] BookingWizardView.vue route component created
- [ ] `/booking` route added to router
- [ ] All 5 steps display correctly
- [ ] Step navigation works (stepper clicks, Previous/Next)
- [ ] Placeholder steps show "Coming soon" message
- [ ] ConfirmationStep displays correctly
- [ ] Route is accessible and working
- [ ] Responsive design works
- [ ] No console errors
- [ ] Phase 5 complete - ready for Phase 6

---

## Notes

- Placeholder steps are intentionally minimal - just enough to show they exist
- All placeholder steps follow the same pattern for consistency
- No logic or data in placeholder steps - pure UI shell
- ConfirmationStep is the only fully implemented step (with hardcoded data)
- Router configuration uses lazy loading for performance
- Check existing views for layout patterns before creating BookingWizardView
- Keep placeholder steps simple - they'll be fully implemented in Phase 6

---

## Related Documents

- Phase Guide: `.cursor/project-manager/features/vue-migration/phases/phase-5-guide.md`
- Project Plan: `.cursor/project-manager/PROJECT_PLAN.md`
- Plan Details: `phase-5-booking-wizard-integration.plan.md`
- Session 5.1 Guide: `.cursor/project-manager/features/vue-migration/sessions/session-5.1-guide.md`
- Phase 6 Guide: `.cursor/project-manager/features/vue-migration/phases/phase-6-guide.md` (for future reference)
