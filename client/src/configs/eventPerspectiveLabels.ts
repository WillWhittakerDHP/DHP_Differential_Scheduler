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

/**
 * Event perspective labels (display values)
 * LEARNING: Maps perspective keys to display labels
 * WHY: Single source of truth for perspective labels, eliminates hardcoded strings
 * PATTERN: Const object with perspective key → label mappings
 */
export const EVENT_PERSPECTIVE_LABELS = {
  major: 'Major',
  minor: 'Minor',
  nonDifferential: 'Non-Differential',
  other: 'Other',
  moveable: 'Moveable',
} as const

/**
 * Event perspective key type
 * LEARNING: Derived from EVENT_PERSPECTIVE_KEYS values
 * WHY: Type-safe perspective key references
 * PATTERN: typeof pattern for type extraction
 */
export type EventPerspectiveKey = typeof EVENT_PERSPECTIVE_KEYS[keyof typeof EVENT_PERSPECTIVE_KEYS]

/**
 * Get perspective label
 * LEARNING: Helper function to get label for a perspective key
 * WHY: Provides type-safe access to perspective labels
 * PATTERN: Simple lookup function
 */
export function getPerspectiveLabel(perspective: EventPerspectiveKey): string {
  return EVENT_PERSPECTIVE_LABELS[perspective]
}
