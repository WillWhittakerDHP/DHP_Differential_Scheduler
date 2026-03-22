
import { Router, Request, Response } from 'express'
import { fetchAll } from '../../helpers/dataController.js'
import { buildFetchOptions } from './entityHelpers.js'
import { getEntityConfig } from '../../../config/entityRegistry.js'
import { ENTITY_KEYS, ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'
import { AnnotationInstance, AnnotationInstanceContent } from '../../../config/app.js'
import { resolveAnnotationTextForAssignment } from '../../../services/annotations/annotationTextResolution.js'
import type { AnnotationWithContentPlain } from '../../../services/annotations/annotationTextResolution.js'
import { createLogger } from '../../../utils/logger.js'
import { sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'

const logger = createLogger('EntityBatchRouter')

const router = Router()

router.get('/batch', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('GET /entities/batch')

    // WHY: Consistent parallel fetching pattern, maximizes performance
    // PATTERN: Map entity keys to fetch promises, await all in parallel
    const entityPromises = ENTITY_KEYS_ARRAY.map(async (entityKey) => {
      const entityConfig = getEntityConfig(entityKey)
      const base = buildFetchOptions(entityConfig.model)
      const fetchOpts = {
        attributes: base.attributes,
        order: base.order,
        includes:
          entityKey === ENTITY_KEYS.ANNOTATION_INSTANCE
            ? [
                {
                  model: AnnotationInstanceContent,
                  as: 'contentRows',
                  attributes: ['id', 'text', 'userTypeBlockInstanceId'],
                  required: false,
                },
              ]
            : undefined,
      }
      const data = await fetchAll(entityConfig.model, fetchOpts)
      return { entityKey, data }
    })

    const entityResults = await Promise.all(entityPromises)

    // WHY: Matches expected batch response format with entity keys as top-level properties
    // PATTERN: Reduce array of results to object keyed by entityKey
    const result = entityResults.reduce((acc, { entityKey, data }) => {
      if (entityKey === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        acc[entityKey] = (data as InstanceType<typeof AnnotationInstance>[]).map((row) => {
          const plain = row.get({ plain: true }) as AnnotationWithContentPlain & Record<string, unknown>
          plain.text = resolveAnnotationTextForAssignment(plain, null)
          return plain
        })
      } else {
        acc[entityKey] = data
      }
      return acc
    }, {} as Record<string, unknown>)

    logger.debug(`Batch returning: ${ENTITY_KEYS_ARRAY.length} entity types`)

    sendSuccess(res, result)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_ENTITIES.replace('{displayName}', 'entities'), 'entities', 'fetching batch entities')
  }
})

export { router as EntityBatchRouter }
