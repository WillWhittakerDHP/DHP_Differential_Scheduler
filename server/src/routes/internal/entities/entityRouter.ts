import { Router, Request, Response } from 'express';
import { Attributes, Model } from 'sequelize';
import { getEntityConfig, isValidEntityType } from '../../../config/entityRegistry.js';
import { BlockInstance, PartInstance, ActiveConstituent } from '../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord, 
  bulkPatch 
} from '../../helpers/dataController.js';
import { getModelAttributes, isModelUnderscored } from '../../../utils/sequelizeHelpers.js';
import { createBlockInstanceVersionIfReferenced } from '../../../services/instanceVersioning.js';

const router = Router();

/**
 * GET /entities/config
 * Returns the list of available entity kinds (entity keys)
 * Used during app initialization in development mode
 * 
 * LEARNING: Route returns entity keys (entity kinds)
 * WHY: Provides frontend with list of valid entity kinds for validation
 * PATTERN: Config endpoint for entity kind discovery
 * 
 * IMPORTANT: This route must be defined BEFORE /:entityType to avoid route conflicts
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    // Return the valid entity kinds (entity keys)
    const entityKeys = ['blockInstance', 'blockShape', 'partInstance', 'partShape'];
    
    res.json({
      entityKeys,
      version: '1.0.0',
      lastModified: new Date().toISOString()
    });
  } catch (error) {
    console.error('[EntityRouter] Error fetching config:', error);
    console.error('[EntityRouter] Error details:', error instanceof Error ? error.stack : error);
    res.status(500).json({ 
      error: 'Failed to fetch entity configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Middleware: Validate entity kind and attach configuration to request
 * 
 * LEARNING: Route parameter name differs from internal concept
 * WHY: URL structure stability is important - changing route params breaks existing clients
 * PATTERN: Route param name (:entityType) can differ from internal concept (entityKind)
 * NOTE: Route param uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.param('entityType', (req, res, next, entityType) => {
  if (!isValidEntityType(entityType)) {
    return res.status(404).json({ 
      error: `Unknown entity kind: ${entityType}`,
      validKinds: ['partInstance', 'blockInstance', 'partShape', 'blockShape']
    });
  }
  
  try {
    req.entityConfig = getEntityConfig(entityType);
    next();
  } catch (error) {
    console.error('[EntityRouter] Configuration error:', error);
    return res.status(500).json({ error: 'Entity configuration error' });
  }
});

/**
 * GET /entities/:entityType
 * Get all entities of a specific kind
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 * 
 * LEARNING: Include descriptions association for blockInstance entities
 * WHY: Descriptions are fetched as associations, not separate API calls
 * PATTERN: Conditional includes based on entity type - only blockInstance includes descriptions
 * NOTE: Descriptions are supporting data, not core entities (not in ENTITY_KEYS)
 */
router.get('/:entityType', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
    // LEARNING: Annotations are now fetched separately via annotation endpoints
    // WHY: Consistent pattern with relationships - annotations fetched separately, then attached during hydration
    // PATTERN: Entities fetched without associations, annotations attached in frontend transformer
    
    // IMPORTANT: For models with `underscored: true`, always specify `attributes` explicitly
    // to avoid duplicate columns in SQL queries (both snake_case and camelCase versions)
    const options: { attributes?: string[] } = {};
    if (isModelUnderscored(entityConfig.model)) {
      options.attributes = getModelAttributes(entityConfig.model);
    }
    
    const data = await fetchAll(entityConfig.model, options);
    res.json(data);
  } catch (error) {
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Failed to fetch ${entityConfig.displayName}s`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /entities/:entityType/:id
 * Get a specific entity by ID
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.get('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
    const record = await fetchById(entityConfig.model, req.params.id);
    
    if (!record) {
      res.status(404).json({ 
        error: `${entityConfig.displayName} not found`,
        id: req.params.id
      });
      return;
    }
    
    res.json(record);
  } catch (error) {
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Error fetching ${entityConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /entities/:entityType
 * Create a new entity
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.post('/:entityType', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
    const created = await createRecord(entityConfig.model, req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Error creating ${entityConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /entities/:entityType/:id
 * Update an entity (full replacement)
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.put('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  const entityId = req.params.id;
  
  try {
    // CRITICAL: For block instances, capture old state BEFORE update for versioning
    if (req.params.entityType === 'blockInstance') {
      const oldInstance = await BlockInstance.findByPk(entityId, {
        include: [
          {
            model: PartInstance,
            as: 'active_constituent_part_instances',
            through: {
              where: { disabled: false },
            },
          }
        ]
      });
      
      if (!oldInstance) {
        res.status(404).json({ 
          error: `${entityConfig.displayName} not found`,
          id: entityId
        });
        return;
      }
      
      // Create version with OLD data if referenced by appointments
      await createBlockInstanceVersionIfReferenced(entityId, oldInstance);
    }
    
    // Perform the update
    const updatedCount = await updateRecord(entityConfig.model, entityId, req.body);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: `${entityConfig.displayName} not found`,
        id: entityId
      });
      return;
    }
    
    res.json({ 
      message: `${entityConfig.displayName} updated successfully`,
      updated: updatedCount 
    });
  } catch (error) {
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Error updating ${entityConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /entities/:entityType/order_index
 * Bulk update order_index for multiple entities
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.patch('/:entityType/order_index', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
    const updatedCount = await bulkPatch(entityConfig.model, req.body);
    res.json({ updated: updatedCount });
  } catch (error) {
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Failed to update ${entityConfig.displayName}s`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /entities/:entityType/bulk
 * Bulk update multiple entities with partial field updates
 * 
 * LEARNING: Bulk partial update endpoint for efficient multi-entity updates
 * WHY: More efficient than individual PATCH requests (1 request vs N requests)
 * PATTERN: Similar to order_index bulk endpoint but handles versioning for block instances
 * 
 * Request body: Array of { id: string, ...fields } objects
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.patch('/:entityType/bulk', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
    const updates = req.body;
    
    // Validate request body is an array
    if (!Array.isArray(updates)) {
      res.status(400).json({ 
        error: 'Request body must be an array of update objects',
        details: 'Expected format: [{ id: string, ...fields }]'
      });
      return;
    }
    
    // CRITICAL: For block instances, capture old state BEFORE update for versioning
    if (req.params.entityType === 'blockInstance') {
      // Fetch old instances with part instances for versioning
      const blockInstanceIds = updates.map((update: { id: string }) => update.id);
      
      for (const blockInstanceId of blockInstanceIds) {
        const oldInstance = await BlockInstance.findByPk(blockInstanceId, {
          include: [
            {
              model: PartInstance,
              as: 'active_constituent_part_instances',
              through: {
                where: { disabled: false },
              },
            }
          ]
        });
        
        if (oldInstance) {
          // Create version with OLD data if referenced by appointments
          await createBlockInstanceVersionIfReferenced(blockInstanceId, oldInstance);
        }
      }
    }
    
    // Perform the bulk update
    const updatedCount = await bulkPatch(entityConfig.model, updates);
    res.json({ updated: updatedCount });
  } catch (error) {
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Failed to bulk update ${entityConfig.displayName}s`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /entities/:entityType/:id
 * Partially update an entity (single field or multiple fields)
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.patch('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  const entityId = req.params.id;
  
  try {
    // LEARNING: Verify entity exists before attempting update
    // WHY: Provides better error messages and helps diagnose 404 issues
    // PATTERN: Check existence before update to distinguish between "not found" and "update failed"
    const existingEntity = await fetchById(entityConfig.model, entityId);
    if (!existingEntity) {
      console.log(`[EntityRouter] PATCH: Entity not found:`, {
        entityType: entityConfig.displayName,
        id: entityId,
        model: entityConfig.model.name
      });
      res.status(404).json({ 
        error: `${entityConfig.displayName} not found`,
        id: entityId
      });
      return;
    }
    
    // LEARNING: All models now use underscored: true with camelCase properties
    // WHY: Sequelize automatically converts camelCase properties to snake_case columns
    // PATTERN: Pass camelCase directly to Sequelize - no field mapping needed
    let updateData;
    const fieldKey = req.body.key;
    const newValue = req.body.value;
    
    // Handle both formats: {key, value} and direct field updates
    if (fieldKey && newValue !== undefined) {
      // Pass camelCase field name directly - Sequelize handles conversion to snake_case
      updateData = { [fieldKey]: newValue };
    } else {
      updateData = req.body;
    }
    
    /**
     * WHY: // WHY: TypeScript doesn't allow direct indexing with dynamic keys on Model types
     * PATTERN: // PATTERN: Use toJSON() to get plain object - Sequelize models always have toJSON() method
     */
    const entityData: Attributes<Model> = existingEntity.toJSON();
    // Access using camelCase since Sequelize converts snake_case to camelCase in toJSON()
    const currentValue = fieldKey ? entityData[fieldKey] : undefined;
    const isDataDifferent = newValue !== currentValue;
    
    console.log(`[EntityRouter] PATCH: Updating entity:`, {
      entityType: entityConfig.displayName,
      id: entityId,
      fieldKey,
      updateData,
      existingValue: currentValue,
      newValue,
      isDataDifferent
    });
    
    // LEARNING: If data is identical, return success without updating
    // WHY: No need to hit database if nothing changed
    // PATTERN: Early return for no-op updates
    if (!isDataDifferent && fieldKey) {
      console.log(`[EntityRouter] PATCH: Data unchanged, skipping update:`, {
        entityType: entityConfig.displayName,
        id: entityId,
        fieldKey,
        value: newValue
      });
      res.json({ updated: 0, message: 'No changes detected' });
      return;
    }
    
    // LEARNING: Wrap update in try-catch to catch Sequelize validation errors
    // WHY: Sequelize may throw validation errors that need to be caught
    // PATTERN: Catch and handle Sequelize-specific errors
    let updatedCount: number;
    try {
      updatedCount = await patchRecord(entityConfig.model, entityId, updateData);
    } catch (updateError: unknown) {
      const error = updateError instanceof Error ? updateError : new Error(String(updateError));
      console.error(`[EntityRouter] PATCH: Sequelize update error:`, {
        entityType: entityConfig.displayName,
        id: entityId,
        updateData,
        error: error.message,
        errorName: error.name,
        errorStack: error.stack
      });
      
      // LEARNING: Re-throw Sequelize validation errors as 400 Bad Request
      // WHY: Validation errors are client errors, not server errors
      // PATTERN: Return 400 for validation errors, 500 for other errors
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
          error: `Validation failed for ${entityConfig.displayName}`,
          details: error.message,
          id: entityId
        });
        return;
      }
      
      // Re-throw other errors to be caught by outer try-catch
      throw error;
    }
    
    if (updatedCount === 0) {
      // LEARNING: This should rarely happen if we verified existence above
      // WHY: But Sequelize update can return 0 if data is identical or validation fails
      // PATTERN: Log detailed info when update returns 0 despite entity existing
      console.warn(`[EntityRouter] PATCH: Update returned 0 rows despite entity existing:`, {
        entityType: entityConfig.displayName,
        id: entityId,
        updateData,
        existingEntity: existingEntity,
        fieldKey,
        currentValue,
        newValue,
        isDataDifferent
      });
      res.status(404).json({ 
        error: `${entityConfig.displayName} not found or could not be updated`,
        id: entityId
      });
      return;
    }
    
    console.log(`[EntityRouter] PATCH: Successfully updated:`, {
      entityType: entityConfig.displayName,
      id: entityId,
      updatedCount
    });
    
    res.json({ updated: updatedCount });
  } catch (error) {
    console.error('[EntityRouter] PATCH Error:', {
      entityType: entityConfig.displayName,
      id: entityId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: `Failed to patch ${entityConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /entities/:entityType/:id
 * Delete an entity
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.delete('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  const entityId = req.params.id;
  
  try {
    // CRITICAL: For block instances, capture old state BEFORE delete for versioning
    if (req.params.entityType === 'blockInstance') {
      const oldInstance = await BlockInstance.findByPk(entityId);
      
      if (!oldInstance) {
        res.status(404).json({ 
          error: `${entityConfig.displayName} not found`,
          id: entityId
        });
        return;
      }
      
      // Create version with OLD data if referenced by appointments
      await createBlockInstanceVersionIfReferenced(entityId, oldInstance);
    }
    
    // Perform the delete
    const deletedCount = await deleteRecord(entityConfig.model, entityId);
    
    if (deletedCount === 0) {
      res.status(404).json({ 
        error: `${entityConfig.displayName} not found`,
        id: entityId
      });
      return;
    }
    
    res.json({ 
      message: `${entityConfig.displayName} deleted successfully`,
      deleted: deletedCount
    });
  } catch (error) {
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Error deleting ${entityConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as EntityRouter };
