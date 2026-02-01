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
import { ENTITY_KEYS_ARRAY, ENTITY_KEYS } from '../../../constants/entities.js';

const router = Router();

router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
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
      // PATTERN: Use constant array from entities.ts
      return res.status(404).json({ 
      error: `Unknown entity kind: ${entityType}`,
      validKinds: ENTITY_KEYS_ARRAY
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

router.get('/:entityType', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
    // WHY: Consistent pattern with relationships - annotations fetched separately, then attached during hydration
    // PATTERN: Entities fetched without associations, annotations attached in frontend transformer
    
    // PATTERN: Build options object functionally using object spread
    const modelAttributes = Object.keys(entityConfig.model.rawAttributes || {});
    const baseOptions: { attributes?: string[]; order?: any[]; include?: any[] } = {};
    
    const optionsWithAttributes = isModelUnderscored(entityConfig.model)
      ? { ...baseOptions, attributes: getModelAttributes(entityConfig.model) }
      : baseOptions;
    
    const options = (() => {
      if (modelAttributes.includes('orderIndex')) {
        return { ...optionsWithAttributes, order: [['orderIndex', 'ASC']] };
      } else if (modelAttributes.includes('createdAt')) {
        return { ...optionsWithAttributes, order: [['createdAt', 'ASC']] };
      } else {
        return { ...optionsWithAttributes, order: [['id', 'ASC']] };
      }
    })();
    
    
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

router.post('/:entityType', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
    // LEARNING: Sanitize empty strings for enum fields to prevent database errors
    // PATTERN: Convert empty strings for known enum fields to their default values
    const sanitizedData = { ...req.body };
    
    if (req.params.entityType === ENTITY_KEYS.BLOCK_INSTANCE && sanitizedData.bookingMode === '') {
      sanitizedData.bookingMode = 'standalone';
    }
    if (req.params.entityType === 'blockInstance' && sanitizedData.booking_mode === '') {
      sanitizedData.booking_mode = 'standalone';
    }
    
    const created = await createRecord(entityConfig.model, sanitizedData);
    res.status(201).json(created);
  } catch (error) {
    // LEARNING: Handle Sequelize validation errors as 400 Bad Request
    // PATTERN: Check error type, return appropriate status code with helpful message
    if (error instanceof Error && 
        (error.name === 'SequelizeValidationError' || 
         error.name === 'SequelizeUniqueConstraintError')) {
      // PATTERN: Extract field names and messages from SequelizeValidationError.errors array
      const validationError = error as any;
      
      if (validationError.name === 'SequelizeUniqueConstraintError') {
        // PATTERN: Check if error has fields property (SequelizeUniqueConstraintError structure)
        const fieldName = validationError?.fields ? Object.keys(validationError.fields)[0] : 'field';
        const fieldValue = validationError?.fields ? Object.values(validationError.fields)[0] : '';
        
        res.status(400).json({
          error: `Validation failed for ${entityConfig.displayName}`,
          details: `${fieldName} "${fieldValue}" already exists. Please use a unique value.`,
        });
        return;
      }
      
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
      
      res.status(400).json({
        error: `Validation failed for ${entityConfig.displayName}`,
        details: error.message,
      });
      return;
    }
    
    // PATTERN: Log error and return 500
    console.error('[EntityRouter] Error:', error);
    res.status(500).json({ 
      error: `Error creating ${entityConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  const entityId = req.params.id;
  
  try {
    // LEARNING: Sanitize empty strings for enum fields to prevent database errors
    // PATTERN: Convert empty strings for known enum fields to their default values
    const sanitizedData = { ...req.body };
    
    if (req.params.entityType === 'blockInstance') {
      if (sanitizedData.bookingMode === '') {
        sanitizedData.bookingMode = 'standalone';
      }
      if (sanitizedData.booking_mode === '') {
        sanitizedData.booking_mode = 'standalone';
      }
    }
    
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
    
    // Perform the update (using sanitizedData to ensure enum fields are properly handled)
    const updatedCount = await updateRecord(entityConfig.model, entityId, sanitizedData);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: `${entityConfig.displayName} not found`,
        id: entityId
      });
      return;
    }
    
    //      per (parent_id, name, partShapeRef) group. Old relationships pointing to other part instances
    // PATTERN: After successful update, find and disable old relationships
    if (req.params.entityType === 'partInstance') {
      try {
        const updatedPartInstance = await PartInstance.findByPk(entityId);
        if (updatedPartInstance) {
          const currentRelationships = await PartAssignment.findAll({
            where: {
              child_id: entityId,
              disabled: false
            }
          });

          // PATTERN: Use map to transform relationships into promises, then await all
          await Promise.all(
            currentRelationships.map(async (currentRel) => {
              const duplicatePartInstances = await PartInstance.findAll({
                where: {
                  name: updatedPartInstance.name,
                  partShapeRef: updatedPartInstance.partShapeRef,
                  id: { [Op.ne]: entityId }
                }
              });

              if (duplicatePartInstances.length > 0) {
                const duplicatePartIds = duplicatePartInstances.map(p => p.id);
                
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
            })
          );
        }
      } catch (versioningError) {
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

router.patch('/:entityType/order_index', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  try {
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
      
      // PATTERN: Map IDs to versioning operations, then execute in parallel
      await Promise.all(
        blockInstanceIds.map(async (blockInstanceId) => {
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
        })
      );
    }
    
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

router.patch('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req;
  if (!entityConfig) {
    res.status(500).json({ error: 'Entity configuration missing' });
    return;
  }
  
  const entityId = req.params.id;
  const fieldKey = req.body.key;
  const newValue = req.body.value;
  
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
    // WHY: Support both {key, value} format and direct field updates
    // PATTERN: Standard PATCH - parse data, update directly, let Sequelize handle validation
    let updateData;
    if (fieldKey && newValue !== undefined) {
      updateData = { [fieldKey]: newValue };
    } else {
      updateData = req.body;
    }
    
    // WHY: Standard PATCH pattern - log essentials, not entire entity state
    // PATTERN: Log before update to track what's being changed
    console.log(`[EntityRouter] PATCH: ${entityConfig.displayName} ${entityId}`, {
      fieldKey,
      value: newValue
    });
    
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
    
    //      per (parent_id, name, partShapeRef) group. Old relationships pointing to other part instances
    // PATTERN: After successful update, find and disable old relationships
    if (req.params.entityType === 'partInstance') {
      try {
        const updatedPartInstance = await PartInstance.findByPk(entityId);
        if (updatedPartInstance) {
          const currentRelationships = await PartAssignment.findAll({
            where: {
              child_id: entityId,
              disabled: false
            }
          });

          // PATTERN: Use map to transform relationships into promises, then await all
          await Promise.all(
            currentRelationships.map(async (currentRel) => {
              const duplicatePartInstances = await PartInstance.findAll({
                where: {
                  name: updatedPartInstance.name,
                  partShapeRef: updatedPartInstance.partShapeRef,
                  id: { [Op.ne]: entityId }
                }
              });

              if (duplicatePartInstances.length > 0) {
                const duplicatePartIds = duplicatePartInstances.map(p => p.id);
                
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
            })
          );
        }
      } catch (versioningError) {
        console.error('[EntityRouter] Error disabling old partAssignments relationships:', versioningError);
      }
    }
    
    res.json({ updated: updatedCount });
  } catch (error) {
    // LEARNING: Handle Sequelize validation errors as 400 Bad Request
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
    
    // PATTERN: Log error and return 500
    console.error('[EntityRouter] PATCH Error:', error);
    res.status(500).json({ 
      error: `Failed to patch ${entityConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

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
