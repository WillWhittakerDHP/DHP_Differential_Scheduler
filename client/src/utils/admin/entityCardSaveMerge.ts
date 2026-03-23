/**
 * Merge form values into entity payload for admin card save.
 * WHY: Extract branchy save prep from useEntityCardActions for complexity audit.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { ValidAdminValue } from '@/constants/primitives'

export function mergeEntityValuesForCardSave(
  entityKey: GlobalEntityKey,
  entityVal: Record<string, ValidAdminValue>,
  formValues: Record<string, ValidAdminValue>,
  contentRows: unknown
): Record<string, ValidAdminValue> {
  const entityToSave = {
    ...entityVal,
    ...formValues,
  } as Record<string, ValidAdminValue>

  if (entityKey === 'annotationInstance' && Array.isArray(contentRows)) {
    entityToSave.contentRows = contentRows as ValidAdminValue
  }

  return entityToSave
}
