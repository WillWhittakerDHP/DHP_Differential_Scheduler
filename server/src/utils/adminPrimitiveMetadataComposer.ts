
import { AdminPrimitiveMetadata } from '../db/models/admin/adminPrimitiveMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import type { FieldMetadataEntry } from './adminMetadataComposer.js';
import { mapMetaFieldsToPayload } from './adminMetadataPayload.js';
import { decodeInputConfig, icColumnsFromModel } from './adminMetadataInputConfigCodec.js';
import { fetchPrimitiveSelectOptionsByMetadataIds } from './adminPrimitiveRelationshipAssembly.js';
import { nilToEmptyArray } from '@shared/utils/nilDefaults.js';

export type { FieldMetadataEntry };

async function fieldEntriesFromPrimitiveRows(rows: AdminPrimitiveMetadata[]): Promise<FieldMetadataEntry[]> {
  const optionsMap = await fetchPrimitiveSelectOptionsByMetadataIds(rows.map((m) => m.id))
  return rows.map((meta) => ({
    fieldKey: meta.fieldKey,
    ...mapMetaFieldsToPayload({
      dataType: meta.dataType,
      label: meta.label,
      isRequired: meta.isRequired,
      visibility: meta.visibility,
      layout: meta.layout,
      displayOrder: meta.displayOrder,
      renderAs: meta.renderAs,
      statusButtonColor: meta.statusButtonColor ?? undefined,
      panel: meta.panel,
      bulkEdit: meta.bulkEdit,
      inputConfig: decodeInputConfig(icColumnsFromModel(meta), nilToEmptyArray(optionsMap.get(meta.id))),
    }),
  }))
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
      return fieldEntriesFromPrimitiveRows(entityMetadata)
    }
    
    if (entityType === 'blockInstance' && entityId === GLOBAL_CONFIG_IDS.BLOCK_INSTANCE) {
      return fieldEntriesFromPrimitiveRows(entityMetadata)
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
      
      return fieldEntriesFromPrimitiveRows(fallbackMetadata)
    }
    
    return fieldEntriesFromPrimitiveRows(entityMetadata)
  }

  const entries = await fieldEntriesFromPrimitiveRows(entityMetadata)
  return entries.map((e) => ({
    ...e,
    statusButtonColor: e.statusButtonColor ?? null,
  }))
}
