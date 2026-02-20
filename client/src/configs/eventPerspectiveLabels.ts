/**
 * Event Perspective Labels Configuration
 * 
 * LEARNING: Config-driven labels for event perspectives instead of hardcoded strings
 * WHY: Eliminates hardcoded perspective labels, enables easier maintenance and i18n
 * PATTERN: Const object with perspective labels, similar to entityDisplayText.ts
 */

/**
 * Event perspective keys (logic values)
 * LEARNING: Constants for perspective keys used in logic
 * WHY: Eliminates hardcoded string literals in code
 * PATTERN: Const object with perspective key values
 */
export const EVENT_PERSPECTIVE_KEYS = {
  MAJOR: 'major',
  MINOR: 'minor',
  NON_DIFFERENTIAL: 'nonDifferential',
  OTHER: 'other',
  MOVEABLE: 'moveable',
} as const

