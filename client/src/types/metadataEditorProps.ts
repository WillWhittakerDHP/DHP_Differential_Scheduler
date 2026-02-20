/**
 * Metadata editor props base (P3 type-similarity)
 *
 * LEARNING: Shared props for metadata editor components.
 * WHY: AdminPrimitiveMetadataEditor and MetadataEditModal share entityKey, entity, blockShapeRef.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

/** Base props shared by AdminPrimitiveMetadataEditor and MetadataEditModal. */
export interface MetadataEditorPropsBase {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  /** Optional BlockShape ID for BlockShape-specific instance metadata. */
  blockShapeRef?: string
}
