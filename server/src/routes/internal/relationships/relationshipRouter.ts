import { Router, Request, Response } from 'express';
import { ValidCascade, ValidPart, ValidAnnotation, ValidEvent, DependentInstance, BookingCascade, PartAssignment, AnnotationAssignment, EventAssignment, EventShapeAttendee, InstanceComponent, BlockInstance, BlockShape, EventInstance, EventShape, PartShape, PartInstance, AnnotationInstance, AnnotationShape } from '../../../config/app.js';
import { Model, ModelStatic } from 'sequelize';
import { getModelAttributes, isModelUnderscored } from '../../../utils/sequelizeHelpers.js';

const router = Router();

/**
 * Relationship kind configuration
 * LEARNING: RelationshipKind represents the type of relationship (validCascades, validParts, etc.)
 * WHY: Clear naming - "kind" distinguishes relationship types from entity structure types
 * PATTERN: Type alias for relationship discriminator values
 * 
 * Three-dimensional relationship model:
 * - Cascade: Vertical hierarchy (different shapes, e.g., user_shape → service)
 * - Constituent: Block → Part relationships (math dimension)
 * - Component: Lateral component relationships (same shape, e.g., service → service)
 * 
 * NOTE: Renamed for clearer domain terminology:
 * - activeCascades → bookingCascades (Booking Cascade) (2026-01-08)
 * - activeComponents → serviceComponents → instanceComponents (Instance Components) (2026-01-07)
 * - validIndependentComponents → additionalServiceOptions → dependentInstanceOptions → dependentInstances (2026-01-20, final naming)
 */
type RelationshipKind = 'validCascades' | 'validParts' | 'validAnnotations' | 'validEvents' | 'dependentInstances' | 'bookingCascades' | 'partAssignments' | 'annotationAssignments' | 'eventAssignments' | 'attendeeAssignments' | 'instanceComponents';

interface RelationshipConfig {
  model: ModelStatic<Model>;
  displayName: string;
  parentEntity: string;
  childEntity: string;
}

// Verify models are available
if (!ValidCascade || !ValidPart || !ValidAnnotation || !DependentInstance || !BookingCascade || !PartAssignment || !AnnotationAssignment || !EventAssignment || !EventShapeAttendee || !InstanceComponent) {
  console.error('[RelationshipRouter] Missing models:', {
    ValidCascade: !!ValidCascade,
    ValidPart: !!ValidPart,
    ValidAnnotation: !!ValidAnnotation,
    DependentInstance: !!DependentInstance,
    BookingCascade: !!BookingCascade,
    PartAssignment: !!PartAssignment,
    AnnotationAssignment: !!AnnotationAssignment,
    EventAssignment: !!EventAssignment,
    EventShapeAttendee: !!EventShapeAttendee,
    InstanceComponent: !!InstanceComponent
  });
}

const RELATIONSHIP_REGISTRY: Record<RelationshipKind, RelationshipConfig> = {
  validCascades: {
    model: ValidCascade,
    displayName: 'Valid Cascade',
    parentEntity: 'blockShape',
    childEntity: 'blockShape'
  },
  validParts: {
    model: ValidPart,
    displayName: 'Valid Part',
    parentEntity: 'blockShape',
    childEntity: 'partShape'
  },
  validAnnotations: {
    model: ValidAnnotation,
    displayName: 'Valid Annotation',
    parentEntity: 'blockShape',
    childEntity: 'annotationShape'
  },
  validEvents: {
    model: ValidEvent,
    displayName: 'Valid Event',
    parentEntity: 'partShape',
    childEntity: 'eventShape'
  },
  dependentInstances: {
    model: DependentInstance,
    displayName: 'Dependent Instance',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  },
  bookingCascades: {
    model: BookingCascade,
    displayName: 'Booking Cascade',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  },
  partAssignments: {
    model: PartAssignment,
    displayName: 'Part Assignment',
    parentEntity: 'blockInstance',
    childEntity: 'partInstance'
  },
  annotationAssignments: {
    model: AnnotationAssignment,
    displayName: 'Annotation Assignment',
    parentEntity: 'blockInstance',
    childEntity: 'annotationInstance'
  },
  eventAssignments: {
    model: EventAssignment,
    displayName: 'Event Assignment',
    parentEntity: 'partInstance', // Can be partInstance or blockInstance (determined by parent_kind)
    childEntity: 'eventInstance'
  },
  attendeeAssignments: {
    model: EventShapeAttendee,
    displayName: 'Attendee Assignment',
    parentEntity: 'eventShape',
    childEntity: 'blockInstance'
  },
  instanceComponents: {
    model: InstanceComponent,
    displayName: 'Instance Component',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  }
};

function isValidRelationshipKind(value: string): value is RelationshipKind {
  // Check if it's a valid relationship kind
  return value in RELATIONSHIP_REGISTRY;
}

function normalizeRelationshipKind(value: string): RelationshipKind {
  // Relationship kind must already be in the registry
  if (value in RELATIONSHIP_REGISTRY) {
    return value as RelationshipKind;
  }
  // No backward compatibility - throw error for unknown relationship kinds
  throw new Error(`Unknown relationship kind: ${value}`);
}

/**
 * Helper function to map generic parent_id/child_id to model-specific field names
 * 
 * LEARNING: Different relationship models use different field names
 * WHY: Models have domain-specific field names (blockInstanceId vs parent_id)
 * PATTERN: Map generic API field names to model-specific attributes
 */
async function mapRelationshipFields(
  relationshipKind: RelationshipKind,
  parentId: string,
  childId: string
): Promise<Record<string, string>> {
  switch (relationshipKind) {
    case RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS:
      return {
        blockInstanceId: parentId,
        annotationId: childId,
      };
    case RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS:
      return {
        eventShapeId: parentId,
        userTypeBlockInstanceId: childId,
      };
    case RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS: {
      // LEARNING: eventAssignments uses parent_id/child_id pattern with parent_kind enum
      // WHY: Matches partAssignments pattern exactly for consistency
      // PATTERN: Determine parent_kind by checking which table parentId exists in
      const partInstance = await PartInstance.findByPk(parentId);
      if (partInstance) {
        return {
          parent_id: parentId,
          parentKind: 'partInstance',
          child_id: childId,
        };
      }
      // Check if it's a BlockInstance
      const blockInstance = await BlockInstance.findByPk(parentId);
      if (blockInstance) {
        return {
          parent_id: parentId,
          parentKind: 'blockInstance',
          child_id: childId,
        };
      }
      // LEARNING: No shape-level fallback - event assignments are instance-level only
      // WHY: EventInstances are native to instances, not shapes
      throw new Error(`Parent ID ${parentId} is not a valid PartInstance or BlockInstance for eventAssignments`);
    }
    default:
      // Standard models use parent_id/child_id
      return {
        parent_id: parentId,
        child_id: childId,
      };
  }
}

/**
 * Helper function to check for circular references in component relationships
 * 
 * LEARNING: Circular reference detection prevents infinite loops
 * WHY: Components can themselves be parents, but we must prevent cycles
 * PATTERN: Functional BFS traversal without array mutations
 */
async function hasCircularReference(
  parentId: string,
  childId: string
): Promise<boolean> {
  const visited = new Set<string>();
  
  /**
   * Functional BFS helper that processes queue without mutations
   * LEARNING: Uses array destructuring and spread to rebuild queue functionally
   * WHY: Avoids queue.shift() and queue.push() mutations
   * PATTERN: Process head of queue, rebuild tail with new items
   */
  async function processQueue(queue: string[]): Promise<boolean> {
    if (queue.length === 0) {
      return false;
    }
    
    const [currentId, ...remainingQueue] = queue;
    
    if (currentId === parentId) {
      return true; // Circular reference detected
    }
    
    if (visited.has(currentId)) {
      // Skip already visited nodes, continue with remaining queue
      return processQueue(remainingQueue);
    }
    
    visited.add(currentId);
    
    // Find all parents where currentId is a parent
    const parents = await InstanceComponent.findAll({
      attributes: getModelAttributes(InstanceComponent),
      where: {
        parent_id: currentId,
        disabled: false,
      },
    });
    
    // LEARNING: Build new queue functionally using spread operator
    // WHY: Creates new array instead of mutating existing queue
    // PATTERN: Map parents to child_ids, filter unvisited, append to remaining queue
    const childIds = parents
      .map(parent => parent.child_id)
      .filter(id => !visited.has(id));
    
    const nextQueue = [...remainingQueue, ...childIds];
    
    return processQueue(nextQueue);
  }
  
  return processQueue([childId]);
}

/**
 * Middleware: Validate relationship kind and attach configuration
 * 
 * LEARNING: Route parameter name differs from internal concept
 * WHY: URL structure stability is important - changing route params breaks existing clients
 * PATTERN: Route param name (:relationshipType) can differ from internal concept (relationshipKind)
 * NOTE: Route param uses "relationshipType" for URL stability, but internally we use "relationshipKind" for clarity
 */
router.param('relationshipType', (req, res, next, relationshipType) => {
  if (!isValidRelationshipKind(relationshipType)) {
    return res.status(404).json({ 
      error: `Unknown relationship kind: ${relationshipType}`,
      validKinds: Object.keys(RELATIONSHIP_REGISTRY)
    });
  }
  
  const normalizedKind = normalizeRelationshipKind(relationshipType);
  req.relationshipConfig = RELATIONSHIP_REGISTRY[normalizedKind];
  next();
});

/**
 * GET /relationships/:relationshipType
 * Get all relationships of a specific kind
 * 
 * Query Parameters (for instanceComponents):
 * - parent_id: Filter by parent ID
 * 
 * NOTE: Route parameter uses "relationshipType" for URL stability, but internally we use "relationshipKind" for clarity
 */
router.get('/:relationshipType', async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig;
  if (!relationshipConfig) {
    res.status(500).json({ error: 'Relationship configuration missing' });
    return;
  }
  
  if (!relationshipConfig.model) {
    console.error('[RelationshipRouter] Model is undefined for:', req.params.relationshipType);
    res.status(500).json({ 
      error: `Model not available for ${relationshipConfig.displayName}`,
      relationshipType: req.params.relationshipType
    });
    return;
  }
  
  try {
    const { parent_id, blockInstanceId } = req.query;
    
    // LEARNING: Build where clause functionally using object spread
    // WHY: Avoids mutating objects, uses immutable patterns
    // PATTERN: Build where clause conditionally with spread operator
    const modelAttributes = relationshipConfig.model.getAttributes();
    const baseWhere: any = {};
    
    // Conditionally filter disabled relationships only if model has disabled field
    const whereWithDisabled = 'disabled' in modelAttributes
      ? { ...baseWhere, disabled: false }
      : baseWhere;
    
    // Support parent_id filtering for instanceComponents
    // LEARNING: Validate parent_id is a valid UUID before using it
    // WHY: parent_id must be a UUID, not an entity key string
    // PATTERN: Only filter if parent_id is provided and looks like a UUID
    const whereWithParentId = (() => {
      if (req.params.relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS && parent_id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (typeof parent_id === 'string' && uuidRegex.test(parent_id)) {
          return { ...whereWithDisabled, parent_id };
        } else {
          console.warn(`[RelationshipRouter] Invalid parent_id format: ${parent_id}. Expected UUID, ignoring filter.`);
        }
      }
      return whereWithDisabled;
    })();
    
    // Support blockInstanceId filtering for annotationAssignments
    // LEARNING: annotationAssignments uses blockInstanceId field (not parent_id)
    // WHY: Different relationship models use different field names for parent reference
    // PATTERN: Filter by model-specific field name when query parameter matches
    const whereClause = (() => {
      if (req.params.relationshipType === 'annotationAssignments' && blockInstanceId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (typeof blockInstanceId === 'string' && uuidRegex.test(blockInstanceId)) {
          return { ...whereWithParentId, blockInstanceId };
        } else {
          console.warn(`[RelationshipRouter] Invalid blockInstanceId format: ${blockInstanceId}. Expected UUID, ignoring filter.`);
        }
      }
      return whereWithParentId;
    })();
    
    const options: any = {
      where: whereClause
    };
    
    // Order by orderIndex for instanceComponents only
    // LEARNING: Use Sequelize attribute name (orderIndex), not database column name (order_index)
    // WHY: Sequelize handles the mapping from camelCase attribute to snake_case column
    // PATTERN: Use attribute names in Sequelize queries, not database column names
    // NOTE: annotationAssignments and eventAssignments no longer have orderIndex - metadata moved to shape tables
    if (req.params.relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS) {
      options.order = [['orderIndex', 'ASC']];
    }
    
    // Add includes for eventAssignments to get nested data (EventInstance.eventShape)
    // LEARNING: Include nested data for eventAssignments
    // WHY: Provides richer data structure matching separate endpoint behavior
    // PATTERN: Conditional includes based on relationship type
    if (req.params.relationshipType === 'eventAssignments') {
      options.include = [
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
      ];
    }
    
    // Add includes for annotationAssignments to get nested data (AnnotationInstance.annotationShape, BlockInstance)
    // LEARNING: Include nested data for annotationAssignments similar to separate endpoint
    // WHY: Provides richer data structure matching separate endpoint behavior
    // PATTERN: Conditional includes based on relationship type
    if (req.params.relationshipType === RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS) {
      options.include = [
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
          attributes: ['id', 'name'],
          required: false
        }
      ];
    }
    
    // IMPORTANT: For models with `underscored: true`, always specify `attributes` explicitly
    // to avoid duplicate columns in SQL queries (both snake_case and camelCase versions)
    if (isModelUnderscored(relationshipConfig.model)) {
      options.attributes = getModelAttributes(relationshipConfig.model);
    }
    
    const data = await relationshipConfig.model.findAll(options);
    res.json(data);
  } catch (error) {
    console.error('[RelationshipRouter] Error fetching relationships:', error);
    console.error('[RelationshipRouter] Relationship kind:', req.params.relationshipType);
    console.error('[RelationshipRouter] Model:', relationshipConfig.model?.name);
    res.status(500).json({ 
      error: `Failed to fetch ${relationshipConfig.displayName}s`,
      details: error instanceof Error ? error.message : 'Unknown error',
      relationshipKind: req.params.relationshipType
    });
  }
});

/**
 * POST /relationships/:relationshipType
 * Create a new relationship
 * 
 * NOTE: Route parameter uses "relationshipType" for URL stability, but internally we use "relationshipKind" for clarity
 * 
 * Request Body:
 * - parent_id: Parent entity ID
 * - child_id: Child entity ID
 * - order_index (optional, for instanceComponents): Order index for components
 */
router.post('/:relationshipType', async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig;
  if (!relationshipConfig) {
    res.status(500).json({ error: 'Relationship configuration missing' });
    return;
  }
  
  const { parent_id, child_id, order_index } = req.body;
  
  if (!parent_id || !child_id) {
    res.status(400).json({ 
      error: 'Missing required fields: parent_id and child_id are required' 
    });
    return;
  }
  
  // Component-specific validation for instanceComponents
  if (req.params.relationshipType === 'instanceComponents') {
    // Validate that parent and child are different
    if (parent_id === child_id) {
      res.status(400).json({
        error: 'Parent and child cannot be the same entity',
      });
      return;
    }
    
    // Validate that parent and child exist
    try {
      const parentExists = await BlockInstance.findByPk(parent_id);
      const childExists = await BlockInstance.findByPk(child_id);
      
      if (!parentExists) {
        res.status(404).json({
          error: `Parent BlockInstance not found: ${parent_id}`,
        });
        return;
      }
      
      if (!childExists) {
        res.status(404).json({
          error: `Child BlockInstance not found: ${child_id}`,
        });
        return;
      }
      
      // Get BlockInstance entities with their BlockShape
      const parentBlockInstance = await BlockInstance.findByPk(parent_id, {
        include: [{ model: BlockShape, as: 'block_shape' }],
      });
      const childBlockInstance = await BlockInstance.findByPk(child_id, {
        include: [{ model: BlockShape, as: 'block_shape' }],
      });
      
      if (!parentBlockInstance || !childBlockInstance) {
        res.status(404).json({
          error: 'BlockInstance not found',
        });
        return;
      }
      
      // LEARNING: Access Sequelize association via type assertion
      // WHY: Sequelize associations are dynamically added, TypeScript doesn't know about them
      // PATTERN: Cast to any to access association, then cast association to proper type
      const parentBlockInstanceWithShape = parentBlockInstance as any;
      const parentBlockShape = parentBlockInstanceWithShape.block_shape as InstanceType<typeof BlockShape> | undefined;
      
      if (!parentBlockShape) {
        res.status(404).json({
          error: `BlockInstance parent missing BlockShape: ${parent_id}`,
        });
        return;
      }
      
      const childBlockInstanceWithShape = childBlockInstance as any;
      const childBlockShape = childBlockInstanceWithShape.block_shape as InstanceType<typeof BlockShape> | undefined;
      
      if (!childBlockShape) {
        res.status(404).json({
          error: `BlockInstance child missing BlockShape: ${child_id}`,
        });
        return;
      }
      
      // Check if parent's BlockShape is composable
      if (!parentBlockShape.composable) {
        res.status(400).json({
          error: `BlockShape '${parentBlockShape.name}' is not composable. Components are only allowed for BlockInstances with composable BlockShapes.`,
          blockShapeId: parentBlockShape.id,
          blockShapeName: parentBlockShape.name,
        });
        return;
      }
      
      // Check if child's BlockShape is composable
      if (!childBlockShape.composable) {
        res.status(400).json({
          error: `BlockShape '${childBlockShape.name}' is not composable. Components are only allowed for BlockInstances with composable BlockShapes.`,
          blockShapeId: childBlockShape.id,
          blockShapeName: childBlockShape.name,
        });
        return;
      }
      
      // Ensure both BlockInstances have the same BlockShape (components same type only)
      if (parentBlockShape.id !== childBlockShape.id) {
        res.status(400).json({
          error: 'Components must have the same BlockShape as their parent',
          parentBlockShape: parentBlockShape.name,
          childBlockShape: childBlockShape.name,
        });
        return;
      }
    } catch (error) {
      console.error('[RelationshipRouter] Error validating entities:', error);
      res.status(500).json({
        error: 'Error validating entities',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
    
    // Check for circular references
    try {
      const hasCircular = await hasCircularReference(parent_id, child_id);
      
      if (hasCircular) {
        res.status(400).json({
          error: 'Circular reference detected: adding this component would create a cycle',
        });
        return;
      }
    } catch (error) {
      console.error('[RelationshipRouter] Error checking circular references:', error);
      res.status(500).json({
        error: 'Error checking circular references',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
    
    // Check if component relationship already exists
    const existing = await InstanceComponent.findOne({
      where: {
        parent_id: parent_id,
        child_id: child_id,
      },
    });
    
    if (existing) {
      if (existing.disabled) {
        // Re-enable existing disabled relationship
        existing.disabled = false;
        existing.orderIndex = order_index ?? existing.orderIndex;
        await existing.save();
        res.json(existing);
        return;
      } else {
        res.status(409).json({
          error: 'Component relationship already exists',
          parent_id: parent_id,
          child_id: child_id,
        });
        return;
      }
    }
  }
  
  let createData: any;
  try {
    const normalizedKind = normalizeRelationshipKind(req.params.relationshipType);
    
    // LEARNING: Validate attendeeAssignments - ensure parent and child exist
    // WHY: Provides better error messages and prevents foreign key constraint violations
    // PATTERN: Check entity existence before creating relationship
    if (normalizedKind === RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS) {
      const eventShape = await EventShape.findByPk(parent_id);
      if (!eventShape) {
        res.status(400).json({
          error: 'Invalid parent entity',
          details: `EventShape with ID ${parent_id} does not exist`,
          relationshipType: req.params.relationshipType,
        });
        return;
      }
      
      const blockInstance = await BlockInstance.findByPk(child_id);
      if (!blockInstance) {
        res.status(400).json({
          error: 'Invalid child entity',
          details: `BlockInstance with ID ${child_id} does not exist`,
          relationshipType: req.params.relationshipType,
        });
        return;
      }
      
      // LEARNING: Verify that the BlockInstance is a UserTypeBlock (state control block)
      // WHY: Attendee assignments should only reference UserTypeBlock instances
      // PATTERN: Check blockShape.isStateControl === true, but handle gracefully if blockShapeRef is missing
      if (blockInstance.blockShapeRef) {
        const blockShape = await BlockShape.findByPk(blockInstance.blockShapeRef);
        if (!blockShape) {
          res.status(400).json({
            error: 'Invalid block shape reference',
            details: `BlockInstance ${child_id} references non-existent BlockShape ${blockInstance.blockShapeRef}`,
            relationshipType: req.params.relationshipType,
          });
          return;
        }
        if (!blockShape.isStateControl) {
          res.status(400).json({
            error: 'Invalid attendee type',
            details: `BlockInstance ${child_id} is not a UserTypeBlock (isStateControl must be true)`,
            relationshipType: req.params.relationshipType,
          });
          return;
        }
      }
    }
    
    // Map generic parent_id/child_id to model-specific field names
    const baseCreateData = await mapRelationshipFields(normalizedKind, parent_id, child_id);
    
    // Add order_index for instanceComponents using object spread
    // LEARNING: Use object spread instead of property assignment
    // WHY: Avoids mutating the baseCreateData object
    // PATTERN: Build final object with spread operator
    createData = req.params.relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS
      ? {
          ...baseCreateData,
          orderIndex: order_index ?? 0,
          disabled: false,
        }
      : baseCreateData;
    
    // NOTE: annotationAssignments no longer supports orderIndex - metadata moved to annotation_shapes table
    
    const created = await relationshipConfig.model.create(createData);
    
    // For instanceComponents, update active flags
    if (req.params.relationshipType === 'instanceComponents') {
      // LEARNING: Components should be inactive
      // WHY: Only parents appear in scheduler
      // PATTERN: Update component active when component relationship is created
      const childBlockInstance = await BlockInstance.findByPk(child_id);
      if (childBlockInstance) {
        childBlockInstance.active = false;
        await childBlockInstance.save();
      }
      
      // Ensure parent is active
      const parentBlockInstance = await BlockInstance.findByPk(parent_id);
      if (parentBlockInstance) {
        parentBlockInstance.active = true;
        await parentBlockInstance.save();
      }
    }
    
    res.status(201).json(created);
  } catch (error: any) {
    console.error('[RelationshipRouter] Error creating relationship:', error);
    console.error('[RelationshipRouter] Relationship type:', req.params.relationshipType);
    console.error('[RelationshipRouter] Create data:', createData ? JSON.stringify(createData, null, 2) : 'undefined');
    console.error('[RelationshipRouter] Error details:', error instanceof Error ? error.stack : String(error));
    
    // LEARNING: Handle unique constraint violations (duplicate relationships)
    // WHY: Provides better error messages for duplicate relationship attempts
    // PATTERN: Check for Sequelize UniqueConstraintError and return 409 Conflict
    if (error?.name === 'SequelizeUniqueConstraintError' || error?.parent?.code === '23505') {
      res.status(409).json({
        error: 'Relationship already exists',
        details: `This ${relationshipConfig.displayName} relationship already exists`,
        relationshipType: req.params.relationshipType,
        parent_id,
        child_id,
      });
      return;
    }
    
    // LEARNING: Handle foreign key constraint violations
    // WHY: Provides better error messages for invalid entity references
    // PATTERN: Check for Sequelize ForeignKeyConstraintError and return 400 Bad Request
    if (error?.name === 'SequelizeForeignKeyConstraintError' || error?.parent?.code === '23503') {
      res.status(400).json({
        error: 'Invalid entity reference',
        details: error.message || 'One of the referenced entities does not exist',
        relationshipType: req.params.relationshipType,
        parent_id,
        child_id,
      });
      return;
    }
    
    res.status(500).json({ 
      error: `Error creating ${relationshipConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error',
      relationshipType: req.params.relationshipType,
      createData: createData || null
    });
  }
});

/**
 * PATCH /relationships/instanceComponents/:id
 * Update an instance component (e.g., order_index, disabled)
 * 
 * NOTE: This endpoint is specific to instanceComponents for ID-based updates
 */
router.patch('/instanceComponents/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { order_index, disabled } = req.body;
  
  try {
    const component = await InstanceComponent.findByPk(id);
    
    if (!component) {
      res.status(404).json({
        error: 'Instance component not found',
        id,
      });
      return;
    }
    
    if (order_index !== undefined) {
      component.orderIndex = order_index;
    }
    
    if (disabled !== undefined) {
      component.disabled = disabled;
    }
    
    await component.save();
    
    res.json(component);
  } catch (error) {
    console.error('[RelationshipRouter] Error updating instance component:', error);
    res.status(500).json({
      error: 'Error updating instance component',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /relationships/instanceComponents/:id
 * Delete an instance component by ID (soft delete by setting disabled=true)
 * 
 * NOTE: This endpoint is specific to instanceComponents for ID-based deletion
 */
router.delete('/instanceComponents/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const component = await InstanceComponent.findByPk(id);
    
    if (!component) {
      res.status(404).json({
        error: 'Instance component not found',
        id,
      });
      return;
    }
    
    // Soft delete
    component.disabled = true;
    await component.save();
    
    // LEARNING: Restore active when entity is removed from component relationship
    // WHY: Entities can be active again when not a component
    // PATTERN: Restore active when no longer in any component relationships
    // Check if component is still in any other component relationships
    const otherComponents = await InstanceComponent.count({
      where: {
        child_id: component.child_id,
        disabled: false,
      },
    });
    
    // If not in any other component relationships, restore active
    if (otherComponents === 0) {
      const childBlockInstance = await BlockInstance.findByPk(component.child_id);
      if (childBlockInstance) {
        childBlockInstance.active = true;
        await childBlockInstance.save();
      }
    }
    
    res.json({
      message: 'Instance component deleted successfully',
      id,
    });
  } catch (error) {
    console.error('[RelationshipRouter] Error deleting instance component:', error);
    res.status(500).json({
      error: 'Error deleting instance component',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /relationships/annotationAssignments/:blockInstanceId/:annotationId
 * Update an annotation assignment (e.g., userTypeBlockInstanceId)
 * 
 * NOTE: This endpoint is specific to annotationAssignments for parent/child ID-based updates
 * LEARNING: annotationAssignments uses blockInstanceId/annotationId fields (not parent_id/child_id)
 * WHY: Different relationship models use different field names
 * PATTERN: Model-specific endpoint for relationships with non-standard field names
 */
router.patch('/annotationAssignments/:blockInstanceId/:annotationId', async (req: Request, res: Response): Promise<void> => {
  const { blockInstanceId, annotationId } = req.params;
  const { userTypeBlockInstanceId } = req.body;
  
  try {
    const assignment = await AnnotationAssignment.findOne({
      where: {
        blockInstanceId,
        annotationId,
      },
    });
    
    if (!assignment) {
      res.status(404).json({
        error: 'Annotation assignment not found',
        blockInstanceId,
        annotationId,
      });
      return;
    }
    
    // LEARNING: Only userTypeBlockInstanceId can be updated on annotationAssignments
    // WHY: orderIndex and isDefault metadata moved to annotation_shapes table
    // PATTERN: Update only fields that exist on the relationship model
    if (userTypeBlockInstanceId !== undefined) {
      assignment.userTypeBlockInstanceId = userTypeBlockInstanceId || null;
    }
    
    await assignment.save();
    
    res.json(assignment);
  } catch (error) {
    console.error('[RelationshipRouter] Error updating annotation assignment:', error);
    res.status(500).json({
      error: 'Error updating annotation assignment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /relationships/:relationshipType/:parentId/:childId
 * Delete a relationship
 * 
 * NOTE: Route parameter uses "relationshipType" for URL stability, but internally we use "relationshipKind" for clarity
 */
router.delete('/:relationshipType/:parentId/:childId', async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig;
  if (!relationshipConfig) {
    res.status(500).json({ error: 'Relationship configuration missing' });
    return;
  }
  
  const { parentId, childId } = req.params;
  const normalizedKind = normalizeRelationshipKind(req.params.relationshipType);
  
  // Map generic parent_id/child_id to model-specific field names
  const whereClause = await mapRelationshipFields(normalizedKind, parentId, childId);
  
  try {
    const deletedCount = await relationshipConfig.model.destroy({
      where: whereClause
    });
    
    if (deletedCount === 0) {
      res.status(404).json({ 
        error: `${relationshipConfig.displayName} not found`,
        parent_id: parentId,
        child_id: childId
      });
      return;
    }
    
    res.json({ 
      message: `${relationshipConfig.displayName} deleted successfully`,
      deleted: deletedCount
    });
  } catch (error) {
    console.error('[RelationshipRouter] Error:', error);
    res.status(500).json({ 
      error: `Error deleting ${relationshipConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      relationshipConfig?: RelationshipConfig;
    }
  }
}

export { router as RelationshipRouter };
