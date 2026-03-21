/**
 * WHY: useConfirmationStepData Composable

WHY: Moves data aggregation and busi...
 */
import { computed } from 'vue'
import {
  buildConfirmationPriceData,
  buildConfirmationSummaryData,
  type ConfirmationDriveContext,
} from '@/utils/booking/confirmationStepData'
import type { PriceData, SummaryData } from '@/types/wizardStepData'
import type { UseConfirmationStepDataParams, UseConfirmationStepDataReturn } from '@/types/booking/confirmationStepData'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { resolveSystemDriveTimeBlockForFees } from '@/utils/booking/systemDriveTimeBlock'

/**
 * WHY: useConfirmationStepData composable

 */
export function useConfirmationStepData(
  params: UseConfirmationStepDataParams
): UseConfirmationStepDataReturn {
  const {
    wizard,
    propertyDetailsStepData,
    availabilityStepData,
    bookingData: bookingDataRef,
  } = params

  const { settings: availabilitySettings } = useAvailabilitySettings()

  /**
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

    const availability = availabilityStepData?.value
    const rawDrive = availability?.totalDriveMinutes
    const driveContext: ConfirmationDriveContext | null =
      rawDrive != null && Number.isFinite(rawDrive)
        ? { totalDriveMinutes: Math.max(0, rawDrive) }
        : null

    return buildConfirmationPriceData(
      {
        selectedServices: wizard.selectedServiceTypeBlocks.value,
        selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
        selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
        selectedLineItemBlocks: wizard.selectedLineItemBlocks.value,
      },
      squareFootage,
      aduCount,
      driveContext,
      availabilitySettings.value?.driveTimeFee ?? null,
      resolveSystemDriveTimeBlockForFees(bookingDataRef?.value ?? undefined)
    )
  })

  // PATTERN: Remove dev-mode debug watches - use proper logging if needed

  return {
    summaryData,
    priceData
  }
}
