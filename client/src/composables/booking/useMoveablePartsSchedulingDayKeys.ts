/**
 * Day-key selection and predicates for the moveable scheduling modal (extracted to keep
 * useMoveablePartsScheduling under composables-logic complexity thresholds).
 */
import { computed, watch, type ComputedRef, type Ref } from 'vue'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import type { MoveableSchedulingWindow } from '@/types/booking/moveableSchedulingWindow'
import { applyMoveableWindowToComputedSlots } from '@/utils/booking/applyMoveableWindowToComputedSlots'

export interface UseMoveablePartsSchedulingDayKeysParams {
  moveableSlotsByDay: Ref<Map<string, ComputedSlot[]>>
  moveableSchedulingWindow: ComputedRef<MoveableSchedulingWindow | null>
  selectedMoveableDay: Ref<string | null>
  setSelectedMoveableDay: (date: string | null) => void
}

export interface UseMoveablePartsSchedulingDayKeysReturn {
  availableMoveableDayKeys: ComputedRef<string[]>
  allowedMoveableDates: ComputedRef<(date: unknown) => boolean>
  moveableFirstDayKey: ComputedRef<string | null>
  moveableLastDayKey: ComputedRef<string | null>
}

export function useMoveablePartsSchedulingDayKeys(
  params: UseMoveablePartsSchedulingDayKeysParams
): UseMoveablePartsSchedulingDayKeysReturn {
  const { moveableSlotsByDay, moveableSchedulingWindow, selectedMoveableDay, setSelectedMoveableDay } = params

  const availableMoveableDayKeys = computed<string[]>(() => {
    const map = moveableSlotsByDay.value
    const schedulingWindow = moveableSchedulingWindow.value
    return [...map.keys()]
      .filter((key) => {
        const raw = map.get(key) ?? []
        return applyMoveableWindowToComputedSlots(raw, schedulingWindow, 'exclude').length > 0
      })
      .sort()
  })

  const allowedMoveableDates = computed(() => {
    const keys = new Set(availableMoveableDayKeys.value)
    return (date: unknown): boolean => typeof date === 'string' && keys.has(date)
  })

  const moveableFirstDayKey = computed(() => availableMoveableDayKeys.value[0] ?? null)

  const moveableLastDayKey = computed(() => {
    const keys = availableMoveableDayKeys.value
    return keys.length > 0 ? keys[keys.length - 1] ?? null : null
  })

  watch(
    [availableMoveableDayKeys, selectedMoveableDay],
    ([keys, day]) => {
      if (keys.length === 0) return
      if (day === null || !keys.includes(day)) {
        setSelectedMoveableDay(keys[0] ?? null)
      }
    }
  )

  return {
    availableMoveableDayKeys,
    allowedMoveableDates,
    moveableFirstDayKey,
    moveableLastDayKey,
  }
}
