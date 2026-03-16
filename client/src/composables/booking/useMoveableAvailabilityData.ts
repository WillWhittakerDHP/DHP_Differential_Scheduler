/**
 * WHY: Extracted from useMoveablePartsScheduling to reduce composable complexity.
 * Owns async options computation (watchEffect) and moveable-day slot fetch (watch).
 */
import type { Ref } from 'vue'
import { computed, ref, watch, watchEffect } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { ContingencyPeriod, MoveableSchedulingOptions } from '@/types/moveableScheduling'
import { toRFC3339DateTime } from '@/utils/datetime'
import { fetchComputedAvailabilityData } from '@/services/calendarApiService'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import { createLogger } from '@/utils/logger'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import {
  computeOuterBoundary,
  extractInnerBoundary,
} from '@/utils/booking/moveableSchedulingBounds'

const logger = createLogger('useMoveableAvailabilityData')
const DEFAULT_MOVEABLE_FALLBACK_LABEL = 'Post-Appointment Work'

function defaultDeadlineTime(
  innerBoundary: string,
  bufferMinutes: number,
  moveableDurationMinutes: number
): string {
  const end = new Date(innerBoundary)
  end.setUTCMinutes(end.getUTCMinutes() + bufferMinutes + moveableDurationMinutes)
  return end.toISOString().slice(11, 16) // HH:mm
}

export interface UseMoveableAvailabilityDataParams {
  hasMoveableParts: Ref<boolean>
  selectedSlot: Ref<AppointmentSlot | null>
  contingencyPeriod: Ref<ContingencyPeriod>
  selectedSlotIndex: Ref<number | null>
  moveableDuration: Ref<number>
  moveablePartShapeName: Ref<string>
  placeId: Ref<string | null | undefined>
  /** Optional ref for parent to own; composable will update from settings when defaulting contingency. */
  configuredMoveableFallbackLabelRef?: Ref<string>
}

export interface UseMoveableAvailabilityDataReturn {
  moveableOptions: Ref<MoveableSchedulingOptions | null>
  isLoadingOptions: Ref<boolean>
  moveableDaySlots: Ref<ComputedSlot[]>
  isLoadingMoveableDaySlots: Ref<boolean>
  selectedMoveableDay: Ref<string | null>
  setSelectedMoveableDay: (date: string | null) => void
  /** Minutes of appointment buffer that apply after the onsite work ends (placement 'after' | 'both'). */
  afterBufferMinutes: Ref<number>
}

export function useMoveableAvailabilityData(
  params: UseMoveableAvailabilityDataParams
): UseMoveableAvailabilityDataReturn {
  const {
    hasMoveableParts,
    selectedSlot,
    contingencyPeriod,
    selectedSlotIndex,
    moveableDuration,
    moveablePartShapeName,
    placeId,
    configuredMoveableFallbackLabelRef,
  } = params

  const { moveableFallbackLabel } = useWizardSettings()
  const moveableOptions = ref<MoveableSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)
  const moveableDaySlots = ref<ComputedSlot[]>([])
  const isLoadingMoveableDaySlots = ref(false)
  const selectedMoveableDay = ref<string | null>(null)
  const afterBufferMinutes = ref(0)
  const fallbackLabel = configuredMoveableFallbackLabelRef ?? ref<string>(DEFAULT_MOVEABLE_FALLBACK_LABEL)

  watchEffect(async () => {
    if (!hasMoveableParts.value || !selectedSlot.value) {
      moveableOptions.value = null
      selectedMoveableDay.value = null
      return
    }

    const slot = selectedSlot.value
    const duration = moveableDuration.value
    const innerBoundary = extractInnerBoundary(slot)
    if (!innerBoundary) {
      moveableOptions.value = null
      selectedMoveableDay.value = null
      return
    }

    try {
      isLoadingOptions.value = true

      const settings = await getAvailabilitySettings()
      const bufferMinutes = settings.buffers?.appointment?.minutes ?? 0
      const placement = settings.buffers?.appointment?.placement ?? 'off'
      afterBufferMinutes.value = (placement === 'after' || placement === 'both') ? bufferMinutes : 0
      fallbackLabel.value = moveableFallbackLabel.value

      const outerBoundary = computeOuterBoundary(contingencyPeriod.value, innerBoundary)
      const innerDate = innerBoundary.slice(0, 10)
      const outerDate = outerBoundary.slice(0, 10)
      if (
        selectedMoveableDay.value === null ||
        selectedMoveableDay.value < innerDate ||
        selectedMoveableDay.value > outerDate
      ) {
        selectedMoveableDay.value = innerDate
      }
      moveableOptions.value = {
        innerBoundary,
        outerBoundary,
        moveableDuration: duration,
        partShapeName: moveablePartShapeName.value,
        availableSlots: [],
        earliestCompletion: innerBoundary,
        selectedSlotIndex: selectedSlotIndex.value,
      }
      if (!contingencyPeriod.value.endDate && !contingencyPeriod.value.endTime) {
        contingencyPeriod.value = {
          ...contingencyPeriod.value,
          hasContingency: true,
          endDate: innerDate,
          endTime: defaultDeadlineTime(innerBoundary, bufferMinutes, duration),
        }
      }
    } catch (err) {
      logger.error('Moveable options computation failed', err)
      moveableOptions.value = null
      selectedMoveableDay.value = null
    } finally {
      isLoadingOptions.value = false
    }
  })

  const hasClosingDate = computed(
    () => contingencyPeriod.value.hasContingency && Boolean(contingencyPeriod.value.endDate)
  )

  watch(
    [selectedMoveableDay, hasClosingDate, moveableDuration, placeId],
    async () => {
      const day = selectedMoveableDay.value
      const duration = moveableDuration.value
      const pid = placeId.value
      if (!hasClosingDate.value || !day || duration <= 0) {
        moveableDaySlots.value = []
        return
      }

      const start = toRFC3339DateTime(new Date(`${day}T00:00:00.000Z`))
      const end = toRFC3339DateTime(new Date(`${day}T23:59:59.999Z`))

      isLoadingMoveableDaySlots.value = true
      try {
        const data = await fetchComputedAvailabilityData({
          dateRange: { start, end },
          candidatePlaceId: pid ?? undefined,
          duration,
          dataSource: 'real',
        })
        const daySlots = data.slotsByDay[day]
        moveableDaySlots.value = Array.isArray(daySlots) ? daySlots : []
      } catch (err) {
        logger.error('Moveable day fetch failed', err)
        moveableDaySlots.value = []
      } finally {
        isLoadingMoveableDaySlots.value = false
      }
    },
    { immediate: true }
  )

  const setSelectedMoveableDay = (date: string | null) => {
    selectedMoveableDay.value = date
  }

  return {
    moveableOptions,
    isLoadingOptions,
    moveableDaySlots,
    isLoadingMoveableDaySlots,
    selectedMoveableDay,
    setSelectedMoveableDay,
    afterBufferMinutes,
  }
}
