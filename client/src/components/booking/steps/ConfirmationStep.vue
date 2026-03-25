<script setup lang="ts">
/**

PATTERN: Uses composable to aggregate wizard...
 */
import { inject, ref, computed } from 'vue'
import { wizardKey } from '@/keys/bookingInjectionKeys'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import { useConfirmationStepData } from '@/composables/booking/useConfirmationStepData'
import { useBooking } from '@/composables/useBooking'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import {
  propertyDetailsStepDataKey,
  availabilityStepDataKey,
  confirmationStepDataKey,
  confirmationStepValidKey,
  confirmationStepValidateKey,
} from '@/keys/bookingInjectionKeys'
import WizardSelect from '@/components/booking/fields/WizardSelect.vue'
import { ensureItemsArray } from '@/composables/admin/tables/useTableModelHelpers'
import type { ConfirmationStepData } from '@/types/wizard'

const wizard = inject(wizardKey)
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const propertyDetailsStepData = inject(propertyDetailsStepDataKey, null)
const availabilityStepData = inject(availabilityStepDataKey, null)
const { bookingData } = useBooking()

const stepData = ref<ConfirmationStepData>({})
const isFormValid = ref(true)
function validateForm(): boolean {
  return true
}
useWizardStepSync({
  stepData,
  isFormValid,
  validateForm,
  stepDataKey: confirmationStepDataKey,
  stepValidKey: confirmationStepValidKey,
  stepValidateKey: confirmationStepValidateKey,
})

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
  availabilityStepData,
  bookingData,
})

// Same pattern as property type on step 2: selection in wizard state
const selectedCouponBlockId = computed(() => wizard!.selectedCouponBlocks.value[0]?.id ?? null)
function onCouponSelect(id: string | null): void {
  if (!wizard) return
  if (id == null || id === '') {
    const blocks = wizard.selectedCouponBlocks.value
    if (blocks.length > 0) {
      wizard.toggleCouponBlock(blocks[0])
    }
    return
  }
  const list = wizard.availableCouponBlocks.value
  const block = list.find(b => b.id === id)
  if (block) wizard.toggleCouponBlock(block)
}

// WHY: Vue does not unwrap nested refs in templates. Passing wizard.availableCouponBlocks (a
// ComputedRef) to :items makes the child receive the Ref; Vuetify then iterates items and throws
// "items is not iterable". Pass an array (computed that unwraps + ensureItemsArray) instead.
const couponSelectItems = computed(() => ensureItemsArray(wizard?.availableCouponBlocks?.value))

// Show coupon row only when admin enables it and (coupons available or discount applied)
const {
  flags: { showApplyCoupon },
} = useWizardSettings()
const showCouponRow = computed(
  () =>
    showApplyCoupon.value &&
    ((couponSelectItems.value?.length ?? 0) > 0 ||
      (priceData.value?.couponDiscount ?? 0) > 0)
)
</script>

<template>
  <VRow>
    <!-- Left Column: Summary Table -->
    <VCol cols="12" md="6">
      <h4 class="text-headline-large mb-4">
        Almost done! 🚀
      </h4>
      
      <p class="text-body-large text-medium-emphasis mb-10">
        Confirm your deal details information and submit to create it.
      </p>
      
      <!-- WHY: Provides structured table layout for key-value pairs -->
      <!-- PATTERN: Table with tbody containing rows of label-value pairs -->
      <VTable class="summary-table">
        <tbody>
          <tr>
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                Service Type
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.serviceType }}
              </span>
            </td>
          </tr>
          
          <tr>
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                Property Type
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.propertyType }}
              </span>
            </td>
          </tr>
          
          <tr>
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                Address
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.address }}
              </span>
            </td>
          </tr>
          
          <tr>
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                Square Footage
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.squareFootage }}
              </span>
            </td>
          </tr>

          <tr v-if="summaryData.appointmentDate">
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                Appointment Date
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.appointmentDate }}
              </span>
            </td>
          </tr>

          <tr v-if="summaryData.appointmentTimes">
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                Appointment Time(s)
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.appointmentTimes }}
              </span>
            </td>
          </tr>

          <tr v-if="summaryData.minimizerCompletion">
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                {{ summaryData.minimizerPartShapeName || 'Minimizer Work' }} Completion
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.minimizerCompletion }}
              </span>
            </td>
          </tr>

          <tr v-if="summaryData.minimizerDeadline">
            <td>
              <span class="text-body-medium font-weight-medium text-medium-emphasis">
                {{ summaryData.minimizerPartShapeName || 'Minimizer Work' }} Deadline
              </span>
            </td>
            <td>
              <span class="text-body-medium text-medium-emphasis">
                {{ summaryData.minimizerDeadline }}
              </span>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCol>

    <!-- Right Column: Price Breakdown Card -->
    <VCol cols="12" md="6">
      <!-- WHY: Provides structured card layout with dividers between sections -->
      <!-- PATTERN: Card with VCardText sections separated by VDivider -->
      <VCard variant="outlined">
        <!-- Total Fee Display -->
        <VCardText class="bg-surface">
          <div class="d-flex flex-column pa-5">
            <h6 class="text-headline-small mb-4">
              Your total fee is:
            </h6>
            
            <!-- WHY: Prominently displays the final total fee (after all calculations including discounts and delivery) -->
            <!-- PATTERN: Flex layout with separate typography elements for currency, amount, and unit -->
            <div class="d-flex align-end justify-end">
              <h6 class="text-headline-small align-self-end">$&nbsp;</h6>
              <h1 class="text-display-large font-weight-bold price-display">
                {{ priceData.finalTotal.toFixed(2) }}
              </h1>
              <h6 class="text-headline-small">&nbsp;{{ priceData.currency }}</h6>
            </div>
          </div>
        </VCardText>
        
        <VDivider />
        
        <!-- Price Details -->
        <VCardText>
          <h6 class="text-headline-small mb-4">
            Price Details
          </h6>
          
          <div class="d-flex flex-column gap-2">
            <!-- WHY: Shows individual price components clearly -->
            <!-- PATTERN: Flex row with justify-space-between for label-value pairs -->
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-large">Bag Total</span>
              <span class="text-body-large text-medium-emphasis">
                ${{ priceData.bagTotal.toFixed(2) }}
              </span>
            </div>
            
            <div v-if="showCouponRow" class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-large">Coupon Discount</span>
              <div class="d-flex align-center flex-grow-1 justify-end">
                <span v-if="priceData.couponDiscount > 0" class="text-body-large text-medium-emphasis mr-2">
                  -${{ priceData.couponDiscount.toFixed(2) }}
                </span>
                <WizardSelect
                  v-else
                  :model-value="selectedCouponBlockId"
                  :items="couponSelectItems"
                  item-title="name"
                  item-value="id"
                  label="Apply Coupon"
                  placeholder="Select coupon"
                  class="coupon-select"
                  style="max-width: 220px;"
                  @update:model-value="onCouponSelect"
                />
              </div>
            </div>
            
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-large">Order Total</span>
              <span class="text-body-large text-medium-emphasis">
                ${{ priceData.orderTotal.toFixed(2) }}
              </span>
            </div>
            
            <!-- WHY: Displays each selected line item block as a separate line item -->
            <!-- PATTERN: Loop through lineItems array, show amount or strikethrough + Free badge -->
            <template v-for="(lineItem, _index) in priceData.lineItems" :key="_index">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-large">{{ lineItem.label }}</span>
                <div v-if="lineItem.isFree" class="d-flex align-center">
                  <span class="text-body-medium text-decoration-line-through text-disabled mr-2">
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
                <span v-else class="text-body-large text-medium-emphasis">
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
            <span class="text-body-large font-weight-medium">
              Total
            </span>
            <span class="text-body-large font-weight-medium">
              ${{ priceData.finalTotal.toFixed(2) }}
            </span>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped lang="scss">
.summary-link {
  text-decoration: none;
}

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
