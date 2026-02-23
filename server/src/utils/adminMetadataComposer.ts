/**
 *      Follows entity pattern: single composer for unified metadata
 * NOTE: Returns merged metadata as single Record (primitives + relationships together)
 */

import { AdminMetadata } from '../db/models/admin/adminMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js';
import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes';
import { Op } from 'sequelize';

/** Extends shared MetadataEntryBase; server includes fieldKey (TYPE_SIMILARITY 1.11). */
export interface FieldMetadataEntry extends MetadataEntryBase {
  fieldKey: string;
  panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
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
        return buildMetadataRecord(entityMetadata);
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
        return buildMetadataRecord(globalMetadata);
      }
      
      return buildMetadataRecord(entityMetadata);
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
          return buildMetadataRecord(blockShapeSpecificMetadata);
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
      
      return buildMetadataRecord(fallbackMetadata);
    }
    
    return buildMetadataRecord(entityMetadata);
  }

  return buildMetadataRecord(entityMetadata);
}


/**
 * WHY: Build metadata record from array of metadata entries
LEARNING: Convert a...
 */
function buildMetadataRecord(
  metadata: Array<{
    fieldKey: string;
    dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference';
    label: string;
    isRequired: boolean;
    visibility: 'titleRow' | 'staticAsTitle' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured';
    layout: 'inline' | 'stacked';
    displayOrder: number;
    renderAs: 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'relationshipCollection';
    statusButtonColor?: string | null;
    panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
    bulkEdit: boolean;
    inputConfig?: Record<string, unknown> | null;
  }>
): Record<string, Omit<FieldMetadataEntry, 'fieldKey'>> {
  const metadataRecord: Record<string, Omit<FieldMetadataEntry, 'fieldKey'>> = {};
  
  for (const meta of metadata) {
    metadataRecord[meta.fieldKey] = {
      dataType: meta.dataType,
      label: meta.label,
      isRequired: meta.isRequired,
      visibility: meta.visibility,
      layout: meta.layout,
      displayOrder: meta.displayOrder,
      renderAs: meta.renderAs,
      statusButtonColor: meta.statusButtonColor || null,
      panel: meta.panel,
      bulkEdit: meta.bulkEdit,
      inputConfig: meta.inputConfig || null,
    };
  }
  
  return metadataRecord;
}
