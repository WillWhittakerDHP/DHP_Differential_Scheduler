/**
 * Progressive summary strip for main wizard steps 2–4 (Property → Contacts).
 * Step gating: service-only on Property; +address+price on Availability; +slot on Contacts; hidden on Summary.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { SummaryData, PriceData } from '@/types/wizardStepData'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

const NO_ADDRESS_PLACEHOLDER = 'No address provided'

export interface UseBookingProgressSummaryStripParams {
  activeStep: Ref<number>
  summaryData: ComputedRef<SummaryData>
  priceData: ComputedRef<PriceData>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
}

export interface UseBookingProgressSummaryStripReturn {
  /** Step gating flags for the strip and rows */
  visibility: {
    stripVisible: ComputedRef<boolean>
    showAddress: ComputedRef<boolean>
    showPrice: ComputedRef<boolean>
    showSlot: ComputedRef<boolean>
    showFeeDetails: ComputedRef<boolean>
  }
  /** Text/lines passed to the strip UI */
  display: {
    serviceLine: ComputedRef<string>
    addressLine: ComputedRef<string>
    feePreviewLabel: ComputedRef<string>
    slotLines: ComputedRef<string[]>
    priceData: ComputedRef<PriceData>
  }
}

export function useBookingProgressSummaryStrip(
  params: UseBookingProgressSummaryStripParams
): UseBookingProgressSummaryStripReturn {
  const { activeStep, summaryData, priceData, selectedServiceTypeBlocks } = params

  const hasSelectedService = computed(
    () => (selectedServiceTypeBlocks.value?.length ?? 0) > 0
  )

  const stripVisible = computed(
    () =>
      hasSelectedService.value && activeStep.value >= 1 && activeStep.value <= 3
  )

  const showAddress = computed(() => activeStep.value >= 2)
  const showPrice = computed(() => activeStep.value >= 2)
  const showSlot = computed(() => activeStep.value >= 3)

  const showFeeDetails = computed(
    () =>
      showPrice.value &&
      hasSelectedService.value &&
      (priceData.value?.finalTotal ?? 0) >= 0
  )

  const serviceLine = computed(() => summaryData.value.serviceType)

  const addressLine = computed(() => {
    const a = summaryData.value.address?.trim() ?? ''
    if (a === '' || a === NO_ADDRESS_PLACEHOLDER) return ''
    return a
  })

  const feePreviewLabel = computed(() => {
    const p = priceData.value
    const prefix = p.currency === 'USD' ? '$' : `${p.currency} `
    return `Fee preview: ${prefix}${p.finalTotal.toFixed(2)}`
  })

  const slotLines = computed(() => {
    const s = summaryData.value
    const lines: string[] = []
    if (s.appointmentDate != null && s.appointmentDate !== '' && s.appointmentTimes != null && s.appointmentTimes !== '') {
      lines.push(`${s.appointmentDate} · ${s.appointmentTimes}`)
    } else if (s.appointmentDate != null && s.appointmentDate !== '') {
      lines.push(s.appointmentDate)
    } else if (s.appointmentTimes != null && s.appointmentTimes !== '') {
      lines.push(s.appointmentTimes)
    }
    if (s.minimizerCompletion != null && s.minimizerCompletion !== '') {
      lines.push(`Completion: ${s.minimizerCompletion}`)
    }
    if (s.minimizerDeadline != null && s.minimizerDeadline !== '') {
      lines.push(`Deadline: ${s.minimizerDeadline}`)
    }
    return lines
  })

  return {
    visibility: {
      stripVisible,
      showAddress,
      showPrice,
      showSlot,
      showFeeDetails,
    },
    display: {
      serviceLine,
      addressLine,
      feePreviewLabel,
      slotLines,
      priceData,
    },
  }
}
