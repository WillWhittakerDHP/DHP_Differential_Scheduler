import { computed, type ComputedRef, type Ref } from 'vue'
import type { AppointmentSlots } from '@/types/appointment'
import type { UseAvailabilityUIParams } from '@/types/booking/availabilityUI'
import type { WizardMode } from '@/types/wizardCore'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { findMatchingTimeSlot } from '@/utils/booking/timeSlotMatching'

export function createOriginalInspectionButtonIndexComputed(input: {
  wizardMode: Ref<WizardMode>
  loadedWizardState: Ref<WizardStateData | null>
  selectedDate: UseAvailabilityUIParams['selectedDate']
  appointmentSlots: ComputedRef<AppointmentSlots>
}): ComputedRef<number | null> {
  const { wizardMode, loadedWizardState, selectedDate, appointmentSlots } = input

  return computed((): number | null => {
    if (wizardMode.value !== 'reschedule') return null
    const loaded = loadedWizardState.value?.availability
    const candidateDate = loaded?.candidateDate?.start
    const candidateSlots = loaded?.candidateTimeSlots
    if (!candidateDate || !candidateSlots?.length) return null
    const selectedStart = selectedDate.value?.start
    if (!selectedStart) return null
    const selectedDay = selectedStart.includes('T') ? selectedStart.split('T')[0] : selectedStart
    const candidateDay = candidateDate.includes('T') ? candidateDate.split('T')[0] : candidateDate
    if (selectedDay !== candidateDay) return null
    const inspectorTime = candidateSlots[0].time
    const slots = appointmentSlots.value
    const matched = findMatchingTimeSlot(inspectorTime, slots)
    return matched?.buttonIndex ?? null
  })
}
