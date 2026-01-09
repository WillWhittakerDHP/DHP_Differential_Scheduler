import { Router, Request, Response } from 'express';
import { AnnotationShape, AnnotationInstance, ActiveAnnotation, BlockInstance } from '../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord 
} from '../../helpers/dataController.js';
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js';

const router = Router();

/**
 * WHY: AnnotationInstance Router

LEARNING: Separate router for AnnotationInstance CRUD operations
WHY: AnnotationInstances are NOT in ENTITY_KEYS (they're supporting data, not core entities)
     They need their own router since they can't use the standard entity router
PATTERN: Standard CRUD operations following entity router pattern
NOTE: AnnotationInstances are fetched as Sequelize associations when fetching blockInstance,
      but admin portal needs CRUD for managing annotation instances independently
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const annotationInstances = await AnnotationInstance.findAll({
      attributes: getModelAttributes(AnnotationInstance),
      include: [
        {
          model: AnnotationShape,
          as: 'annotationShape',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(annotationInstances);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error fetching annotation instances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch annotation instances',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /annotation-instances/active-annotations
 * Get all ActiveAnnotation relationships (bulk endpoint)
 * 
 * LEARNING: Bulk endpoint returns all active annotations with includes
 * WHY: Enables efficient fetching of all active annotations in one request (avoids N+1 problem)
 * PATTERN: Similar to relationship bulk endpoints - returns flat array for frontend grouping
 * 
 * IMPORTANT: This route must be defined BEFORE /:id to avoid route conflicts
 * Express matches routes in order, so /active-annotations must come before /:id
 */
router.get('/active-annotations', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all ActiveAnnotation relationships with includes
    const relationships = await ActiveAnnotation.findAll({
      attributes: getModelAttributes(ActiveAnnotation),
      include: [
        {
          model: AnnotationInstance,
          as: 'annotation',
          attributes: ['id', 'text', 'userType', 'type'],
          include: [
            {
              model: AnnotationShape,
              as: 'annotationShape',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: BlockInstance,
          as: 'userTypeBlockInstance',
          attributes: ['id', 'name']
        }
      ],
      order: [['orderIndex', 'ASC']]
    });
    
    res.json(relationships);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error fetching active annotations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch active annotations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /annotation-instances/:id
 * Get a specific annotation instance by ID
 * 
 * IMPORTANT: This route must be defined AFTER /active-annotations to avoid route conflicts
 * 
 * LEARNING: Includes annotationShape association to return shape information
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const annotationInstance = await AnnotationInstance.findByPk(req.params.id, {
      attributes: getModelAttributes(AnnotationInstance),
      include: [
        {
          model: AnnotationShape,
          as: 'annotationShape',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!annotationInstance) {
      res.status(404).json({ 
        error: 'Annotation instance not found',
        id: req.params.id
      });
      return;
    }
    
    res.json(annotationInstance);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error fetching annotation instance:', error);
    res.status(500).json({ 
      error: 'Error fetching annotation instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /annotation-instances
 * Create a new annotation instance
 * 
 * LEARNING: Validates that type field is a valid annotation shape ID
 * WHY: Ensures data integrity - annotation instances must reference valid shapes
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate type field if provided
    if (req.body.type) {
      const annotationShape = await AnnotationShape.findByPk(req.body.type);
      if (!annotationShape) {
        res.status(400).json({ 
          error: 'Invalid annotation shape',
          type: req.body.type,
          message: 'The provided shape ID does not exist in annotation_shapes table'
        });
        return;
      }
    }
    
    const created = await AnnotationInstance.create(req.body);
    
    // Fetch with annotationShape association for response
    const annotationInstanceWithShape = await AnnotationInstance.findByPk(created.id, {
      attributes: getModelAttributes(AnnotationInstance),
      include: [
        {
          model: AnnotationShape,
          as: 'annotationShape',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(201).json(annotationInstanceWithShape);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error creating annotation instance:', error);
    res.status(500).json({ 
      error: 'Error creating annotation instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /annotation-instances/:id
 * Update an annotation instance (full replacement)
 * 
 * LEARNING: Validates that type field is a valid annotation shape ID
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate type field if provided
    if (req.body.type) {
      const annotationShape = await AnnotationShape.findByPk(req.body.type);
      if (!annotationShape) {
        res.status(400).json({ 
          error: 'Invalid annotation shape',
          type: req.body.type,
          message: 'The provided shape ID does not exist in annotation_shapes table'
        });
        return;
      }
    }
    
    const updatedCount = await updateRecord(AnnotationInstance, req.params.id, req.body);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: 'Annotation instance not found',
        id: req.params.id
      });
      return;
    }
    
    // Fetch updated annotation instance with annotationShape association
    const updatedAnnotationInstance = await AnnotationInstance.findByPk(req.params.id, {
      attributes: getModelAttributes(AnnotationInstance),
      include: [
        {
          model: AnnotationShape,
          as: 'annotationShape',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json(updatedAnnotationInstance);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error updating annotation instance:', error);
    res.status(500).json({ 
      error: 'Error updating annotation instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /annotation-instances/:id
 * Partially update an annotation instance (single field or multiple fields)
 * 
 * LEARNING: Validates that type field is a valid annotation shape ID if provided
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const annotationInstanceId = req.params.id;
  
  try {
    // Verify annotation instance exists before attempting update
    const existingAnnotationInstance = await AnnotationInstance.findByPk(annotationInstanceId, {
      attributes: getModelAttributes(AnnotationInstance)
    });
    if (!existingAnnotationInstance) {
      res.status(404).json({ 
        error: 'Annotation instance not found',
        id: annotationInstanceId
      });
      return;
    }
    
    // Validate type field if provided
    if (req.body.type) {
      const annotationShape = await AnnotationShape.findByPk(req.body.type);
      if (!annotationShape) {
        res.status(400).json({ 
          error: 'Invalid annotation shape',
          type: req.body.type,
          message: 'The provided shape ID does not exist in annotation_shapes table'
        });
        return;
      }
    }
    
    const updatedCount = await patchRecord(AnnotationInstance, annotationInstanceId, req.body);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: 'Annotation instance not found or could not be updated',
        id: annotationInstanceId
      });
      return;
    }
    
    // Fetch updated annotation instance with annotationShape association
    const updatedAnnotationInstance = await AnnotationInstance.findByPk(annotationInstanceId, {
      attributes: getModelAttributes(AnnotationInstance),
      include: [
        {
          model: AnnotationShape,
          as: 'annotationShape',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json(updatedAnnotationInstance);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] PATCH Error:', {
      id: annotationInstanceId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Failed to patch annotation instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /annotation-instances/:id
 * Delete an annotation instance
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedCount = await deleteRecord(AnnotationInstance, req.params.id);
    
    if (deletedCount === 0) {
      res.status(404).json({ 
        error: 'Annotation instance not found',
        id: req.params.id
      });
      return;
    }
    
    res.json({ 
      message: 'Annotation instance deleted successfully',
      deleted: deletedCount
    });
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error deleting annotation instance:', error);
    res.status(500).json({ 
      error: 'Error deleting annotation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * WHY: ActiveAnnotation Management Endpoints

LEARNING: Separate endpoints for managing ActiveAnnotation through-table
WHY: ActiveAnnotation is NOT in RELATIONSHIP_KEYS (annotations are supporting data)
     These endpoints handle the many-to-many relationship between BlockInstance and AnnotationInstance
PATTERN: Similar to relationship router but specific to annotations
 */
router.get('/block-instance/:blockInstanceId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId } = req.params;
    
    // Verify block instance exists
    const blockInstance = await BlockInstance.findByPk(blockInstanceId);
    if (!blockInstance) {
      res.status(404).json({ 
        error: 'Block instance not found',
        id: blockInstanceId
      });
      return;
    }
    
    // Get all ActiveAnnotation relationships for this block instance
    const relationships = await ActiveAnnotation.findAll({
      attributes: getModelAttributes(ActiveAnnotation),
      where: { blockInstanceId },
      include: [
        {
          model: AnnotationInstance,
          as: 'annotation',
          attributes: ['id', 'text', 'type', 'userType'],
          include: [
            {
              model: AnnotationShape,
              as: 'annotationShape',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: BlockInstance,
          as: 'userTypeBlockInstance',
          attributes: ['id', 'name']
        }
      ],
      order: [['orderIndex', 'ASC']]
    });
    
    res.json(relationships);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error fetching block instance annotation instances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch block instance annotation instances',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /annotation-instances/block-instance/:blockInstanceId
 * Link an annotation instance to a block instance
 * Body: { annotationId, orderIndex?, isDefault?, userTypeBlockInstanceId? }
 */
router.post('/block-instance/:blockInstanceId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId } = req.params;
    const { annotationId, orderIndex = 0, isDefault = false, userTypeBlockInstanceId = null } = req.body;
    
    // Verify block instance exists
    const blockInstance = await BlockInstance.findByPk(blockInstanceId);
    if (!blockInstance) {
      res.status(404).json({ 
        error: 'Block instance not found',
        id: blockInstanceId
      });
      return;
    }
    
    // Verify annotation instance exists
    const annotationInstance = await AnnotationInstance.findByPk(annotationId);
    if (!annotationInstance) {
      res.status(404).json({ 
        error: 'Annotation instance not found',
        id: annotationId
      });
      return;
    }
    
    // Verify user type block instance exists (if provided)
    if (userTypeBlockInstanceId) {
      const userTypeBlockInstance = await BlockInstance.findByPk(userTypeBlockInstanceId);
      if (!userTypeBlockInstance) {
        res.status(404).json({ 
          error: 'User type block instance not found',
          id: userTypeBlockInstanceId
        });
        return;
      }
    }
    
    // Check if relationship already exists
    const existing = await ActiveAnnotation.findOne({
      attributes: getModelAttributes(ActiveAnnotation),
      where: { blockInstanceId, annotationId, userTypeBlockInstanceId }
    });
    
    if (existing) {
      res.status(400).json({ 
        error: 'Annotation instance already linked to this block instance with this user type',
        id: existing.id
      });
      return;
    }
    
    // Create relationship
    const relationship = await ActiveAnnotation.create({
      blockInstanceId,
      annotationId,
      orderIndex,
      isDefault,
      userTypeBlockInstanceId
    });
    
    res.status(201).json(relationship);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error linking annotation instance to block instance:', error);
    res.status(500).json({ 
      error: 'Error linking annotation instance to block instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /annotation-instances/block-instance/:blockInstanceId/:annotationId
 * Update through-table metadata (orderIndex, isDefault, userTypeBlockInstanceId)
 */
router.patch('/block-instance/:blockInstanceId/:annotationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId, annotationId } = req.params;
    
    // Find relationship
    const relationship = await ActiveAnnotation.findOne({
      attributes: getModelAttributes(ActiveAnnotation),
      where: { blockInstanceId, annotationId }
    });
    
    if (!relationship) {
      res.status(404).json({ 
        error: 'Block instance annotation instance relationship not found',
        blockInstanceId,
        annotationId
      });
      return;
    }
    
    // Update relationship
    await relationship.update(req.body);
    
    res.json(relationship);
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error updating block instance annotation instance:', error);
    res.status(500).json({ 
      error: 'Error updating block instance annotation instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /annotation-instances/block-instance/:blockInstanceId/:annotationId
 * Unlink an annotation instance from a block instance
 */
router.delete('/block-instance/:blockInstanceId/:annotationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId, annotationId } = req.params;
    
    const deletedCount = await ActiveAnnotation.destroy({
      where: { blockInstanceId, annotationId }
    });
    
    if (deletedCount === 0) {
      res.status(404).json({ 
        error: 'Block instance annotation instance relationship not found',
        blockInstanceId,
        annotationId
      });
      return;
    }
    
    res.json({ 
      message: 'Annotation instance unlinked from block instance successfully',
      deleted: deletedCount
    });
  } catch (error) {
    console.error('[AnnotationInstanceRouter] Error unlinking annotation instance from block instance:', error);
    res.status(500).json({ 
      error: 'Error unlinking annotation instance from block instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as AnnotationInstanceRouter };

