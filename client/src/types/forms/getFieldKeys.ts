import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export interface GetFieldKeysOptions<GE extends GlobalEntityKey> {
  entity: Record<string, unknown> | null | undefined
  fieldMetadata?: Record<string, FieldMetadataEntry> | null
  entityKey: GE
}
