import { Router, Request, Response } from 'express';
import { AnnotationShape, AnnotationInstance, AnnotationAssignment, BlockInstance } from '../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord 
} from '../../helpers/dataController.js';
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js';
import { Op } from 'sequelize';

const router = Router();

/**
 * Annotation Router
 * 
 * LEARNING: Consolidated router for annotation CRUD operations (matching entities/relationships pattern)
 * WHY: Single router handles both annotationInstance and annotationShape via parameterized routes
 * PATTERN: /annotations/:annotationType where annotationType is 'annotationInstance' or 'annotationShape'
 */

type AnnotationType = 'annotationInstance' | 'annotationShape';

interface AnnotationConfig {
  model: typeof AnnotationInstance | typeof AnnotationShape;
  displayName: string;
  isInstance: boolean;
}

const ANNOTATION_REGISTRY: Record<AnnotationType, AnnotationConfig> = {
  annotationInstance: {
    model: AnnotationInstance,
    displayName: 'Annotation Instance',
    isInstance: true,
  },
  annotationShape: {
    model: AnnotationShape,
    displayName: 'Annotation Shape',
    isInstance: false,
  },
};

function isValidAnnotationType(annotationType: string): annotationType is AnnotationType {
  return annotationType === 'annotationInstance' || annotationType === 'annotationShape';
}

/**
 * Middleware: Validate annotation type and attach configuration to request
 */
router.param('annotationType', (req, res, next, annotationType) => {
  if (!isValidAnnotationType(annotationType)) {
    return res.status(404).json({ 
      error: `Unknown annotation type: ${annotationType}`,
      validTypes: ['annotationInstance', 'annotationShape']
    });
  }
  
  req.annotationConfig = ANNOTATION_REGISTRY[annotationType];
  next();
});

/**
 * GET /annotations/:annotationType
 * Get all annotations of a specific type
 */
router.get('/:annotationType', async (req: Request, res: Response): Promise<void> => {
  const { annotationConfig } = req;
  if (!annotationConfig) {
    res.status(500).json({ error: 'Annotation configuration missing' });
    return;
  }
  
  try {
    if (annotationConfig.isInstance) {
      // AnnotationInstance: include annotationShape association
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
    } else {
      // AnnotationShape: simple fetch
      const annotationShapes = await fetchAll(AnnotationShape, {
        attributes: getModelAttributes(AnnotationShape)
      });
      res.json(annotationShapes);
    }
  } catch (error) {
    console.error('[AnnotationRouter] Error fetching annotations:', error);
    res.status(500).json({ 
      error: `Failed to fetch ${annotationConfig.displayName.toLowerCase()}s`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /annotations/annotationInstance/annotation-assignments
 * Get all AnnotationAssignment relationships (bulk endpoint)
 * 
 * IMPORTANT: This route must be defined BEFORE /:annotationType/:id to avoid route conflicts
 */
router.get('/annotationInstance/annotation-assignments', async (req: Request, res: Response): Promise<void> => {
  try {
    const relationships = await AnnotationAssignment.findAll({
      attributes: getModelAttributes(AnnotationAssignment),
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
      ]
    });
    
    res.json(relationships);
  } catch (error) {
    console.error('[AnnotationRouter] Error fetching annotation assignments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch annotation assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /annotations/:annotationType/:id
 * Get a specific annotation by ID
 */
router.get('/:annotationType/:id', async (req: Request, res: Response): Promise<void> => {
  const { annotationConfig } = req;
  if (!annotationConfig) {
    res.status(500).json({ error: 'Annotation configuration missing' });
    return;
  }
  
  try {
    if (annotationConfig.isInstance) {
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
    } else {
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
    }
  } catch (error) {
    console.error('[AnnotationRouter] Error fetching annotation:', error);
    res.status(500).json({ 
      error: `Error fetching ${annotationConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /annotations/:annotationType
 * Create a new annotation
 */
router.post('/:annotationType', async (req: Request, res: Response): Promise<void> => {
  const { annotationConfig } = req;
  if (!annotationConfig) {
    res.status(500).json({ error: 'Annotation configuration missing' });
    return;
  }
  
  try {
    if (annotationConfig.isInstance) {
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
    } else {
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
    }
  } catch (error) {
    console.error('[AnnotationRouter] Error creating annotation:', error);
    res.status(500).json({ 
      error: `Error creating ${annotationConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /annotations/:annotationType/:id
 * Update an annotation (full replacement)
 */
router.put('/:annotationType/:id', async (req: Request, res: Response): Promise<void> => {
  const { annotationConfig } = req;
  if (!annotationConfig) {
    res.status(500).json({ error: 'Annotation configuration missing' });
    return;
  }
  
  try {
    if (annotationConfig.isInstance) {
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
    } else {
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
    }
  } catch (error) {
    console.error('[AnnotationRouter] Error updating annotation:', error);
    res.status(500).json({ 
      error: `Error updating ${annotationConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /annotations/:annotationType/:id
 * Partially update an annotation
 */
router.patch('/:annotationType/:id', async (req: Request, res: Response): Promise<void> => {
  const { annotationConfig } = req;
  const annotationId = req.params.id;
  
  if (!annotationConfig) {
    res.status(500).json({ error: 'Annotation configuration missing' });
    return;
  }
  
  try {
    if (annotationConfig.isInstance) {
      // Verify annotation instance exists
      const existingAnnotationInstance = await AnnotationInstance.findByPk(annotationId, {
        attributes: getModelAttributes(AnnotationInstance)
      });
      if (!existingAnnotationInstance) {
        res.status(404).json({ 
          error: 'Annotation instance not found',
          id: annotationId
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
      
      const updatedCount = await patchRecord(AnnotationInstance, annotationId, req.body);
      
      if (updatedCount === 0) {
        res.status(404).json({ 
          error: 'Annotation instance not found or could not be updated',
          id: annotationId
        });
        return;
      }
      
      // Fetch updated annotation instance with annotationShape association
      const updatedAnnotationInstance = await AnnotationInstance.findByPk(annotationId, {
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
    } else {
      // Verify annotation shape exists
      const existing = await AnnotationShape.findByPk(annotationId, {
        attributes: getModelAttributes(AnnotationShape)
      });
      if (!existing) {
        res.status(404).json({ 
          error: 'Annotation shape not found',
          id: annotationId
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
            id: { [Op.ne]: annotationId }
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
      
      const updatedCount = await patchRecord(AnnotationShape, annotationId, req.body);
      
      if (updatedCount === 0) {
        res.status(404).json({ 
          error: 'Annotation shape not found or could not be updated',
          id: annotationId
        });
        return;
      }
      
      // Fetch updated annotation shape
      const updated = await AnnotationShape.findByPk(annotationId, {
        attributes: getModelAttributes(AnnotationShape)
      });
      res.json(updated);
    }
  } catch (error) {
    console.error('[AnnotationRouter] PATCH Error:', {
      id: annotationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: `Failed to patch ${annotationConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /annotations/:annotationType/:id
 * Delete an annotation
 */
router.delete('/:annotationType/:id', async (req: Request, res: Response): Promise<void> => {
  const { annotationConfig } = req;
  if (!annotationConfig) {
    res.status(500).json({ error: 'Annotation configuration missing' });
    return;
  }
  
  try {
    if (annotationConfig.isInstance) {
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
    } else {
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
    }
  } catch (error) {
    console.error('[AnnotationRouter] Error deleting annotation:', error);
    res.status(500).json({ 
      error: `Error deleting ${annotationConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * AnnotationAssignment Management Endpoints (annotationInstance-specific)
 * These routes handle the many-to-many relationship between BlockInstance and AnnotationInstance
 */

/**
 * GET /annotations/annotationInstance/block-instance/:blockInstanceId
 * Get all AnnotationAssignment relationships for a block instance
 */
router.get('/annotationInstance/block-instance/:blockInstanceId', async (req: Request, res: Response): Promise<void> => {
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
    
    // Get all AnnotationAssignment relationships for this block instance
    const relationships = await AnnotationAssignment.findAll({
      attributes: getModelAttributes(AnnotationAssignment),
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
      ]
    });
    
    res.json(relationships);
  } catch (error) {
    console.error('[AnnotationRouter] Error fetching block instance annotation instances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch block instance annotation instances',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /annotations/annotationInstance/block-instance/:blockInstanceId
 * Link an annotation instance to a block instance
 */
router.post('/annotationInstance/block-instance/:blockInstanceId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId } = req.params;
    const { annotationId, userTypeBlockInstanceId = null } = req.body;
    
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
    const existing = await AnnotationAssignment.findOne({
      attributes: getModelAttributes(AnnotationAssignment),
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
    const relationship = await AnnotationAssignment.create({
      blockInstanceId,
      annotationId,
      userTypeBlockInstanceId
    });
    
    res.status(201).json(relationship);
  } catch (error) {
    console.error('[AnnotationRouter] Error linking annotation instance to block instance:', error);
    res.status(500).json({ 
      error: 'Error linking annotation instance to block instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /annotations/annotationInstance/block-instance/:blockInstanceId/:annotationId
 * Update through-table metadata (userTypeBlockInstanceId)
 */
router.patch('/annotationInstance/block-instance/:blockInstanceId/:annotationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId, annotationId } = req.params;
    
    // Find relationship
    const relationship = await AnnotationAssignment.findOne({
      attributes: getModelAttributes(AnnotationAssignment),
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
    console.error('[AnnotationRouter] Error updating block instance annotation instance:', error);
    res.status(500).json({ 
      error: 'Error updating block instance annotation instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /annotations/annotationInstance/block-instance/:blockInstanceId/:annotationId
 * Unlink an annotation instance from a block instance
 */
router.delete('/annotationInstance/block-instance/:blockInstanceId/:annotationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId, annotationId } = req.params;
    
    const deletedCount = await AnnotationAssignment.destroy({
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
    console.error('[AnnotationRouter] Error unlinking annotation instance from block instance:', error);
    res.status(500).json({ 
      error: 'Error unlinking annotation instance from block instance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as AnnotationRouter };
