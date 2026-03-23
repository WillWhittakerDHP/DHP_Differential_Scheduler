import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { MetadataCache } from '@/types/admin/metadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { resolveBlockInstanceMetadataFromCache } from '@/utils/admin/resolveBlockInstanceMetadata'

export function resolveEntityFieldMetadataRecord<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: GlobalEntity<GE> | null,
  data: MetadataCache | null | undefined
): Record<string, FieldMetadataEntry> {
  if (!entity) {
    return {}
  }
  const entityType = getEntityTypeForMetadata(entityKey)
  if (!entityType) {
    return {}
  }
  if (!data) {
    return {}
  }
  if (entityType === 'blockInstance' && entityKey === 'blockInstance') {
    const blockInstanceEntity = entity as GlobalEntity<'blockInstance'>
    return resolveBlockInstanceMetadataFromCache(data, blockInstanceEntity.blockShapeRef)
  }
  const raw = data.global[entityType]
  return (raw !== undefined && raw !== null ? raw : {}) as Record<string, FieldMetadataEntry>
}
