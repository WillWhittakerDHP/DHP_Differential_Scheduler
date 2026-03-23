import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldLocation, FieldLocationContext } from '@/types/forms/fieldLocationDispatcher'
import { fieldLocationFromMetadata } from '@/utils/forms/fieldLocationFromMetadata'
import { groupFieldsByLocation as groupFieldsByLocationImpl } from '@/utils/forms/fieldLocationGrouping'

export type { FieldLocation, FieldLocationContext } from '@/types/forms/fieldLocationDispatcher'

export { determinePanelFromFieldKey } from '@/utils/forms/fieldPanelFromKey'

export function getFieldLocation<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry | undefined,
  context: FieldLocationContext
): FieldLocation {
  if (!fieldMetadata) {
    return { type: 'hidden', reason: 'notConfigured' }
  }
  return fieldLocationFromMetadata(fieldKey, fieldMetadata, context)
}

export const groupFieldsByLocation = groupFieldsByLocationImpl
