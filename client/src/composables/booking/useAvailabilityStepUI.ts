/**
 * Extracted UI logic for AvailabilityStep (audit-fix: reduce component script size and function count).
 * Domain rules: step summaries, badge state, slot overlay, sub-step labels, column layout.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import { formatTimeRange } from '@/utils/time/timeFormatting'
import { derivePerspective } from '@/utils/booking/perspectiveResolver'
import type { AvailabilitySubStepOrchestratorState } from '@/composables/booking/injectionKeys'
import type { UseAvailabilityConfirmationStateReturn } from '@/composables/booking/useAvailabilityConfirmationState'
import type { AvailabilitySettings } from '@/configs/availabilitySettings/types'

export interface UseAvailabilityStepUIParams {
  o: AvailabilitySubStepOrchestratorState
  availabilitySettings: Ref<AvailabilitySettings | null>
  confirmation: UseAvailabilityConfirmationStateReturn
}

export interface UseAvailabilityStepUIReturn {
  getStepSummary: (stepIndex: number) => string | null
  getStepBadgeState: (stepIndex: number) => 'empty' | 'prefilled' | 'confirmed'
  slotGridOverlayLabel: ComputedRef<string | null>
  slotGridOverlayError: ComputedRef<string | null>
  showSlotsOverlay: ComputedRef<boolean>
  subStepLabels: ComputedRef<{ 0?: string; 1?: string; 2?: string; 3?: string; 4?: string }>
  handleDateChangeWithConfirm: (value: string | Date | string[] | Date[] | null) => void
  onOptionIdUpdate: (id: string | null) => void
  handleTimeBasisChangeWithConfirm: (type: 'major' | 'minor') => void
  handleSlotClickWithConfirm: (buttonIndex: number) => void
  handleMoveableConfirmWithConfirm: () => void
}

export function useAvailabilityStepUI(
  params: UseAvailabilityStepUIParams
): UseAvailabilityStepUIReturn {
  const { o, availabilitySettings, confirmation } = params

  const hasSelectedSlot = computed(
    () => o.graphBars.value?.major != null || o.graphBars.value?.minor != null
  )
  const slotGridOverlayLabel = computed(() => {
    const raw = availabilitySettings.value?.differentialPerspectives?.differentialGraphDefaultLabel
    return typeof raw === 'string' ? raw.trim() : null
  })
  const showSlotsOverlay = computed(
    () =>
      o.isEffectivelyDifferential.value &&
      !hasSelectedSlot.value &&
      !o.userHasChosenTimeBasisFromGraph?.value
  )
  const slotGridOverlayError = computed(() => {
    if (!showSlotsOverlay.value) return null
    if (slotGridOverlayLabel.value) return null
    return 'Differential Graph Default Label is not configured. Set it in Admin → Business Controls → Calendar → Grid.'
  })

  const subStepLabels = computed(() => {
    const dp = availabilitySettings.value?.differentialPerspectives
    const graphLabel = typeof dp?.differentialGraphDefaultLabel === 'string'
      ? dp.differentialGraphDefaultLabel.trim()
      : null
    return {
      0: dp?.subStepLabelPickDay?.trim() || undefined,
      1: dp?.subStepLabelOptions?.trim() || undefined,
      2: graphLabel || undefined,
      3: dp?.subStepLabelPickTime?.trim() || undefined,
      4: dp?.subStepLabelConfirmMoveable?.trim() || undefined,
    }
  })

  function getStepSummary(stepIndex: number): string | null {
    if (stepIndex === 0) {
      const start = o.selectedDate.value?.start
      if (!start) return null
      const date = new Date(start.includes('T') ? start : `${start}T00:00:00`)
      if (Number.isNaN(date.getTime())) return null
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
    if (stepIndex === 1) {
      const id = o.selectedOptionTypeBlockId.value
      if (!id) return null
      const block = o.wizard.availableOptionTypeBlocks.value.find((b) => b.id === id)
      return block?.name ?? id
    }
    if (stepIndex === 2) {
      if (!o.userHasChosenTimeBasisFromGraph?.value) return null
      const pers = o.perspective.value
      const majorLabel = availabilitySettings.value?.differentialPerspectives?.majorLabel ?? 'Major'
      const minorLabel = availabilitySettings.value?.differentialPerspectives?.minorLabel ?? 'Minor'
      if (pers === 'major') return `${majorLabel} times`
      if (pers === 'minor') return `${minorLabel} times`
      return null
    }
    if (stepIndex === 3) {
      const idx = o.selectedButtonIndex.value
      if (idx == null) return null
      const slots = o.appointmentSlots.value
      const slot = slots.find((s) => s.buttonIndex === idx)
      if (!slot) return null
      const range = derivePerspective(slot, o.perspective.value)
      return range ? formatTimeRange(range) : null
    }
    if (stepIndex === 4) {
      return o.stepData.value?.moveableScheduling ? 'Confirmed' : null
    }
    return null
  }

  function getStepBadgeState(stepIndex: number): 'empty' | 'prefilled' | 'confirmed' {
    const hasValue = getStepSummary(stepIndex) != null
    const isConfirmed = confirmation.isConfirmed(stepIndex)
    if (!hasValue) return 'empty'
    if (isConfirmed) return 'confirmed'
    return 'prefilled'
  }

  function handleDateChangeWithConfirm(value: string | Date | string[] | Date[] | null): void {
    o.handleDateChange(value)
    confirmation.confirm(0)
  }
  function onOptionIdUpdate(id: string | null): void {
    o.selectedOptionTypeBlockId.value = id
    confirmation.confirm(1)
  }
  function handleTimeBasisChangeWithConfirm(type: 'major' | 'minor'): void {
    o.handleTimeBasisChange(type)
    confirmation.confirm(2)
  }
  function handleSlotClickWithConfirm(buttonIndex: number): void {
    o.handleAppointmentSlotClick(buttonIndex)
    confirmation.confirm(3)
  }
  function handleMoveableConfirmWithConfirm(): void {
    o.handleMoveableConfirm()
    confirmation.confirm(4)
  }

  return {
    getStepSummary,
    getStepBadgeState,
    slotGridOverlayLabel,
    slotGridOverlayError,
    showSlotsOverlay,
    subStepLabels,
    handleDateChangeWithConfirm,
    onOptionIdUpdate,
    handleTimeBasisChangeWithConfirm,
    handleSlotClickWithConfirm,
    handleMoveableConfirmWithConfirm,
  }
}
