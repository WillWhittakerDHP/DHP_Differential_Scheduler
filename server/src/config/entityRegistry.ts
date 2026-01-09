import { ModelStatic, Model } from 'sequelize';
import { PartShape, PartInstance, BlockShape, BlockInstance } from './app.js';

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
    
    // LEARNING: Access Sequelize association via type assertion
    // WHY: Sequelize associations are dynamically added, TypeScript doesn't know about them
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

/**
 * Get component config for an entity type
 * 
 * LEARNING: Component config is now dynamic based on BlockShape's composable property
 * WHY: Only BlockInstances with composable BlockShapes support component relationships
 * PATTERN: Return config if entity type supports component relationships, undefined otherwise
 */
export function getComponentConfig(entityType: EntityType): ComponentConfig | undefined {
  const config = ENTITY_REGISTRY[entityType];
  
  // For blockInstance, component relationships are enabled but must be checked per-instance via BlockShape
  if (entityType === 'blockInstance') {
    return {
      enabled: true, // Enabled at type level, but checked per-instance
      componentRules: {
        baseFee: 'sum',
        baseTime: 'sum',
        rateOverBaseFee: 'sum',
        activeConstituents: 'merge', // Merge all part instances from composed blocks
        onSite: 'every', // All must be true
        clientPresent: 'every', // All must be true
        name: 'first', // Use first particle's name
        description: 'first', // Use first particle's description
      },
    };
  }
  
  return config.component;
}

/**
 * Supported entity types that map to frontend PROPERTY_KEYS
 * These strings MUST match the keys used in client/src/global/constants/propertyConstants.ts
 */
export type EntityType = 'partInstance' | 'blockInstance' | 'partShape' | 'blockShape';

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
  // Property-specific component strategies (e.g., baseFee: 'sum', activeConstituents: 'merge', onSite: 'every')
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

// Verify models are available (log warning but don't throw - models may be initialized later)
if (!PartShape || !PartInstance || !BlockShape || !BlockInstance) {
  const missingModels = {
    PartShape: !!PartShape,
    PartInstance: !!PartInstance,
    BlockShape: !!BlockShape,
    BlockInstance: !!BlockInstance
  };
  console.warn('[EntityRegistry] Models not yet initialized:', missingModels);
  console.warn('[EntityRegistry] This is normal during module loading - models will be available after app initialization');
}

/**
 * Centralized Entity Registry
 * Maps entity type strings to Sequelize models and metadata
 * 
 * CRITICAL: Entity keys must match frontend PROPERTY_KEYS exactly
 */
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
    // Note: Component relationships enabled is checked dynamically via BlockShape's composable property
    // Use getComponentConfig() to get component config for blockInstance
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
  }
};

/**
 * Validate if a string is a valid entity type
 */
export function isValidEntityType(value: string): value is EntityType {
  return value in ENTITY_REGISTRY;
}

/**
 * Get entity configuration by type
 * Throws error if entity type is invalid or model is not available
 */
export function getEntityConfig(entityType: string): EntityConfig {
  if (!isValidEntityType(entityType)) {
    throw new Error(`Unknown entity type: ${entityType}. Valid types: ${Object.keys(ENTITY_REGISTRY).join(', ')}`);
  }
  
  const config = ENTITY_REGISTRY[entityType];
  
  // Runtime check: ensure model is actually available
  if (!config.model) {
    throw new Error(`Model not available for entity type: ${entityType}. Models may not be initialized yet.`);
  }
  
  return config;
}

