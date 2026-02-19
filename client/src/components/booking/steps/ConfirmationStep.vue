<script setup lang="ts">
/**
 * ConfirmationStep Component
 * 
 * LEARNING: Final step for confirming appointment details and pricing
 * WHY: Displays summary of all selections and calculated fees
 * PATTERN: Uses composable to aggregate wizard state and step data
 */

import { inject, ref, type Ref } from 'vue'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { useConfirmationStepData } from '@/composables/booking/useConfirmationStepData'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import type { AvailabilityStepData } from '@/types/wizardStepData'
import type { PropertyDetailsStepData, ConfirmationStepData } from '@/types/wizard'

const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const propertyDetailsStepData = inject<Ref<PropertyDetailsStepData> | null>('propertyDetailsStepData', null)
const availabilityStepData = inject<Ref<AvailabilityStepData> | null>('availabilityStepData', null)

// Stub state for useWizardStepSync; summary step participates in same sync pattern as other steps
const stepData = ref<ConfirmationStepData>({})
const isFormValid = ref(true)
function validateForm(): boolean {
  return true
}
useWizardStepSync({
  stepData,
  isFormValid,
  validateForm,
  stepDataKey: 'confirmationStepData',
  stepValidKey: 'confirmationStepValid',
  stepValidateKey: 'confirmationStepValidate',
})

// LEARNING: Use confirmation step data composable
// PATTERN: Composable aggregates wizard state and step data, calculates fees
const {
  summaryData,
  priceData
} = useConfirmationStepData({
  wizard: {
    selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
    selectedLineItemBlocks: wizard.selectedLineItemBlocks,
    selectedUserTypeBlock: wizard.selectedUserTypeBlock
  },
  propertyDetailsStepData,
  availabilityStepData
})
</script>

<template>
  <VRow>
    <!-- Left Column: Summary Table -->
    <VCol cols="12" md="6">
      <h4 class="text-h4 mb-4">
        Almost done! 🚀
      </h4>
      
      <p class="text-body-1 text-medium-emphasis mb-10">
        Confirm your deal details information and submit to create it.
      </p>
      
      <!-- LEARNING: VTable for summary data display -->
      <!-- WHY: Provides structured table layout for key-value pairs -->
      <!-- PATTERN: Table with tbody containing rows of label-value pairs -->
      <VTable class="summary-table">
        <tbody>
          <tr>
            <td>
              <span class="text-body-2 font-weight-medium text-medium-emphasis">
                Service Type
              </span>
            </td>
            <td>
              <span class="text-body-2 text-medium-emphasis">
                {{ summaryData.serviceType }}
              </span>
            </td>
          </tr>
          
          <tr>
            <td>
              <span class="text-body-2 font-weight-medium text-medium-emphasis">
                Property Type
              </span>
            </td>
            <td>
              <span class="text-body-2 text-medium-emphasis">
                {{ summaryData.propertyType }}
              </span>
            </td>
          </tr>
          
          <tr>
            <td>
              <span class="text-body-2 font-weight-medium text-medium-emphasis">
                Address
              </span>
            </td>
            <td>
              <span class="text-body-2 text-medium-emphasis">
                {{ summaryData.address }}
              </span>
            </td>
          </tr>
          
          <tr>
            <td>
              <span class="text-body-2 font-weight-medium text-medium-emphasis">
                Square Footage
              </span>
            </td>
            <td>
              <span class="text-body-2 text-medium-emphasis">
                {{ summaryData.squareFootage }}
              </span>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCol>

    <!-- Right Column: Price Breakdown Card -->
    <VCol cols="12" md="6">
      <!-- LEARNING: VCard with multiple sections for price breakdown -->
      <!-- WHY: Provides structured card layout with dividers between sections -->
      <!-- PATTERN: Card with VCardText sections separated by VDivider -->
      <VCard variant="outlined">
        <!-- Total Fee Display -->
        <VCardText class="bg-surface">
          <div class="d-flex flex-column pa-5">
            <h6 class="text-h6 mb-4">
              Your total fee is:
            </h6>
            
            <!-- LEARNING: Large price display with currency -->
            <!-- WHY: Prominently displays the final total fee (after all calculations including discounts and delivery) -->
            <!-- PATTERN: Flex layout with separate typography elements for currency, amount, and unit -->
            <div class="d-flex align-end justify-end">
              <h6 class="text-h6 align-self-end">$&nbsp;</h6>
              <h1 class="text-h1 font-weight-bold price-display">
                {{ priceData.finalTotal.toFixed(2) }}
              </h1>
              <h6 class="text-h6">&nbsp;{{ priceData.currency }}</h6>
            </div>
          </div>
        </VCardText>
        
        <VDivider />
        
        <!-- Price Details -->
        <VCardText>
          <h6 class="text-h6 mb-4">
            Price Details
          </h6>
          
          <div class="d-flex flex-column gap-2">
            <!-- LEARNING: Price detail rows with space-between layout -->
            <!-- WHY: Shows individual price components clearly -->
            <!-- PATTERN: Flex row with justify-space-between for label-value pairs -->
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-1">Bag Total</span>
              <span class="text-body-1 text-medium-emphasis">
                ${{ priceData.bagTotal.toFixed(2) }}
              </span>
            </div>
            
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-1">Coupon Discount</span>
              <div class="d-flex align-center">
                <span v-if="priceData.couponDiscount > 0" class="text-body-1 text-medium-emphasis mr-2">
                  -${{ priceData.couponDiscount.toFixed(2) }}
                </span>
                <VBtn
                  v-else
                  variant="text"
                  color="primary"
                  size="small"
                  class="text-h6"
                  style="text-decoration: none;"
                  @click.prevent
                >
                  Apply Coupon
                </VBtn>
              </div>
            </div>
            
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-1">Order Total</span>
              <span class="text-body-1 text-medium-emphasis">
                ${{ priceData.orderTotal.toFixed(2) }}
              </span>
            </div>
            
            <!-- LEARNING: Dynamic line items from selected line item blocks -->
            <!-- WHY: Displays each selected line item block as a separate line item -->
            <!-- PATTERN: Loop through lineItems array, show amount or strikethrough + Free badge -->
            <template v-for="(lineItem, _index) in priceData.lineItems" :key="_index">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-1">{{ lineItem.label }}</span>
                <div v-if="lineItem.isFree" class="d-flex align-center">
                  <span class="text-body-2 text-decoration-line-through text-disabled mr-2">
                    ${{ lineItem.amount.toFixed(2) }}
                  </span>
                  <VChip
                    rounded
                    size="small"
                    color="success"
                    variant="tonal"
                  >
                    Free
                  </VChip>
                </div>
                <span v-else class="text-body-1 text-medium-emphasis">
                  ${{ lineItem.amount.toFixed(2) }}
                </span>
              </div>
            </template>
          </div>
        </VCardText>
        
        <VDivider />
        
        <!-- Final Total -->
        <VCardText class="final-total-section">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-1 font-weight-medium">
              Total
            </span>
            <span class="text-body-1 font-weight-medium">
              ${{ priceData.finalTotal.toFixed(2) }}
            </span>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped lang="scss">
:deep(.summary-table) {
  tbody {
    tr {
      td {
        border-bottom: none;
        vertical-align: top;
        padding: 6px 0; // Equivalent to theme.spacing(0.75)
        
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

.price-display {
  line-height: 1;
  font-size: 3.75rem !important;
}

.final-total-section {
  padding-top: 28px !important; // theme.spacing(3.5)
  padding-bottom: 28px !important; // theme.spacing(3.5)
}
</style>

