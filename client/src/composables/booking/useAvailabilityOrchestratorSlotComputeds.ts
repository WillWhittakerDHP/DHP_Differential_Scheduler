import { computed, type ComputedRef, type Ref } from 'vue'
import type { UseAvailabilityUIParams } from '@/types/booking/availabilityUI'
import type { TimeSlot } from '@/types/appointment'
import type { ContingencyPeriod } from '@/types/moveableScheduling'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import { parseContingencyDeadlineLocalWallToUtcMs } from '@/utils/booking/clampContingencyDeadlineToEarliest'
import { applyDeadlineConstraintToInspectionSlots } from '@/utils/booking/applyMoveableWindowToComputedSlots'

export interface AvailabilityOrchestratorSlotComputedsInput {
  selectedDate: UseAvailabilityUIParams['selectedDate']
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  hasMoveablePartsGated: ComputedRef<boolean>
  contingencyPeriod: Ref<ContingencyPeriod>
  moveableRoundedMinutes: ComputedRef<number>
  afterBufferMinutes: Ref<number>
}

export interface AvailabilityOrchestratorSlotComputeds {
  selectedDayKey: ComputedRef<string | null>
  serverSlotsForDay: ComputedRef<ComputedSlot[]>
  deadlineFilteredSlotsForDay: ComputedRef<ComputedSlot[]>
  timeSlotsFromServer: ComputedRef<TimeSlot[]>
}

export function createAvailabilityOrchestratorSlotComputeds(
  input: AvailabilityOrchestratorSlotComputedsInput
): AvailabilityOrchestratorSlotComputeds {
  const {
    selectedDate,
    slotsByDay,
    hasMoveablePartsGated,
    contingencyPeriod,
    moveableRoundedMinutes,
    afterBufferMinutes,
  } = input

  const selectedDayKey = computed(() => {
    const start = selectedDate.value?.start
    return start ? (start.includes('T') ? start.split('T')[0] : start) : null
  })

  const serverSlotsForDay = computed(() => {
    const day = selectedDayKey.value
    if (!day) return []
    const raw = slotsByDay.value.get(day)
    return raw !== undefined ? raw : []
  })

  const deadlineFilteredSlotsForDay = computed(() => {
    const raw = serverSlotsForDay.value
    if (!hasMoveablePartsGated.value) return raw
    const c = contingencyPeriod.value
    if (c.hasContingency !== true || !c.endDate || !c.endTime) return raw
    const deadlineMs = parseContingencyDeadlineLocalWallToUtcMs(c.endDate, c.endTime)
    return applyDeadlineConstraintToInspectionSlots(
      raw,
      deadlineMs,
      moveableRoundedMinutes.value,
      afterBufferMinutes.value,
      'markUnavailable'
    )
  })

  const timeSlotsFromServer = computed<TimeSlot[]>(() =>
    deadlineFilteredSlotsForDay.value.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      slotKind: 'major',
      isAvailable: s.isAvailable,
      flexibleViolations: s.violations,
    }))
  )

  return {
    selectedDayKey,
    serverSlotsForDay,
    deadlineFilteredSlotsForDay,
    timeSlotsFromServer,
  }
}
