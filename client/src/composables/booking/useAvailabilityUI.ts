/**
 * WHY: useAvailabilityUI Composable

WHY: Moves responsive layout and date hand...
 */
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useFormValidation } from '@/composables/useFormValidation'
import { parseVDatePickerValueToIso } from '@/utils/booking/availabilityDatePickerParse'
import { applySelectedDateValidationToFieldErrors } from '@/utils/booking/availabilitySelectedDateErrors'
import type { UseAvailabilityUIParams, UseAvailabilityUIReturn } from '@/types/booking/availabilityUI'

const CALENDAR_WIDTH = 328
const GRID_MIN_WIDTH = 140 + 20
const COLUMN_GAP = 16
const MIN_TOTAL_WIDTH = CALENDAR_WIDTH + GRID_MIN_WIDTH + COLUMN_GAP

/**
 * WHY: useAvailabilityUI composable

WHY: Extracts responsive layout and date h...
 */
export function useAvailabilityUI(params: UseAvailabilityUIParams): UseAvailabilityUIReturn {
  const { fieldErrors } = params

  const { dateNotInPast } = useFormValidation()

  const { width, smAndUp } = useDisplay()

  const shouldShowGridInline = computed(
    () => width.value >= MIN_TOTAL_WIDTH || smAndUp.value
  )

  const handleDateChange = (value: string | Date | string[] | Date[] | null): void => {
    const dateString = parseVDatePickerValueToIso(value)
    const { selectedDate } = params
    selectedDate.value = { start: dateString, end: null }

    if (dateString) {
      const dateResult = dateNotInPast()(dateString)
      applySelectedDateValidationToFieldErrors(fieldErrors, dateString, dateResult)
      return
    }

    applySelectedDateValidationToFieldErrors(fieldErrors, null, undefined)
  }

  return {
    shouldShowGridInline,
    handleDateChange,
  }
}
