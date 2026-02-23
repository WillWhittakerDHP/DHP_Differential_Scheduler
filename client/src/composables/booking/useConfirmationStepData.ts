/**
 * WHY: useConfirmationStepData Composable

WHY: Moves data aggregation and busi...
 */
import { computed, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { buildConfirmationPriceData, buildConfirmationSummaryData } from '@/utils/booking/confirmationStepData'
import type { AvailabilityStepData, PriceData, SummaryData } from '@/types/wizardStepData'

export type { SummaryData, PriceData } from '@/types/wizardStepData'
import type { PropertyDetailsStepData } from '@/types/wizard'

/**
 * Step data interfaces (matching BookingWizard.vue)
 * FIX: Use shared types from wizardStepData.ts and wizard.ts
 */

export interface UseConfirmationStepDataParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
    selectedLineItemBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  }
  propertyDetailsStepData?: Ref<PropertyDetailsStepData> | null
  availabilityStepData?: Ref<AvailabilityStepData> | null
}

export interface UseConfirmationStepDataReturn {
  summaryData: ComputedRef<SummaryData>
  priceData: ComputedRef<PriceData>
}

/**
 * WHY: useConfirmationStepData composable

LEARNING: Aggregates wizard state an...
 */
export function useConfirmationStepData(
  params: UseConfirmationStepDataParams
): UseConfirmationStepDataReturn {
  const {
    wizard,
    propertyDetailsStepData,
  } = params

  /**
   * LEARNING: Aggregate summary data from wizard state and step data
   */
  const summaryData = computed<SummaryData>(() => {
    return buildConfirmationSummaryData(
      {
        selectedServices: wizard.selectedServiceTypeBlocks.value,
        selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
        selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
        selectedLineItemBlocks: wizard.selectedLineItemBlocks.value,
      },
      propertyDetailsStepData?.value ?? null
    )
  })

  /**
   * WHY: /**


FIX: Explicitly access value to ensure reactivity tracking
WHY: Op...
   */
  const priceData = computed<PriceData>(() => {
    const stepDataValue = propertyDetailsStepData?.value
    const aduCount = stepDataValue?.additionalUnits ?? null
    
    // WHY: Overage fees depend on square footage, use propertySize as fallback if squareFootage not available
    // PATTERN: Use squareFootage if available, otherwise fallback to propertySize, otherwise null
    const squareFootage = stepDataValue?.squareFootage ?? stepDataValue?.propertySize ?? null
    
    return buildConfirmationPriceData({
      selectedServices: wizard.selectedServiceTypeBlocks.value,
      selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
      selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
      selectedLineItemBlocks: wizard.selectedLineItemBlocks.value,
    }, squareFootage, aduCount)
  })

  // PATTERN: Remove dev-mode debug watches - use proper logging if needed

  return {
    summaryData,
    priceData
  }
}

