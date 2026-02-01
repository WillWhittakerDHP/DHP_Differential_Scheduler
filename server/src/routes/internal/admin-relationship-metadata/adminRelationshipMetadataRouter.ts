/**
 * LEARNING: Admin Relationship Metadata Router
 * WHY: Unified API for admin relationship metadata (parallel to adminInputMetadataRouter)
 * PATTERN: Single router handles all entity types without special casing
 * NOTE: Supports inheritance - instance entities inherit from shapes
 */

import { Router, Request, Response } from 'express';
import { AdminRelationshipMetadata } from '../../../db/models/admin/adminRelationshipMetadata.js';
import { getAdminRelationshipMetadata } from '../../../utils/adminRelationshipMetadataComposer.js';

const router = Router();

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

    const metadata = await getAdminRelationshipMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
      entityId
    );

    const metadataRecord: Record<string, Omit<typeof metadata[0], 'relationshipKey'>> = {};
    for (const meta of metadata) {
      metadataRecord[meta.relationshipKey] = {
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
      };
    }

    res.json(metadataRecord);
  } catch (error) {
    console.error('[AdminRelationshipMetadataRouter] Error fetching metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch relationship metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const {
      relationshipKey,
      dataType,
      label,
      isRequired = false,
      visibility,
      layout,
      displayOrder,
      renderAs = 'reference',
      statusButtonColor = null,
      panel = 'relationships',
      bulkEdit = false,
      inputConfig = null,
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
    if (!relationshipKey || !dataType || !label || visibility === undefined || !layout || displayOrder === undefined) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['relationshipKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'],
      });
      return;
    }

    // Validate inputConfig - required for select/multiselect/reference/partsCollection fields
    // LEARNING: Accepts both FormFieldConfig structure (new format) and direct select config (old format)
    // PATTERN: Validate that inputConfig exists and is an object, accept any valid JSONB structure
    if (renderAs === 'select' || renderAs === 'multiselect' || renderAs === 'reference' || renderAs === 'relationshipCollection') {
      if (!inputConfig || typeof inputConfig !== 'object') {
        res.status(400).json({
          error: 'Missing inputConfig',
          message: `inputConfig is required when renderAs is "${renderAs}". ` +
            `Expected FormFieldConfig structure with relationshipSelect property, or direct select config.`,
        });
        return;
      }
    }

    const existing = await AdminRelationshipMetadata.findOne({
      where: {
        entityType: entityType as any,
        entityId: entityId,
        relationshipKey: relationshipKey,
      },
    });

    if (existing) {
      await existing.update({
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
      });

      res.json(existing);
    } else {
      const metadata = await AdminRelationshipMetadata.create({
        entityType: entityType as any,
        entityId: entityId,
        relationshipKey,
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
      });

      res.status(201).json(metadata);
    }
  } catch (error) {
    console.error('[AdminRelationshipMetadataRouter] Error creating/updating metadata:', error);
    res.status(500).json({
      error: 'Failed to create/update relationship metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/:entityType/:entityId/:relationshipKey', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, relationshipKey } = req.params;

    const validEntityTypes = ['blockShape', 'partShape', 'blockInstance', 'partInstance'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: 'Invalid entityType',
        message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    const metadata = await AdminRelationshipMetadata.findOne({
      where: {
        entityType: entityType as any,
        entityId: entityId,
        relationshipKey: relationshipKey,
      },
    });

    if (!metadata) {
      res.status(404).json({
        error: 'Relationship metadata not found',
        entityType,
        entityId,
        relationshipKey,
      });
      return;
    }

    await metadata.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('[AdminRelationshipMetadataRouter] Error deleting metadata:', error);
    res.status(500).json({
      error: 'Failed to delete relationship metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
