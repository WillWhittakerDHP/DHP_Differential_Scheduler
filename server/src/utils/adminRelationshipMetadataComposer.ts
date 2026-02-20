/**
 * LEARNING: Admin Relationship Metadata Composer Utility
 * WHY: Fetches and merges admin relationship metadata
 * PATTERN: Parallel to adminInputMetadataComposer but for relationship fields
 * NOTE: Instance entities fall back to global configs if no instance-specific metadata exists
 *       All entity types have completely independent metadata (no inheritance between shapes and instances)
 */

import { AdminRelationshipMetadata } from '../db/models/admin/adminRelationshipMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes';
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js';
import { mapMetaFieldsToPayload } from './adminMetadataPayload.js';

/** Extends shared MetadataEntryBase; relationship entries use relationshipKey (TYPE_SIMILARITY 1.11). */
export interface RelationshipMetadataEntry extends MetadataEntryBase {
  relationshipKey: string;
  panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
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
      return entityMetadata.map(meta => ({
        relationshipKey: meta.relationshipKey,
        ...mapMetaFieldsToPayload(meta),
      }));
    }
    
    if (entityType === 'blockInstance' && entityId === GLOBAL_CONFIG_IDS.BLOCK_INSTANCE) {
      return entityMetadata.map(meta => ({
        relationshipKey: meta.relationshipKey,
        ...mapMetaFieldsToPayload(meta),
      }));
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
      
      return fallbackMetadata.map(meta => ({
        relationshipKey: meta.relationshipKey,
        ...mapMetaFieldsToPayload(meta),
      }));
    }
    
    return entityMetadata.map(meta => ({
      relationshipKey: meta.relationshipKey,
      ...mapMetaFieldsToPayload(meta),
    }));
  }

  return entityMetadata.map(meta => ({
    relationshipKey: meta.relationshipKey,
    ...mapMetaFieldsToPayload(meta),
    statusButtonColor: meta.statusButtonColor ?? null,
  }));
}
