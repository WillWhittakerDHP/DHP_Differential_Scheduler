/**
 * Extracted UI logic for AvailabilityStep (audit-fix: reduce component script size and function count).
 * Domain rules: step summaries, badge state, sub-step labels.
 * Slot overlay (showSlotsOverlay, slotGridOverlayLabel, slotGridOverlayError) lives in useAvailabilityStepSlotOverlay.
 */
import { computed, type ComputedRef } from 'vue'
import { formatTimeRange } from '@/utils/time/timeFormatting'
import { derivePerspective } from '@/utils/booking/perspectiveResolver'
import type { AvailabilitySubStepOrchestratorState } from '@/types/booking/injectionContexts'
import type { UseAvailabilityConfirmationStateReturn } from '@/composables/booking/useAvailabilityConfirmationState'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'

interface UseAvailabilityStepUIParams {
  o: AvailabilitySubStepOrchestratorState
  confirmation: UseAvailabilityConfirmationStateReturn
}

export interface UseAvailabilityStepUIReturn {
  getStepSummary: (stepIndex: number) => string | null
  getStepBadgeState: (stepIndex: number) => 'empty' | 'prefilled' | 'confirmed'
  subStepLabels: ComputedRef<{ 0?: string; 1?: string; 2?: string; 3?: string; 4?: string }>
  handleDateChangeWithConfirm: (value: string | Date | string[] | Date[] | null) => void
  onOptionIdUpdate: (id: string | null) => void
  handleTimeBasisChangeWithConfirm: (type: 'major' | 'minor') => void
  handleSlotClickWithConfirm: (buttonIndex: number) => void
  handleMinimizerConfirmWithConfirm: () => void
}

export function useAvailabilityStepUI(
  params: UseAvailabilityStepUIParams
): UseAvailabilityStepUIReturn {
  const { o, confirmation } = params
  const { labels: wizardLabels } = useWizardSettings()

  const subStepLabels = computed(() => {
    const base = wizardLabels.subStepLabels.value
    const raw4 = base[4]
    const minimizerLabel =
      raw4?.replace(/\bminimizer\b/gi, o.minimizerPartShapeName.value) ??
      `Schedule ${o.minimizerPartShapeName.value}`
    return {
      ...base,
      4: minimizerLabel,
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
      const parts: string[] = []
      const id = o.selectedOptionTypeBlockId.value
      if (id) {
        const block = o.wizard.availableOptionTypeBlocks.value.find((b) => b.id === id)
        parts.push(block?.name ?? id)
      }
      if (o.hasMinimizerPartsGated.value) {
        const c = o.contingencyPeriod.value
        if (c.hasContingency === false) {
          parts.push('No deadline')
        } else if (c.hasContingency === true && c.endDate && c.endTime) {
          const ms = new Date(
            `${c.endDate}T${c.endTime.length === 5 ? `${c.endTime}:00` : c.endTime}`
          ).getTime()
          const formatted = Number.isNaN(ms)
            ? `${c.endDate} ${c.endTime}`
            : new Date(ms).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
          parts.push(`Deadline ${formatted}`)
        }
      }
      return parts.length > 0 ? parts.join(' · ') : null
    }
    if (stepIndex === 2) {
      if (!o.userHasChosenTimeBasisFromGraph?.value) return null
      const pers = o.perspective.value
      if (pers === 'major') return `${wizardLabels.majorLabel.value} times`
      if (pers === 'minor') return `${wizardLabels.minorLabel.value} times`
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
      const ms = o.stepData.value?.minimizerScheduling
      if (!ms) return null
      const partName = ms.partShapeName ?? o.minimizerPartShapeName.value ?? 'Work'
      const outer = ms.outerBoundary
      if (!outer) return `${partName} confirmed`
      const date = new Date(outer)
      const formatted = Number.isNaN(date.getTime())
        ? ''
        : date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
      return formatted ? `${partName} to be completed by ${formatted}` : `${partName} confirmed`
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
  }
  function handleTimeBasisChangeWithConfirm(type: 'major' | 'minor'): void {
    o.handleTimeBasisChange(type)
    confirmation.confirm(2)
  }
  function handleSlotClickWithConfirm(buttonIndex: number): void {
    o.handleAppointmentSlotClick(buttonIndex)
    confirmation.confirm(3)
  }
  function handleMinimizerConfirmWithConfirm(): void {
    o.handleMinimizerConfirm()
    confirmation.confirm(4)
  }

  return {
    getStepSummary,
    getStepBadgeState,
    subStepLabels,
    handleDateChangeWithConfirm,
    onOptionIdUpdate,
    handleTimeBasisChangeWithConfirm,
    handleSlotClickWithConfirm,
    handleMinimizerConfirmWithConfirm,
  }
}
