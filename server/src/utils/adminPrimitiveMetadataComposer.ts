/**
 * LEARNING: Admin Primitive Metadata Composer Utility
 * WHY: Fetches and merges admin primitive metadata
 *      Renamed from adminInputMetadataComposer to align with entity data pattern
 * PATTERN: Unified fetching for all entity types
 * NOTE: Aligns with displayConfig.primitives pattern from regular entity data
 *       All entity types have completely independent metadata (no inheritance between shapes and instances)
 */

import { AdminPrimitiveMetadata } from '../db/models/admin/adminPrimitiveMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js';

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
  panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
  bulkEdit: boolean;
  inputConfig?: Record<string, unknown> | null;
}

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
        fieldKey: meta.fieldKey,
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
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
      }));
    }
    
    return entityMetadata.map(meta => ({
      fieldKey: meta.fieldKey,
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
    fieldKey: meta.fieldKey,
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
