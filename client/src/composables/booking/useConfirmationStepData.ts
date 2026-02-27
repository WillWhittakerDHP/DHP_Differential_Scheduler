/**
 * WHY: useConfirmationStepData Composable

WHY: Moves data aggregation and busi...
 */
import { computed } from 'vue'
import { buildConfirmationPriceData, buildConfirmationSummaryData } from '@/utils/booking/confirmationStepData'
import type { PriceData, SummaryData } from '@/types/wizardStepData'
import type { UseConfirmationStepDataParams, UseConfirmationStepDataReturn } from '@/types/booking/confirmationStepData'



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
    availabilityStepData,
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
      propertyDetailsStepData?.value ?? null,
      availabilityStepData?.value ?? null
    )
  })

  /**


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

