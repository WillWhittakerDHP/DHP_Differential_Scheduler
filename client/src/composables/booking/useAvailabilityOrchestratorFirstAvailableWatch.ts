import { watch, type ComputedRef, type Ref } from 'vue'
import type { UseAvailabilityUIParams } from '@/types/booking/availabilityUI'
import { toISO8601Date } from '@/utils/datetime'
import { getTodayDate } from '@/utils/time/timeFormatting'
import { buildFirstAvailableNoticeCopy } from '@/utils/booking/firstAvailableNoticeCopy'

export function wireFirstAvailableDateNotice(input: {
  firstAvailableDate: ComputedRef<string | null>
  selectedDate: UseAvailabilityUIParams['selectedDate']
  firstAvailableNotice: Ref<string | null>
}): void {
  const { firstAvailableDate, selectedDate, firstAvailableNotice } = input

  watch(
    firstAvailableDate,
    (firstDate) => {
      if (!firstDate) return
      const today = getTodayDate()
      if (firstDate === today) {
        firstAvailableNotice.value = null
        return
      }
      const currentStart = selectedDate.value.start
      const currentDay = currentStart
        ? currentStart.includes('T')
          ? currentStart.split('T')[0]
          : currentStart
        : null
      if (firstAvailableNotice.value !== null && currentDay !== firstDate) {
        selectedDate.value = { start: toISO8601Date(firstDate), end: null }
        firstAvailableNotice.value = buildFirstAvailableNoticeCopy(firstDate)
        return
      }
      if (currentDay !== today) return
      selectedDate.value = { start: toISO8601Date(firstDate), end: null }
      firstAvailableNotice.value = buildFirstAvailableNoticeCopy(firstDate)
    },
    { immediate: true }
  )
}
