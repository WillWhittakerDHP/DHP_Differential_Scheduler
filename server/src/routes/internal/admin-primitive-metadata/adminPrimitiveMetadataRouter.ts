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
 * LEARNING: Auto-compute renderAs based on dataType and inputConfig
 * WHY: renderAs should be automatically determined, not manually configured
 * PATTERN: Compute renderAs from field characteristics (matches client-side logic)
 */
function computeRenderAs(
  dataType: string | undefined,
  inputConfig: Record<string, unknown> | null | undefined,
  fieldKey: string
): 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'relationshipCollection' {
  // Special cases first
  if (fieldKey === 'icon') {
    return 'iconSelect'
  }
  
  // If inputConfig exists, determine select type from config
  if (inputConfig && typeof inputConfig === 'object') {
    const selectType = inputConfig.selectType as string | undefined
    if (selectType === 'partsCollectionSelect') {
      return 'relationshipCollection'
    }
    const selectMode = inputConfig.selectMode as string | undefined
    if (selectMode === 'multiple') {
      return 'multiselect'
    }
    // Default to reference for relationship selects
    if (inputConfig.targetMode === 'relationship') {
      return 'reference'
    }
    // Default to select for other selects
    return 'select'
  }
  
  // Base renderAs on dataType
  // LEARNING: Ternary fields use 'boolean' dataType but render as statusButton
  // WHY: Ternary is a boolean variant with three states, still renders as status button
  if (dataType === 'boolean' || dataType === 'ternary') {
    return 'statusButton'
  }
  if (dataType === 'number') {
    return 'number'
  }
  if (dataType === 'array') {
    return 'reference'
  }
  
  // Default to text for string and other types
  return 'text'
}

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
        renderAs: meta.renderAs,
        statusButtonColor: meta.statusButtonColor,
        panel: meta.panel,
        bulkEdit: meta.bulkEdit,
        inputConfig: meta.inputConfig || null,
      };
    }

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
 * Body: { fieldKey, dataType, label, isRequired, visibility, layout, displayOrder, renderAs?, statusButtonColor?, panel?, bulkEdit?, inputConfig? }
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
      renderAs: providedRenderAs,
      statusButtonColor = null,
      panel = 'none',
      bulkEdit = false,
      inputConfig = null,
    } = req.body;
    
    // LEARNING: Auto-compute renderAs if not provided
    // WHY: renderAs should be automatically determined from dataType and inputConfig
    // PATTERN: Use provided renderAs if present, otherwise compute it
    const renderAs = providedRenderAs || computeRenderAs(dataType, inputConfig, fieldKey)

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

    // Validate inputConfig - required for select/multiselect/reference/relationshipCollection fields
    // LEARNING: Accepts both FormFieldConfig structure (new format) and direct select config (old format)
    // WHY: Supports backward compatibility during transition
    // PATTERN: Validate that inputConfig exists and is an object, accept any valid JSONB structure
    if (renderAs === 'select' || renderAs === 'multiselect' || renderAs === 'reference' || renderAs === 'relationshipCollection') {
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
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
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
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
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
