import { EntityConfig } from '../config/entityRegistry';

declare global {
  namespace Express {
    interface Request {
      entityConfig?: EntityConfig;
    }
  }
}

