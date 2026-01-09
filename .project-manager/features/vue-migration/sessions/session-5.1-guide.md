# Phase 5 Session 5.1 Guide: Create Wizard Layout & Confirmation Step

**Feature:** Vue Migration  
**Purpose:** Session-level guide for creating the booking wizard layout with stepper and Phase 5 confirmation step

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 5 - Booking Wizard UI Shell (Static/Dead State)
**Session:** 5.1 - Create Wizard Layout & Confirmation Step
**Status:** Not Started

---

## Session Overview

**Session Number:** 5.1
**Session Name:** Create Wizard Layout & Confirmation Step
**Description:** Create main booking wizard component with Vuetify VStepper and implement Phase 5 confirmation step with hardcoded data matching Jose's beautiful design.

**Duration:** Estimated 3-4 hours
**Dependencies:** Phase 4 complete (Vuexy admin integration)

---

## Session Objectives

- Create BookingWizard.vue main component with VStepper
- Set up step navigation with simple reactive state
- Create ConfirmationStep.vue with hardcoded data matching Jose's design
- Match Jose's visual design exactly (summary table, price breakdown card)
- Add Previous/Next/Submit navigation buttons
- Ensure responsive design works

---

## Key Deliverables

- BookingWizard.vue component with VStepper
- ConfirmationStep.vue component with hardcoded data
- Step navigation working (clickable steps, Previous/Next buttons)
- Visual design matching Jose's UI
- Responsive layout

---

## Detailed Task Breakdown

### Task 5.1.1: Create BookingWizard.vue Component Structure

**File:** `client-vue/src/components/booking/BookingWizard.vue`

**Steps:**
1. Create scheduler directory if it doesn't exist: `client-vue/src/components/booking/`
2. Create BookingWizard.vue component file
3. Import Vue 3 Composition API (`ref`, `computed`)
4. Import Vuetify components: `VStepper`, `VStepperItem`, `VCard`, `VCardContent`, `VBtn`
5. Import Vuexy icon system (check how icons are used in existing components)
6. Set up reactive state for active step: `const activeStep = ref(0)`
7. Define steps array matching Jose's structure:
   - Service Selection (icon: 'tabler-users')
   - Property Details (icon: 'tabler-home')
   - Appointment Availability (icon: 'tabler-bookmarks')
   - Personal Information (icon: 'tabler-map-pin')
   - Summary (icon: 'tabler-currency-dollar')
8. Create method to get step content based on active step
9. Create navigation handlers (handleNext, handlePrev, handleStepClick)

**Code Structure:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmationStep from './steps/ConfirmationStep.vue'
// Import placeholder steps (will be created in Session 5.2)
// import ServiceSelectionStep from './steps/ServiceSelectionStep.vue'
// import PropertyDetailsStep from './steps/PropertyDetailsStep.vue'
// import AvailabilityStep from './steps/AvailabilityStep.vue'
// import ContactsStep from './steps/ContactsStep.vue'

const activeStep = ref(0)

const steps = [
  {
    icon: 'tabler-users',
    title: 'Service Selection',
    subtitle: 'Identifying your needs'
  },
  {
    icon: 'tabler-home',
    title: 'Property Details',
    subtitle: 'Provide property info'
  },
  {
    icon: 'tabler-bookmarks',
    title: 'Appointment Availability',
    subtitle: 'Find a day/time slot'
  },
  {
    icon: 'tabler-map-pin',
    title: 'Personal Information',
    subtitle: 'Agent/Buyer information'
  },
  {
    icon: 'tabler-currency-dollar',
    title: 'Summary',
    subtitle: 'Summary of services'
  }
]

const handleNext = () => {
  if (activeStep.value < steps.length - 1) {
    activeStep.value++
  }
}

const handlePrev = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

const handleStepClick = (index: number) => {
  activeStep.value = index
}

const getStepContent = (step: number) => {
  switch (step) {
    case 0:
      // return <ServiceSelectionStep /> (placeholder for Session 5.2)
      return null
    case 1:
      // return <PropertyDetailsStep /> (placeholder for Session 5.2)
      return null
    case 2:
      // return <AvailabilityStep /> (placeholder for Session 5.2)
      return null
    case 3:
      // return <ContactsStep /> (placeholder for Session 5.2)
      return null
    case 4:
      return ConfirmationStep
    default:
      return null
  }
}

const isLastStep = computed(() => activeStep.value === steps.length - 1)
</script>

<template>
  <VCard class="booking-wizard">
    <VRow no-gutters>
      <!-- Stepper Header (Left Side) -->
      <VCol cols="12" lg="4">
        <VCardContent class="stepper-header">
          <VStepper
            v-model="activeStep"
            vertical
            :items="steps"
            class="booking-stepper"
          >
            <template v-for="(step, index) in steps" :key="index">
              <VStepperItem
                :value="index"
                :title="step.title"
                :subtitle="step.subtitle"
                :icon="step.icon"
                @click="handleStepClick(index)"
                :complete="activeStep > index"
                :selected="activeStep === index"
              />
            </template>
          </VStepper>
        </VCardContent>
      </VCol>

      <!-- Step Content (Right Side) -->
      <VCol cols="12" lg="8">
        <VCardContent class="step-content">
          <component :is="getStepContent(activeStep)" />
          
          <!-- Navigation Footer -->
          <div class="d-flex justify-space-between mt-6">
            <VBtn
              variant="tonal"
              color="secondary"
              :disabled="activeStep === 0"
              prepend-icon="tabler-arrow-left"
              @click="handlePrev"
            >
              Previous
            </VBtn>
            
            <VBtn
              :color="isLastStep ? 'success' : 'primary'"
              :prepend-icon="isLastStep ? 'tabler-check' : undefined"
              :append-icon="!isLastStep ? 'tabler-arrow-right' : undefined"
              @click="isLastStep ? handleSubmit() : handleNext()"
            >
              {{ isLastStep ? 'Submit' : 'Next' }}
            </VBtn>
          </div>
        </VCardContent>
      </VCol>
    </VRow>
  </VCard>
</template>

<style scoped lang="scss">
.booking-wizard {
  .stepper-header {
    border-right: 1px solid rgb(var(--v-theme-on-surface-variant));
    
    @media (max-width: 1279px) {
      border-right: none;
      border-bottom: 1px solid rgb(var(--v-theme-on-surface-variant));
    }
  }
  
  .step-content {
    padding-top: 24px !important;
  }
}
</style>
```

**Learning Points:**
- VStepper component structure and props
- Dynamic component rendering with `<component :is>`
- Step navigation logic
- Responsive layout with VRow/VCol

**Note:** Check Vuetify 3 VStepper API - may need to adjust component structure based on actual Vuetify version. If VStepper doesn't support vertical mode or has different API, may need to use custom stepper implementation.

---

### Task 5.1.2: Research Vuetify VStepper Component

**Steps:**
1. Check Vuetify version in package.json
2. Review Vuetify documentation for VStepper component
3. Check if vertical stepper is supported
4. Review existing Vuexy components for stepper patterns
5. If VStepper doesn't support vertical mode, create custom stepper using VList or VTimeline
6. Match Jose's stepper design (vertical, icons, titles, subtitles, clickable)

**Alternative Custom Stepper Structure:**
If VStepper doesn't work, use VList or custom structure:
```vue
<template>
  <VList>
    <VListItem
      v-for="(step, index) in steps"
      :key="index"
      :class="{ 'step-active': activeStep === index, 'step-completed': activeStep > index }"
      @click="handleStepClick(index)"
    >
      <template #prepend>
        <VAvatar
          :color="activeStep >= index ? 'primary' : 'default'"
          :variant="activeStep === index ? 'flat' : 'tonal'"
        >
          <VIcon :icon="step.icon" />
        </VAvatar>
      </template>
      
      <VListItemTitle>{{ step.title }}</VListItemTitle>
      <VListItemSubtitle>{{ step.subtitle }}</VListItemSubtitle>
    </VListItem>
  </VList>
</template>
```

**Learning Points:**
- Vuetify component API research
- Custom component patterns
- Matching design requirements

---

### Task 5.1.3: Create ConfirmationStep.vue Component

**File:** `client-vue/src/components/booking/steps/ConfirmationStep.vue`

**Steps:**
1. Create steps directory: `client-vue/src/components/booking/steps/`
2. Create ConfirmationStep.vue component
3. Import Vuetify components: `VRow`, `VCol`, `VTable`, `VCard`, `VCardContent`, `VChip`, `VDivider`, `VTypography`
4. Define hardcoded data matching Jose's StepPriceDetails:
   - Service Type: "Walk & Talk"
   - Additional Services: "Radon Testing, Blue Tape"
   - Dwelling Type: "Condo"
   - Address: "1209 13th St. NW #602, Washington DC, 20005"
   - Square Footage: "1000sqft"
   - Total Fee: "$899 USD"
   - Price breakdown values (hardcoded)
5. Create left column with summary table
6. Create right column with price breakdown card
7. Match Jose's styling exactly

**Code Structure:**
```vue
<script setup lang="ts">
// All data is hardcoded - no props, no state, no logic
const summaryData = {
  serviceType: 'Walk & Talk',
  additionalServices: 'Radon Testing, Blue Tape',
  dwellingType: 'Condo',
  address: '1209 13th St. NW #602, Washington DC, 20005',
  squareFootage: '1000sqft'
}

const priceData = {
  totalFee: 899,
  currency: 'USD',
  bagTotal: 1198.00,
  couponDiscount: 0,
  orderTotal: 1198.00,
  deliveryCharges: 5.00,
  deliveryFree: true,
  finalTotal: 1198.00
}
</script>

<template>
  <VRow>
    <!-- Left Column: Summary Table -->
    <VCol cols="12" md="6">
      <VTypography variant="h4" class="mb-4">
        Almost done! 🚀
      </VTypography>
      
      <VTypography
        variant="body1"
        color="text.secondary"
        class="mb-10"
      >
        Confirm your deal details information and submit to create it.
      </VTypography>
      
      <VTable>
        <tbody>
          <tr>
            <td>
              <VTypography
                no-wrap
                variant="body2"
                class="font-weight-medium text-medium-emphasis"
              >
                Service Type
              </VTypography>
            </td>
            <td>
              <VTypography variant="body2" color="text.secondary">
                {{ summaryData.serviceType }}
              </VTypography>
            </td>
          </tr>
          
          <tr>
            <td>
              <VTypography
                no-wrap
                variant="body2"
                class="font-weight-medium text-medium-emphasis"
              >
                Additional Service
              </VTypography>
            </td>
            <td>
              <VTypography variant="body2" color="text.secondary">
                {{ summaryData.additionalServices }}
              </VTypography>
            </td>
          </tr>
          
          <tr>
            <td>
              <VTypography
                no-wrap
                variant="body2"
                class="font-weight-medium text-medium-emphasis"
              >
                Dwelling Type
              </VTypography>
            </td>
            <td>
              <VTypography variant="body2" color="text.secondary">
                {{ summaryData.dwellingType }}
              </VTypography>
            </td>
          </tr>
          
          <tr>
            <td>
              <VTypography
                no-wrap
                variant="body2"
                class="font-weight-medium text-medium-emphasis"
              >
                Address
              </VTypography>
            </td>
            <td>
              <VTypography variant="body2" color="text.secondary">
                {{ summaryData.address }}
              </VTypography>
            </td>
          </tr>
          
          <tr>
            <td>
              <VTypography
                no-wrap
                variant="body2"
                class="font-weight-medium text-medium-emphasis"
              >
                Square Footage
              </VTypography>
            </td>
            <td>
              <VTypography variant="body2" color="text.secondary">
                {{ summaryData.squareFootage }}
              </VTypography>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCol>

    <!-- Right Column: Price Breakdown Card -->
    <VCol cols="12" md="6">
      <VCard variant="outlined">
        <!-- Total Fee Display -->
        <VCardContent class="bg-surface">
          <div class="d-flex flex-column pa-5">
            <VTypography variant="h6" class="mb-4">
              Your total fee is:
            </VTypography>
            
            <div class="d-flex align-end justify-end">
              <VTypography variant="h6" class="align-self-end">$&nbsp;</VTypography>
              <VTypography
                variant="h1"
                class="font-weight-bold"
                style="line-height: 1; font-size: 3.75rem !important;"
              >
                {{ priceData.totalFee }}
              </VTypography>
              <VTypography variant="h6">&nbsp;{{ priceData.currency }}</VTypography>
            </div>
          </div>
        </VCardContent>
        
        <VDivider />
        
        <!-- Price Details -->
        <VCardContent>
          <VTypography variant="h6" class="mb-4">
            Price Details
          </VTypography>
          
          <div class="d-flex flex-column gap-2">
            <div class="d-flex justify-space-between align-center mb-2">
              <VTypography variant="body1">Bag Total</VTypography>
              <VTypography variant="body1" color="text.secondary">
                ${{ priceData.bagTotal.toFixed(2) }}
              </VTypography>
            </div>
            
            <div class="d-flex justify-space-between align-center mb-2">
              <VTypography variant="body1">Coupon Discount</VTypography>
              <VBtn
                variant="text"
                color="primary"
                size="small"
                @click.prevent
              >
                Apply Coupon
              </VBtn>
            </div>
            
            <div class="d-flex justify-space-between align-center mb-2">
              <VTypography variant="body1">Order Total</VTypography>
              <VTypography variant="body1" color="text.secondary">
                ${{ priceData.orderTotal.toFixed(2) }}
              </VTypography>
            </div>
            
            <div class="d-flex justify-space-between align-center">
              <VTypography variant="body1">Delivery Charges</VTypography>
              <div class="d-flex align-center">
                <VTypography
                  variant="body2"
                  class="text-decoration-line-through text-disabled mr-2"
                >
                  ${{ priceData.deliveryCharges.toFixed(2) }}
                </VTypography>
                <VChip
                  rounded
                  size="small"
                  color="success"
                  variant="tonal"
                >
                  Free
                </VChip>
              </div>
            </div>
          </div>
        </VCardContent>
        
        <VDivider />
        
        <!-- Final Total -->
        <VCardContent class="py-3">
          <div class="d-flex justify-space-between align-center">
            <VTypography variant="body1" class="font-weight-medium">
              Total
            </VTypography>
            <VTypography variant="body1" class="font-weight-medium">
              ${{ priceData.finalTotal.toFixed(2) }}
            </VTypography>
          </div>
        </VCardContent>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped lang="scss">
// Match Jose's table styling
:deep(.v-table) {
  tbody {
    tr {
      td {
        border-bottom: none;
        vertical-align: top;
        padding: 6px 0;
        
        &:first-child {
          padding-left: 0;
        }
        
        &:last-child {
          padding-right: 0;
        }
      }
    }
  }
}
</style>
```

**Learning Points:**
- VTable structure and styling
- VCard with multiple sections
- VTypography for text styling
- VChip for badges
- Responsive grid layout
- Matching exact design from Jose's component

---

### Task 5.1.4: Match Jose's Visual Design

**Steps:**
1. Review Jose's StepPriceDetails component styling
2. Match typography sizes and weights
3. Match spacing and padding
4. Match colors (use Vuexy theme colors)
5. Match table styling (no borders, specific padding)
6. Match price breakdown card styling
7. Match large total fee display (3.75rem font size)
8. Ensure responsive breakpoints match

**Key Design Elements to Match:**
- Summary table: No borders, specific padding, left-aligned labels, right-aligned values
- Price card: Outlined variant, sections with dividers
- Total fee: Large display (3.75rem), right-aligned, with currency
- Price details: Flex layout with space-between
- Delivery charges: Strikethrough price + "Free" chip
- Final total: Bold, separated section

**Styling Notes:**
- Use Vuexy theme colors: `primary`, `success`, `text.secondary`, `text.disabled`
- Use Vuetify spacing utilities: `mb-4`, `pa-5`, `gap-2`
- Use Vuetify typography: `variant="h4"`, `variant="h6"`, `variant="body1"`
- Match exact font sizes from Jose's design

---

### Task 5.1.5: Add Navigation Buttons

**File:** `client-vue/src/components/booking/BookingWizard.vue`

**Steps:**
1. Add Previous button (disabled on first step)
2. Add Next/Submit button (changes to Submit on last step)
3. Match Jose's button styling and icons
4. Add click handlers
5. Position buttons correctly (space-between layout)

**Button Implementation:**
```vue
<template>
  <div class="d-flex justify-space-between mt-6">
    <VBtn
      variant="tonal"
      color="secondary"
      :disabled="activeStep === 0"
      prepend-icon="tabler-arrow-left"
      @click="handlePrev"
    >
      Previous
    </VBtn>
    
    <VBtn
      :color="isLastStep ? 'success' : 'primary'"
      :prepend-icon="isLastStep ? 'tabler-check' : undefined"
      :append-icon="!isLastStep ? 'tabler-arrow-right' : undefined"
      @click="isLastStep ? handleSubmit() : handleNext()"
    >
      {{ isLastStep ? 'Submit' : 'Next' }}
    </VBtn>
  </div>
</template>

<script setup lang="ts">
const handleSubmit = () => {
  // Placeholder - just alert for now (no real logic)
  alert('Submitted! (This is a static UI shell)')
}
</script>
```

**Learning Points:**
- Conditional button styling
- Icon positioning (prepend vs append)
- Disabled state handling
- Click handlers

---

### Task 5.1.6: Test Wizard Layout and Confirmation Step

**Steps:**
1. Start dev server: `cd client-vue && npm run dev`
2. Navigate to `/booking` route (will be set up in Session 5.2)
3. Verify stepper displays correctly
4. Verify step 4 (Summary) shows ConfirmationStep
5. Verify navigation buttons work
6. Verify responsive design (test mobile and desktop)
7. Compare visual design with Jose's original
8. Check browser console for errors
9. Verify all hardcoded data displays correctly

**Testing Checklist:**
- [ ] Stepper displays with all 5 steps
- [ ] Step icons display correctly
- [ ] Step titles and subtitles display
- [ ] Clicking steps changes active step
- [ ] ConfirmationStep displays on step 4
- [ ] Summary table shows all hardcoded data
- [ ] Price breakdown card displays correctly
- [ ] Large total fee displays prominently
- [ ] Previous button disabled on first step
- [ ] Next button changes to Submit on last step
- [ ] Navigation buttons work correctly
- [ ] Responsive layout works (mobile/desktop)
- [ ] Visual design matches Jose's design
- [ ] No console errors
- [ ] Submit button shows alert (placeholder)

---

## Vuetify/Vuexy Components Used

- `VCard` - Main wizard container
- `VCardContent` - Content sections
- `VRow` / `VCol` - Responsive grid layout
- `VStepper` / `VStepperItem` - Step navigation (or custom if not supported)
- `VTable` - Summary data table
- `VTypography` - Text styling
- `VChip` - Badges (e.g., "Free")
- `VDivider` - Section separators
- `VBtn` - Navigation buttons
- `VIcon` - Step icons (via Vuexy icon system)

---

## File Structure Created

```
client-vue/src/components/booking/
├── BookingWizard.vue (NEW)
└── steps/
    └── ConfirmationStep.vue (NEW)
```

---

## Success Criteria

- [ ] BookingWizard.vue created with VStepper (or custom stepper)
- [ ] Step navigation works (clickable steps, Previous/Next buttons)
- [ ] ConfirmationStep.vue created with hardcoded data
- [ ] Summary table displays correctly
- [ ] Price breakdown card displays correctly
- [ ] Large total fee displays prominently
- [ ] Visual design matches Jose's design
- [ ] Responsive layout works
- [ ] No console errors
- [ ] Ready for Session 5.2 (Placeholder Steps & Routing)

---

## Notes

- This session focuses on UI structure only - no logic, no data connections
- All data in ConfirmationStep is hardcoded
- Stepper implementation may need adjustment based on Vuetify version
- Visual design matching is critical - compare side-by-side with Jose's component
- Keep components simple - no state management, no composables yet
- Navigation is basic - just step index management

---

## Related Documents

- Phase Guide: `.cursor/project-manager/features/vue-migration/phases/phase-5-guide.md`
- Project Plan: `.cursor/project-manager/PROJECT_PLAN.md`
- Plan Details: `phase-5-booking-wizard-integration.plan.md`
- Jose's Reference: `WillWhittakerDHP/Stuff-From_Jose` - `src/views/pages/wizard-examples/scheduler/StepPriceDetails.js`


