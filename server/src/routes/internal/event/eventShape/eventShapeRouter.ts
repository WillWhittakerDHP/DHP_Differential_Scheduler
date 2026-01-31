import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { EventShape } from '../../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord 
} from '../../../helpers/dataController.js';
import { getModelAttributes } from '../../../../utils/sequelizeHelpers.js';

const router = Router();

/**
 * WHY: EventShape Router
 *
 * LEARNING: Separate router for EventShape CRUD operations
 * WHY: EventShapes are NOT in ENTITY_KEYS (they're supporting data, not core entities)
 *     They need their own router since they can't use the standard entity router
 * PATTERN: Standard CRUD operations following entity router pattern
 * NOTE: EventShapes are simple entities with just id and name fields (shape-level definitions)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const eventShapes = await fetchAll(EventShape, {
      attributes: getModelAttributes(EventShape)
    });
    res.json(eventShapes);
  } catch (error) {
    console.error('[EventShapeRouter] Error fetching event shapes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event shapes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /event-shapes/:id
 * Get a specific event shape by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const eventShape = await EventShape.findByPk(req.params.id, {
      attributes: getModelAttributes(EventShape)
    });
    
    if (!eventShape) {
      res.status(404).json({ 
        error: 'Event shape not found',
        id: req.params.id
      });
      return;
    }
    
    res.json(eventShape);
  } catch (error) {
    console.error('[EventShapeRouter] Error fetching event shape:', error);
    res.status(500).json({ 
      error: 'Error fetching event shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /event-shapes
 * Create a new event shape
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate required fields
    if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      res.status(400).json({ 
        error: 'Invalid event shape name',
        message: 'Name is required and must be a non-empty string'
      });
      return;
    }

    // Check if event shape with same name already exists
    const existing = await EventShape.findOne({
      attributes: getModelAttributes(EventShape),
      where: { name: req.body.name.trim() }
    });

    if (existing) {
      res.status(400).json({ 
        error: 'Event shape already exists',
        name: req.body.name,
        message: 'An event shape with this name already exists'
      });
      return;
    }

    const created = await createRecord(EventShape, { name: req.body.name.trim() });
    res.status(201).json(created);
  } catch (error) {
    console.error('[EventShapeRouter] Error creating event shape:', error);
    res.status(500).json({ 
      error: 'Error creating event shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /event-shapes/:id
 * Update an event shape (full replacement)
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate required fields
    if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      res.status(400).json({ 
        error: 'Invalid event shape name',
        message: 'Name is required and must be a non-empty string'
      });
      return;
    }

    // Check if another event shape with same name already exists
    const existing = await EventShape.findOne({
      attributes: getModelAttributes(EventShape),
      where: { 
        name: req.body.name.trim(),
        id: { [Op.ne]: req.params.id }
      }
    });

    if (existing) {
      res.status(400).json({ 
        error: 'Event shape already exists',
        name: req.body.name,
        message: 'Another event shape with this name already exists'
      });
      return;
    }

    const updatedCount = await updateRecord(EventShape, req.params.id, { name: req.body.name.trim() });
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: 'Event shape not found',
        id: req.params.id
      });
      return;
    }
    
    // Fetch updated event shape
    const updated = await EventShape.findByPk(req.params.id, {
      attributes: getModelAttributes(EventShape)
    });
    res.json(updated);
  } catch (error) {
    console.error('[EventShapeRouter] Error updating event shape:', error);
    res.status(500).json({ 
      error: 'Error updating event shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /event-shapes/:id
 * Partially update an event shape
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const eventShapeId = req.params.id;
  
  try {
    // Verify event shape exists
    const existing = await EventShape.findByPk(eventShapeId, {
      attributes: getModelAttributes(EventShape)
    });
    if (!existing) {
      res.status(404).json({ 
        error: 'Event shape not found',
        id: eventShapeId
      });
      return;
    }

    // Validate name if provided
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
        res.status(400).json({ 
          error: 'Invalid event shape name',
          message: 'Name must be a non-empty string'
        });
        return;
      }

      // Check if another event shape with same name already exists
      const existingWithName = await EventShape.findOne({
        attributes: getModelAttributes(EventShape),
        where: { 
          name: req.body.name.trim(),
          id: { [Op.ne]: eventShapeId }
        }
      });

      if (existingWithName) {
        res.status(400).json({ 
          error: 'Event shape already exists',
          name: req.body.name,
          message: 'Another event shape with this name already exists'
        });
        return;
      }

      req.body.name = req.body.name.trim();
    }
    
    const updatedCount = await patchRecord(EventShape, eventShapeId, req.body);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: 'Event shape not found or could not be updated',
        id: eventShapeId
      });
      return;
    }
    
    // Fetch updated event shape
    const updated = await EventShape.findByPk(eventShapeId, {
      attributes: getModelAttributes(EventShape)
    });
    res.json(updated);
  } catch (error) {
    console.error('[EventShapeRouter] PATCH Error:', {
      id: eventShapeId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Failed to patch event shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /event-shapes/:id
 * Delete an event shape
 * 
 * LEARNING: Prevents deletion if event instances are using this shape
 * WHY: Maintains data integrity - can't delete shapes that are in use
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { EventInstance } = await import('../../../../config/app.js');
    
    // Check if any event instances are using this shape
    const eventInstancesUsingShape = await EventInstance.count({
      where: { eventShapeRef: req.params.id }
    });

    if (eventInstancesUsingShape > 0) {
      res.status(400).json({ 
        error: 'Cannot delete event shape',
        id: req.params.id,
        message: `Cannot delete event shape because ${eventInstancesUsingShape} event instance(s) are using it. Please update or delete those event instances first.`
      });
      return;
    }

    const deletedCount = await deleteRecord(EventShape, req.params.id);
    
    if (deletedCount === 0) {
      res.status(404).json({ 
        error: 'Event shape not found',
        id: req.params.id
      });
      return;
    }
    
    res.json({ 
      message: 'Event shape deleted successfully',
      deleted: deletedCount
    });
  } catch (error) {
    console.error('[EventShapeRouter] Error deleting event shape:', error);
    res.status(500).json({ 
      error: 'Error deleting event shape',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as EventShapeRouter };
