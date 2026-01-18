/**
 * Composable for EntityCard readiness checks and context retrieval
 * WHY: Extracts readiness check and context retrieval logic from components
 * PATTERN: Helper functions that work with EntityCard template refs
 */

import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'
import EntityCard from '@/components/admin/generic/EntityCard.vue'

type EntityCardInstance = InstanceType<typeof EntityCard>

/**
 * Check if EntityCard is ready for a specific instance
 * WHY: Need to know if field contexts are available before rendering
 * PATTERN: Pure function that checks EntityCard readiness state
 */
export function isEntityCardReady<GE extends GlobalEntityKey>(
  instance: GlobalEntity<GE>,
  entityCardRefs: Map<string, EntityCardInstance>
): boolean {
  const instanceId = String(instance.id)
  const entityCard = entityCardRefs.get(instanceId)
  if (!entityCard) {
    return false
  }
  return entityCard.isMetadataReady === true && entityCard.isFormReady === true
}

/**
 * Get field context for a specific instance and field
 * WHY: Need field contexts for accessing field values or other purposes
 * PATTERN: Access field context from EntityCard via template ref
 * NOTE: Only returns context if EntityCard is ready (metadata loaded, form ready)
 */
export function getFieldContextForInstance<GE extends GlobalEntityKey>(
  instance: GlobalEntity<GE>,
  fieldKey: GlobalFieldKey<GE>,
  entityCardRefs: Map<string, EntityCardInstance>
): FieldContextType<GE, GlobalFieldKey<GE>> | undefined {
  if (!isEntityCardReady(instance, entityCardRefs)) {
    return undefined
  }
  
  const instanceId = String(instance.id)
  const entityCard = entityCardRefs.get(instanceId)
  if (!entityCard) {
    return undefined
  }
  
  return entityCard.getFieldContext(fieldKey) as FieldContextType<GE, GlobalFieldKey<GE>> | undefined
}

/**
 * Get field context for a part instance using formFields map
 * WHY: Part instances use a different pattern (formFields map instead of EntityCard refs)
 * PATTERN: Look up pre-created field context from formFields map
 */
export function getFieldContextForPartInstance<GE extends GlobalEntityKey>(
  instance: GlobalEntity<GE>,
  fieldKey: GlobalFieldKey<GE>,
  formFieldsMap: Map<string, { getFieldContext: (key: GlobalFieldKey<GE>) => FieldContextType<GE, GlobalFieldKey<GE>> | undefined }>
): FieldContextType<GE, GlobalFieldKey<GE>> | undefined {
  const instanceId = String(instance.id)
  const formFields = formFieldsMap.get(instanceId)
  if (!formFields) {
    return undefined
  }
  return formFields.getFieldContext(fieldKey)
}

/**
 * Export as object for easier usage
 */
export const useEntityCardReadiness = {
  isEntityCardReady,
  getFieldContextForInstance,
  getFieldContextForPartInstance
}
