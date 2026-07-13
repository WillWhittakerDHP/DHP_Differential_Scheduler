/**
 * Full select inputConfig shapes for code-first metadata (Feature 20.6.1.1).
 * WHY: useSelectConfig / selectTypeResolver require selectMode, candidateChildKey, etc.;
 * bare `{ targetMode: 'relationship' }` throws at runtime.
 */
import { selectableDisplayBlockInstanceSection } from '@/configs/field/display/selectableDisplayConfigBlockInstance'
import { selectableDisplayBlockShapeSection } from '@/configs/field/display/selectableDisplayConfigBlockShape'
import { selectableDisplayPartsAndPlaceholderSection } from '@/configs/field/display/selectableDisplayConfigPartsAndPlaceholders'
import {
  ENTITY_KEY_BLOCK_INSTANCE,
  ENTITY_KEY_BLOCK_SHAPE,
  ENTITY_KEY_PART_INSTANCE,
  ENTITY_KEY_PART_SHAPE,
} from '@/constants/entities'

const SELECT_INPUT_KEYS = [
  'targetMode',
  'targetKey',
  'globalField',
  'selectedParentKey',
  'selectedChildKey',
  'selectedChildPath',
  'candidateParentKey',
  'candidateParentPath',
  'candidateChildKey',
  'candidateChildPath',
  'selectType',
  'selectMode',
  'groupByKey',
  'filterCandidates',
] as const

function pickSelectInputConfig(src: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of SELECT_INPUT_KEYS) {
    if (k in src && src[k] !== undefined) {
      out[k] = src[k]
    }
  }
  return out
}

const blockInstanceDisplay = selectableDisplayBlockInstanceSection[ENTITY_KEY_BLOCK_INSTANCE]
const blockShapeDisplay = selectableDisplayBlockShapeSection[ENTITY_KEY_BLOCK_SHAPE]
const partInstanceDisplay = selectableDisplayPartsAndPlaceholderSection[ENTITY_KEY_PART_INSTANCE]
const partShapeDisplay = selectableDisplayPartsAndPlaceholderSection[ENTITY_KEY_PART_SHAPE]

/** Baseline admin_metadata JSON for eventShape.attendeeAssignments (server 20260320 baseline_data). */
export const EVENT_SHAPE_ATTENDEE_ASSIGNMENTS_INPUT_CONFIG: Record<string, unknown> = {
  targetKey: 'attendeeAssignments',
  selectMode: 'multiple',
  selectType: 'attendeeSelect',
  targetMode: 'relationship',
  globalField: 'attendees',
  placeholder: 'No attendees selected',
  filterCandidates: { blockShape: { semanticType: 'user' } },
  selectedChildKey: 'blockInstance',
  candidateChildKey: 'blockInstance',
  selectedChildPath: ['attendees'],
  selectedParentKey: 'eventShape',
  candidateChildPath: [],
  candidateParentKey: 'eventShape',
  candidateParentPath: [],
}

/** partInstance.eventAssignments — aligned with migration 20260431_000029 (groupBy eventShapeRef). */
export const PART_INSTANCE_EVENT_ASSIGNMENTS_INPUT_CONFIG: Record<string, unknown> = {
  targetKey: 'eventAssignments',
  groupByKey: 'eventShapeRef',
  selectMode: 'multiple',
  selectType: 'eventAssignmentSelect',
  targetMode: 'relationship',
  globalField: 'eventAssignments',
  placeholder: 'No events selected',
  selectedChildKey: 'eventInstance',
  candidateChildKey: 'eventInstance',
  selectedChildPath: ['eventAssignments'],
  selectedParentKey: 'partInstance',
  candidateChildPath: [],
  candidateParentKey: 'partShape',
  candidateParentPath: ['partShapeRef'],
}

export const codeFirstBlockInstanceSelectInputs = {
  blockShapeRef: pickSelectInputConfig(blockInstanceDisplay.blockShapeRef as Record<string, unknown>),
  bookingCascades: pickSelectInputConfig(blockInstanceDisplay.bookingCascades as Record<string, unknown>),
  partAssignments: pickSelectInputConfig(blockInstanceDisplay.partAssignments as Record<string, unknown>),
  annotationAssignments: pickSelectInputConfig(blockInstanceDisplay.annotationAssignments as Record<string, unknown>),
  eventAssignments: pickSelectInputConfig(blockInstanceDisplay.eventAssignments as Record<string, unknown>),
  instanceComponents: pickSelectInputConfig(blockInstanceDisplay.instanceComponents as Record<string, unknown>),
} as const

export const codeFirstBlockShapeSelectInputs = {
  validBookingCascades: pickSelectInputConfig(blockShapeDisplay.validBookingCascades as Record<string, unknown>),
  validPartCascades: pickSelectInputConfig(blockShapeDisplay.validPartCascades as Record<string, unknown>),
  validAnnotationAssignments: pickSelectInputConfig(
    blockShapeDisplay.validAnnotationAssignments as Record<string, unknown>
  ),
  validEventCascades: pickSelectInputConfig(blockShapeDisplay.validEventCascades as Record<string, unknown>),
} as const

export const codeFirstPartInstanceSelectInputs = {
  partShapeRef: pickSelectInputConfig(partInstanceDisplay.partShapeRef as Record<string, unknown>),
  pricingCascades: pickSelectInputConfig(partInstanceDisplay.pricingCascades as Record<string, unknown>),
} as const

export const codeFirstPartShapeSelectInputs = {
  validPricingCascades: pickSelectInputConfig(partShapeDisplay.validPricingCascades as Record<string, unknown>),
} as const
