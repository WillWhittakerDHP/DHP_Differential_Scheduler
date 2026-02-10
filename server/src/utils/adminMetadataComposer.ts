/**
 * LEARNING: Unified Admin Metadata Composer Utility
 * WHY: Fetches and merges admin metadata (primitives + relationships)
 *      Follows entity pattern: single composer for unified metadata
 * PATTERN: Unified fetching for all metadata types
 * NOTE: Returns merged metadata as single Record (primitives + relationships together)
 */

import { AdminMetadata } from '../db/models/admin/adminMetadata.js';
import { Op } from 'sequelize';

export interface FieldMetadataEntry {
  fieldKey: string;
  dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference';
  label: string;
  isRequired: boolean;
  visibility: 'titleRow' | 'staticAsTitle' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured';
  layout: 'inline' | 'stacked';
  displayOrder: number;
  renderAs: 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'relationshipCollection';
  statusButtonColor?: string | null;
  panel: 'none' | 'parts' | 'relationships' | 'annotations';
  bulkEdit: boolean;
  inputConfig?: Record<string, unknown> | null;
}

export async function getAdminMetadata(
  entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance',
  entityId: string,
  blockShapeRef?: string | null
): Promise<Record<string, Omit<FieldMetadataEntry, 'fieldKey'>>> {
  const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
  const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

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
      (entityType === 'partInstance' && entityId === PART_INSTANCE_GLOBAL_CONFIG_ID) ||
      (entityType === 'blockInstance' && entityId === BLOCK_INSTANCE_GLOBAL_CONFIG_ID)
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
            entityId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
            blockShapeRef: blockShapeRef,
          },
          order: [['display_order', 'ASC'], ['field_key', 'ASC']],
        });
        
        if (blockShapeSpecificMetadata.length > 0) {
          return buildMetadataRecord(blockShapeSpecificMetadata);
        }
      }
      
      const fallbackEntityId = entityType === 'blockInstance' 
        ? BLOCK_INSTANCE_GLOBAL_CONFIG_ID 
        : PART_INSTANCE_GLOBAL_CONFIG_ID;
      
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
 * Build metadata record from array of metadata entries
 * LEARNING: Convert array to Record format expected by client
 * WHY: Client expects Record<fieldKey, FieldMetadataEntry> structure
 * PATTERN: Map array to Record, exclude fieldKey from value (it's the key)
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
    panel: 'none' | 'parts' | 'relationships' | 'annotations';
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
