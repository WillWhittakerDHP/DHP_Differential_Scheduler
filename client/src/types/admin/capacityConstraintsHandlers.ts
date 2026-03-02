/**
 * State shape required by useCapacityConstraintsHandlers.
 * Reactive/unwrapped view of the capacity slice from BUSINESS_CONTROLS_STATE_KEY
 * so handlers can assign directly (Vue reactive proxy forwards to refs).
 */
export interface CapacityConstraintsState {
  capacity: {
    maxWorkHours: {
      maxWorkHoursDayMaxHours: number
      maxWorkHoursDayEnforcement: 'off' | 'flexible' | 'hard'
      maxWorkHoursCalendarWeekMaxHours: number
      maxWorkHoursCalendarWeekEnforcement: 'off' | 'flexible' | 'hard'
      maxWorkHoursRollingWeekMaxHours: number
      maxWorkHoursRollingWeekEnforcement: 'off' | 'flexible' | 'hard'
      maxWorkHoursRollingWeekDirection: 'past' | 'centered' | 'future'
    }
    maxIncome: {
      maxIncomeDayMaxIncome: number
      maxIncomeDayEnforcement: 'off' | 'flexible' | 'hard'
      maxIncomeCalendarWeekMaxIncome: number
      maxIncomeCalendarWeekEnforcement: 'off' | 'flexible' | 'hard'
      maxIncomeRollingWeekMaxIncome: number
      maxIncomeRollingWeekEnforcement: 'off' | 'flexible' | 'hard'
      maxIncomeRollingWeekDirection: 'past' | 'centered' | 'future'
    }
  }
}

export interface UseCapacityConstraintsHandlersReturn {
  handleMaxWorkHoursDayMaxHours: (v: number | string) => void
  handleMaxWorkHoursDayEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleMaxIncomeDayMaxIncome: (v: number | string) => void
  handleMaxIncomeDayEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleMaxWorkHoursCalendarWeekMaxHours: (v: number | string) => void
  handleMaxWorkHoursCalendarWeekEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleMaxIncomeCalendarWeekMaxIncome: (v: number | string) => void
  handleMaxIncomeCalendarWeekEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleMaxWorkHoursRollingWeekMaxHours: (v: number | string) => void
  handleMaxWorkHoursRollingWeekEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleMaxWorkHoursRollingWeekDirection: (v: 'past' | 'centered' | 'future') => void
  handleMaxIncomeRollingWeekMaxIncome: (v: number | string) => void
  handleMaxIncomeRollingWeekEnforcement: (v: 'off' | 'flexible' | 'hard') => void
  handleMaxIncomeRollingWeekDirection: (v: 'past' | 'centered' | 'future') => void
}
