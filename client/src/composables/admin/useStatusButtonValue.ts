/**
 * Composable for status button value extraction
 * WHY: Extracts value extraction logic from ShapesTab
 * PATTERN: Pure helper function
 */

import type { GlobalEntity, GlobalEntityKey } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

/**
 * Get status button boolean value from entity
 * LEARNING: Read status-button booleans directly from the entity
 * WHY: Metadata may include fields that don't exist on an entity record yet (migration in progress)
 * PATTERN: Log missing property errors explicitly and default to false (visible failure, not silent filtering)
 */
export function getStatusButtonBooleanValue<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: GlobalEntity<GE>,
  fieldKey: GlobalFieldKey<GE>
): boolean {
  const keyStr = String(fieldKey)
  const entityRecord = entity as unknown as Record<string, unknown>
  const fieldValue = entityRecord[keyStr]

  if (fieldValue === undefined) {
    console.error(
      `[StatusButton] Status button field '${keyStr}' is configured in metadata for ${entityKey} but missing on entity. ` +
      `Entity ID: ${entity.id}. Defaulting to false.`
    )
    return false
  }

  return fieldValue === true || fieldValue === 1 || fieldValue === 'true'
}

/**
 * Export as object for easier destructuring
 */
export const useStatusButtonValue = {
  getStatusButtonBooleanValue
}
