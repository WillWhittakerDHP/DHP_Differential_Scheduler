import type { DriveTimeApplyTo, ConstraintEnforcement, RollingWeekDirection } from '@/configs/availabilitySettings'
import type { CalendarProvider } from '@/configs/calendarSettings'
import { ROLLING_WEEK_DIRECTION } from '@shared/constants/availabilityConstants'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants'

export interface OptionItem<T = string> {
  title: string
  value: T
}

export const ENFORCEMENT_OPTIONS: OptionItem<ConstraintEnforcement>[] = [
  { title: 'Off', value: 'off' },
  { title: 'Flexible', value: 'flexible' },
  { title: 'Hard', value: 'hard' }
]

const ROLLING_WEEK_DIRECTION_VALUES_CORE = ROLLING_WEEK_DIRECTION

export const ROLLING_WEEK_DIRECTION_VALUES = ROLLING_WEEK_DIRECTION_VALUES_CORE

export const ROLLING_WEEK_DIRECTION_OPTIONS: OptionItem<RollingWeekDirection>[] = [
  { title: 'Past 7 days', value: ROLLING_WEEK_DIRECTION_VALUES_CORE.PAST },
  { title: 'Centered (3 before + day + 3 after)', value: ROLLING_WEEK_DIRECTION_VALUES_CORE.CENTERED },
  { title: 'Future 7 days', value: ROLLING_WEEK_DIRECTION_VALUES_CORE.FUTURE },
]

export const BUFFER_PLACEMENT_OPTIONS: OptionItem<'off' | 'before' | 'after' | 'both'>[] = [
  { title: 'Off', value: 'off' },
  { title: 'Before', value: 'before' },
  { title: 'After', value: 'after' },
  { title: 'Both', value: 'both' }
]

export const DRIVE_TIME_APPLY_TO_OPTIONS: OptionItem<DriveTimeApplyTo>[] = [
  { title: 'All Slots', value: 'all' },
  { title: 'Skip Day Start', value: 'skipDayStart' },
  { title: 'Skip Day End', value: 'skipDayEnd' },
  { title: 'None (Disabled)', value: 'none' }
]

export const ROUNDING_INCREMENT_OPTIONS: OptionItem<number>[] = [
  { title: '5 minutes', value: 5 },
  { title: '10 minutes', value: 10 },
  { title: '15 minutes', value: 15 },
  { title: '30 minutes', value: 30 },
  { title: '60 minutes', value: 60 }
]

export const ROUNDING_METHOD_OPTIONS: OptionItem<'roundUp' | 'roundDown' | 'roundNearest'>[] = [
  { title: 'Round Up', value: 'roundUp' },
  { title: 'Round Down', value: 'roundDown' },
  { title: 'Round Nearest', value: 'roundNearest' }
]

export const CALENDAR_PROVIDER_OPTIONS: OptionItem<CalendarProvider>[] = [
  { title: BUSINESS_RULES_UI.VALIDATION_NONE, value: 'none' },
  { title: 'Google Calendar', value: 'google' },
  { title: 'Microsoft Outlook', value: 'outlook' }
]
