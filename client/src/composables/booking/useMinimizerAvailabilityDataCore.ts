/**
 * WHY: Effect/watch bodies extracted from useMinimizerAvailabilityData (nesting/length audit).
 */

import type { ComputedRef, Ref } from 'vue'
import type { MinimizerSchedulingOptions } from '@/types/minimizerScheduling'
import { toRFC3339DateTime } from '@/utils/datetime'
import { fetchComputedAvailabilityData } from '@/services/calendarApiService'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import {
  computeOuterBoundary,
  extractInnerBoundary,
} from '@/utils/booking/minimizerSchedulingBounds'
import { earliestMinimizerUtcDayKey } from '@/utils/booking/applyMinimizerWindowToComputedSlots'
import { utcDateKeyFromSlotStartTime } from '@/utils/booking/utcSlotDateKey'
import type { UseMinimizerAvailabilityDataParams } from '@/composables/booking/useMinimizerAvailabilityDataTypes'

const logger = createLogger('useMinimizerAvailabilityDataCore')

type MinimizerFallbackLabelRef = ComputedRef<string>

function resetMinimizerOptionsAndSlots(
  minimizerOptions: Ref<MinimizerSchedulingOptions | null>,
  selectedMinimizerDay: Ref<string | null>,
  minimizerSlotsByDay: Ref<Map<string, ComputedSlot[]>>
): void {
  minimizerOptions.value = null
  selectedMinimizerDay.value = null
  minimizerSlotsByDay.value = new Map()
}

type OptionsEffectRefs = Pick<
  UseMinimizerAvailabilityDataParams,
  | 'hasMinimizerParts'
  | 'selectedSlot'
  | 'contingencyPeriod'
  | 'selectedSlotIndex'
  | 'minimizerDuration'
  | 'minimizerPartShapeName'
> & {
  minimizerOptions: Ref<MinimizerSchedulingOptions | null>
  isLoadingOptions: Ref<boolean>
  minimizerSlotsByDay: Ref<Map<string, ComputedSlot[]>>
  selectedMinimizerDay: Ref<string | null>
  afterBufferMinutes: Ref<number>
  fallbackLabel: Ref<string>
  minimizerFallbackLabel: MinimizerFallbackLabelRef
}

export async function runMinimizerOptionsWatchEffectBody(refs: OptionsEffectRefs): Promise<void> {
  if (!refs.hasMinimizerParts.value || !refs.selectedSlot.value) {
    resetMinimizerOptionsAndSlots(refs.minimizerOptions, refs.selectedMinimizerDay, refs.minimizerSlotsByDay)
    return
  }

  const slot = refs.selectedSlot.value
  const duration = refs.minimizerDuration.value
  const innerBoundary = extractInnerBoundary(slot)
  if (!innerBoundary) {
    resetMinimizerOptionsAndSlots(refs.minimizerOptions, refs.selectedMinimizerDay, refs.minimizerSlotsByDay)
    return
  }

  const outerBoundary = computeOuterBoundary(refs.contingencyPeriod.value, innerBoundary)

  try {
    refs.isLoadingOptions.value = true

    const settings = await getAvailabilitySettings()
    const bufferMinutes = settings.buffers?.appointment?.minutes ?? 0
    const placement = settings.buffers?.appointment?.placement ?? 'off'
    refs.afterBufferMinutes.value = placement === 'after' || placement === 'both' ? bufferMinutes : 0
    refs.fallbackLabel.value = refs.minimizerFallbackLabel.value
    refs.minimizerOptions.value = {
      innerBoundary,
      outerBoundary,
      minimizerDuration: duration,
      partShapeName: refs.minimizerPartShapeName.value,
      availableSlots: [],
      earliestCompletion: innerBoundary,
      selectedSlotIndex: refs.selectedSlotIndex.value,
    }
  } catch (err) {
    logger.error('Minimizer options computation failed', err)
    resetMinimizerOptionsAndSlots(refs.minimizerOptions, refs.selectedMinimizerDay, refs.minimizerSlotsByDay)
  } finally {
    refs.isLoadingOptions.value = false
  }
}

type DaySlotsWatchRefs = {
  hasClosingDate: ComputedRef<boolean>
  minimizerOptions: Ref<MinimizerSchedulingOptions | null>
  minimizerDuration: Ref<number>
  placeId: Ref<string | null | undefined>
  afterBufferMinutes: Ref<number>
  minimizerSlotsByDay: Ref<Map<string, ComputedSlot[]>>
  selectedMinimizerDay: Ref<string | null>
  isLoadingMinimizerDaySlots: Ref<boolean>
}

export async function runMinimizerDaySlotsWatchBody(refs: DaySlotsWatchRefs): Promise<void> {
  if (!refs.hasClosingDate.value || !refs.minimizerOptions.value) {
    refs.minimizerSlotsByDay.value = new Map()
    return
  }

  const opts = refs.minimizerOptions.value
  const duration = refs.minimizerDuration.value
  if (duration <= 0) {
    refs.minimizerSlotsByDay.value = new Map()
    return
  }

  const innerDay =
    earliestMinimizerUtcDayKey(opts.innerBoundary, refs.afterBufferMinutes.value) ??
    opts.innerBoundary.slice(0, 10)
  let outerDay = utcDateKeyFromSlotStartTime(opts.outerBoundary)
  if (outerDay < innerDay) {
    outerDay = innerDay
  }

  const start = toRFC3339DateTime(new Date(`${innerDay}T00:00:00.000Z`))
  const end = toRFC3339DateTime(new Date(`${outerDay}T23:59:59.999Z`))
  const pid = refs.placeId.value

  refs.isLoadingMinimizerDaySlots.value = true
  try {
    const data = await fetchComputedAvailabilityData({
      dateRange: { start, end },
      candidatePlaceId: pid ?? undefined,
      duration,
      dataSource: 'real',
    })
    const next = buildSlotsByDayMap(data.slotsByDay)
    refs.minimizerSlotsByDay.value = next
    applyDefaultSelectedMinimizerDay(refs.selectedMinimizerDay, next, innerDay)
  } catch (err) {
    logger.error('Minimizer range fetch failed', err)
    refs.minimizerSlotsByDay.value = new Map()
  } finally {
    refs.isLoadingMinimizerDaySlots.value = false
  }
}

function buildSlotsByDayMap(slotsByDay: Record<string, unknown>): Map<string, ComputedSlot[]> {
  const next = new Map<string, ComputedSlot[]>()
  for (const [dayKey, slots] of Object.entries(slotsByDay)) {
    if (Array.isArray(slots)) {
      next.set(dayKey, slots)
    }
  }
  return next
}

function applyDefaultSelectedMinimizerDay(
  selectedMinimizerDay: Ref<string | null>,
  next: Map<string, ComputedSlot[]>,
  innerDay: string
): void {
  const sortedKeys = [...next.keys()].sort()
  if (selectedMinimizerDay.value === null || !next.has(selectedMinimizerDay.value)) {
    selectedMinimizerDay.value = sortedKeys[0] ?? innerDay
  }
}
