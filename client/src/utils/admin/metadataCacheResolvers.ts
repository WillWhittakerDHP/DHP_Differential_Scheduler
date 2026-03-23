/**
 * WHY: Pure metadata slice resolution (useMetadataCache length audit).
 */

import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { MetadataCache, MetadataEntityType } from '@/types/admin/metadataCache'
import { resolveBlockInstanceMetadataFromCache } from '@/utils/admin/resolveBlockInstanceMetadata'

export function resolveMetadataRecordForEntity(
  data: MetadataCache | undefined,
  entityType: MetadataEntityType,
  blockShapeRef?: string | null
): Record<string, FieldMetadataEntry> {
  if (!data) {
    return {}
  }

  if (entityType === 'blockInstance') {
    return resolveBlockInstanceMetadataFromCache(data, blockShapeRef ?? null)
  }

  const raw = data.global[entityType]
  return (raw !== undefined && raw !== null ? raw : {}) as Record<string, FieldMetadataEntry>
}
