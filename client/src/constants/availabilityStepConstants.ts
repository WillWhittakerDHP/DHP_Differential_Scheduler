/**
 * Constants for availability step UI (hardcoding-audit: extract field mappings and UI strings).
 */

/** CSS class for slot grid when overlay is shown (fieldMapping extraction). */
export const SLOT_GRID_WRAPPER_OVERLAY_CLASS = 'slot-grid-wrapper--overlay'

/** UI strings for availability sub-step content. */
export const AVAILABILITY_SUBSTEP_UI = {
  SELECT_DATE_PLACEHOLDER: 'Select a date from the calendar to see available time slots',
  CALCULATING_TIMES: 'Calculating available times...',
  CONTINGENCY_DEADLINE: 'Contingency Deadline',
  CONTINGENCY_QUESTION: 'Do you have a deadline for when this work needs to be completed?',
  CONTINGENCY_YES: 'Yes',
  CONTINGENCY_NO: 'No',
  DEADLINE_DATE: 'Deadline Date',
  DEADLINE_TIME: 'Deadline Time',
  AVAILABLE_COMPLETION_TIMES: 'Available Completion Times',
  CHOOSE_DAY: 'Choose a day',
  PREV: 'Prev',
  NEXT: 'Next',
  NO_DAY_SELECTED: 'No day selected',
  TODAY: 'Today',
  TOMORROW: 'Tomorrow',
  PROVIDE_DEADLINE: 'Provide a deadline date above to see available completion times.',
  SELECT_COMPLETION_TIME: "Select when you'd like the moveable work to be completed (first option is earliest).",
  LOADING_DAY_SLOTS: 'Loading times for this day...',
  NO_SLOTS_FOR_DAY: 'No available time slots found for this day.',
  NO_SLOTS_HINT: 'Pick another day or adjust your contingency deadline.',
} as const
