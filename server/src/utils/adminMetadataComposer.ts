/**
 * LEARNING: Unified Admin Metadata Composer Utility
 * WHY: Fetches and merges admin metadata (primitives + relationships)
 *      Follows entity pattern: single composer for unified metadata
 * PATTERN: Unified fetching for all metadata types
 * NOTE: Returns merged metadata as single Record (primitives + relationships together)
 */

import { AdminMetadata } from '../db/models/admin/adminMetadata.js';
import { Op } from 'sequelize';

/**
 * Field metadata entry (unified - works for both primitives and relationships)
 */
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

/**
 * Get admin metadata for an entity (primitives + relationships merged)
 * Instance entities fall back to global configs if no instance-specific metadata exists
 * 
 * LEARNING: Returns unified metadata as Record<fieldKey, FieldMetadataEntry>
 * WHY: Single structure for both primitives and relationships (matches entity pattern)
 * PATTERN: Fetch both metadata types, merge into single Record
 * NOTE: All entity types have completely independent metadata (no inheritance between shapes and instances)
 * 
 * @param entityType - Entity type: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance'
 * @param entityId - Entity ID or sentinel UUID for global configs
 * @param blockShapeRef - Optional BlockShape ID for BlockShape-specific instance metadata
 * @returns Record of field metadata entries (primitives + relationships merged)
 */
export async function getAdminMetadata(
  entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
  entityId: string,
  blockShapeRef?: string | null
): Promise<Record<string, Omit<FieldMetadataEntry, 'fieldKey'>>> {
  // Sentinel UUIDs for global configs
  const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
  const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
  const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
  const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

  // Build WHERE clause with blockShapeRef filtering for blockInstance
  const whereClause: any = {
    entityType: entityType,
    entityId: entityId,
  };

  // For blockInstance with blockShapeRef, filter by blockShapeRef
  // LEARNING: BlockShape-specific metadata uses sentinel UUID + blockShapeRef combination
  // WHY: Allows each BlockShape's instances to have their own metadata configuration
  // PATTERN: Filter by blockShapeRef when provided, fall back to NULL (global) if not found
  if (entityType === 'blockInstance' && blockShapeRef) {
    whereClause.blockShapeRef = blockShapeRef;
    console.log(`[getAdminMetadata] Filtering blockInstance metadata by blockShapeRef: ${blockShapeRef}`);
  } else if (entityType === 'blockInstance') {
    // For blockInstance without blockShapeRef, only get global config (blockShapeRef IS NULL)
    whereClause.blockShapeRef = { [Op.is]: null };
    console.log('[getAdminMetadata] Using global blockInstance metadata (blockShapeRef IS NULL)');
  }

  // Fetch all metadata for this entity (both primitives and relationships)
  const entityMetadata = await AdminMetadata.findAll({
    where: whereClause,
    order: [['display_order', 'ASC'], ['field_key', 'ASC']],
  });

  if (entityType === 'blockInstance') {
    console.log(`[getAdminMetadata] Found ${entityMetadata.length} metadata entries for blockInstance (entityId: ${entityId}, blockShapeRef: ${blockShapeRef || 'NULL'})`);
  }

  // If this is an instance entity, handle fallback to global config
  // LEARNING: Instances do NOT inherit fields from shapes - they have their own fields
  // WHY: blockInstance has fields like baseSqFt that don't exist in blockShape
  //      partInstance has fields that don't exist in partShape
  // PATTERN: Return instance metadata directly, fallback to global instance config if no instance-specific metadata
  if (entityType === 'blockInstance' || entityType === 'partInstance') {
    // For global instance configs with blockShapeRef, return metadata directly
    if (
      (entityType === 'partInstance' && entityId === PART_INSTANCE_GLOBAL_CONFIG_ID) ||
      (entityType === 'blockInstance' && entityId === BLOCK_INSTANCE_GLOBAL_CONFIG_ID)
    ) {
      // If we have blockShapeRef-specific metadata, return it
      if (entityMetadata.length > 0) {
        return buildMetadataRecord(entityMetadata);
      }
      
      // If no blockShapeRef-specific metadata and blockShapeRef was provided, fall back to global (NULL)
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
    
    // For non-sentinel instance entities, check if instance-specific metadata exists
    // If no instance-specific metadata, fall back to blockShapeRef-specific or global config
    if (entityMetadata.length === 0) {
      // Try blockShapeRef-specific metadata first (if blockShapeRef provided)
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
      
      // Fall back to global config (blockShapeRef = NULL)
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
    
    // Instance-specific metadata exists, return it directly (no inheritance)
    // Instances have their own fields, they don't inherit from shapes
    return buildMetadataRecord(entityMetadata);
  }

  // For shape entities, return entity metadata directly
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
