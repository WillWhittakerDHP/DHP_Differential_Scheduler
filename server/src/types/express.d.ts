import type { ModelStatic, Model } from 'sequelize';
import { EntityConfig } from '../config/entityRegistry';
import { RelationshipConfig } from '../routes/internal/relationships/relationshipConstants';

interface AnnotationConfig {
  model: ModelStatic<Model>;
  displayName: string;
  isInstance: boolean;
}

interface EventConfig {
  model: ModelStatic<Model>;
  displayName: string;
  isInstance: boolean;
}

declare global {
  namespace Express {
    interface Request {
      entityConfig?: EntityConfig;
      annotationConfig?: AnnotationConfig;
      eventConfig?: EventConfig;
      relationshipConfig?: RelationshipConfig;
    }
  }
}

