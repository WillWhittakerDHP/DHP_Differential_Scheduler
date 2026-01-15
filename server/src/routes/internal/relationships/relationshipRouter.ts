import { Router, Request, Response } from 'express';
import { ValidCascade, ValidPart, DependentInstanceOption, BookingCascade, ActivePart, InstanceComponent, BlockInstance, BlockShape } from '../../../config/app.js';
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
 * - validIndependentComponents → additionalServiceOptions → dependentInstanceOptions (Dependent Instance Options) (2026-01-09)
 */
type RelationshipKind = 'validCascades' | 'validParts' | 'dependentInstanceOptions' | 'bookingCascades' | 'activeParts' | 'instanceComponents';

interface RelationshipConfig {
  model: ModelStatic<Model>;
  displayName: string;
  parentEntity: string;
  childEntity: string;
}

// Verify models are available
if (!ValidCascade || !ValidPart || !DependentInstanceOption || !BookingCascade || !ActivePart || !InstanceComponent) {
  console.error('[RelationshipRouter] Missing models:', {
    ValidCascade: !!ValidCascade,
    ValidPart: !!ValidPart,
    DependentInstanceOption: !!DependentInstanceOption,
    BookingCascade: !!BookingCascade,
    ActivePart: !!ActivePart,
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
  dependentInstanceOptions: {
    model: DependentInstanceOption,
    displayName: 'Dependent Instance Option',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  },
  bookingCascades: {
    model: BookingCascade,
    displayName: 'Booking Cascade',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  },
  activeParts: {
    model: ActivePart,
    displayName: 'Active Part',
    parentEntity: 'blockInstance',
    childEntity: 'partInstance'
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
 * Helper function to check for circular references in component relationships
 * 
 * LEARNING: Circular reference detection prevents infinite loops
 * WHY: Components can themselves be parents, but we must prevent cycles
 * PATTERN: Recursive traversal with visited set
 */
async function hasCircularReference(
  parentId: string,
  childId: string
): Promise<boolean> {
  const visited = new Set<string>();
  const queue: string[] = [childId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    if (currentId === parentId) {
      return true; // Circular reference detected
    }
    
    if (visited.has(currentId)) {
      continue; // Already visited
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
    
    // Add all children of these parents to queue
    for (const parent of parents) {
      queue.push(parent.child_id);
    }
  }
  
  return false;
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
    const { parent_id } = req.query;
    const where: any = {};
    
    // Support parent_id filtering for instanceComponents
    // LEARNING: Validate parent_id is a valid UUID before using it
    // WHY: parent_id must be a UUID, not an entity key string
    // PATTERN: Only filter if parent_id is provided and looks like a UUID
    if (req.params.relationshipType === 'instanceComponents' && parent_id) {
      // Validate that parent_id is a UUID (basic check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (typeof parent_id === 'string' && uuidRegex.test(parent_id)) {
        where.parent_id = parent_id;
      } else {
        // Invalid UUID - ignore the filter (return all relationships)
        console.warn(`[RelationshipRouter] Invalid parent_id format: ${parent_id}. Expected UUID, ignoring filter.`);
      }
    }
    
    const options: any = {};
    if (Object.keys(where).length > 0) {
      options.where = where;
    }
    
    // Order by orderIndex for instanceComponents
    // LEARNING: Use Sequelize attribute name (orderIndex), not database column name (order_index)
    // WHY: Sequelize handles the mapping from camelCase attribute to snake_case column
    // PATTERN: Use attribute names in Sequelize queries, not database column names
    if (req.params.relationshipType === 'instanceComponents') {
      options.order = [['orderIndex', 'ASC']];
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
  
  try {
    const createData: any = { parent_id, child_id };
    
    // Add order_index for instanceComponents
    if (req.params.relationshipType === 'instanceComponents') {
      createData.orderIndex = order_index ?? 0;
      createData.disabled = false;
    }
    
    const created = await relationshipConfig.model.create(createData);
    
    // For instanceComponents, update visible flags
    if (req.params.relationshipType === 'instanceComponents') {
      // LEARNING: Components always have visible=false
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
  } catch (error) {
    console.error('[RelationshipRouter] Error:', error);
    res.status(500).json({ 
      error: `Error creating ${relationshipConfig.displayName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
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
    
    // LEARNING: Restore visible when entity is removed from component relationship
    // WHY: Entities can be visible again when not a component
    // PATTERN: Restore visible when no longer in any component relationships
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
  
  try {
    const deletedCount = await relationshipConfig.model.destroy({
      where: { parent_id: parentId, child_id: childId }
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
