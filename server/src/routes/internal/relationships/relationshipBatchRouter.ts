
import { Router, Request, Response } from 'express'
import { RELATIONSHIP_REGISTRY, type RelationshipKind } from './relationshipConstants.js'
import { buildRelationshipQueryOptions } from './relationshipQueryBuilders.js'
import { formatAnnotationAssignmentsForApi } from './relationshipAnnotationFormat.js'
import { AnnotationAssignment } from '../../../config/app.js'
import { createLogger } from '../../../utils/logger.js'
import { sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { ERROR_MESSAGES } from './relationshipConstants.js'
import { whereActiveRelationships } from './relationshipDisabledHelpers.js'

const logger = createLogger('RelationshipBatchRouter')

const router = Router()

function buildBatchWhereClause(
  relationshipConfig: typeof RELATIONSHIP_REGISTRY[RelationshipKind]
): Record<string, unknown> {
  return whereActiveRelationships(relationshipConfig.model, {})
}

router.get('/batch', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('GET /relationships/batch')

    // WHY: Consistent parallel fetching pattern, maximizes performance
    // PATTERN: Map relationship keys to fetch promises, await all in parallel
    const relationshipPromises = (Object.keys(RELATIONSHIP_REGISTRY) as RelationshipKind[]).map(async (relationshipKey) => {
      const relationshipConfig = RELATIONSHIP_REGISTRY[relationshipKey]
      const whereClause = buildBatchWhereClause(relationshipConfig)
      const options = buildRelationshipQueryOptions({
        relationshipType: relationshipKey,
        relationshipConfig,
        whereClause,
      })
      const data = await relationshipConfig.model.findAll(options)
      return { relationshipKey, data }
    })

    const relationshipResults = await Promise.all(relationshipPromises)

    // WHY: Matches expected batch response format with relationship keys as top-level properties
    // PATTERN: Reduce array of results to object keyed by relationshipKey
    const result = relationshipResults.reduce((acc, { relationshipKey, data }) => {
      acc[relationshipKey] =
        relationshipKey === 'annotationAssignments'
          ? formatAnnotationAssignmentsForApi(data as InstanceType<typeof AnnotationAssignment>[])
          : data
      return acc
    }, {} as Record<string, unknown>)

    logger.debug(`Batch returning: ${Object.keys(RELATIONSHIP_REGISTRY).length} relationship types`)

    sendSuccess(res, result)
  } catch (error) {
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.FETCH_RELATIONSHIPS,
      'fetching relationships',
      'relationships',
      'batch'
    )
  }
})

export { router as RelationshipBatchRouter }
