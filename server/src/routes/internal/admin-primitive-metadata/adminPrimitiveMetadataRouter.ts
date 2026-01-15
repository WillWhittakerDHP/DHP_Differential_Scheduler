/**
 * LEARNING: Admin Primitive Metadata Router
 * WHY: Unified API for admin primitive metadata (renamed from AdminInputMetadataRouter)
 *      Aligns with entity data pattern: primitives + relationships
 * PATTERN: Single router handles all entity types without special casing
 * NOTE: Supports inheritance - instance entities inherit from shapes
 */

import { Router, Request, Response } from 'express';
import { AdminPrimitiveMetadata } from '../../../db/models/admin/adminPrimitiveMetadata.js';
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js';
import { getAdminPrimitiveMetadata } from '../../../utils/adminPrimitiveMetadataComposer.js';

const router = Router();

/**
 * GET /admin-primitive-metadata/:entityType/:entityId
 * Get primitive metadata for an entity (with inheritance for instances)
 * Returns merged metadata: instance overrides + inherited shape metadata
 */
router.get('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    // Use composer to get metadata (handles inheritance)
    const metadata = await getAdminPrimitiveMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
      entityId
    );

    // Convert to Record format expected by client
    const metadataRecord: Record<string, Omit<typeof metadata[0], 'fieldKey'>> = {};
    for (const meta of metadata) {
      metadataRecord[meta.fieldKey] = {
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
        inheritsFromEntityType: meta.inheritsFromEntityType,
        inheritsFromEntityId: meta.inheritsFromEntityId,
      };
    }

    // TEMP: Debug logging to trace returned metadata keys
    console.log('[AdminPrimitiveMetadataRouter] Returning metadata', {
      entityType,
      entityId,
      returnedKeys: Object.keys(metadataRecord),
    });

    res.json(metadataRecord);
  } catch (error) {
    console.error('[AdminPrimitiveMetadataRouter] Error fetching metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch primitive metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /admin-primitive-metadata/:entityType/:entityId
 * Create or update primitive metadata for an entity
 * Body: { fieldKey, dataType, label, isRequired, visibility, layout, displayOrder, section?, renderAs?, statusButtonColor?, panel?, bulkEdit?, inputConfig? }
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

    // Validate renderAs - reject 'toggle' (removed from system)
    if (renderAs === 'toggle') {
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
    if (renderAs === 'select' || renderAs === 'multiselect' || renderAs === 'reference' || renderAs === 'partsCollection') {
      if (!inputConfig || typeof inputConfig !== 'object') {
        res.status(400).json({
          error: 'Missing inputConfig',
          message: `inputConfig is required when renderAs is "${renderAs}". ` +
            `Expected FormFieldConfig structure with relationshipSelect or typeSelect property, or direct select config.`,
        });
        return;
      }
    }

    // Check if entry already exists
    const existing = await AdminPrimitiveMetadata.findOne({
      where: {
        entityType: entityType as any,
        entityId: entityId,
        fieldKey: fieldKey,
      },
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
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
        inheritsFromEntityType,
        inheritsFromEntityId,
      });

      res.json(existing);
    } else {
      // Create new entry
      const metadata = await AdminPrimitiveMetadata.create({
        entityType: entityType as any,
        entityId: entityId,
        fieldKey,
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        section,
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
        inheritsFromEntityType,
        inheritsFromEntityId,
      });

      res.status(201).json(metadata);
    }
  } catch (error) {
    console.error('[AdminPrimitiveMetadataRouter] Error creating/updating metadata:', error);
    res.status(500).json({
      error: 'Failed to create/update primitive metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /admin-primitive-metadata/:entityType/:entityId/:fieldKey
 * Delete primitive metadata for a specific field
 */
router.delete('/:entityType/:entityId/:fieldKey', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, fieldKey } = req.params;

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    const metadata = await AdminPrimitiveMetadata.findOne({
      where: {
        entityType: entityType as any,
        entityId: entityId,
        fieldKey: fieldKey,
      },
    });

    if (!metadata) {
      res.status(404).json({
        error: 'Primitive metadata not found',
        entityType,
        entityId,
        fieldKey,
      });
      return;
    }

    await metadata.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('[AdminPrimitiveMetadataRouter] Error deleting metadata:', error);
    res.status(500).json({
      error: 'Failed to delete primitive metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
