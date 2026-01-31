import { Router, Request, Response } from 'express';
import { Attributes, Model, Op } from 'sequelize';
import { getEntityConfig, isValidEntityType } from '../../../config/entityRegistry.js';
import { BlockInstance, PartInstance, PartAssignment } from '../../../config/app.js';
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
    const entityKeys = ['blockInstance', 'blockShape', 'partInstance', 'partShape', 'eventShape', 'eventInstance', 'annotationShape', 'annotationInstance'];
    
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
      validKinds: ['partInstance', 'blockInstance', 'partShape', 'blockShape', 'eventShape', 'eventInstance', 'annotationShape', 'annotationInstance']
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
    // LEARNING: Order entities by orderIndex to ensure consistent ordering (if field exists)
    // WHY: Most entity types (blockInstance, blockShape, partInstance, partShape) have orderIndex fields,
    //      but some (eventShape, eventInstance) do not
    // PATTERN: Conditionally add order option only if model has orderIndex field
    const options: { attributes?: string[]; order?: any[] } = {};
    if (isModelUnderscored(entityConfig.model)) {
      options.attributes = getModelAttributes(entityConfig.model);
    }
    // Order by orderIndex if the model has that field (check model attributes)
    const modelAttributes = Object.keys(entityConfig.model.rawAttributes || {});
    if (modelAttributes.includes('orderIndex')) {
      options.order = [['orderIndex', 'ASC']];
    } else {
      // For models without orderIndex, order by createdAt or id
      if (modelAttributes.includes('createdAt')) {
        options.order = [['createdAt', 'ASC']];
      } else {
        options.order = [['id', 'ASC']];
      }
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
    // LEARNING: Handle Sequelize validation errors as 400 Bad Request
    // WHY: Validation errors (including unique constraint violations) are client errors, not server errors
    // PATTERN: Check error type, return appropriate status code with helpful message
    if (error instanceof Error && 
        (error.name === 'SequelizeValidationError' || 
         error.name === 'SequelizeUniqueConstraintError')) {
      // LEARNING: Extract detailed validation error information
      // WHY: SequelizeValidationError contains errors array with field-specific messages
      // PATTERN: Extract field names and messages from SequelizeValidationError.errors array
      const validationError = error as any;
      
      if (validationError.name === 'SequelizeUniqueConstraintError') {
        // LEARNING: Extract field name from unique constraint error for better error message
        // WHY: Unique constraint errors should indicate which field has the duplicate value
        // PATTERN: Check if error has fields property (SequelizeUniqueConstraintError structure)
        const fieldName = validationError?.fields ? Object.keys(validationError.fields)[0] : 'field';
        const fieldValue = validationError?.fields ? Object.values(validationError.fields)[0] : '';
        
        res.status(400).json({
          error: `Validation failed for ${entityConfig.displayName}`,
          details: `${fieldName} "${fieldValue}" already exists. Please use a unique value.`,
        });
        return;
      }
      
      // LEARNING: Extract field-specific validation errors from SequelizeValidationError
      // WHY: SequelizeValidationError.errors is an array of field-specific error objects
      // PATTERN: Map errors array to extract field names and messages
      if (validationError.errors && Array.isArray(validationError.errors) && validationError.errors.length > 0) {
        const fieldErrors = validationError.errors.map((err: any) => {
          const fieldName = err.path || 'field';
          const message = err.message || 'Validation error';
          return `${fieldName}: ${message}`;
        }).join('; ');
        
        res.status(400).json({
          error: `Validation failed for ${entityConfig.displayName}`,
          details: fieldErrors,
        });
        return;
      }
      
      // Fallback to generic error message
      res.status(400).json({
        error: `Validation failed for ${entityConfig.displayName}`,
        details: error.message,
      });
      return;
    }
    
    // LEARNING: Other errors are server errors
    // WHY: Unexpected errors indicate server-side issues
    // PATTERN: Log error and return 500
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
            as: 'part_assignment_instances',
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
    
    // LEARNING: For partInstance updates, disable old partAssignments relationships
    // WHY: When a part instance is updated, we need to ensure only one partAssignments relationship exists
    //      per (parent_id, name, partShapeRef) group. Old relationships pointing to other part instances
    //      with the same logical identity should be disabled.
    // PATTERN: After successful update, find and disable old relationships
    if (req.params.entityType === 'partInstance') {
      try {
        const updatedPartInstance = await PartInstance.findByPk(entityId);
        if (updatedPartInstance) {
          // Find all partAssignments relationships pointing to this part instance
          // This tells us which block instances reference this part
          const currentRelationships = await PartAssignment.findAll({
            where: {
              child_id: entityId,
              disabled: false
            }
          });

          // For each block instance that references this part, find and disable old relationships
          // that point to other part instances with the same (name, partShapeRef) but different ID
          for (const currentRel of currentRelationships) {
            // Find all part instances with the same name and partShapeRef but different ID
            const duplicatePartInstances = await PartInstance.findAll({
              where: {
                name: updatedPartInstance.name,
                partShapeRef: updatedPartInstance.partShapeRef,
                id: { [Op.ne]: entityId }
              }
            });

            if (duplicatePartInstances.length > 0) {
              const duplicatePartIds = duplicatePartInstances.map(p => p.id);
              
              // Disable partAssignments relationships pointing to these duplicate part instances
              // for the same parent_id (block instance)
              await PartAssignment.update(
                { disabled: true },
                {
                  where: {
                    parent_id: currentRel.parent_id,
                    child_id: { [Op.in]: duplicatePartIds },
                    disabled: false
                  }
                }
              );
            }
          }
        }
      } catch (versioningError) {
        // Log error but don't fail the update - versioning cleanup is best effort
        console.error('[EntityRouter] Error disabling old partAssignments relationships:', versioningError);
      }
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
    // LEARNING: Transform snake_case field names to camelCase for Sequelize
    // WHY: Sequelize models use camelCase property names (orderIndex), but frontend sends snake_case (order_index)
    // PATTERN: Transform payload before passing to bulkPatch to match Sequelize model property names
    const transformedUpdates = req.body.map((update: { id: string; order_index: number }) => ({
      id: update.id,
      orderIndex: update.order_index,
    }));
    
    const updatedCount = await bulkPatch(entityConfig.model, transformedUpdates);
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
              as: 'part_assignment_instances',
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
  const fieldKey = req.body.key;
  const newValue = req.body.value;
  
  // LEARNING: Reject PATCH requests for temporary entity IDs
  // WHY: Temporary IDs (starting with "new-") are used for unsaved entities that should be created via POST, not updated via PATCH
  // PATTERN: Validate entity ID format before attempting database operations
  if (entityId.startsWith('new-') || entityId === '00000000-0000-0000-0000-000000000000') {
    res.status(400).json({ 
      error: `Cannot update ${entityConfig.displayName} with temporary ID`,
      details: `Entity ID "${entityId}" is a temporary ID. Use POST to create the entity first.`,
      id: entityId
    });
    return;
  }
  
  try {
    // LEARNING: Parse update data from request body
    // WHY: Support both {key, value} format and direct field updates
    // PATTERN: Standard PATCH - parse data, update directly, let Sequelize handle validation
    let updateData;
    if (fieldKey && newValue !== undefined) {
      updateData = { [fieldKey]: newValue };
    } else {
      updateData = req.body;
    }
    
    // LEARNING: Minimal logging - just field key and value
    // WHY: Standard PATCH pattern - log essentials, not entire entity state
    // PATTERN: Log before update to track what's being changed
    console.log(`[EntityRouter] PATCH: ${entityConfig.displayName} ${entityId}`, {
      fieldKey,
      value: newValue
    });
    
    // LEARNING: Update directly - Sequelize handles validation and returns 0 if entity not found
    // WHY: Standard REST PATCH pattern - one database query, let ORM handle validation
    // PATTERN: Call update, check result, handle errors
    const updatedCount = await patchRecord(entityConfig.model, entityId, updateData);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: `${entityConfig.displayName} not found`,
        id: entityId
      });
      return;
    }
    
    // LEARNING: For partInstance updates, disable old partAssignments relationships
    // WHY: When a part instance is updated, we need to ensure only one partAssignments relationship exists
    //      per (parent_id, name, partShapeRef) group. Old relationships pointing to other part instances
    //      with the same logical identity should be disabled.
    // PATTERN: After successful update, find and disable old relationships
    if (req.params.entityType === 'partInstance') {
      try {
        const updatedPartInstance = await PartInstance.findByPk(entityId);
        if (updatedPartInstance) {
          // Find all partAssignments relationships pointing to this part instance
          // This tells us which block instances reference this part
          const currentRelationships = await PartAssignment.findAll({
            where: {
              child_id: entityId,
              disabled: false
            }
          });

          // For each block instance that references this part, find and disable old relationships
          // that point to other part instances with the same (name, partShapeRef) but different ID
          for (const currentRel of currentRelationships) {
            // Find all part instances with the same name and partShapeRef but different ID
            const duplicatePartInstances = await PartInstance.findAll({
              where: {
                name: updatedPartInstance.name,
                partShapeRef: updatedPartInstance.partShapeRef,
                id: { [Op.ne]: entityId }
              }
            });

            if (duplicatePartInstances.length > 0) {
              const duplicatePartIds = duplicatePartInstances.map(p => p.id);
              
              // Disable partAssignments relationships pointing to these duplicate part instances
              // for the same parent_id (block instance)
              await PartAssignment.update(
                { disabled: true },
                {
                  where: {
                    parent_id: currentRel.parent_id,
                    child_id: { [Op.in]: duplicatePartIds },
                    disabled: false
                  }
                }
              );
            }
          }
        }
      } catch (versioningError) {
        // Log error but don't fail the update - versioning cleanup is best effort
        console.error('[EntityRouter] Error disabling old partAssignments relationships:', versioningError);
      }
    }
    
    res.json({ updated: updatedCount });
  } catch (error) {
    // LEARNING: Handle Sequelize validation errors as 400 Bad Request
    // WHY: Validation errors are client errors, not server errors
    // PATTERN: Check error type, return appropriate status code
    
    // Handle database constraint violations (e.g., mutual exclusivity)
    if (error instanceof Error && 
        'parent' in error &&
        error.parent &&
        typeof error.parent === 'object' &&
        'code' in error.parent &&
        error.parent.code === '23514') {
      // Check if it's the state control mutual exclusivity constraint
      if ('constraint' in error.parent && 
          error.parent.constraint === 'check_state_control_mutual_exclusivity') {
        res.status(400).json({
          error: 'Mutual exclusivity violation',
          message: 'isStateControl and canHaveParts cannot both be true. They are mutually exclusive.',
          details: 'Setting one to true requires the other to be false.',
          id: entityId
        });
        return;
      }
    }
    
    if (error instanceof Error && 
        (error.name === 'SequelizeValidationError' || 
         error.name === 'SequelizeUniqueConstraintError')) {
      res.status(400).json({
        error: `Validation failed for ${entityConfig.displayName}`,
        details: error.message,
        id: entityId
      });
      return;
    }
    
    // LEARNING: Other errors are server errors
    // WHY: Unexpected errors indicate server-side issues
    // PATTERN: Log error and return 500
    console.error('[EntityRouter] PATCH Error:', error);
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
