/**
 * WHY: useConfirmationStepData Composable

WHY: Moves data aggregation and busi...
 */
import { computed, ref, watch } from 'vue'
import {
  buildConfirmationPriceData,
  buildConfirmationSummaryData,
  type ConfirmationDriveContext,
} from '@/utils/booking/confirmationStepData'
import type { PriceData, SummaryData } from '@/types/wizardStepData'
import type { UseConfirmationStepDataParams, UseConfirmationStepDataReturn } from '@/types/booking/confirmationStepData'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { resolveSystemDriveTimeBlockForFees } from '@/utils/booking/systemDriveTimeBlock'
import { getOrganizationDefaults } from '@/configs/organizationDefaults/api'
import { getCalendarSettings } from '@/configs/calendarSettings'
import { resolveBookingNumericPolicyFromLoadedData } from '@/utils/booking/resolveBookingNumericPolicyClient'
import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useConfirmationStepData')

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

  /** Merged drive-time fee (org + availability + calendar), same contract as computed availability / useAppointmentShape. */
  const resolvedDriveTimeFee = ref<DriveTimeFeeConfig | null>(null)

  watch(
    () => availabilitySettings.value,
    async (avail) => {
      if (avail === null || avail === undefined) {
        resolvedDriveTimeFee.value = null
        return
      }
      try {
        const [org, cal] = await Promise.all([getOrganizationDefaults(), getCalendarSettings()])
        const policy = resolveBookingNumericPolicyFromLoadedData(org, avail, cal)
        resolvedDriveTimeFee.value = policy.driveTimeFee
      } catch (error) {
        logger.error('Failed to resolve booking numeric policy for confirmation drive-time fee', error)
        resolvedDriveTimeFee.value = null
      }
    },
    { immediate: true },
  )

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
    const clampedDrive =
      rawDrive != null && Number.isFinite(rawDrive) ? Math.max(0, rawDrive) : null
    const driveContext: ConfirmationDriveContext | null =
      clampedDrive != null ? { totalDriveMinutes: clampedDrive } : null

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
      resolvedDriveTimeFee.value ?? availabilitySettings.value?.driveTimeFee ?? null,
      resolveSystemDriveTimeBlockForFees(bookingDataRef?.value ?? undefined)
    )
  })

  // PATTERN: Remove dev-mode debug watches - use proper logging if needed

  return {
    summaryData,
    priceData
  }
}
