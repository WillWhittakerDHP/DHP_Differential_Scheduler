import type { Model } from 'sequelize';
import type { Request, Response } from 'express';
import { fetchAll, fetchById } from '../../helpers/dataController.js';
import { ERROR_MESSAGES } from './entityConstants.js';
import { handleRouteError } from './entityErrorHandler.js';
import { buildFetchOptions } from './entityHelpers.js';
import { ENTITY_KEYS } from '../../../constants/entities.js';
import { AnnotationInstance, AnnotationInstanceContent } from '../../../config/app.js';
import { resolveAnnotationTextForAssignment } from '../../../services/annotations/annotationTextResolution.js';
import type { AnnotationWithContentPlain } from '../../../services/annotations/annotationTextResolution.js';
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js';
import { sendSuccess, sendNotFound, sendError } from '../../helpers/routerResponseHelpers.js';
import { paramString } from '../../helpers/requestHelpers.js';
import { HTTP_STATUS_CODES } from '../../../constants/router.js';
import {
  stripRejectedEventShapeResponseFields,
} from './eventShapeEntityValidation.js';

export async function handleEntityCrudList(req: Request, res: Response): Promise<void> {
  const { entityConfig } = req;
  if (!entityConfig) {
    sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    return;
  }

  try {
    const entityTypeParam = paramString(req, 'entityType');
    const base = buildFetchOptions(entityConfig.model);
    const fetchOpts = {
      attributes: base.attributes,
      order: base.order,
      includes:
        entityTypeParam === ENTITY_KEYS.ANNOTATION_INSTANCE
          ? [
              {
                model: AnnotationInstanceContent,
                as: 'contentRows',
                attributes: ['id', 'text', 'userTypeBlockInstanceId'],
                required: false,
              },
            ]
          : undefined,
    };
    const data = await fetchAll(entityConfig.model, fetchOpts);

    if (entityTypeParam === ENTITY_KEYS.ANNOTATION_INSTANCE) {
      const formatted = (data as InstanceType<typeof AnnotationInstance>[]).map((row) => {
        const plain = row.get({ plain: true }) as AnnotationWithContentPlain & Record<string, unknown>;
        plain.text = resolveAnnotationTextForAssignment(plain, null);
        return plain;
      });
      sendSuccess(res, formatted);
      return;
    }

    if (entityTypeParam === ENTITY_KEYS.EVENT_SHAPE || entityTypeParam === 'eventShape') {
      const formatted = (data as Model[]).map((row) => {
        const plain = row.get({ plain: true }) as Record<string, unknown>;
        stripRejectedEventShapeResponseFields(plain);
        return plain;
      });
      sendSuccess(res, formatted);
      return;
    }

    sendSuccess(res, data);
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.FETCH_ENTITIES.replace('{displayName}', entityConfig.displayName);
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'fetching entities');
  }
}

export async function handleEntityCrudGetById(req: Request, res: Response): Promise<void> {
  const { entityConfig } = req;
  if (!entityConfig) {
    sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    return;
  }

  try {
    const id = paramString(req, 'id');
    const entityTypeParam = paramString(req, 'entityType');

    if (entityTypeParam === ENTITY_KEYS.ANNOTATION_INSTANCE) {
      const record = await AnnotationInstance.findByPk(id, {
        attributes: getModelAttributes(AnnotationInstance),
        include: [
          {
            model: AnnotationInstanceContent,
            as: 'contentRows',
            attributes: ['id', 'text', 'userTypeBlockInstanceId'],
            required: false,
          },
        ],
      });
      if (!record) {
        const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName);
        sendNotFound(res, errorMessage, id);
        return;
      }
      const plain = record.get({ plain: true }) as AnnotationWithContentPlain & Record<string, unknown>;
      plain.text = resolveAnnotationTextForAssignment(plain, null);
      sendSuccess(res, plain);
      return;
    }

    const record = await fetchById(entityConfig.model, id);

    if (!record) {
      const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName);
      sendNotFound(res, errorMessage, id);
      return;
    }

    if (entityTypeParam === ENTITY_KEYS.EVENT_SHAPE || entityTypeParam === 'eventShape') {
      const plain = (record as Model).get({ plain: true }) as Record<string, unknown>;
      stripRejectedEventShapeResponseFields(plain);
      sendSuccess(res, plain);
      return;
    }

    sendSuccess(res, record);
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.FETCH_ENTITY.replace('{displayName}', entityConfig.displayName);
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'fetching entity', paramString(req, 'id'));
  }
}
