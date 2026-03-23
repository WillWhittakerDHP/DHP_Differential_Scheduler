import { watch, type ComputedRef, type Ref } from 'vue'
import type { UseAvailabilityUIParams } from '@/types/booking/availabilityUI'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'

export function wireVDatePickerToDisplayedMonth(input: {
  vDatePickerDisplayDate: Ref<Date>
  displayedMonth: Ref<DisplayedMonth>
  updateDisplayedMonth: (month: DisplayedMonth) => void
}): void {
  const { vDatePickerDisplayDate, displayedMonth, updateDisplayedMonth } = input

  watch(vDatePickerDisplayDate, (newDate) => {
    if (!isNaN(newDate.getTime())) {
      const newMonth: DisplayedMonth = { year: newDate.getUTCFullYear(), month: newDate.getUTCMonth() }
      const currentMonth = displayedMonth.value
      if (currentMonth.year !== newMonth.year || currentMonth.month !== newMonth.month) {
        updateDisplayedMonth(newMonth)
      }
    }
  })
}

export function wireDisplayedMonthToVDatePicker(input: {
  displayedMonth: Ref<DisplayedMonth>
  vDatePickerDisplayDate: Ref<Date>
}): void {
  const { displayedMonth, vDatePickerDisplayDate } = input

  watch(
    displayedMonth,
    (newMonth) => {
      const newDate = new Date(Date.UTC(newMonth.year, newMonth.month, 1))
      const currentDate = vDatePickerDisplayDate.value
      if (currentDate.getUTCFullYear() !== newMonth.year || currentDate.getUTCMonth() !== newMonth.month) {
        vDatePickerDisplayDate.value = newDate
      }
    },
    { immediate: true }
  )
}

export function wireSelectedDateToDisplayedMonth(input: {
  selectedDate: UseAvailabilityUIParams['selectedDate']
  updateDisplayedMonth: (month: DisplayedMonth) => void
}): void {
  const { selectedDate, updateDisplayedMonth } = input

  watch(
    selectedDate,
    (newDate) => {
      if (newDate?.start) {
        const date = new Date(newDate.start)
        if (!isNaN(date.getTime())) {
          updateDisplayedMonth({ year: date.getUTCFullYear(), month: date.getUTCMonth() })
        }
      }
    },
    { immediate: true }
  )
}

export function wireAppointmentDurationToRef(input: {
  appointmentDuration: ComputedRef<number | null>
  appointmentDurationRef: Ref<number | null>
}): void {
  const { appointmentDuration, appointmentDurationRef } = input

  watch(
    appointmentDuration,
    (newDuration) => {
      appointmentDurationRef.value = newDuration
    },
    { immediate: true }
  )
}
