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
  /** Shown below the divider until the user picks Yes or No on the contingency question. */
  ANSWER_CONTINGENCY_PROMPT: 'Choose Yes or No above to see completion times (if applicable).',
  DEADLINE_DATE: 'Deadline Date',
  DEADLINE_TIME: 'Deadline Time',
  /** Shown while minimizer bounds compute before deadline pickers mount. */
  PREPARING_DEADLINE_BOUNDS: 'Preparing earliest allowed deadline…',
  AVAILABLE_COMPLETION_TIMES: 'Available Completion Times',
  CHOOSE_DAY: 'Choose a day',
  PREV: 'Prev',
  NEXT: 'Next',
  NO_DAY_SELECTED: 'No day selected',
  TODAY: 'Today',
  TOMORROW: 'Tomorrow',
  PROVIDE_DEADLINE:
    'Choose a deadline date and time above to see available completion times (no default time is applied).',
  SELECT_COMPLETION_TIME: "Select when you'd like the minimizer work to be completed (first option is earliest).",
  LOADING_DAY_SLOTS: 'Loading times for this day...',
  NO_SLOTS_FOR_DAY: 'No available time slots found for this day.',
  NO_SLOTS_HINT: 'Pick another day or adjust your contingency deadline.',
} as const

/** Default when Admin Wizard setting `minimizerNoFeasibleCompletionSlotsMessage` is empty. */
export const DEFAULT_MINIMIZER_NO_FEASIBLE_COMPLETION_SLOTS_MESSAGE =
  'No completion times are available that meet your deadline. Try a different onsite time, a later deadline, or another day for minimizer work.'
