/**
 * LEARNING: Admin Relationship Metadata Composer Utility
 * WHY: Fetches and merges admin relationship metadata
 * PATTERN: Parallel to adminInputMetadataComposer but for relationship fields
 * NOTE: Instance entities fall back to global configs if no instance-specific metadata exists
 *       All entity types have completely independent metadata (no inheritance between shapes and instances)
 */

import { AdminRelationshipMetadata } from '../db/models/admin/adminRelationshipMetadata.js';

export interface RelationshipMetadataEntry {
  relationshipKey: string;
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
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';
    
    if (entityType === 'partInstance' && entityId === PART_INSTANCE_GLOBAL_CONFIG_ID) {
      return entityMetadata.map(meta => ({
        relationshipKey: meta.relationshipKey,
        dataType: meta.dataType,
        label: meta.label,
        isRequired: meta.isRequired,
        visibility: meta.visibility,
        layout: meta.layout,
        displayOrder: meta.displayOrder,
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
      }));
    }
    
    if (entityType === 'blockInstance' && entityId === BLOCK_INSTANCE_GLOBAL_CONFIG_ID) {
      return entityMetadata.map(meta => ({
        relationshipKey: meta.relationshipKey,
        dataType: meta.dataType,
        label: meta.label,
        isRequired: meta.isRequired,
        visibility: meta.visibility,
        layout: meta.layout,
        displayOrder: meta.displayOrder,
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
      }));
    }
    
    if (entityMetadata.length === 0) {
      const fallbackEntityId = entityType === 'blockInstance' 
        ? BLOCK_INSTANCE_GLOBAL_CONFIG_ID 
        : PART_INSTANCE_GLOBAL_CONFIG_ID;
      
      const fallbackMetadata = await AdminRelationshipMetadata.findAll({
        where: {
          entityType: entityType,
          entityId: fallbackEntityId,
        },
        order: [['display_order', 'ASC'], ['relationship_key', 'ASC']],
      });
      
      return fallbackMetadata.map(meta => ({
        relationshipKey: meta.relationshipKey,
        dataType: meta.dataType,
        label: meta.label,
        isRequired: meta.isRequired,
        visibility: meta.visibility,
        layout: meta.layout,
        displayOrder: meta.displayOrder,
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
      }));
    }
    
    return entityMetadata.map(meta => ({
      relationshipKey: meta.relationshipKey,
      dataType: meta.dataType,
      label: meta.label,
      isRequired: meta.isRequired,
      visibility: meta.visibility,
      layout: meta.layout,
      displayOrder: meta.displayOrder,
      renderAs: meta.renderAs,
      statusButtonColor: meta.statusButtonColor,
      panel: meta.panel,
      bulkEdit: meta.bulkEdit,
      inputConfig: meta.inputConfig || null,
    }));
  }

  return entityMetadata.map(meta => ({
    relationshipKey: meta.relationshipKey,
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
  }));
}
