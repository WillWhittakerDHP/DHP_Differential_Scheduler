/**
 * Metadata editor props base (P3 type-similarity)
 *
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
