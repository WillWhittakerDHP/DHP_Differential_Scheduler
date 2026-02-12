/**
 * LEARNING: Admin Relationship Metadata Composer Utility
 * WHY: Fetches and merges admin relationship metadata
 * PATTERN: Parallel to adminInputMetadataComposer but for relationship fields
 * NOTE: Instance entities fall back to global configs if no instance-specific metadata exists
 *       All entity types have completely independent metadata (no inheritance between shapes and instances)
 */

import { AdminRelationshipMetadata } from '../db/models/admin/adminRelationshipMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js';

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
  panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
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
    if (entityType === 'partInstance' && entityId === GLOBAL_CONFIG_IDS.PART_INSTANCE) {
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
    
    if (entityType === 'blockInstance' && entityId === GLOBAL_CONFIG_IDS.BLOCK_INSTANCE) {
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
