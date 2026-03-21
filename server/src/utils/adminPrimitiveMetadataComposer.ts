
import { AdminPrimitiveMetadata } from '../db/models/admin/adminPrimitiveMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import type { FieldMetadataEntry } from './adminMetadataComposer.js';
import { mapMetaFieldsToPayload } from './adminMetadataPayload.js';

export type { FieldMetadataEntry };

export async function getAdminPrimitiveMetadata(
  entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
  entityId: string
): Promise<FieldMetadataEntry[]> {
  const entityMetadata = await AdminPrimitiveMetadata.findAll({
    where: {
      entityType: entityType,
      entityId: entityId,
    },
    order: [['display_order', 'ASC'], ['field_key', 'ASC']],
  });

  // PATTERN: Return instance metadata directly, no inheritance merging
  if (entityType === 'blockInstance' || entityType === 'partInstance') {
    if (entityType === 'partInstance' && entityId === GLOBAL_CONFIG_IDS.PART_INSTANCE) {
      return entityMetadata.map(meta => ({
        fieldKey: meta.fieldKey,
        ...mapMetaFieldsToPayload(meta),
      }));
    }
    
    if (entityType === 'blockInstance' && entityId === GLOBAL_CONFIG_IDS.BLOCK_INSTANCE) {
      return entityMetadata.map(meta => ({
        fieldKey: meta.fieldKey,
        ...mapMetaFieldsToPayload(meta),
      }));
    }
    
    if (entityMetadata.length === 0) {
      const fallbackEntityId = entityType === 'blockInstance' 
        ? GLOBAL_CONFIG_IDS.BLOCK_INSTANCE 
        : GLOBAL_CONFIG_IDS.PART_INSTANCE;
      
      const fallbackMetadata = await AdminPrimitiveMetadata.findAll({
        where: {
          entityType: entityType,
          entityId: fallbackEntityId,
        },
        order: [['display_order', 'ASC'], ['field_key', 'ASC']],
      });
      
      return fallbackMetadata.map(meta => ({
        fieldKey: meta.fieldKey,
        ...mapMetaFieldsToPayload(meta),
      }));
    }
    
    return entityMetadata.map(meta => ({
      fieldKey: meta.fieldKey,
      ...mapMetaFieldsToPayload(meta),
    }));
  }

  return entityMetadata.map(meta => ({
    fieldKey: meta.fieldKey,
    ...mapMetaFieldsToPayload(meta),
    statusButtonColor: meta.statusButtonColor ?? null,
  }));
}
