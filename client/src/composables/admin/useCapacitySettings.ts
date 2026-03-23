import type { UseCapacitySettingsParams, UseCapacitySettingsReturn } from '@/types/admin/capacitySettings'
import { buildMaxWorkHoursWritables } from '@/composables/admin/capacitySettings/useCapacityMaxWorkComputeds'
import { buildMaxIncomeWritables } from '@/composables/admin/capacitySettings/useCapacityMaxIncomeComputeds'

export type { UseCapacitySettingsParams, UseCapacitySettingsReturn } from '@/types/admin/capacitySettings'

export function useCapacitySettings(params: UseCapacitySettingsParams): UseCapacitySettingsReturn {
  return {
    maxWorkHours: buildMaxWorkHoursWritables(params),
    maxIncome: buildMaxIncomeWritables(params),
  }
}
