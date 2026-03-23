
import { AdminRelationshipMetadata } from '../db/models/admin/adminRelationshipMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes';
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js';
import { mapMetaFieldsToPayloadWithDecodedInput } from './adminMetadataPayload.js';
import { fetchRelationshipSelectOptionsByMetadataIds } from './adminPrimitiveRelationshipAssembly.js';

/** Extends shared MetadataEntryBase; relationship entries use relationshipKey (TYPE_SIMILARITY 1.11). */
export interface RelationshipMetadataEntry extends MetadataEntryBase {
  relationshipKey: string;
  panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
}

async function relationshipEntriesFromRows(rows: AdminRelationshipMetadata[]): Promise<RelationshipMetadataEntry[]> {
  const optionsMap = await fetchRelationshipSelectOptionsByMetadataIds(rows.map((m) => m.id))
  return rows.map((meta) => ({
    relationshipKey: meta.relationshipKey,
    ...mapMetaFieldsToPayloadWithDecodedInput(meta, optionsMap.get(meta.id)),
  }))
}

export async function getAdminRelationshipMetadata(
  entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
  entityId: string
): Promise<RelationshipMetadataEntry[]> {
  const entityMetadata = await AdminRelationshipMetadata.findAll({
    where: {
      entityType: entityType,
      entityId: entityId,
    },
    order: [['display_order', 'ASC'], ['relationship_key', 'ASC']],
  });

  // PATTERN: Return instance metadata directly, no inheritance merging
  if (entityType === 'blockInstance' || entityType === 'partInstance') {
    if (entityType === 'partInstance' && entityId === GLOBAL_CONFIG_IDS.PART_INSTANCE) {
      return relationshipEntriesFromRows(entityMetadata)
    }
    
    if (entityType === 'blockInstance' && entityId === GLOBAL_CONFIG_IDS.BLOCK_INSTANCE) {
      return relationshipEntriesFromRows(entityMetadata)
    }
    
    if (entityMetadata.length === 0) {
      const fallbackEntityId = entityType === 'blockInstance' 
        ? GLOBAL_CONFIG_IDS.BLOCK_INSTANCE 
        : GLOBAL_CONFIG_IDS.PART_INSTANCE;
      
      const fallbackMetadata = await AdminRelationshipMetadata.findAll({
        where: {
          entityType: entityType,
          entityId: fallbackEntityId,
        },
        order: [['display_order', 'ASC'], ['relationship_key', 'ASC']],
      });
      
      return relationshipEntriesFromRows(fallbackMetadata)
    }
    
    return relationshipEntriesFromRows(entityMetadata)
  }

  const entries = await relationshipEntriesFromRows(entityMetadata)
  return entries.map((e) => ({
    ...e,
    statusButtonColor: e.statusButtonColor ?? null,
  }))
}
