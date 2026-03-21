import type {
  CapacityConstraintsState,
  UseCapacityConstraintsHandlersReturn,
} from '@/types/admin/capacityConstraintsHandlers'

/**
 * Returns handlers for CapacityConstraintsPanel that write into the capacity slice.
 * Keeps the panel thin (vue-architecture audit).
 */
export function useCapacityConstraintsHandlers(
  state: CapacityConstraintsState
): UseCapacityConstraintsHandlersReturn {
  const workHours = state.capacity.maxWorkHours
  const income = state.capacity.maxIncome

  return {
    handleMaxWorkHoursDayMaxHours(v: number | string): void {
      workHours.maxWorkHoursDayMaxHours = Number(v)
    },
    handleMaxWorkHoursDayEnforcement(v: 'off' | 'flexible' | 'hard'): void {
      workHours.maxWorkHoursDayEnforcement = v
    },
    handleMaxIncomeDayMaxIncome(v: number | string): void {
      income.maxIncomeDayMaxIncome = Number(v)
    },
    handleMaxIncomeDayEnforcement(v: 'off' | 'flexible' | 'hard'): void {
      income.maxIncomeDayEnforcement = v
    },
    handleMaxWorkHoursCalendarWeekMaxHours(v: number | string): void {
      workHours.maxWorkHoursCalendarWeekMaxHours = Number(v)
    },
    handleMaxWorkHoursCalendarWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
      workHours.maxWorkHoursCalendarWeekEnforcement = v
    },
    handleMaxIncomeCalendarWeekMaxIncome(v: number | string): void {
      income.maxIncomeCalendarWeekMaxIncome = Number(v)
    },
    handleMaxIncomeCalendarWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
      income.maxIncomeCalendarWeekEnforcement = v
    },
    handleMaxWorkHoursRollingWeekMaxHours(v: number | string): void {
      workHours.maxWorkHoursRollingWeekMaxHours = Number(v)
    },
    handleMaxWorkHoursRollingWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
      workHours.maxWorkHoursRollingWeekEnforcement = v
    },
    handleMaxWorkHoursRollingWeekDirection(v: 'past' | 'centered' | 'future'): void {
      workHours.maxWorkHoursRollingWeekDirection = v
    },
    handleMaxIncomeRollingWeekMaxIncome(v: number | string): void {
      income.maxIncomeRollingWeekMaxIncome = Number(v)
    },
    handleMaxIncomeRollingWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
      income.maxIncomeRollingWeekEnforcement = v
    },
    handleMaxIncomeRollingWeekDirection(v: 'past' | 'centered' | 'future'): void {
      income.maxIncomeRollingWeekDirection = v
    },
  }
}
