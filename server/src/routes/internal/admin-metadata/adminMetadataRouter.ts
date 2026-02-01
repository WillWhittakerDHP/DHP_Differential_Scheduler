/**
 * LEARNING: Unified Admin Metadata Router
 * WHY: Single API endpoint for all metadata (primitives + relationships)
 *      Follows entity pattern: single endpoint/table, backend routes based on field type
 * PATTERN: Single router handles all metadata types, backend determines metadataType by checking RELATIONSHIP_KEYS
 * NOTE: Backend routes based on fieldKey type (matches entity pattern where backend routes based on field type)
 */

import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { AdminMetadata } from '../../../db/models/admin/adminMetadata.js';
import { getAdminMetadata } from '../../../utils/adminMetadataComposer.js';
import { isRelationshipKey } from '../../../constants/relationships.js';

const router = Router();

/**
 * LEARNING: Sentinel UUIDs for global configuration metadata
 * WHY: Global configs use fixed UUIDs to identify entity-type-wide metadata
 * PATTERN: Same constants used on frontend and backend for consistency
 */
const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

router.get('/batch', async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('[AdminMetadataRouter] GET /admin-metadata/batch');

    const allMetadata = await AdminMetadata.findAll({
      order: [['display_order', 'ASC'], ['field_key', 'ASC']],
    });

    const result: {
      global: {
        blockShape: Record<string, unknown>;
        partShape: Record<string, unknown>;
        blockInstance: Record<string, unknown>;
        partInstance: Record<string, unknown>;
        eventShape: Record<string, unknown>;
        eventInstance: Record<string, unknown>;
        annotationShape: Record<string, unknown>;
        annotationInstance: Record<string, unknown>;
      };
      blockShapeSpecific: Record<string, Record<string, unknown>>;
    } = {
      global: {
        blockShape: {},
        partShape: {},
        blockInstance: {},
        partInstance: {},
        eventShape: {},
        eventInstance: {},
        annotationShape: {},
        annotationInstance: {},
      },
      blockShapeSpecific: {},
    };

    for (const entry of allMetadata) {
      const entityType = entry.entityType as keyof typeof result.global;
      const fieldKey = entry.fieldKey;
      const blockShapeRef = entry.blockShapeRef;

      const metadataEntry = {
        dataType: entry.dataType,
        label: entry.label,
        isRequired: entry.isRequired,
        visibility: entry.visibility,
        layout: entry.layout,
        displayOrder: entry.displayOrder,
        renderAs: entry.renderAs,
        statusButtonColor: entry.statusButtonColor,
        panel: entry.panel,
        bulkEdit: entry.bulkEdit,
        inputConfig: entry.inputConfig,
      };

      if (entityType === 'blockInstance' && blockShapeRef) {
        if (!result.blockShapeSpecific[blockShapeRef]) {
          result.blockShapeSpecific[blockShapeRef] = {};
        }
        result.blockShapeSpecific[blockShapeRef][fieldKey] = metadataEntry;
      } else {
        if (result.global[entityType]) {
          result.global[entityType][fieldKey] = metadataEntry;
        }
      }
    }

    console.log(`[AdminMetadataRouter] Batch returning: global counts = blockShape:${Object.keys(result.global.blockShape).length}, partShape:${Object.keys(result.global.partShape).length}, blockInstance:${Object.keys(result.global.blockInstance).length}, partInstance:${Object.keys(result.global.partInstance).length}, eventShape:${Object.keys(result.global.eventShape).length}, eventInstance:${Object.keys(result.global.eventInstance).length}, annotationShape:${Object.keys(result.global.annotationShape).length}, annotationInstance:${Object.keys(result.global.annotationInstance).length}, blockShapeSpecific:${Object.keys(result.blockShapeSpecific).length}`);

    res.json(result);
  } catch (error) {
    console.error('[AdminMetadataRouter] Error fetching batch metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch batch metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const blockShapeRef = req.query.blockShapeRef as string | undefined;

    console.log(`[AdminMetadataRouter] GET /admin-metadata/${entityType}/${entityId}`, {
      blockShapeRef: blockShapeRef || null,
    });

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance', 'eventShape', 'eventInstance', 'annotationShape', 'annotationInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    const metadataRecord = await getAdminMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance',
      entityId,
      blockShapeRef || null
    );

    console.log(`[AdminMetadataRouter] Returning ${Object.keys(metadataRecord).length} metadata entries`);

    res.json(metadataRecord);
  } catch (error) {
    console.error('[AdminMetadataRouter] Error fetching metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /admin-metadata/:entityType/:entityId
 * Create or update metadata for an entity
 * Body: { fieldKey, dataType, label, isRequired, visibility, layout, displayOrder, renderAs?, statusButtonColor?, panel?, bulkEdit?, inputConfig? }
 * 
 * LEARNING: Backend determines metadataType by checking if fieldKey is in RELATIONSHIP_KEYS
 * WHY: Matches entity pattern - backend routes based on field type (no explicit type parameter from frontend)
 * PATTERN: Frontend sends fieldKey, backend checks RELATIONSHIP_KEYS to set metadataType
 */
router.post('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const {
      fieldKey,
      dataType,
      label,
      isRequired = false,
      visibility,
      layout,
      displayOrder,
      renderAs = 'text',
      statusButtonColor = null,
      panel = 'none',
      bulkEdit = false,
      inputConfig = null,
      blockShapeRef = null, // NEW: BlockShape ID for BlockShape-specific instance metadata
    } = req.body;

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance', 'eventShape', 'eventInstance', 'annotationShape', 'annotationInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    // Validate required fields
    if (!fieldKey || !dataType || !label || visibility === undefined || !layout || displayOrder === undefined) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['fieldKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'],
      });
      return;
    }

    // LEARNING: Backend determines metadataType by checking RELATIONSHIP_KEYS (matches entity pattern)
    // PATTERN: Check if fieldKey is in RELATIONSHIP_KEYS to determine metadataType
    const metadataType = isRelationshipKey(fieldKey) ? 'relationship' : 'primitive';

    const defaultRenderAs = metadataType === 'relationship' ? 'reference' : 'text';
    const finalRenderAs = renderAs || defaultRenderAs;

    const defaultPanel = metadataType === 'relationship' ? 'relationships' : 'none';
    const finalPanel = panel || defaultPanel;

    // Validate renderAs - reject 'toggle' (removed from system)
    if (finalRenderAs === 'toggle') {
      res.status(400).json({
        error: 'Invalid renderAs',
        message: 'renderAs "toggle" is not supported. Use "statusButton" for boolean toggle fields or "text" for regular boolean inputs.',
      });
      return;
    }

    // Validate inputConfig - required for select/multiselect/reference/relationshipCollection fields
    // LEARNING: Accepts both FormFieldConfig structure (new format) and direct select config (old format)
    // PATTERN: Validate that inputConfig exists and is an object, accept any valid JSONB structure
    if (finalRenderAs === 'select' || finalRenderAs === 'multiselect' || finalRenderAs === 'reference' || finalRenderAs === 'relationshipCollection') {
      if (!inputConfig || typeof inputConfig !== 'object') {
        res.status(400).json({
          error: 'Missing inputConfig',
          message: `inputConfig is required when renderAs is "${finalRenderAs}". ` +
            `Expected FormFieldConfig structure with relationshipSelect or typeSelect property, or direct select config.`,
        });
        return;
      }
    }

    // PATTERN: When saving blockInstance metadata with blockShapeRef, use BLOCK_INSTANCE_GLOBAL_CONFIG_ID as entityId
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';
    const finalEntityId = (entityType === 'blockInstance' && blockShapeRef) 
      ? BLOCK_INSTANCE_GLOBAL_CONFIG_ID 
      : entityId;
    const finalBlockShapeRef = (entityType === 'blockInstance' && blockShapeRef) 
      ? blockShapeRef 
      : null;

    console.log(`[AdminMetadataRouter] POST /admin-metadata/${entityType}/${entityId}`, {
      fieldKey,
      blockShapeRef: finalBlockShapeRef || null,
      finalEntityId,
    });

    const existingWhere: any = {
      entityType: entityType as any,
      entityId: finalEntityId,
      metadataType: metadataType as any,
      fieldKey: fieldKey,
    };
    
    if (entityType === 'blockInstance') {
      existingWhere.blockShapeRef = finalBlockShapeRef;
    } else {
      existingWhere.blockShapeRef = { [Op.is]: null };
    }

    const existing = await AdminMetadata.findOne({
      where: existingWhere,
    });

    if (existing) {
      await existing.update({
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs: finalRenderAs,
        statusButtonColor,
        panel: finalPanel,
        bulkEdit,
        inputConfig,
        blockShapeRef: finalBlockShapeRef,
      });

      res.json(existing);
    } else {
      const metadata = await AdminMetadata.create({
        entityType: entityType as any,
        entityId: finalEntityId,
        metadataType: metadataType as any,
        fieldKey,
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs: finalRenderAs,
        statusButtonColor,
        panel: finalPanel,
        bulkEdit,
        inputConfig,
        blockShapeRef: finalBlockShapeRef,
      });

      res.status(201).json(metadata);
    }
  } catch (error) {
    console.error('[AdminMetadataRouter] Error creating/updating metadata:', error);
    res.status(500).json({
      error: 'Failed to create/update metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/:entityType/:entityId/:fieldKey', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, fieldKey } = req.params;
    const blockShapeRef = req.query.blockShapeRef as string | undefined;

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance', 'eventShape', 'eventInstance', 'annotationShape', 'annotationInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    // LEARNING: Backend determines metadataType by checking RELATIONSHIP_KEYS (matches entity pattern)
    // PATTERN: Check if fieldKey is in RELATIONSHIP_KEYS to determine metadataType
    const metadataType = isRelationshipKey(fieldKey) ? 'relationship' : 'primitive';

    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';
    const finalEntityId = (entityType === 'blockInstance' && blockShapeRef) 
      ? BLOCK_INSTANCE_GLOBAL_CONFIG_ID 
      : entityId;
    const finalBlockShapeRef = (entityType === 'blockInstance' && blockShapeRef) 
      ? blockShapeRef 
      : null;

    const whereClause: any = {
      entityType: entityType as any,
      entityId: finalEntityId,
      metadataType: metadataType as any,
      fieldKey: fieldKey,
    };

    if (entityType === 'blockInstance') {
      whereClause.blockShapeRef = finalBlockShapeRef;
    } else {
      whereClause.blockShapeRef = { [Op.is]: null };
    }

    const metadata = await AdminMetadata.findOne({
      where: whereClause,
    });

    if (!metadata) {
      res.status(404).json({
        error: 'Metadata not found',
        entityType,
        entityId,
        fieldKey,
        metadataType,
      });
      return;
    }

    await metadata.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('[AdminMetadataRouter] Error deleting metadata:', error);
    res.status(500).json({
      error: 'Failed to delete metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
