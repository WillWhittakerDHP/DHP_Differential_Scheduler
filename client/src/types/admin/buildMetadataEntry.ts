import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export interface BuildMetadataEntryOptions {
  key: string
  renderingUpdates: Partial<FieldMetadataEntry>
  existingMetadata: FieldMetadataEntry
  isRelationship?: boolean
}
