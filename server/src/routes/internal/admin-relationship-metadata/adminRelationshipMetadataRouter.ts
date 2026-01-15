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

/**
 * GET /admin-relationship-metadata/:entityType/:entityId
 * Get relationship metadata for an entity (with inheritance for instances)
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
    const metadata = await getAdminRelationshipMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
      entityId
    );

    // Convert to Record format expected by client
    // Map relationshipKey to fieldKey for consistency with field metadata structure
    const metadataRecord: Record<string, Omit<typeof metadata[0], 'relationshipKey'>> = {};
    for (const meta of metadata) {
      metadataRecord[meta.relationshipKey] = {
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

    res.json(metadataRecord);
  } catch (error) {
    console.error('[AdminRelationshipMetadataRouter] Error fetching metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch relationship metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /admin-relationship-metadata/:entityType/:entityId
 * Create or update relationship metadata for an entity
 * Body: { relationshipKey, dataType, label, isRequired, visibility, layout, displayOrder, section?, renderAs?, statusButtonColor?, panel?, bulkEdit?, inputConfig? }
 */
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
      section = null,
      renderAs = 'reference',
      statusButtonColor = null,
      panel = 'relationships',
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
    if (!relationshipKey || !dataType || !label || visibility === undefined || !layout || displayOrder === undefined) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['relationshipKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'],
      });
      return;
    }

    // Validate inputConfig - required for select/multiselect/reference fields
    if (renderAs === 'select' || renderAs === 'multiselect' || renderAs === 'reference') {
      if (!inputConfig || typeof inputConfig !== 'object') {
        res.status(400).json({
          error: 'Missing inputConfig',
          message: `inputConfig is required when renderAs is "${renderAs}"`,
        });
        return;
      }
    }

    // Check if entry already exists
    const existing = await AdminRelationshipMetadata.findOne({
      where: {
        entityType: entityType as any,
        entityId: entityId,
        relationshipKey: relationshipKey,
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
    console.error('[AdminRelationshipMetadataRouter] Error creating/updating metadata:', error);
    res.status(500).json({
      error: 'Failed to create/update relationship metadata',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /admin-relationship-metadata/:entityType/:entityId/:relationshipKey
 * Delete relationship metadata for a specific relationship field
 */
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
