/**
 * Entity Batch Router
 * 
 * LEARNING: Batch endpoint that fetches all entity types in a single request
 * WHY: Reduces N+8 HTTP requests to 1 request, improving initial load performance
 * PATTERN: Fetch all entity types in parallel, return structured response
 */

import { Router, Request, Response } from 'express'
import { fetchAll } from '../../helpers/dataController.js'
import { buildFetchOptions } from './entityHelpers.js'
import { getEntityConfig } from '../../../config/entityRegistry.js'
import { ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'
import { createLogger } from '../../../utils/logger.js'
import { sendSuccess, sendError } from '../../helpers/routerResponseHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'

const logger = createLogger('EntityBatchRouter')

const router = Router()

/**
 * GET /entities/batch
 * Get all entities of all types in batch format
 * 
 * LEARNING: Batch endpoint that returns all entity types in structured format
 * WHY: Provides complete entity data in a single request, reducing network overhead
 * PATTERN: Fetch all entity types in parallel, transform to structured result
 */
router.get('/batch', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('GET /entities/batch')

    // LEARNING: Fetch all entity types in parallel using Promise.all
    // WHY: Consistent parallel fetching pattern, maximizes performance
    // PATTERN: Map entity keys to fetch promises, await all in parallel
    const entityPromises = ENTITY_KEYS_ARRAY.map(async (entityKey) => {
      const entityConfig = getEntityConfig(entityKey)
      const options = buildFetchOptions(entityConfig.model)
      const data = await fetchAll(entityConfig.model, options)
      return { entityKey, data }
    })

    const entityResults = await Promise.all(entityPromises)

    // LEARNING: Transform parallel results into structured response object
    // WHY: Matches expected batch response format with entity keys as top-level properties
    // PATTERN: Reduce array of results to object keyed by entityKey
    const result = entityResults.reduce((acc, { entityKey, data }) => {
      acc[entityKey] = data
      return acc
    }, {} as Record<string, unknown>)

    logger.debug(`Batch returning: ${ENTITY_KEYS_ARRAY.length} entity types`)

    sendSuccess(res, result)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_ENTITIES.replace('{displayName}', 'entities'), 'entities', 'fetching batch entities')
  }
})

export { router as EntityBatchRouter }
