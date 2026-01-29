/**
 * Business Controls Tab UI Strings Configuration
 * 
 * LEARNING: Centralized UI strings for BusinessControlsTab component
 * WHY: Reduces hardcoding audit findings, centralizes all UI text for consistency
 * PATTERN: Single config object with all UI strings grouped by section
 */
export const BUSINESS_CONTROLS_TAB_STRINGS = {
  loading: 'Loading settings...',
  panels: {
    constraints: 'Constraints',
    businessHours: 'Business Hours',
    leadTimeConstraint: 'Lead Time Constraint',
    dateRangeConstraint: 'Date Range Constraint',
    perDayLimit: 'Per Day Limit',
    calendarWeekLimit: 'Calendar Week Limit (Monday-Sunday)',
    rollingWeekLimit: 'Rolling Week Limit (7-day window)',
    appointmentBuffers: 'Appointment Buffers',
    driveTimeBuffer: 'Drive Time Buffer',
    lunchBuffer: 'Lunch Buffer',
    calendar: 'Calendar'
  },
  labels: {
    startTime: 'Start Time',
    endTime: 'End Time',
    minimumLeadTime: 'Minimum Lead Time (minutes)',
    maximumHoursPerDay: 'Maximum Hours Per Day',
    maximumHoursPerWeek: 'Maximum Hours Per Week',
    maximumHours7Days: 'Maximum Hours (7 days)',
    enforcement: 'Enforcement',
    direction: 'Direction',
    bufferTime: 'Buffer Time (minutes)',
    placement: 'Placement',
    timeSlotIncrement: 'Time Slot Increment',
    timezone: 'Timezone'
  },
  validation: {
    startTimeRequired: 'Start time is required',
    endTimeRequired: 'End time is required',
    invalidTimeFormat: 'Invalid time format (HH:MM)',
    leadTimeRequired: 'Lead time is required',
    leadTimeMin: 'Lead time must be 0 or greater',
    mustBeZeroOrGreater: 'Must be 0 or greater',
    cannotExceed24Hours: 'Cannot exceed 24 hours',
    bufferTimeMin: 'Buffer time must be 0 or greater',
    timeIncrementRequired: 'Time increment is required',
    timezoneRequired: 'Timezone is required'
  },
  hints: {
    enforcement: 'Off: No filtering | Flexible: Block if limit already exceeded | Hard: Block if would exceed limit',
    direction: 'How the 7-day window is calculated relative to appointment date',
    bufferTime: 'Time to add around candidate appointments when checking availability',
    placement: 'Where to apply buffer time: Before (before start), After (after end), Both (before and after), Off (no buffer)',
    bufferEnforcement: 'How strictly to enforce buffer: Off (not applied), Flexible (warn), Hard (block)',
    timezone: 'Used for all availability calculations and time slot generation.'
  },
  help: {
    rangeConstraints: 'Range Constraints: Filter slots by when they can occur. Lead time prevents scheduling too close to current time. Date range sets absolute boundaries.',
    enforcement: 'Enforcement: Off = No filtering | Flexible = Block if limit already exceeded | Hard = Block if would exceed limit',
    placement: 'Placement: Off = No buffer | Before = Gap before | After = Gap after | Both = Gaps both sides. Enforcement: Off = Not applied | Flexible = Warn | Hard = Block',
    timeSlots: 'Time slots will be generated at intervals of',
    timezone: 'Business hours and time slots will be interpreted in the selected timezone.',
    currentSelection: 'Current selection:',
    notSet: 'Not set',
    leadTimeDescription: 'Appointments must be scheduled at least',
    leadTimeMinutes: 'minutes in advance',
    leadTimeHours: 'hours',
    leadTimeFilter: 'Lead time filters out slots that are too soon (before current time + lead time minutes)',
    dateRangeNotSetup: 'Not Set-up',
    dateRangeDescription: 'Date range constraints allow you to set absolute start and end boundaries for when appointments can be scheduled.',
    driveTimeNotSetup: 'Not Set-up',
    driveTimeDescription: 'Drive time buffers add travel time between appointments to prevent scheduling conflicts when appointments are at different locations.',
    lunchNotSetup: 'Not Set-up',
    lunchDescription: 'Lunch buffers block time for lunch breaks to prevent scheduling appointments during meal times.'
  },
  buttons: {
    saveSettings: 'Save Settings',
    resetToDefaults: 'Reset to Defaults'
  },
  tabs: {
    range: 'Range',
    capacity: 'Capacity',
    overlap: 'Overlap'
  }
} as const
