import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { getFieldComponent } from '@/utils/forms/fieldComponentDispatcher'

export function isEntityCardRelationshipCollectionField(
  entityKey: GlobalEntityKey,
  fieldKey: GlobalFieldKey<GlobalEntityKey>,
  fieldMetadata: Record<string, FieldMetadataEntry> | undefined
): boolean {
  if (!fieldMetadata) return false
  const fieldMeta = fieldMetadata[String(fieldKey)]
  if (!fieldMeta) return false
  return getFieldComponent(entityKey, fieldKey, fieldMeta).type === 'relationshipCollection'
}
