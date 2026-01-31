import { Router, Request, Response } from 'express';
import { EventShape, EventInstance, EventAssignment, PartShape, BlockShape } from '../../../config/app.js';
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
 * Event Router
 * 
 * LEARNING: Consolidated router for event CRUD operations (matching entities/relationships pattern)
 * WHY: Single router handles both eventInstance and eventShape via parameterized routes
 * PATTERN: /events/:eventType where eventType is 'eventInstance' or 'eventShape'
 */

type EventType = 'eventInstance' | 'eventShape';

interface EventConfig {
  model: typeof EventInstance | typeof EventShape;
  displayName: string;
  isInstance: boolean;
}

const EVENT_REGISTRY: Record<EventType, EventConfig> = {
  eventInstance: {
    model: EventInstance,
    displayName: 'Event Instance',
    isInstance: true,
  },
  eventShape: {
    model: EventShape,
    displayName: 'Event Shape',
    isInstance: false,
  },
};

function isValidEventType(eventType: string): eventType is EventType {
  return eventType === 'eventInstance' || eventType === 'eventShape';
}

/**
 * Middleware: Validate event type and attach configuration to request
 */
router.param('eventType', (req, res, next, eventType) => {
  if (!isValidEventType(eventType)) {
    return res.status(404).json({ 
      error: `Unknown event type: ${eventType}`,
      validTypes: ['eventInstance', 'eventShape']
    });
  }
  
  req.eventConfig = EVENT_REGISTRY[eventType];
  next();
});

/**
 * GET /events/:eventType
 * Get all events of a specific type
 */
router.get('/:eventType', async (req: Request, res: Response): Promise<void> => {
  const { eventConfig } = req;
  if (!eventConfig) {
    res.status(500).json({ error: 'Event configuration missing' });
    return;
  }
  
  try {
    if (eventConfig.isInstance) {
      // EventInstance: include eventShape association
      const eventInstances = await EventInstance.findAll({
        attributes: getModelAttributes(EventInstance),
        include: [
          {
            model: EventShape,
            as: 'eventShape',
            attributes: ['id', 'name']
          }
        ]
      });
      res.json(eventInstances);
    } else {
      // EventShape: simple fetch
      const eventShapes = await fetchAll(EventShape, {
        attributes: getModelAttributes(EventShape)
      });
      res.json(eventShapes);
    }
  } catch (error) {
    console.error('[EventRouter] Error fetching events:', error);
    res.status(500).json({ 
      error: `Failed to fetch ${eventConfig.displayName.toLowerCase()}s`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /events/eventInstance/event-assignments
 * Get all EventAssignment relationships (bulk endpoint)
 * 
 * IMPORTANT: This route must be defined BEFORE /:eventType/:id to avoid route conflicts
 */
router.get('/eventInstance/event-assignments', async (req: Request, res: Response): Promise<void> => {
  try {
    const relationships = await EventAssignment.findAll({
      attributes: getModelAttributes(EventAssignment),
      include: [
        {
          model: EventInstance,
          as: 'eventInstance',
          attributes: ['id', 'name', 'event_shape_ref', 'title_template', 'description_template', 'location_template'],
          include: [
            {
              model: EventShape,
              as: 'eventShape',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: PartShape,
          as: 'partShape',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: BlockShape,
          as: 'blockShape',
          attributes: ['id', 'name'],
          required: false
        }
      ]
      // NOTE: orderIndex removed - metadata now in event_shapes table
    });
    
    res.json(relationships);
  } catch (error) {
    console.error('[EventRouter] Error fetching event assignments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /events/:eventType/:id
 * Get a specific event by ID
 */
router.get('/:eventType/:id', async (req: Request, res: Response): Promise<void> => {
  const { eventConfig } = req;
  if (!eventConfig) {
    res.status(500).json({ error: 'Event configuration missing' });
    return;
  }
  
  try {
    if (eventConfig.isInstance) {
      const eventInstance = await EventInstance.findByPk(req.params.id, {
        attributes: getModelAttributes(EventInstance),
        include: [
          {
            model: EventShape,
            as: 'eventShape',
            attributes: ['id', 'name']
          }
        ]
      });
      
      if (!eventInstance) {
        res.status(404).json({ 
          error: 'Event instance not found',
          id: req.params.id
        });
        return;
      }
      
      res.json(eventInstance);
    } else {
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
    }
  } catch (error) {
    console.error('[EventRouter] Error fetching event:', error);
    res.status(500).json({ 
      error: `Error fetching ${eventConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /events/:eventType
 * Create a new event
 */
router.post('/:eventType', async (req: Request, res: Response): Promise<void> => {
  const { eventConfig } = req;
  if (!eventConfig) {
    res.status(500).json({ error: 'Event configuration missing' });
    return;
  }
  
  try {
    if (eventConfig.isInstance) {
      // Validate event_shape_ref if provided
      if (req.body.eventShapeRef || req.body.event_shape_ref) {
        const eventShapeRef = req.body.eventShapeRef || req.body.event_shape_ref;
        const eventShape = await EventShape.findByPk(eventShapeRef);
        if (!eventShape) {
          res.status(400).json({ 
            error: 'Invalid event shape',
            eventShapeRef,
            message: 'The provided shape ID does not exist in event_shapes table'
          });
          return;
        }
      }
      
      const newEventInstance = await createRecord(EventInstance, req.body);
      
      // Fetch created event instance with eventShape association
      const createdEventInstance = await EventInstance.findByPk(newEventInstance.id, {
        attributes: getModelAttributes(EventInstance),
        include: [
          {
            model: EventShape,
            as: 'eventShape',
            attributes: ['id', 'name']
          }
        ]
      });
      
      res.status(201).json(createdEventInstance);
    } else {
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
    }
  } catch (error) {
    console.error('[EventRouter] Error creating event:', error);
    res.status(500).json({ 
      error: `Error creating ${eventConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /events/:eventType/:id
 * Update an event (full replacement)
 */
router.put('/:eventType/:id', async (req: Request, res: Response): Promise<void> => {
  const { eventConfig } = req;
  if (!eventConfig) {
    res.status(500).json({ error: 'Event configuration missing' });
    return;
  }
  
  try {
    if (eventConfig.isInstance) {
      // Validate event_shape_ref if provided
      if (req.body.eventShapeRef || req.body.event_shape_ref) {
        const eventShapeRef = req.body.eventShapeRef || req.body.event_shape_ref;
        const eventShape = await EventShape.findByPk(eventShapeRef);
        if (!eventShape) {
          res.status(400).json({ 
            error: 'Invalid event shape',
            eventShapeRef,
            message: 'The provided shape ID does not exist in event_shapes table'
          });
          return;
        }
      }
      
      const updatedCount = await updateRecord(EventInstance, req.params.id, req.body);
      
      if (updatedCount === 0) {
        res.status(404).json({ 
          error: 'Event instance not found',
          id: req.params.id
        });
        return;
      }
      
      // Fetch updated event instance with eventShape association
      const updatedEventInstance = await EventInstance.findByPk(req.params.id, {
        attributes: getModelAttributes(EventInstance),
        include: [
          {
            model: EventShape,
            as: 'eventShape',
            attributes: ['id', 'name']
          }
        ]
      });
      
      res.json(updatedEventInstance);
    } else {
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
    }
  } catch (error) {
    console.error('[EventRouter] Error updating event:', error);
    res.status(500).json({ 
      error: `Error updating ${eventConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /events/:eventType/:id
 * Partially update an event
 */
router.patch('/:eventType/:id', async (req: Request, res: Response): Promise<void> => {
  const { eventConfig } = req;
  const eventId = req.params.id;
  
  if (!eventConfig) {
    res.status(500).json({ error: 'Event configuration missing' });
    return;
  }
  
  try {
    if (eventConfig.isInstance) {
      // Verify event instance exists
      const existingEventInstance = await EventInstance.findByPk(eventId, {
        attributes: getModelAttributes(EventInstance)
      });
      if (!existingEventInstance) {
        res.status(404).json({ 
          error: 'Event instance not found',
          id: eventId
        });
        return;
      }
      
      // Validate event_shape_ref if provided
      if (req.body.eventShapeRef || req.body.event_shape_ref) {
        const eventShapeRef = req.body.eventShapeRef || req.body.event_shape_ref;
        const eventShape = await EventShape.findByPk(eventShapeRef);
        if (!eventShape) {
          res.status(400).json({ 
            error: 'Invalid event shape',
            eventShapeRef,
            message: 'The provided shape ID does not exist in event_shapes table'
          });
          return;
        }
      }
      
      const updatedCount = await patchRecord(EventInstance, eventId, req.body);
      
      if (updatedCount === 0) {
        res.status(404).json({ 
          error: 'Event instance not found or could not be updated',
          id: eventId
        });
        return;
      }
      
      // Fetch updated event instance with eventShape association
      const updatedEventInstance = await EventInstance.findByPk(eventId, {
        attributes: getModelAttributes(EventInstance),
        include: [
          {
            model: EventShape,
            as: 'eventShape',
            attributes: ['id', 'name']
          }
        ]
      });
      
      res.json(updatedEventInstance);
    } else {
      // Verify event shape exists
      const existing = await EventShape.findByPk(eventId, {
        attributes: getModelAttributes(EventShape)
      });
      if (!existing) {
        res.status(404).json({ 
          error: 'Event shape not found',
          id: eventId
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
            id: { [Op.ne]: eventId }
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
      
      const updatedCount = await patchRecord(EventShape, eventId, req.body);
      
      if (updatedCount === 0) {
        res.status(404).json({ 
          error: 'Event shape not found or could not be updated',
          id: eventId
        });
        return;
      }
      
      // Fetch updated event shape
      const updated = await EventShape.findByPk(eventId, {
        attributes: getModelAttributes(EventShape)
      });
      res.json(updated);
    }
  } catch (error) {
    console.error('[EventRouter] PATCH Error:', {
      id: eventId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: `Failed to patch ${eventConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /events/:eventType/:id
 * Delete an event
 */
router.delete('/:eventType/:id', async (req: Request, res: Response): Promise<void> => {
  const { eventConfig } = req;
  if (!eventConfig) {
    res.status(500).json({ error: 'Event configuration missing' });
    return;
  }
  
  try {
    if (eventConfig.isInstance) {
      const deletedCount = await deleteRecord(EventInstance, req.params.id);
      
      if (deletedCount === 0) {
        res.status(404).json({ 
          error: 'Event instance not found',
          id: req.params.id
        });
        return;
      }
      
      res.json({ 
        message: 'Event instance deleted successfully',
        deleted: deletedCount
      });
    } else {
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
    }
  } catch (error) {
    console.error('[EventRouter] Error deleting event:', error);
    res.status(500).json({ 
      error: `Error deleting ${eventConfig.displayName.toLowerCase()}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * EventAssignment Management Endpoints (eventInstance-specific)
 * These routes handle the many-to-many relationship between PartShape/BlockShape and EventInstance
 */

/**
 * GET /events/eventInstance/part-shape/:partShapeId
 * Get all event assignments for a specific part shape
 */
router.get('/eventInstance/part-shape/:partShapeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partShapeId } = req.params;
    
    // Verify part shape exists
    const partShape = await PartShape.findByPk(partShapeId);
    if (!partShape) {
      res.status(404).json({ 
        error: 'Part shape not found',
        partShapeId
      });
      return;
    }
    
    // Get event assignments for this part shape
    const eventAssignments = await EventAssignment.findAll({
      where: { partShapeId: partShapeId },
      attributes: getModelAttributes(EventAssignment),
      include: [
        {
          model: EventInstance,
          as: 'eventInstance',
          attributes: ['id', 'name', 'event_shape_ref', 'title_template', 'description_template', 'location_template'],
          include: [
            {
              model: EventShape,
              as: 'eventShape',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
      // NOTE: orderIndex removed - metadata now in event_shapes table
    });
    
    res.json(eventAssignments);
  } catch (error) {
    console.error('[EventRouter] Error fetching part shape event assignments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch part shape event assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /events/eventInstance/part-shape/:partShapeId
 * Create an EventAssignment relationship for a part shape
 */
router.post('/eventInstance/part-shape/:partShapeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partShapeId } = req.params;
    
    // Verify part shape exists
    const partShape = await PartShape.findByPk(partShapeId);
    if (!partShape) {
      res.status(404).json({ 
        error: 'Part shape not found',
        partShapeId
      });
      return;
    }
    
    // Verify event instance exists
    const eventInstanceId = req.body.eventInstanceId || req.body.event_instance_id;
    if (!eventInstanceId) {
      res.status(400).json({ 
        error: 'eventInstanceId is required'
      });
      return;
    }
    
    const eventInstance = await EventInstance.findByPk(eventInstanceId);
    if (!eventInstance) {
      res.status(404).json({ 
        error: 'Event instance not found',
        eventInstanceId
      });
      return;
    }
    
    // Create EventAssignment relationship
    const eventAssignment = await EventAssignment.create({
      partShapeId: partShapeId,
      eventInstanceId: eventInstanceId
    });
    
    // Fetch created event assignment with includes
    const createdEventAssignment = await EventAssignment.findByPk(eventAssignment.id, {
      attributes: getModelAttributes(EventAssignment),
      include: [
        {
          model: EventInstance,
          as: 'eventInstance',
          attributes: ['id', 'name', 'event_shape_ref', 'title_template', 'description_template', 'location_template'],
          include: [
            {
              model: EventShape,
              as: 'eventShape',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: PartShape,
          as: 'partShape',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(201).json(createdEventAssignment);
  } catch (error) {
    console.error('[EventRouter] Error creating part shape event assignment:', error);
    res.status(500).json({ 
      error: 'Failed to create part shape event assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /events/eventInstance/event-assignments/:id
 * Update an EventAssignment relationship
 */
router.put('/eventInstance/event-assignments/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const eventAssignmentId = req.params.id;
    
    // Verify event assignment exists
    const existingEventAssignment = await EventAssignment.findByPk(eventAssignmentId);
    if (!existingEventAssignment) {
      res.status(404).json({ 
        error: 'Event assignment not found',
        id: eventAssignmentId
      });
      return;
    }
    
    // Update event assignment
    const updatedCount = await updateRecord(EventAssignment, eventAssignmentId, req.body);
    
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: 'Event assignment not found or could not be updated',
        id: eventAssignmentId
      });
      return;
    }
    
    // Fetch updated event assignment with includes
    const updatedEventAssignment = await EventAssignment.findByPk(eventAssignmentId, {
      attributes: getModelAttributes(EventAssignment),
      include: [
        {
          model: EventInstance,
          as: 'eventInstance',
          attributes: ['id', 'name', 'event_shape_ref', 'title_template', 'description_template', 'location_template'],
          include: [
            {
              model: EventShape,
              as: 'eventShape',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: PartShape,
          as: 'partShape',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: BlockShape,
          as: 'blockShape',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    
    res.json(updatedEventAssignment);
  } catch (error) {
    console.error('[EventRouter] Error updating event assignment:', error);
    res.status(500).json({ 
      error: 'Failed to update event assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /events/eventInstance/event-assignments/:id
 * Delete an EventAssignment relationship
 */
router.delete('/eventInstance/event-assignments/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedCount = await deleteRecord(EventAssignment, req.params.id);
    
    if (deletedCount === 0) {
      res.status(404).json({ 
        error: 'Event assignment not found',
        id: req.params.id
      });
      return;
    }
    
    res.json({ 
      message: 'Event assignment deleted successfully',
      deleted: deletedCount
    });
  } catch (error) {
    console.error('[EventRouter] Error deleting event assignment:', error);
    res.status(500).json({ 
      error: 'Failed to delete event assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as EventRouter };
