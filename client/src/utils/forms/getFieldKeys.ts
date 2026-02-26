
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GetFieldKeysOptions } from '@/types/forms/getFieldKeys'

export type { GetFieldKeysOptions } from '@/types/forms/getFieldKeys'

const SYSTEM_FIELDS = [
  FIELD_NAMES.ID,
  FIELD_NAMES.ENTITY_KEY,
  FIELD_NAMES.ORDER_INDEX,
  FIELD_NAMES.CREATED_AT,
  FIELD_NAMES.UPDATED_AT,
  FIELD_NAMES.ANNOTATIONS,
] as const

export function getFieldKeys<GE extends GlobalEntityKey>(
  options: GetFieldKeysOptions<GE>
): GlobalFieldKey<GE>[] {
  const { entity, fieldMetadata } = options

  // WHY: Entity object has all field keys as properties, no need to wait for metadata
  // PATTERN: Extract keys from entity, filter out non-field properties and system fields
  const entityKeys = entity ? Object.keys(entity).filter(key => {
    // PATTERN: Filter out known system/special fields to prevent "Unknown input type" warnings
    return !(SYSTEM_FIELDS as readonly string[]).includes(key)
  }) as GlobalFieldKey<GE>[] : []

  // LEARNING: If metadata is available, use it as source of truth for which fields to include
  // PATTERN: Prefer metadata keys if available, otherwise use entity keys
  if (fieldMetadata && Object.keys(fieldMetadata).length > 0) {
    const metadataKeys = Object.keys(fieldMetadata) as GlobalFieldKey<GE>[]
    return metadataKeys
  }

  // PATTERN: Use entity keys immediately, metadata will update when it loads
  return entityKeys
}
