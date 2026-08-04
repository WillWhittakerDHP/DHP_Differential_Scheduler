import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import { ENTITY_STATUS } from '@/constants/entityFieldConstants'

/**
 * WHY: State-specific display labels for admin status buttons
 */
export const STATUS_BUTTON_LABELS: Record<
  string,
  { true: string; false: string; override?: string }
> = {
  active: { true: ENTITY_STATUS.ACTIVE, false: ENTITY_STATUS.INACTIVE },
  composite: { true: 'Composite', false: 'Atomic' },
  orchestrator: { true: 'Orchestrator', false: 'Not orchestrator' },
  accumulator: { true: 'Accumulator', false: 'Not accumulator' },
  allowMultiple: { true: 'Allow Multiple', false: 'Single' },
  requiresUnitNumber: { true: 'Unit Number', false: 'No Unit Number' },
  preClosing: { true: 'Pre-closing', false: 'Not pre-closing' },
  isMultiFamily: { true: 'Multi-family', false: 'Single-family' },
  requiresAgent: { true: 'Requires agent', false: 'No agent required' },
  zeroOutPart: { true: 'Zero Out', false: 'Keep Value' },
  major: { true: 'Major', false: 'Not Major', override: APPOINTMENTS_TABLE_UI.OVERRIDE_CONSTRAINTS },
  minor: { true: 'Minor', false: 'Not Minor', override: APPOINTMENTS_TABLE_UI.OVERRIDE_CONSTRAINTS }
}
