/**
 * WHY: Extracted from useMoveablePartsScheduling to reduce composable complexity.
 * Owns async options computation (watchEffect) and moveable range fetch (watch) — mirrors useComputedAvailability Map pattern.
 */
import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watch, watchEffect } from 'vue'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import type { UseMoveableAvailabilityDataParams } from '@/composables/booking/useMoveableAvailabilityDataTypes'
import {
  runMoveableDaySlotsWatchBody,
  runMoveableOptionsWatchEffectBody,
} from '@/composables/booking/useMoveableAvailabilityDataCore'

const DEFAULT_MOVEABLE_FALLBACK_LABEL = 'Post-Appointment Work'

export type { UseMoveableAvailabilityDataParams } from '@/composables/booking/useMoveableAvailabilityDataTypes'

export interface UseMoveableAvailabilityDataReturn {
  moveableOptions: Ref<MoveableSchedulingOptions | null>
  isLoadingOptions: Ref<boolean>
  moveableDaySlots: ComputedRef<ComputedSlot[]>
  isLoadingMoveableDaySlots: Ref<boolean>
  selectedMoveableDay: Ref<string | null>
  setSelectedMoveableDay: (date: string | null) => void
  afterBufferMinutes: Ref<number>
  moveableSlotsByDay: Ref<Map<string, ComputedSlot[]>>
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

  const {
    labels: { moveableFallbackLabel },
  } = useWizardSettings()
  const moveableOptions = ref<MoveableSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)
  const moveableSlotsByDay = ref<Map<string, ComputedSlot[]>>(new Map())
  const isLoadingMoveableDaySlots = ref(false)
  const selectedMoveableDay = ref<string | null>(null)
  const afterBufferMinutes = ref(0)
  const fallbackLabel = configuredMoveableFallbackLabelRef ?? ref<string>(DEFAULT_MOVEABLE_FALLBACK_LABEL)

  const moveableDaySlots = computed<ComputedSlot[]>(() => {
    const day = selectedMoveableDay.value
    if (!day) return []
    return moveableSlotsByDay.value.get(day) ?? []
  })

  watchEffect(async () => {
    await runMoveableOptionsWatchEffectBody({
      hasMoveableParts,
      selectedSlot,
      contingencyPeriod,
      selectedSlotIndex,
      moveableDuration,
      moveablePartShapeName,
      moveableOptions,
      isLoadingOptions,
      moveableSlotsByDay,
      selectedMoveableDay,
      afterBufferMinutes,
      fallbackLabel,
      moveableFallbackLabel,
    })
  })

  const hasClosingDate = computed(
    () =>
      contingencyPeriod.value.hasContingency === true &&
      Boolean(contingencyPeriod.value.endDate && contingencyPeriod.value.endTime)
  )

  watch(
    [moveableOptions, hasClosingDate, moveableDuration, placeId, afterBufferMinutes],
    async () => {
      await runMoveableDaySlotsWatchBody({
        hasClosingDate,
        moveableOptions,
        moveableDuration,
        placeId,
        afterBufferMinutes,
        moveableSlotsByDay,
        selectedMoveableDay,
        isLoadingMoveableDaySlots,
      })
    },
    { immediate: true }
  )

  const setSelectedMoveableDay = (date: string | null): void => {
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
    moveableSlotsByDay,
  }
}
