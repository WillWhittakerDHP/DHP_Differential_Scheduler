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
 * GET /admin-metadata/:entityType/:entityId
 * Get unified metadata for an entity (primitives + relationships merged)
 * Returns merged metadata for the specified entity type
 * NOTE: All entity types have completely independent metadata (no inheritance between shapes and instances)
 */
router.get('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const blockShapeRef = req.query.blockShapeRef as string | undefined;

    console.log(`[AdminMetadataRouter] GET /admin-metadata/${entityType}/${entityId}`, {
      blockShapeRef: blockShapeRef || null,
    });

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    // Use unified composer to get metadata (returns merged primitives + relationships)
    // LEARNING: Pass blockShapeRef to composer for BlockShape-specific instance metadata filtering
    // WHY: Allows each BlockShape's instances to have their own metadata configuration
    // NOTE: All entity types have completely independent metadata (no inheritance between shapes and instances)
    const metadataRecord = await getAdminMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
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
 * Body: { fieldKey, dataType, label, isRequired, visibility, layout, displayOrder, section?, renderAs?, statusButtonColor?, panel?, bulkEdit?, inputConfig? }
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
      section = null,
      renderAs = 'text',
      statusButtonColor = null,
      panel = 'none',
      bulkEdit = false,
      inputConfig = null,
      inheritsFromEntityType = null,
      inheritsFromEntityId = null,
      blockShapeRef = null, // NEW: BlockShape ID for BlockShape-specific instance metadata
    } = req.body;

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance'];
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
    // WHY: Frontend doesn't need to know type - backend routes based on fieldKey type
    // PATTERN: Check if fieldKey is in RELATIONSHIP_KEYS to determine metadataType
    const metadataType = isRelationshipKey(fieldKey) ? 'relationship' : 'primitive';

    // Set default renderAs based on metadataType (relationships default to 'reference')
    const defaultRenderAs = metadataType === 'relationship' ? 'reference' : 'text';
    const finalRenderAs = renderAs || defaultRenderAs;

    // Set default panel based on metadataType (relationships default to 'relationships')
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

    // Validate inputConfig - required for select/multiselect/reference/partsCollection fields
    // LEARNING: Accepts both FormFieldConfig structure (new format) and direct select config (old format)
    // WHY: Supports backward compatibility during transition
    // PATTERN: Validate that inputConfig exists and is an object, accept any valid JSONB structure
    if (finalRenderAs === 'select' || finalRenderAs === 'multiselect' || finalRenderAs === 'reference' || finalRenderAs === 'partsCollection') {
      if (!inputConfig || typeof inputConfig !== 'object') {
        res.status(400).json({
          error: 'Missing inputConfig',
          message: `inputConfig is required when renderAs is "${finalRenderAs}". ` +
            `Expected FormFieldConfig structure with relationshipSelect or typeSelect property, or direct select config.`,
        });
        return;
      }
    }

    // LEARNING: For blockInstance with blockShapeRef, use sentinel UUID + blockShapeRef combination
    // WHY: BlockShape-specific metadata is stored with global config ID + blockShapeRef
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

    // Check if entry already exists (using metadataType + fieldKey + blockShapeRef)
    const existingWhere: any = {
      entityType: entityType as any,
      entityId: finalEntityId,
      metadataType: metadataType as any,
      fieldKey: fieldKey,
    };
    
    // Include blockShapeRef in WHERE clause (NULL for non-blockInstance or when not provided)
    if (entityType === 'blockInstance') {
      existingWhere.blockShapeRef = finalBlockShapeRef;
    } else {
      existingWhere.blockShapeRef = { [Op.is]: null };
    }

    const existing = await AdminMetadata.findOne({
      where: existingWhere,
    });

    if (existing) {
      // Update existing entry
      await existing.update({
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        section,
        renderAs: finalRenderAs,
        statusButtonColor,
        panel: finalPanel,
        bulkEdit,
        inputConfig,
        inheritsFromEntityType,
        inheritsFromEntityId,
        blockShapeRef: finalBlockShapeRef,
      });

      res.json(existing);
    } else {
      // Create new entry
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
        section,
        renderAs: finalRenderAs,
        statusButtonColor,
        panel: finalPanel,
        bulkEdit,
        inputConfig,
        inheritsFromEntityType,
        inheritsFromEntityId,
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

/**
 * DELETE /admin-metadata/:entityType/:entityId/:fieldKey
 * Delete metadata for a specific field
 * 
 * LEARNING: Backend determines metadataType by checking if fieldKey is in RELATIONSHIP_KEYS
 * WHY: Matches entity pattern - backend routes based on field type
 * PATTERN: Frontend sends fieldKey, backend checks RELATIONSHIP_KEYS to determine metadataType
 */
router.delete('/:entityType/:entityId/:fieldKey', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, fieldKey } = req.params;
    const blockShapeRef = req.query.blockShapeRef as string | undefined;

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    // LEARNING: Backend determines metadataType by checking RELATIONSHIP_KEYS (matches entity pattern)
    // WHY: Frontend doesn't need to know type - backend routes based on fieldKey type
    // PATTERN: Check if fieldKey is in RELATIONSHIP_KEYS to determine metadataType
    const metadataType = isRelationshipKey(fieldKey) ? 'relationship' : 'primitive';

    // LEARNING: For blockInstance with blockShapeRef, use sentinel UUID + blockShapeRef combination
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

    // Include blockShapeRef in WHERE clause
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
