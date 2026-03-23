/**
 * WHY: Contingency deadline + step-4 moveable orchestration for AvailabilitySubStepContent.
 * PATTERN: Named composable keeps the SFC thin (component-governance / vue-architecture).
 */
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { AvailabilitySubStepContext } from '@/types/booking/injectionContexts'
import type { ContingencyPeriod } from '@/types/moveableScheduling'
import {
  clampContingencyDeadlineToEarliest,
  parseContingencyDeadlineLocalWallToUtcMs,
} from '@/utils/booking/clampContingencyDeadlineToEarliest'
import { useAvailabilitySubStepContingencyDeadlineFields } from '@/composables/booking/useAvailabilitySubStepContingencyDeadlineFields'

export interface UseAvailabilitySubStepContentReturn {
  onContingencyChoice: (value: boolean) => void
  onDeadlineDateModelUpdate: (raw: unknown) => void
  onDeadlineTimeModelUpdate: (raw: unknown) => void
  contingencyDeadlineMinTime: ComputedRef<string | undefined>
  deadlineDateNativeAttrs: ComputedRef<Record<string, string>>
  allowedDeadlineMinutes: ComputedRef<(m: number) => boolean>
  deadlineTimeMenuOpen: Ref<boolean>
  step4HasClosingDate: ComputedRef<boolean>
  hasOptions: ComputedRef<boolean>
  step4CanStepPrev: ComputedRef<boolean>
  step4CanStepNext: ComputedRef<boolean>
  step4StepDay: (delta: -1 | 1) => void
  handleMoveableSlotClick: (buttonIndex: number) => void
}

export function useAvailabilitySubStepContent(
  ctx: AvailabilitySubStepContext,
  stepIndex: Ref<number>
): UseAvailabilitySubStepContentReturn {
  const {
    contingencyDeadlineMinDate,
    contingencyDeadlineMinTime,
    deadlineDateNativeAttrs,
    allowedDeadlineMinutes,
  } = useAvailabilitySubStepContingencyDeadlineFields(ctx)

  const deadlineTimeMenuOpen = ref(false)

  function updateContingency(partial: Partial<ContingencyPeriod>): void {
    const o = ctx.o
    let next: ContingencyPeriod = { ...o.contingencyPeriod.value, ...partial }
    const win = o.moveableSchedulingWindow.value
    if (win?.earliestStart && next.hasContingency === true && next.endDate && next.endTime) {
      const c = clampContingencyDeadlineToEarliest(next.endDate, next.endTime, win.earliestStart)
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

  const step4HasClosingDate = computed(
    () =>
      ctx.o.contingencyPeriod.value.hasContingency === true &&
      Boolean(ctx.o.contingencyPeriod.value.endDate && ctx.o.contingencyPeriod.value.endTime)
  )

  const hasOptions = computed(() => ctx.hasOptions.value)

  const step4MoveableDayIndex = computed(() => {
    const keys = ctx.o.availableMoveableDayKeys.value
    const day = ctx.o.selectedMoveableDay.value
    if (!day) return -1
    return keys.indexOf(day)
  })

  const step4CanStepPrev = computed(() => step4MoveableDayIndex.value > 0)

  const step4CanStepNext = computed(() => {
    const keys = ctx.o.availableMoveableDayKeys.value
    const i = step4MoveableDayIndex.value
    return i >= 0 && i < keys.length - 1
  })

  const step4CanConfirm = computed(() => {
    const o = ctx.o
    const opts = o.moveableOptions.value
    if (!opts) return false
    const h = o.contingencyPeriod.value.hasContingency
    if (h === false) return true
    if (!step4HasClosingDate.value) return false
    const slots = o.moveableAppointmentSlots.value
    if (slots.length === 0) return false
    return o.selectedMoveableSlotIndex.value !== null
  })

  function step4StepDay(delta: -1 | 1): void {
    const keys = ctx.o.availableMoveableDayKeys.value
    const i = step4MoveableDayIndex.value
    if (i < 0) return
    const nextIdx = i + delta
    if (nextIdx < 0 || nextIdx >= keys.length) return
    const nextDay = keys[nextIdx]
    if (nextDay !== undefined) {
      ctx.o.setSelectedMoveableDay(nextDay)
    }
  }

  function handleMoveableSlotClick(buttonIndex: number): void {
    ctx.o.selectMoveableSlot(buttonIndex)
    ctx.handleMoveableConfirmWithConfirm()
  }

  watch(
    () =>
      stepIndex.value === 4 &&
      step4CanConfirm.value &&
      !ctx.o.stepData.value?.moveableScheduling &&
      !ctx.o.isLoadingOptions.value &&
      !(step4HasClosingDate.value && ctx.o.isLoadingMoveableDaySlots.value),
    (shouldAutoConfirm) => {
      if (shouldAutoConfirm) ctx.handleMoveableConfirmWithConfirm()
    },
    { immediate: true }
  )

  watch(
    () => ctx.o.moveableSchedulingWindow.value?.earliestStart ?? null,
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
    onContingencyChoice,
    onDeadlineDateModelUpdate,
    onDeadlineTimeModelUpdate,
    contingencyDeadlineMinTime,
    deadlineDateNativeAttrs,
    allowedDeadlineMinutes,
    deadlineTimeMenuOpen,
    step4HasClosingDate,
    hasOptions,
    step4CanStepPrev,
    step4CanStepNext,
    step4StepDay,
    handleMoveableSlotClick,
  }
}
