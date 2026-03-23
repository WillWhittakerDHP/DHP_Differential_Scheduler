/**
 * WHY: Effect/watch bodies extracted from useMoveableAvailabilityData (nesting/length audit).
 */

import type { ComputedRef, Ref } from 'vue'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import { toRFC3339DateTime } from '@/utils/datetime'
import { fetchComputedAvailabilityData } from '@/services/calendarApiService'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import {
  computeOuterBoundary,
  extractInnerBoundary,
} from '@/utils/booking/moveableSchedulingBounds'
import { earliestMoveableUtcDayKey } from '@/utils/booking/applyMoveableWindowToComputedSlots'
import { utcDateKeyFromSlotStartTime } from '@/utils/booking/utcSlotDateKey'
import type { UseMoveableAvailabilityDataParams } from '@/composables/booking/useMoveableAvailabilityDataTypes'

const logger = createLogger('useMoveableAvailabilityDataCore')

type MoveableFallbackLabelRef = ComputedRef<string>

export function resetMoveableOptionsAndSlots(
  moveableOptions: Ref<MoveableSchedulingOptions | null>,
  selectedMoveableDay: Ref<string | null>,
  moveableSlotsByDay: Ref<Map<string, ComputedSlot[]>>
): void {
  moveableOptions.value = null
  selectedMoveableDay.value = null
  moveableSlotsByDay.value = new Map()
}

type OptionsEffectRefs = Pick<
  UseMoveableAvailabilityDataParams,
  | 'hasMoveableParts'
  | 'selectedSlot'
  | 'contingencyPeriod'
  | 'selectedSlotIndex'
  | 'moveableDuration'
  | 'moveablePartShapeName'
> & {
  moveableOptions: Ref<MoveableSchedulingOptions | null>
  isLoadingOptions: Ref<boolean>
  moveableSlotsByDay: Ref<Map<string, ComputedSlot[]>>
  selectedMoveableDay: Ref<string | null>
  afterBufferMinutes: Ref<number>
  fallbackLabel: Ref<string>
  moveableFallbackLabel: MoveableFallbackLabelRef
}

export async function runMoveableOptionsWatchEffectBody(refs: OptionsEffectRefs): Promise<void> {
  if (!refs.hasMoveableParts.value || !refs.selectedSlot.value) {
    resetMoveableOptionsAndSlots(refs.moveableOptions, refs.selectedMoveableDay, refs.moveableSlotsByDay)
    return
  }

  const slot = refs.selectedSlot.value
  const duration = refs.moveableDuration.value
  const innerBoundary = extractInnerBoundary(slot)
  if (!innerBoundary) {
    resetMoveableOptionsAndSlots(refs.moveableOptions, refs.selectedMoveableDay, refs.moveableSlotsByDay)
    return
  }

  const outerBoundary = computeOuterBoundary(refs.contingencyPeriod.value, innerBoundary)

  try {
    refs.isLoadingOptions.value = true

    const settings = await getAvailabilitySettings()
    const bufferMinutes = settings.buffers?.appointment?.minutes ?? 0
    const placement = settings.buffers?.appointment?.placement ?? 'off'
    refs.afterBufferMinutes.value = placement === 'after' || placement === 'both' ? bufferMinutes : 0
    refs.fallbackLabel.value = refs.moveableFallbackLabel.value
    refs.moveableOptions.value = {
      innerBoundary,
      outerBoundary,
      moveableDuration: duration,
      partShapeName: refs.moveablePartShapeName.value,
      availableSlots: [],
      earliestCompletion: innerBoundary,
      selectedSlotIndex: refs.selectedSlotIndex.value,
    }
  } catch (err) {
    logger.error('Moveable options computation failed', err)
    resetMoveableOptionsAndSlots(refs.moveableOptions, refs.selectedMoveableDay, refs.moveableSlotsByDay)
  } finally {
    refs.isLoadingOptions.value = false
  }
}

type DaySlotsWatchRefs = {
  hasClosingDate: ComputedRef<boolean>
  moveableOptions: Ref<MoveableSchedulingOptions | null>
  moveableDuration: Ref<number>
  placeId: Ref<string | null | undefined>
  afterBufferMinutes: Ref<number>
  moveableSlotsByDay: Ref<Map<string, ComputedSlot[]>>
  selectedMoveableDay: Ref<string | null>
  isLoadingMoveableDaySlots: Ref<boolean>
}

export async function runMoveableDaySlotsWatchBody(refs: DaySlotsWatchRefs): Promise<void> {
  if (!refs.hasClosingDate.value || !refs.moveableOptions.value) {
    refs.moveableSlotsByDay.value = new Map()
    return
  }

  const opts = refs.moveableOptions.value
  const duration = refs.moveableDuration.value
  if (duration <= 0) {
    refs.moveableSlotsByDay.value = new Map()
    return
  }

  const innerDay =
    earliestMoveableUtcDayKey(opts.innerBoundary, refs.afterBufferMinutes.value) ??
    opts.innerBoundary.slice(0, 10)
  let outerDay = utcDateKeyFromSlotStartTime(opts.outerBoundary)
  if (outerDay < innerDay) {
    outerDay = innerDay
  }

  const start = toRFC3339DateTime(new Date(`${innerDay}T00:00:00.000Z`))
  const end = toRFC3339DateTime(new Date(`${outerDay}T23:59:59.999Z`))
  const pid = refs.placeId.value

  refs.isLoadingMoveableDaySlots.value = true
  try {
    const data = await fetchComputedAvailabilityData({
      dateRange: { start, end },
      candidatePlaceId: pid ?? undefined,
      duration,
      dataSource: 'real',
    })
    const next = buildSlotsByDayMap(data.slotsByDay)
    refs.moveableSlotsByDay.value = next
    applyDefaultSelectedMoveableDay(refs.selectedMoveableDay, next, innerDay)
  } catch (err) {
    logger.error('Moveable range fetch failed', err)
    refs.moveableSlotsByDay.value = new Map()
  } finally {
    refs.isLoadingMoveableDaySlots.value = false
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

function applyDefaultSelectedMoveableDay(
  selectedMoveableDay: Ref<string | null>,
  next: Map<string, ComputedSlot[]>,
  innerDay: string
): void {
  const sortedKeys = [...next.keys()].sort()
  if (selectedMoveableDay.value === null || !next.has(selectedMoveableDay.value)) {
    selectedMoveableDay.value = sortedKeys[0] ?? innerDay
  }
}
