import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { SubPanelKey } from '@/constants/fieldMetadata'

export function determinePanelFromFieldKey(fieldKey: string): 'none' | SubPanelKey {
  if (fieldKey in RELATIONSHIP_KEYS) {
    if (fieldKey === RELATIONSHIP_KEYS.partAssignments.frontendKey) {
      return 'parts'
    }
    if (fieldKey === RELATIONSHIP_KEYS.validPartCascades.frontendKey) {
      return 'parts'
    }
    if (fieldKey === RELATIONSHIP_KEYS.annotationAssignments.frontendKey) {
      return FIELD_NAMES.ANNOTATIONS
    }
    if (fieldKey === RELATIONSHIP_KEYS.validAnnotationAssignments.frontendKey) {
      return FIELD_NAMES.ANNOTATIONS
    }
    if (fieldKey === RELATIONSHIP_KEYS.eventAssignments.frontendKey) {
      return 'events'
    }
    if (fieldKey === RELATIONSHIP_KEYS.validEventCascades.frontendKey) {
      return 'events'
    }
    // Vertical same-shape packaging — Composite flag, not Orchestrator.
    if (fieldKey === RELATIONSHIP_KEYS.instanceComponents.frontendKey) {
      return 'composition'
    }
    return 'relationships'
  }

  return 'none'
}
