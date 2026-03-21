/**
 * Fee preview (price details popover) for AvailabilityStep.
 * Extracted to reduce component script size per vue-architecture audit; domain logic lives here.
 */
import { computed, type ComputedRef } from 'vue'
import type { Ref } from 'vue'
import { buildConfirmationPriceData } from '@/utils/booking/confirmationStepData'
import type { PriceData } from '@/types/wizardStepData'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { PropertyDetailsStepData } from '@/types/wizard'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'

export interface UseAvailabilityStepFeePreviewParams {
  wizard: UseBookingWizardReturn
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null> | null
}

export interface UseAvailabilityStepFeePreviewReturn {
  availabilityStepPriceData: ComputedRef<PriceData>
  showFeeBar: ComputedRef<boolean>
  feePreviewLabel: ComputedRef<string>
  showApplyCoupon: ComputedRef<boolean>
}

export function useAvailabilityStepFeePreview(
  params: UseAvailabilityStepFeePreviewParams
): UseAvailabilityStepFeePreviewReturn {
  const { wizard, propertyDetailsStepData } = params
  const {
    flags: { showApplyCoupon },
  } = useWizardSettings()

  const availabilityStepPriceData = computed<PriceData>(() => {
    const stepDataValue = propertyDetailsStepData?.value
    const aduCount = stepDataValue?.additionalUnits ?? null
    const squareFootage =
      stepDataValue?.squareFootage ?? stepDataValue?.propertySize ?? null
    return buildConfirmationPriceData(
      {
        selectedServices: wizard.selectedServiceTypeBlocks.value,
        selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
        selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
        selectedLineItemBlocks: wizard.selectedLineItemBlocks.value,
      },
      squareFootage ?? null,
      aduCount
    )
  })

  const showFeeBar = computed(
    () =>
      (wizard.selectedServiceTypeBlocks.value?.length ?? 0) > 0 &&
      (availabilityStepPriceData.value?.finalTotal ?? 0) >= 0
  )

  const feePreviewLabel = computed(() => {
    const p = availabilityStepPriceData.value
    if (!p) return 'Fee preview: $0.00'
    const prefix = p.currency === 'USD' ? '$' : `${p.currency} `
    return `Fee preview: ${prefix}${p.finalTotal.toFixed(2)}`
  })

  return {
    availabilityStepPriceData,
    showFeeBar,
    feePreviewLabel,
    showApplyCoupon,
  }
}
