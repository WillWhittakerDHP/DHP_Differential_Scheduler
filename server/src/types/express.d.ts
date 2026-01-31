import { EntityConfig } from '../config/entityRegistry';

interface AnnotationConfig {
  model: any;
  displayName: string;
  isInstance: boolean;
}

interface EventConfig {
  model: any;
  displayName: string;
  isInstance: boolean;
}

declare global {
  namespace Express {
    interface Request {
      entityConfig?: EntityConfig;
      annotationConfig?: AnnotationConfig;
      eventConfig?: EventConfig;
    }
  }
}

