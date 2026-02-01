import { ModelStatic, Model } from 'sequelize';
import { PartShape, PartInstance, BlockShape, BlockInstance, EventShape, EventInstance, AnnotationShape, AnnotationInstance } from './app.js';

/**
 * Helper function to check if a BlockInstance can be a component
 * 
 * LEARNING: Component relationships are now controlled by BlockShape's composable property
 * WHY: Only BlockInstances with composable BlockShapes can participate in component relationships
 * PATTERN: Runtime check based on BlockShape's composable property
 */
export async function isBlockInstanceComposable(blockInstanceId: string): Promise<boolean> {
  try {
    const blockInstance = await BlockInstance.findByPk(blockInstanceId, {
      include: [{ model: BlockShape, as: 'block_shape' }],
    });
    
    if (!blockInstance) {
      return false;
    }
    
    // PATTERN: Cast to any to access association, then cast association to proper type
    const blockInstanceWithShape = blockInstance as any;
    const blockShape = blockInstanceWithShape.block_shape as InstanceType<typeof BlockShape> | undefined;
    
    if (!blockShape) {
      return false;
    }
    
    return blockShape.composable === true;
  } catch (error) {
    console.error('[EntityRegistry] Error checking if BlockInstance is composable:', error);
    return false;
  }
}

export function getComponentConfig(entityType: EntityType): ComponentConfig | undefined {
  const config = ENTITY_REGISTRY[entityType];
  
  if (entityType === 'blockInstance') {
    return {
      enabled: true, // Enabled at type level, but checked per-instance
      componentRules: {
        baseFee: 'sum',
        baseTime: 'sum',
        rateOverBaseFee: 'sum',
        partAssignments: 'merge', // Merge all part instances from composed blocks
        name: 'first', // Use first particle's name
      },
    };
  }
  
  return config.component;
}

/**
 * Supported entity types that map to frontend PROPERTY_KEYS
 * These strings MUST match the keys used in client/src/global/constants/propertyConstants.ts
 * 
 * Session Event Refactor: Added eventShape and eventInstance to entity registry
 * WHY: Enables admin CRUD operations for event shapes and instances
 * PATTERN: Follows annotation pattern but includes in registry for admin UI
 * 
 * Session Annotation/Event Entity Refactor: Added annotationShape and annotationInstance to entity registry
 * WHY: Annotations are now core entities, not configuration data
 * PATTERN: All entity types (including annotations/events) use unified entity endpoints
 */
export type EntityType = 'partInstance' | 'blockInstance' | 'partShape' | 'blockShape' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance';

/**
 * Component strategy for combining properties
 * 
 * LEARNING: Different properties need different component strategies
 * WHY: Numeric values sum, arrays merge, booleans use AND, strings use first
 * PATTERN: Config-driven component per property
 */
export type ComponentStrategy = 'sum' | 'merge' | 'first' | 'every' | 'custom';

/**
 * Component configuration for entities
 * 
 * LEARNING: Config-driven component enables flexible component rules
 * WHY: Different entity types and properties need different component behavior
 * PATTERN: Optional config that enables component relationships with property-specific rules
 */
export interface ComponentConfig {
  enabled: boolean;
  componentRules?: Record<string, ComponentStrategy>;
}

/**
 * Entity configuration structure
 * WHY: Uses Model without generics for generic model references
 * PATTERN: Sequelize ModelStatic<Model> is the standard type for unknown model types
 */
export interface EntityConfig {
  model: ModelStatic<Model>;
  tableName: string;
  displayName: string;
  description: string;
  component?: ComponentConfig;
}

if (!PartShape || !PartInstance || !BlockShape || !BlockInstance || !EventShape || !EventInstance || !AnnotationShape || !AnnotationInstance) {
  const missingModels = {
    PartShape: !!PartShape,
    PartInstance: !!PartInstance,
    BlockShape: !!BlockShape,
    BlockInstance: !!BlockInstance,
    EventShape: !!EventShape,
    EventInstance: !!EventInstance,
    AnnotationShape: !!AnnotationShape,
    AnnotationInstance: !!AnnotationInstance
  };
  console.warn('[EntityRegistry] Models not yet initialized:', missingModels);
  console.warn('[EntityRegistry] This is normal during module loading - models will be available after app initialization');
}

export const ENTITY_REGISTRY: Record<EntityType, EntityConfig> = {
  partInstance: {
    model: PartInstance,
    tableName: 'part_instances',
    displayName: 'Part Instance',
    description: 'Individual part instances with timing and fee configuration'
  },
  blockInstance: {
    model: BlockInstance,
    tableName: 'block_instances',
    displayName: 'Block Instance',
    description: 'Block instances with shape assignments and configuration',
  },
  partShape: {
    model: PartShape,
    tableName: 'part_shapes',
    displayName: 'Part Shape',
    description: 'Part shape definitions and constraints'
  },
  blockShape: {
    model: BlockShape,
    tableName: 'block_shapes',
    displayName: 'Block Shape',
    description: 'Block shape definitions and constraints'
  },
  eventShape: {
    model: EventShape,
    tableName: 'event_shapes',
    displayName: 'Event Shape',
    description: 'Event shape definitions (e.g., OnSite, Moveable, ClientPresent)'
  },
  eventInstance: {
    model: EventInstance,
    tableName: 'event_instances',
    displayName: 'Event Instance',
    description: 'Event instance configurations with calendar event templates'
  },
  annotationShape: {
    model: AnnotationShape,
    tableName: 'annotation_shapes',
    displayName: 'Annotation Shape',
    description: 'Annotation shape definitions (e.g., description, tooltip)'
  },
  annotationInstance: {
    model: AnnotationInstance,
    tableName: 'annotation_instances',
    displayName: 'Annotation Instance',
    description: 'Reusable annotation instances that can be assigned to block instances'
  }
};

/**
 * Validate if a string is a valid entity type
 */
export function isValidEntityType(value: string): value is EntityType {
  return value in ENTITY_REGISTRY;
}

export function getEntityConfig(entityType: string): EntityConfig {
  if (!isValidEntityType(entityType)) {
    throw new Error(`Unknown entity type: ${entityType}. Valid types: ${Object.keys(ENTITY_REGISTRY).join(', ')}`);
  }
  
  const config = ENTITY_REGISTRY[entityType];
  
  if (!config.model) {
    throw new Error(`Model not available for entity type: ${entityType}. Models may not be initialized yet.`);
  }
  
  return config;
}

