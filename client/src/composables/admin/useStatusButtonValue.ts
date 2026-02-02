/**
 * Composable for status button value extraction
 * WHY: Extracts value extraction logic from ShapesTab
 * PATTERN: Pure helper function
 */

import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useStatusButtonValue')

export function getStatusButtonBooleanValue<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: GlobalEntity<GE>,
  fieldKey: GlobalFieldKey<GE>
): boolean {
  const keyStr = String(fieldKey)
  const entityRecord = entity as unknown as Record<string, unknown>
  const fieldValue = entityRecord[keyStr]

  if (fieldValue === undefined) {
    logger.error('Status button field configured in metadata but missing on entity', {
      entityKey,
      fieldKey: keyStr,
      entityId: entity.id
    })
    return false
  }

  return fieldValue === true || fieldValue === 1 || fieldValue === 'true'
}

export const useStatusButtonValue = {
  getStatusButtonBooleanValue
}
