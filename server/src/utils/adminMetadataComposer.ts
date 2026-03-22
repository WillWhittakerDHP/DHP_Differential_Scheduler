
import { AdminMetadata } from '../db/models/admin/adminMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import { Op } from 'sequelize';
import {
  buildMetadataRecordFromRows,
  type FieldMetadataEntryAssembly,
} from './adminMetadataEntryAssembly.js';

/** Server batch entry: fieldKey + assembly fields. */
export interface FieldMetadataEntry extends FieldMetadataEntryAssembly {
  fieldKey: string;
}

export async function getAdminMetadata(
  entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance',
  entityId: string,
  blockShapeRef?: string | null
): Promise<Record<string, Omit<FieldMetadataEntry, 'fieldKey'>>> {
  // PATTERN: Query directly by entityType and entityId
  const whereClause: Record<string, unknown> = {
    entityType: entityType,
    entityId: entityId,
  };

  // PATTERN: Filter by blockShapeRef when provided, fall back to NULL (global) if not found
  if (entityType === 'blockInstance' && blockShapeRef) {
    whereClause.blockShapeRef = blockShapeRef;
  } else if (entityType === 'blockInstance') {
    whereClause.blockShapeRef = { [Op.is]: null };
  }

  const entityMetadata = await AdminMetadata.findAll({
    where: whereClause,
    order: [['display_order', 'ASC'], ['field_key', 'ASC']],
  });

  // PATTERN: Return instance metadata directly, fallback to global instance config if no instance-specific metadata
  if (entityType === 'blockInstance' || entityType === 'partInstance') {
    if (
      (entityType === 'partInstance' && entityId === GLOBAL_CONFIG_IDS.PART_INSTANCE) ||
      (entityType === 'blockInstance' && entityId === GLOBAL_CONFIG_IDS.BLOCK_INSTANCE)
    ) {
      if (entityMetadata.length > 0) {
        return buildMetadataRecordFromRows(entityMetadata);
      }
      
      if (blockShapeRef && entityType === 'blockInstance') {
        const globalMetadata = await AdminMetadata.findAll({
          where: {
            entityType: entityType,
            entityId: entityId,
            blockShapeRef: { [Op.is]: null },
          },
          order: [['display_order', 'ASC'], ['field_key', 'ASC']],
        });
        return buildMetadataRecordFromRows(globalMetadata);
      }
      
      return buildMetadataRecordFromRows(entityMetadata);
    }
    
    if (entityMetadata.length === 0) {
      if (blockShapeRef && entityType === 'blockInstance') {
        const blockShapeSpecificMetadata = await AdminMetadata.findAll({
          where: {
            entityType: entityType,
            entityId: GLOBAL_CONFIG_IDS.BLOCK_INSTANCE,
            blockShapeRef: blockShapeRef,
          },
          order: [['display_order', 'ASC'], ['field_key', 'ASC']],
        });
        
        if (blockShapeSpecificMetadata.length > 0) {
          return buildMetadataRecordFromRows(blockShapeSpecificMetadata);
        }
      }
      
      const fallbackEntityId = entityType === 'blockInstance' 
        ? GLOBAL_CONFIG_IDS.BLOCK_INSTANCE 
        : GLOBAL_CONFIG_IDS.PART_INSTANCE;
      
      const fallbackMetadata = await AdminMetadata.findAll({
        where: {
          entityType: entityType,
          entityId: fallbackEntityId,
          blockShapeRef: { [Op.is]: null },
        },
        order: [['display_order', 'ASC'], ['field_key', 'ASC']],
      });
      
      return buildMetadataRecordFromRows(fallbackMetadata);
    }
    
    return buildMetadataRecordFromRows(entityMetadata);
  }

  return buildMetadataRecordFromRows(entityMetadata);
}
