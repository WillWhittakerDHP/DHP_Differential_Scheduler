import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

/** Entity + metadata passed into BulkEditModal (single prop to stay under component prop-count governance). */
export interface BulkEditModalContent {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  fieldMetadata: Record<string, FieldMetadataEntry>
}

/** Title, body copy, and count for Apply button (single prop). */
export interface BulkEditModalLabels {
  title: string
  description: string
  instanceCount: number
}
