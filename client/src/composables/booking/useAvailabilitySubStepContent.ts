import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { AvailabilitySubStepContext } from '@/types/booking/injectionContexts'
import type { ContingencyPeriod } from '@/types/minimizerScheduling'
import {
  clampContingencyDeadlineToEarliest,
  minContingencyDateKeyFromEarliest,
  minContingencyTimeForDate,
  parseContingencyDeadlineLocalWallToUtcMs,
} from '@/utils/booking/clampContingencyDeadlineToEarliest'

/**
 * Native date input passthrough for VTextField `type="date"` (Vuetify forwards to the DOM input).
 * Only `min` is set when the earliest minimizer start yields a constraint; otherwise `{}` (no attrs).
 */
type DeadlineDateNativeAttrs = { min?: string }

export interface UseAvailabilitySubStepContentParams {
  ctx: AvailabilitySubStepContext
  stepIndex: Ref<number>
}

export interface UseAvailabilitySubStepContentReturn {
  hasOptions: ComputedRef<boolean>
  onContingencyChoice: (value: boolean) => void
  step4HasClosingDate: ComputedRef<boolean>
  contingencyDeadlineMinDate: ComputedRef<string | undefined>
  contingencyDeadlineMinTime: ComputedRef<string | undefined>
  deadlineDateNativeAttrs: ComputedRef<DeadlineDateNativeAttrs>
  allowedDeadlineMinutes: ComputedRef<(m: number) => boolean>
  deadlineTimeMenuOpen: Ref<boolean>
  onDeadlineDateModelUpdate: (raw: unknown) => void
  onDeadlineTimeModelUpdate: (raw: unknown) => void
  step4CanStepPrev: ComputedRef<boolean>
  step4CanStepNext: ComputedRef<boolean>
  step4CanConfirm: ComputedRef<boolean>
  step4StepDay: (delta: -1 | 1) => void
  handleMinimizerSlotClick: (buttonIndex: number) => void
}

/**
 * WHY: Keeps AvailabilitySubStepContent.vue thin (vue-architecture: script size + local function count).
 */
export function useAvailabilitySubStepContent(
  params: UseAvailabilitySubStepContentParams
): UseAvailabilitySubStepContentReturn {
  const { ctx, stepIndex } = params

  function updateContingency(partial: Partial<ContingencyPeriod>): void {
    const o = ctx.o
    let next: ContingencyPeriod = { ...o.contingencyPeriod.value, ...partial }
    const schedulingRange = o.minimizerSchedulingWindow.value
    if (
      schedulingRange?.earliestStart &&
      next.hasContingency === true &&
      next.endDate &&
      next.endTime
    ) {
      const c = clampContingencyDeadlineToEarliest(next.endDate, next.endTime, schedulingRange.earliestStart)
      next = { ...next, endDate: c.endDate, endTime: c.endTime }
    }
    o.contingencyPeriod.value = next
  }

  function onContingencyChoice(value: boolean): void {
    const o = ctx.o
    const cur = o.contingencyPeriod.value
    if (value === false) {
      o.contingencyPeriod.value = {
        ...cur,
        hasContingency: false,
        endDate: null,
        endTime: null,
      }
      return
    }
    o.contingencyPeriod.value = { ...cur, hasContingency: true }
  }

  const step4HasClosingDate = computed(
    () =>
      ctx.o.contingencyPeriod.value.hasContingency === true &&
      Boolean(ctx.o.contingencyPeriod.value.endDate && ctx.o.contingencyPeriod.value.endTime)
  )

  const hasOptions = computed(() => ctx.hasOptions.value)

  const contingencyDeadlineMinDate = computed(() => {
    const es = ctx.o.minimizerSchedulingWindow.value?.earliestStart
    return es ? minContingencyDateKeyFromEarliest(es) : undefined
  })

  const contingencyDeadlineMinTime = computed(() => {
    const schedulingRange = ctx.o.minimizerSchedulingWindow.value
    const endDate = ctx.o.contingencyPeriod.value.endDate
    if (!schedulingRange?.earliestStart || !endDate) return undefined
    return minContingencyTimeForDate(endDate, schedulingRange.earliestStart)
  })

  const deadlineDateNativeAttrs = computed((): DeadlineDateNativeAttrs => {
    const min = contingencyDeadlineMinDate.value
    if (min !== undefined && min !== '') {
      return { min }
    }
    return {}
  })

  const allowedDeadlineMinutes = computed(() => {
    const minutes = ctx.o.availabilityMinuteIncrement.value
    const step = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 15
    return (m: number): boolean => m % step === 0
  })

  const deadlineTimeMenuOpen = ref(false)

  function coerceDeadlineDateInput(raw: unknown): string | null {
    const s = typeof raw === 'string' ? raw.trim() : ''
    if (!s) return null
    const minD = contingencyDeadlineMinDate.value
    if (minD && s.length === 10 && s < minD) return minD
    return s
  }

  function coerceDeadlineTimeInput(raw: unknown): string | null {
    const t = typeof raw === 'string' ? raw.trim() : ''
    if (!t) return null
    const minT = contingencyDeadlineMinTime.value
    const endDate = ctx.o.contingencyPeriod.value.endDate
    const minD = contingencyDeadlineMinDate.value
    if (
      minT !== undefined &&
      endDate &&
      minD &&
      endDate === minD &&
      t.length >= 5 &&
      t < minT
    ) {
      return minT
    }
    return t
  }

  function onDeadlineDateModelUpdate(raw: unknown): void {
    updateContingency({ endDate: coerceDeadlineDateInput(raw) })
  }

  function onDeadlineTimeModelUpdate(raw: unknown): void {
    updateContingency({ endTime: coerceDeadlineTimeInput(raw) })
  }

  const step4MinimizerDayIndex = computed(() => {
    const keys = ctx.o.availableMinimizerDayKeys.value
    const day = ctx.o.selectedMinimizerDay.value
    if (!day) return -1
    return keys.indexOf(day)
  })

  const step4CanStepPrev = computed(() => step4MinimizerDayIndex.value > 0)

  const step4CanStepNext = computed(() => {
    const keys = ctx.o.availableMinimizerDayKeys.value
    const i = step4MinimizerDayIndex.value
    return i >= 0 && i < keys.length - 1
  })

  const step4CanConfirm = computed(() => {
    const o = ctx.o
    const opts = o.minimizerOptions.value
    if (!opts) return false
    const h = o.contingencyPeriod.value.hasContingency
    if (h === false) return true
    if (!step4HasClosingDate.value) return false
    const slots = o.minimizerAppointmentSlots.value
    if (slots.length === 0) return false
    return o.selectedMinimizerSlotIndex.value !== null
  })

  function step4StepDay(delta: -1 | 1): void {
    const keys = ctx.o.availableMinimizerDayKeys.value
    const i = step4MinimizerDayIndex.value
    if (i < 0) return
    const nextIdx = i + delta
    if (nextIdx < 0 || nextIdx >= keys.length) return
    const nextDay = keys[nextIdx]
    if (nextDay !== undefined) {
      ctx.o.setSelectedMinimizerDay(nextDay)
    }
  }

  function handleMinimizerSlotClick(buttonIndex: number): void {
    ctx.o.selectMinimizerSlot(buttonIndex)
    ctx.handleMinimizerConfirmWithConfirm()
  }

  watch(
    () =>
      stepIndex.value === 4 &&
      step4CanConfirm.value &&
      !ctx.o.stepData.value?.minimizerScheduling &&
      !ctx.o.isLoadingOptions.value &&
      !(step4HasClosingDate.value && ctx.o.isLoadingMinimizerDaySlots.value),
    (shouldAutoConfirm) => {
      if (shouldAutoConfirm) ctx.handleMinimizerConfirmWithConfirm()
    },
    { immediate: true }
  )

  watch(
    () => ctx.o.minimizerSchedulingWindow.value?.earliestStart ?? null,
    (earliest) => {
      if (!earliest) return
      const o = ctx.o
      const c = o.contingencyPeriod.value
      if (c.hasContingency !== true || !c.endDate || !c.endTime) return
      const clamped = clampContingencyDeadlineToEarliest(c.endDate, c.endTime, earliest)
      const beforeMs = parseContingencyDeadlineLocalWallToUtcMs(c.endDate, c.endTime)
      const afterMs = parseContingencyDeadlineLocalWallToUtcMs(clamped.endDate, clamped.endTime)
      const deadlineUnchanged =
        (beforeMs === null && afterMs === null) ||
        (beforeMs !== null && afterMs !== null && beforeMs === afterMs)
      if (!deadlineUnchanged) {
        o.contingencyPeriod.value = { ...c, endDate: clamped.endDate, endTime: clamped.endTime }
      }
    }
  )

  return {
    hasOptions,
    onContingencyChoice,
    step4HasClosingDate,
    contingencyDeadlineMinDate,
    contingencyDeadlineMinTime,
    deadlineDateNativeAttrs,
    allowedDeadlineMinutes,
    deadlineTimeMenuOpen,
    onDeadlineDateModelUpdate,
    onDeadlineTimeModelUpdate,
    step4CanStepPrev,
    step4CanStepNext,
    step4CanConfirm,
    step4StepDay,
    handleMinimizerSlotClick,
  }
}
