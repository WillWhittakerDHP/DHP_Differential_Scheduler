/**
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import { useLocalTime } from '@/utils/time/localTime'
import type { BusinessHoursConfig } from '@/configs/availabilitySettings'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { BusinessHoursDay } from '@/types/admin/businessControlsFormState'

export interface UseBusinessHoursFormStateReturn {
  businessHoursForUI: ComputedRef<Record<number, { start: string; end: string }>>
  isBusinessHoursConfig: (
    config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }
  ) => config is BusinessHoursConfig
  updateBusinessHours: (day: number, field: 'start' | 'end', value: string) => void
}

export function useBusinessHoursFormState(formData: Ref<AvailabilitySettings | null>): UseBusinessHoursFormStateReturn {
  const { rfc3339ToBusinessHoursHHmm, businessHoursHHmmToRfc3339 } = useLocalTime()

  const businessHoursForUI = computed(() => {
    if (!formData.value) return {} as Record<number, { start: string; end: string }>
    const currentFormData = formData.value
    return Object.fromEntries(
      Array.from({ length: 7 }, (_, day) => {
        const dayHours = currentFormData.businessHours[day as BusinessHoursDay]
        return [
          day,
          {
            start: rfc3339ToBusinessHoursHHmm(dayHours.start),
            end: rfc3339ToBusinessHoursHHmm(dayHours.end),
          },
        ]
      })
    ) as Record<number, { start: string; end: string }>
  })

  const isBusinessHoursConfig = (
    config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }
  ): config is BusinessHoursConfig => 'hours' in config

  const updateBusinessHours = (day: number, field: 'start' | 'end', value: string): void => {
    if (!formData.value) return
    const rfc3339Value = businessHoursHHmmToRfc3339(value)
    formData.value.businessHours[day as BusinessHoursDay][field] = rfc3339Value
    const businessHoursConstraint = formData.value.rangeConstraints?.businessHours
    if (businessHoursConstraint && isBusinessHoursConfig(businessHoursConstraint.config)) {
      businessHoursConstraint.config.hours[day as BusinessHoursDay][field] = rfc3339Value
    }
  }

  return {
    businessHoursForUI,
    isBusinessHoursConfig,
    updateBusinessHours,
  }
}
