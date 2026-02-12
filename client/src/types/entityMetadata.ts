/**
 * Re-export barrel for entity metadata types.
 * WHY: Types live in @/constants/fieldMetadata to break the fieldMetadata <-> entityMetadata cycle.
 * PATTERN: Consumers import from @/types/entityMetadata; no import path changes required.
 */

export type {
  EntityMetadataType,
  FieldMetadataEntry,
  FieldMetadata,
} from '@/constants/fieldMetadata'
