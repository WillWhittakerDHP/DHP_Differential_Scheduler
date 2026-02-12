import { ENTITY_STATUS } from '@/constants/entityFieldConstants'

/**
 * State-specific display labels for admin status buttons.
 * WHY: Status buttons show the current state (e.g. ENTITY_STATUS.ACTIVE vs ENTITY_STATUS.INACTIVE) instead of a static label.
 * PATTERN: Used by BooleanInput to compute displayLabel from normalizedValue.
 */

export const STATUS_BUTTON_LABELS: Record<
  string,
  { true: string; false: string; override?: string }
> = {
  active: { true: ENTITY_STATUS.ACTIVE, false: ENTITY_STATUS.INACTIVE },
  composite: { true: 'Composite', false: 'Atomic' },
  differential: {
    true: 'Differential',
    false: 'Flat',
    override: 'Override'
  },
  allowMultiple: { true: 'Allow Multiple', false: 'Single' },
  requiresUnitNumber: { true: 'Unit Number', false: 'No Unit Number' },
  composable: { true: 'Composable', false: 'Fixed' },
  canHaveParts: { true: 'Has Parts', false: 'No Parts' },
  isStateControl: { true: 'State Control', false: 'Not State Control' },
  zeroOutPart: { true: 'Zero Out', false: 'Keep Value' },
  isTernary: { true: 'Ternary', false: 'Binary' },
  major: { true: 'Major', false: 'Not Major', override: 'Override' },
  minor: { true: 'Minor', false: 'Not Minor', override: 'Override' }
}
