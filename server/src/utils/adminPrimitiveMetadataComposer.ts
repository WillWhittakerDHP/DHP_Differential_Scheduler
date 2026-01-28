/**
 * LEARNING: Admin Primitive Metadata Composer Utility
 * WHY: Fetches and merges admin primitive metadata
 *      Renamed from adminInputMetadataComposer to align with entity data pattern
 * PATTERN: Unified fetching for all entity types
 * NOTE: Aligns with displayConfig.primitives pattern from regular entity data
 *       All entity types have completely independent metadata (no inheritance between shapes and instances)
 */

import { AdminPrimitiveMetadata } from '../db/models/admin/adminPrimitiveMetadata.js';
import { QueryTypes, Op } from 'sequelize';

/**
 * Field metadata entry (matches client-side FieldMetadataEntry)
 */
export interface FieldMetadataEntry {
  fieldKey: string;
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'reference';
  label: string;
  isRequired: boolean;
  visibility: 'titleRow' | 'staticAsTitle' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured';
  layout: 'inline' | 'stacked';
  displayOrder: number;
  section: string | null;
  renderAs: 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'partsCollection';
  statusButtonColor?: string | null;
  panel: 'none' | 'parts' | 'relationships' | 'annotations';
  bulkEdit: boolean;
  inputConfig?: Record<string, unknown> | null;
  inheritsFromEntityType?: 'blockShape' | 'partShape' | null;
  inheritsFromEntityId?: string | null;
}

/**
 * Get admin primitive metadata for an entity
 * Instance entities fall back to global configs if no instance-specific metadata exists
 * 
 * NOTE: All entity types have completely independent metadata (no inheritance between shapes and instances)
 * 
 * @param entityType - Entity type: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance'
 * @param entityId - Entity ID or sentinel UUID for global configs
 * @returns Array of field metadata entries
 */
export async function getAdminPrimitiveMetadata(
  entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
  entityId: string
): Promise<FieldMetadataEntry[]> {
  // Fetch metadata for this entity
  const entityMetadata = await AdminPrimitiveMetadata.findAll({
    where: {
      entityType: entityType,
      entityId: entityId,
    },
    order: [['display_order', 'ASC'], ['field_key', 'ASC']],
  });

  // If this is an instance entity, handle metadata
  // LEARNING: Instances do NOT inherit fields from shapes - they have their own fields
  // WHY: blockInstance has fields like baseSqFt that don't exist in blockShape
  //      partInstance has fields that don't exist in partShape
  // PATTERN: Return instance metadata directly, no inheritance merging
  if (entityType === 'blockInstance' || entityType === 'partInstance') {
    // Check if this is a global config sentinel UUID
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';
    
    // For global instance configs, return metadata directly without inheritance
    if (entityType === 'partInstance' && entityId === PART_INSTANCE_GLOBAL_CONFIG_ID) {
      return entityMetadata.map(meta => ({
        fieldKey: meta.fieldKey,
        dataType: meta.dataType,
        label: meta.label,
        isRequired: meta.isRequired,
        visibility: meta.visibility,
        layout: meta.layout,
        displayOrder: meta.displayOrder,
        section: meta.section,
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
        inheritsFromEntityType: meta.inheritsFromEntityType || null,
        inheritsFromEntityId: meta.inheritsFromEntityId || null,
      }));
    }
    
    // For global blockInstance config, return metadata directly without inheritance
    if (entityType === 'blockInstance' && entityId === BLOCK_INSTANCE_GLOBAL_CONFIG_ID) {
      return entityMetadata.map(meta => ({
        fieldKey: meta.fieldKey,
        dataType: meta.dataType,
        label: meta.label,
        isRequired: meta.isRequired,
        visibility: meta.visibility,
        layout: meta.layout,
        displayOrder: meta.displayOrder,
        section: meta.section,
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
        inheritsFromEntityType: meta.inheritsFromEntityType || null,
        inheritsFromEntityId: meta.inheritsFromEntityId || null,
      }));
    }
    
    // For non-sentinel instance entities, check if instance-specific metadata exists
    // If no instance-specific metadata, fall back to global config
    if (entityMetadata.length === 0) {
      // No instance-specific metadata found, fall back to global config
      const fallbackEntityId = entityType === 'blockInstance' 
        ? BLOCK_INSTANCE_GLOBAL_CONFIG_ID 
        : PART_INSTANCE_GLOBAL_CONFIG_ID;
      
      const fallbackMetadata = await AdminPrimitiveMetadata.findAll({
        where: {
          entityType: entityType,
          entityId: fallbackEntityId,
        },
        order: [['display_order', 'ASC'], ['field_key', 'ASC']],
      });
      
      return fallbackMetadata.map(meta => ({
        fieldKey: meta.fieldKey,
        dataType: meta.dataType,
        label: meta.label,
        isRequired: meta.isRequired,
        visibility: meta.visibility,
        layout: meta.layout,
        displayOrder: meta.displayOrder,
        section: meta.section,
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
        inheritsFromEntityType: meta.inheritsFromEntityType || null,
        inheritsFromEntityId: meta.inheritsFromEntityId || null,
      }));
    }
    
    // Instance-specific metadata exists, return it directly (no inheritance)
    // Instances have their own fields, they don't inherit from shapes
    return entityMetadata.map(meta => ({
      fieldKey: meta.fieldKey,
      dataType: meta.dataType,
      label: meta.label,
      isRequired: meta.isRequired,
      visibility: meta.visibility,
      layout: meta.layout,
      displayOrder: meta.displayOrder,
      section: meta.section,
      renderAs: meta.renderAs,
      statusButtonColor: meta.statusButtonColor,
      panel: meta.panel,
      bulkEdit: meta.bulkEdit,
      inputConfig: meta.inputConfig || null,
      inheritsFromEntityType: meta.inheritsFromEntityType || null,
      inheritsFromEntityId: meta.inheritsFromEntityId || null,
    }));
  }

  // For shape entities, return entity metadata directly
  return entityMetadata.map(meta => ({
    fieldKey: meta.fieldKey,
    dataType: meta.dataType,
    label: meta.label,
    isRequired: meta.isRequired,
    visibility: meta.visibility,
    layout: meta.layout,
    displayOrder: meta.displayOrder,
    section: meta.section,
    renderAs: meta.renderAs,
    statusButtonColor: meta.statusButtonColor || null,
    panel: meta.panel,
    bulkEdit: meta.bulkEdit,
    inputConfig: meta.inputConfig || null,
    inheritsFromEntityType: meta.inheritsFromEntityType || null,
    inheritsFromEntityId: meta.inheritsFromEntityId || null,
  }));
}
