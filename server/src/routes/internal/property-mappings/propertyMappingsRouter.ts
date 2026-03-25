
import { Router, type Request } from 'express';
import {
  PropertyFieldMapping,
  PropertyFeatureMapping,
  BlockInstance,
} from '../../../config/app.js';
import { createCrudRouter } from '../../helpers/createCrudRouter.js';
import { SORT_ORDERS } from '../entities/entityConstants.js';
import {
  validateFieldMappingBody,
  validateFeatureMappingBody,
} from './propertyMappingsValidators.js';

const router = Router();

const fieldMappingsRouter = createCrudRouter({
  model: PropertyFieldMapping,
  resourceName: 'property field mapping',
  validateRequest: (req: Request, method: 'create' | 'update' | 'patch') =>
    validateFieldMappingBody(req.body, method),
  errorMessages: {
    FETCH_ALL: 'Failed to fetch field mappings',
    FETCH_ONE: 'Failed to fetch field mapping',
    NOT_FOUND: 'Field mapping not found',
    CREATE: 'Failed to create field mapping',
    UPDATE: 'Failed to update field mapping',
    DELETE: 'Failed to delete field mapping',
  },
  defaultOrder: [['sourceField', 'ASC']],
});

const featureMappingsRouter = createCrudRouter({
  model: PropertyFeatureMapping,
  resourceName: 'property feature mapping',
  validateRequest: (req: Request, method: 'create' | 'update' | 'patch') =>
    validateFeatureMappingBody(req.body, method),
  errorMessages: {
    FETCH_ALL: 'Failed to fetch feature mappings',
    FETCH_ONE: 'Failed to fetch feature mapping',
    NOT_FOUND: 'Feature mapping not found',
    CREATE: 'Failed to create feature mapping',
    UPDATE: 'Failed to update feature mapping',
    DELETE: 'Failed to delete feature mapping',
  },
  defaultOrder: [
    ['priority', SORT_ORDERS.DESC],
    ['sourceField', 'ASC'],
  ],
  defaultIncludes: [
    {
      model: BlockInstance,
      as: 'blockInstance',
      attributes: ['id', 'name'],
    },
  ],
});

router.use('/field-mappings', fieldMappingsRouter);
router.use('/feature-mappings', featureMappingsRouter);

export { router as PropertyMappingsRouter };
