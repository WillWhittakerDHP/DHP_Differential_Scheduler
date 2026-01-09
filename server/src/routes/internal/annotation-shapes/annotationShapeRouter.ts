import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { AnnotationShape } from '../../../config/app.js';
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
 * WHY: AnnotationShape Router

LEARNING: Separate router for AnnotationShape CRUD operations
WHY: AnnotationShapes are NOT in ENTITY_KEYS (they're supporting data, not core entities)
     They need their own router since they can't use the standard entity router
PATTERN: Standard CRUD operations following entity router pattern
NOTE: AnnotationShapes are simple entities with just id and name fields (shape-level definitions)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const annotationShapes = await fetchAll(AnnotationShape, {
      attributes: getModelAttributes(AnnotationShape)
    });
    res.json(annotationShapes);
  } catch (error) {
    console.error('[AnnotationShapeRouter] Error fetching annotation shapes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch annotation shapes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /annotation-shapes/:id
 * Get a specific annotation shape by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const annotationShape = await AnnotationShape.findByPk(req.params.id, {
      attributes: getModelAttributes(AnnotationShape)
    });
    
    if (!annotationShape) {
      res.status(404).json({ 
        error: 'Annotation shape not found',
        id: req.params.id
      });
      return;
    }
    
    res.json(annotationShape);
  } catch (error) {
    console.error('[AnnotationShapeRouter] Error fetching annotation shape:', error);
    res.status(500).json({ 
      error: 'Error fetching annotation shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /annotation-shapes
 * Create a new annotation shape
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate required fields
    if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      res.status(400).json({ 
        error: 'Invalid annotation shape name',
        message: 'Name is required and must be a non-empty string'
      });
      return;
    }

    // Check if annotation shape with same name already exists
    const existing = await AnnotationShape.findOne({
      attributes: getModelAttributes(AnnotationShape),
      where: { name: req.body.name.trim() }
    });

    if (existing) {
      res.status(400).json({ 
        error: 'Annotation shape already exists',
        name: req.body.name,
        message: 'An annotation shape with this name already exists'
      });
      return;
    }

    const created = await createRecord(AnnotationShape, { name: req.body.name.trim() });
    res.status(201).json(created);
  } catch (error) {
    console.error('[AnnotationShapeRouter] Error creating annotation shape:', error);
    res.status(500).json({ 
      error: 'Error creating annotation shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /annotation-shapes/:id
 * Update an annotation shape (full replacement)
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate required fields
    if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      res.status(400).json({ 
        error: 'Invalid annotation shape name',
        message: 'Name is required and must be a non-empty string'
      });
      return;
    }

    // Check if another annotation shape with same name already exists
    const existing = await AnnotationShape.findOne({
      attributes: getModelAttributes(AnnotationShape),
      where: { 
        name: req.body.name.trim(),
        id: { [Op.ne]: req.params.id }
      }
    });

    if (existing) {
      res.status(400).json({ 
        error: 'Annotation shape already exists',
        name: req.body.name,
        message: 'Another annotation shape with this name already exists'
      });
      return;
    }

    const updatedCount = await updateRecord(AnnotationShape, req.params.id, { name: req.body.name.trim() });
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: 'Annotation shape not found',
        id: req.params.id
      });
      return;
    }
    
    // Fetch updated annotation shape
    const updated = await AnnotationShape.findByPk(req.params.id, {
      attributes: getModelAttributes(AnnotationShape)
    });
    res.json(updated);
  } catch (error) {
    console.error('[AnnotationShapeRouter] Error updating annotation shape:', error);
    res.status(500).json({ 
      error: 'Error updating annotation shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /annotation-shapes/:id
 * Partially update an annotation shape
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const annotationShapeId = req.params.id;
  
  try {
    // Verify annotation shape exists
    const existing = await AnnotationShape.findByPk(annotationShapeId, {
      attributes: getModelAttributes(AnnotationShape)
    });
    if (!existing) {
      res.status(404).json({ 
        error: 'Annotation shape not found',
        id: annotationShapeId
      });
      return;
    }

    // Validate name if provided
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
        res.status(400).json({ 
          error: 'Invalid annotation shape name',
          message: 'Name must be a non-empty string'
        });
        return;
      }

      // Check if another annotation shape with same name already exists
      const existingWithName = await AnnotationShape.findOne({
        attributes: getModelAttributes(AnnotationShape),
        where: { 
          name: req.body.name.trim(),
          id: { [Op.ne]: annotationShapeId }
        }
      });

      if (existingWithName) {
        res.status(400).json({ 
          error: 'Annotation shape already exists',
          name: req.body.name,
          message: 'Another annotation shape with this name already exists'
        });
        return;
      }

      req.body.name = req.body.name.trim();
    }
    
    const updatedCount = await patchRecord(AnnotationShape, annotationShapeId, req.body);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: 'Annotation shape not found or could not be updated',
        id: annotationShapeId
      });
      return;
    }
    
    // Fetch updated annotation shape
    const updated = await AnnotationShape.findByPk(annotationShapeId, {
      attributes: getModelAttributes(AnnotationShape)
    });
    res.json(updated);
  } catch (error) {
    console.error('[AnnotationShapeRouter] PATCH Error:', {
      id: annotationShapeId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Failed to patch annotation shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /annotation-shapes/:id
 * Delete an annotation shape
 * 
 * LEARNING: Prevents deletion if annotation instances are using this shape
 * WHY: Maintains data integrity - can't delete shapes that are in use
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { AnnotationInstance } = await import('../../../config/app.js');
    
    // Check if any annotation instances are using this shape
    const annotationInstancesUsingShape = await AnnotationInstance.count({
      where: { type: req.params.id }
    });

    if (annotationInstancesUsingShape > 0) {
      res.status(400).json({ 
        error: 'Cannot delete annotation shape',
        id: req.params.id,
        message: `Cannot delete annotation shape because ${annotationInstancesUsingShape} annotation instance(s) are using it. Please update or delete those annotation instances first.`
      });
      return;
    }

    const deletedCount = await deleteRecord(AnnotationShape, req.params.id);
    
    if (deletedCount === 0) {
      res.status(404).json({ 
        error: 'Annotation shape not found',
        id: req.params.id
      });
      return;
    }
    
    res.json({ 
      message: 'Annotation shape deleted successfully',
      deleted: deletedCount
    });
  } catch (error) {
    console.error('[AnnotationShapeRouter] Error deleting annotation shape:', error);
    res.status(500).json({ 
      error: 'Error deleting annotation shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as AnnotationShapeRouter };

