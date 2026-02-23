import { ModelStatic, Model } from 'sequelize';
import { PartShape, PartInstance, BlockShape, BlockInstance, EventShape, EventInstance, AnnotationShape, AnnotationInstance } from './app.js';
import { createLogger } from '../utils/logger.js';
import type { ComponentConfig, ComponentStrategy } from '../../../shared/types/componentTypes.js';

const logger = createLogger('EntityRegistry');

export type EntityType = 'partInstance' | 'blockInstance' | 'partShape' | 'blockShape' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance';

export type { ComponentConfig, ComponentStrategy };

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
  logger.warn('Models not yet initialized:', missingModels);
  logger.warn('This is normal during module loading - models will be available after app initialization');
}

const ENTITY_REGISTRY: Record<EntityType, EntityConfig> = {
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

