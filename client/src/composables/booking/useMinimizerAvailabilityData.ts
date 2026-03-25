/**
 * WHY: Extracted from useMinimizerPartsScheduling to reduce composable complexity.
 * Owns async options computation (watchEffect) and minimizer range fetch (watch) — mirrors useComputedAvailability Map pattern.
 */
import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watch, watchEffect } from 'vue'
import type { MinimizerSchedulingOptions } from '@/types/minimizerScheduling'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import type { UseMinimizerAvailabilityDataParams } from '@/composables/booking/useMinimizerAvailabilityDataTypes'
import {
  runMinimizerDaySlotsWatchBody,
  runMinimizerOptionsWatchEffectBody,
} from '@/composables/booking/useMinimizerAvailabilityDataCore'

const DEFAULT_MINIMIZER_FALLBACK_LABEL = 'Post-Appointment Work'

export type { UseMinimizerAvailabilityDataParams } from '@/composables/booking/useMinimizerAvailabilityDataTypes'

export interface UseMinimizerAvailabilityDataReturn {
  minimizerOptions: Ref<MinimizerSchedulingOptions | null>
  isLoadingOptions: Ref<boolean>
  minimizerDaySlots: ComputedRef<ComputedSlot[]>
  isLoadingMinimizerDaySlots: Ref<boolean>
  selectedMinimizerDay: Ref<string | null>
  setSelectedMinimizerDay: (date: string | null) => void
  afterBufferMinutes: Ref<number>
  minimizerSlotsByDay: Ref<Map<string, ComputedSlot[]>>
}

export function useMinimizerAvailabilityData(
  params: UseMinimizerAvailabilityDataParams
): UseMinimizerAvailabilityDataReturn {
  const {
    hasMinimizerParts,
    selectedSlot,
    contingencyPeriod,
    selectedSlotIndex,
    minimizerDuration,
    minimizerPartShapeName,
    placeId,
    configuredMinimizerFallbackLabelRef,
  } = params

  const {
    labels: { minimizerFallbackLabel },
  } = useWizardSettings()
  const minimizerOptions = ref<MinimizerSchedulingOptions | null>(null)
  const isLoadingOptions = ref(false)
  const minimizerSlotsByDay = ref<Map<string, ComputedSlot[]>>(new Map())
  const isLoadingMinimizerDaySlots = ref(false)
  const selectedMinimizerDay = ref<string | null>(null)
  const afterBufferMinutes = ref(0)
  const fallbackLabel = configuredMinimizerFallbackLabelRef ?? ref<string>(DEFAULT_MINIMIZER_FALLBACK_LABEL)

  const minimizerDaySlots = computed<ComputedSlot[]>(() => {
    const day = selectedMinimizerDay.value
    if (!day) return []
    return minimizerSlotsByDay.value.get(day) ?? []
  })

  watchEffect(async () => {
    await runMinimizerOptionsWatchEffectBody({
      hasMinimizerParts,
      selectedSlot,
      contingencyPeriod,
      selectedSlotIndex,
      minimizerDuration,
      minimizerPartShapeName,
      minimizerOptions,
      isLoadingOptions,
      minimizerSlotsByDay,
      selectedMinimizerDay,
      afterBufferMinutes,
      fallbackLabel,
      minimizerFallbackLabel,
    })
  })

  const hasClosingDate = computed(
    () =>
      contingencyPeriod.value.hasContingency === true &&
      Boolean(contingencyPeriod.value.endDate && contingencyPeriod.value.endTime)
  )

  watch(
    [minimizerOptions, hasClosingDate, minimizerDuration, placeId, afterBufferMinutes],
    async () => {
      await runMinimizerDaySlotsWatchBody({
        hasClosingDate,
        minimizerOptions,
        minimizerDuration,
        placeId,
        afterBufferMinutes,
        minimizerSlotsByDay,
        selectedMinimizerDay,
        isLoadingMinimizerDaySlots,
      })
    },
    { immediate: true }
  )

  const setSelectedMinimizerDay = (date: string | null): void => {
    selectedMinimizerDay.value = date
  }

  return {
    minimizerOptions,
    isLoadingOptions,
    minimizerDaySlots,
    isLoadingMinimizerDaySlots,
    selectedMinimizerDay,
    setSelectedMinimizerDay,
    afterBufferMinutes,
    minimizerSlotsByDay,
  }
}
