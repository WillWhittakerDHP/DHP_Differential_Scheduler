import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { AvailabilitySettings, RollingWeekDirection } from '@/configs/availabilitySettings'

export interface UseCapacitySettingsParams {
  formData: Ref<AvailabilitySettings | null>
  maxBusinessHours: ComputedRef<number>
}

export interface UseCapacitySettingsReturn {
  maxWorkHours: {
    maxWorkHoursDayMaxHours: WritableComputedRef<number>
    maxWorkHoursDayEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
    maxWorkHoursCalendarWeekMaxHours: WritableComputedRef<number>
    maxWorkHoursCalendarWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
    maxWorkHoursRollingWeekMaxHours: WritableComputedRef<number>
    maxWorkHoursRollingWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
    maxWorkHoursRollingWeekDirection: WritableComputedRef<RollingWeekDirection>
  }
  maxIncome: {
    maxIncomeDayMaxIncome: WritableComputedRef<number>
    maxIncomeDayEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
    maxIncomeCalendarWeekMaxIncome: WritableComputedRef<number>
    maxIncomeCalendarWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
    maxIncomeRollingWeekMaxIncome: WritableComputedRef<number>
    maxIncomeRollingWeekEnforcement: WritableComputedRef<'off' | 'flexible' | 'hard'>
    maxIncomeRollingWeekDirection: WritableComputedRef<RollingWeekDirection>
  }
}
