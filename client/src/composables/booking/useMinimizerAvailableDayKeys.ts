/**
 * WHY: Split from useMinimizerPartsScheduling so composables-logic score stays under session tier thresholds.
 */
import type { ComputedRef, Ref } from 'vue'
import { computed, watch } from 'vue'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import { applyMinimizerWindowToComputedSlots } from '@/utils/booking/applyMinimizerWindowToComputedSlots'
import type { MinimizerSchedulingWindow } from '@/types/booking/minimizerSchedulingWindow'

export interface UseMinimizerAvailableDayKeysParams {
  minimizerSlotsByDay: Ref<Map<string, ComputedSlot[]>>
  minimizerSchedulingWindow: ComputedRef<MinimizerSchedulingWindow | null>
  selectedMinimizerDay: Ref<string | null>
  setSelectedMinimizerDay: (date: string | null) => void
}

export interface UseMinimizerAvailableDayKeysReturn {
  availableMinimizerDayKeys: ComputedRef<string[]>
  allowedMinimizerDates: ComputedRef<(date: unknown) => boolean>
  minimizerFirstDayKey: ComputedRef<string | null>
  minimizerLastDayKey: ComputedRef<string | null>
}

export function useMinimizerAvailableDayKeys(
  params: UseMinimizerAvailableDayKeysParams
): UseMinimizerAvailableDayKeysReturn {
  const { minimizerSlotsByDay, minimizerSchedulingWindow, selectedMinimizerDay, setSelectedMinimizerDay } = params

  const availableMinimizerDayKeys = computed<string[]>(() => {
    const map = minimizerSlotsByDay.value
    const schedulingRange = minimizerSchedulingWindow.value
    return [...map.keys()]
      .filter((key) => {
        const raw = map.get(key) ?? []
        return applyMinimizerWindowToComputedSlots(raw, schedulingRange, 'exclude').length > 0
      })
      .sort()
  })

  const allowedMinimizerDates = computed(() => {
    const keys = new Set(availableMinimizerDayKeys.value)
    return (date: unknown): boolean => typeof date === 'string' && keys.has(date)
  })

  const minimizerFirstDayKey = computed(() => availableMinimizerDayKeys.value[0] ?? null)

  const minimizerLastDayKey = computed(() => {
    const keys = availableMinimizerDayKeys.value
    return keys.length > 0 ? keys[keys.length - 1] ?? null : null
  })

  watch(
    [availableMinimizerDayKeys, selectedMinimizerDay],
    ([keys, day]) => {
      if (keys.length === 0) return
      if (day === null || !keys.includes(day)) {
        setSelectedMinimizerDay(keys[0] ?? null)
      }
    }
  )

  return {
    availableMinimizerDayKeys,
    allowedMinimizerDates,
    minimizerFirstDayKey,
    minimizerLastDayKey,
  }
}
