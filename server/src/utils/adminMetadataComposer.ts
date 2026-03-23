import { AdminMetadata } from '../db/models/admin/adminMetadata.js';
import { GLOBAL_CONFIG_IDS } from '../routes/internal/admin-metadata/adminMetadataConstants.js';
import { Op, type Order } from 'sequelize';
import {
  buildMetadataRecordFromRows,
  type FieldMetadataEntryAssembly,
} from './adminMetadataEntryAssembly.js';

/** Server batch entry: fieldKey + assembly fields. */
export interface FieldMetadataEntry extends FieldMetadataEntryAssembly {
  fieldKey: string;
}

type EntityTypeKey =
  | 'blockShape'
  | 'partShape'
  | 'blockInstance'
  | 'partInstance'
  | 'eventShape'
  | 'eventInstance'
  | 'annotationShape'
  | 'annotationInstance';

type MetadataRecord = Record<string, Omit<FieldMetadataEntry, 'fieldKey'>>;

const adminMetadataOrder: Order = [
  ['display_order', 'ASC'],
  ['field_key', 'ASC'],
];

function addBlockShapeToWhereClause(
  whereClause: Record<string, unknown>,
  entityType: EntityTypeKey,
  blockShapeRef?: string | null
): void {
  if (entityType !== 'blockInstance') {
    return;
  }
  if (blockShapeRef) {
    whereClause.blockShapeRef = blockShapeRef;
    return;
  }
  whereClause.blockShapeRef = { [Op.is]: null };
}

function isGlobalInstanceTemplate(entityType: EntityTypeKey, entityId: string): boolean {
  return (
    (entityType === 'partInstance' && entityId === GLOBAL_CONFIG_IDS.PART_INSTANCE) ||
    (entityType === 'blockInstance' && entityId === GLOBAL_CONFIG_IDS.BLOCK_INSTANCE)
  );
}

async function resolveGlobalTemplateMetadata(
  entityType: 'blockInstance' | 'partInstance',
  entityId: string,
  blockShapeRef: string | null | undefined,
  entityMetadata: InstanceType<typeof AdminMetadata>[]
): Promise<MetadataRecord> {
  if (entityMetadata.length > 0) {
    return buildMetadataRecordFromRows(entityMetadata);
  }

  if (blockShapeRef && entityType === 'blockInstance') {
    const globalMetadata = await AdminMetadata.findAll({
      where: {
        entityType,
        entityId,
        blockShapeRef: { [Op.is]: null },
      },
      order: adminMetadataOrder,
    });
    return buildMetadataRecordFromRows(globalMetadata);
  }

  return buildMetadataRecordFromRows(entityMetadata);
}

async function resolveInstanceMetadataWhenEmpty(
  entityType: 'blockInstance' | 'partInstance',
  blockShapeRef: string | null | undefined
): Promise<MetadataRecord> {
  if (blockShapeRef && entityType === 'blockInstance') {
    const blockShapeSpecificMetadata = await AdminMetadata.findAll({
      where: {
        entityType,
        entityId: GLOBAL_CONFIG_IDS.BLOCK_INSTANCE,
        blockShapeRef,
      },
      order: adminMetadataOrder,
    });

    if (blockShapeSpecificMetadata.length > 0) {
      return buildMetadataRecordFromRows(blockShapeSpecificMetadata);
    }
  }

  const fallbackEntityId =
    entityType === 'blockInstance' ? GLOBAL_CONFIG_IDS.BLOCK_INSTANCE : GLOBAL_CONFIG_IDS.PART_INSTANCE;

  const fallbackMetadata = await AdminMetadata.findAll({
    where: {
      entityType,
      entityId: fallbackEntityId,
      blockShapeRef: { [Op.is]: null },
    },
    order: adminMetadataOrder,
  });

  return buildMetadataRecordFromRows(fallbackMetadata);
}

export async function getAdminMetadata(
  entityType: EntityTypeKey,
  entityId: string,
  blockShapeRef?: string | null
): Promise<MetadataRecord> {
  const whereClause: Record<string, unknown> = {
    entityType,
    entityId,
  };

  addBlockShapeToWhereClause(whereClause, entityType, blockShapeRef);

  const entityMetadata = await AdminMetadata.findAll({
    where: whereClause,
    order: adminMetadataOrder,
  });

  if (entityType !== 'blockInstance' && entityType !== 'partInstance') {
    return buildMetadataRecordFromRows(entityMetadata);
  }

  if (isGlobalInstanceTemplate(entityType, entityId)) {
    return resolveGlobalTemplateMetadata(entityType, entityId, blockShapeRef, entityMetadata);
  }

  if (entityMetadata.length === 0) {
    return resolveInstanceMetadataWhenEmpty(entityType, blockShapeRef);
  }

  return buildMetadataRecordFromRows(entityMetadata);
}
