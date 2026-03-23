/**
 * Min date/time and picker constraints for moveable contingency deadline (AvailabilitySubStepContent).
 */
import { computed, type ComputedRef } from 'vue'
import type { AvailabilitySubStepContext } from '@/types/booking/injectionContexts'
import {
  minContingencyDateKeyFromEarliest,
  minContingencyTimeForDate,
} from '@/utils/booking/clampContingencyDeadlineToEarliest'

export interface UseAvailabilitySubStepContingencyDeadlineFieldsReturn {
  contingencyDeadlineMinDate: ComputedRef<string | undefined>
  contingencyDeadlineMinTime: ComputedRef<string | undefined>
  deadlineDateNativeAttrs: ComputedRef<Record<string, string>>
  allowedDeadlineMinutes: ComputedRef<(m: number) => boolean>
}

export function useAvailabilitySubStepContingencyDeadlineFields(
  ctx: AvailabilitySubStepContext
): UseAvailabilitySubStepContingencyDeadlineFieldsReturn {
  const contingencyDeadlineMinDate = computed(() => {
    const es = ctx.o.moveableSchedulingWindow.value?.earliestStart
    return es ? minContingencyDateKeyFromEarliest(es) : undefined
  })

  const contingencyDeadlineMinTime = computed(() => {
    const win = ctx.o.moveableSchedulingWindow.value
    const endDate = ctx.o.contingencyPeriod.value.endDate
    if (!win?.earliestStart || !endDate) return undefined
    return minContingencyTimeForDate(endDate, win.earliestStart)
  })

  const deadlineDateNativeAttrs = computed((): Record<string, string> => {
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

  return {
    contingencyDeadlineMinDate,
    contingencyDeadlineMinTime,
    deadlineDateNativeAttrs,
    allowedDeadlineMinutes,
  }
}
