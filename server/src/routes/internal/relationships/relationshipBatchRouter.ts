/**
 * Relationship Batch Router
 * 
 * LEARNING: Batch endpoint that fetches all relationship types in a single request
 * WHY: Reduces N+10 HTTP requests to 1 request, improving initial load performance
 * PATTERN: Fetch all relationship types in parallel, return structured response
 */

import { Router, Request, Response } from 'express'
import { RELATIONSHIP_REGISTRY, type RelationshipKind } from './relationshipConstants.js'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'
import { 
  EventInstance, 
  EventShape, 
  AnnotationInstance, 
  AnnotationShape, 
  BlockInstance 
} from '../../../config/app.js'
import { getModelAttributes, isModelUnderscored } from '../../../utils/sequelizeHelpers.js'
import { createLogger } from '../../../utils/logger.js'
import { sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { ERROR_MESSAGES } from './relationshipConstants.js'

const logger = createLogger('RelationshipBatchRouter')

const router = Router()

/**
 * Build query options for batch relationship fetch
 * LEARNING: Simplified version of buildRelationshipQueryOptions for batch endpoint
 * WHY: Batch endpoint doesn't need query filtering, just basic options
 * PATTERN: Build options with disabled filter, ordering, includes, and attributes
 */
function buildBatchRelationshipOptions(
  relationshipType: string,
  relationshipConfig: typeof RELATIONSHIP_REGISTRY[RelationshipKind]
): any {
  const modelAttributes = relationshipConfig.model.getAttributes()
  const baseWhere: any = {}
  
  // PATTERN: Only filter disabled if model has disabled field
  const whereClause = 'disabled' in modelAttributes
    ? { ...baseWhere, disabled: false }
    : baseWhere
  
  const options: any = {
    where: whereClause
  }
  
  // PATTERN: Use attribute names in Sequelize queries, not database column names
  if (relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS) {
    options.order = [['orderIndex', 'ASC']]
  }
  
  // PATTERN: Conditional includes based on relationship type (matching CRUD router logic)
  if (relationshipType === 'eventAssignments') {
    options.include = [
      {
        model: EventInstance,
        as: 'eventInstance',
        attributes: ['id', 'name', 'event_shape_ref', 'title_template', 'description_template', 'location_template'],
        include: [
          {
            model: EventShape,
            as: 'eventShape',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  }
  
  if (relationshipType === RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS) {
    options.include = [
      {
        model: AnnotationInstance,
        as: 'annotation',
        attributes: ['id', 'text', 'userType', 'type'],
        include: [
          {
            model: AnnotationShape,
            as: 'annotationShape',
            attributes: ['id', 'name']
          }
        ]
      },
      {
        model: BlockInstance,
        as: 'userTypeBlockInstance',
        attributes: ['id', 'name'],
        required: false
      }
    ]
  }
  
  if (isModelUnderscored(relationshipConfig.model)) {
    options.attributes = getModelAttributes(relationshipConfig.model)
  }
  
  return options
}

/**
 * GET /relationships/batch
 * Get all relationships of all types in batch format
 * 
 * LEARNING: Batch endpoint that returns all relationship types in structured format
 * WHY: Provides complete relationship data in a single request, reducing network overhead
 * PATTERN: Fetch all relationship types in parallel, transform to structured result
 */
router.get('/batch', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('GET /relationships/batch')

    // LEARNING: Fetch all relationship types in parallel using Promise.all
    // WHY: Consistent parallel fetching pattern, maximizes performance
    // PATTERN: Map relationship keys to fetch promises, await all in parallel
    const relationshipPromises = (Object.keys(RELATIONSHIP_REGISTRY) as RelationshipKind[]).map(async (relationshipKey) => {
      const relationshipConfig = RELATIONSHIP_REGISTRY[relationshipKey]
      
      // LEARNING: Build options for batch fetch (no query filtering needed)
      // WHY: Batch endpoint returns all relationships, simplified options
      const options = buildBatchRelationshipOptions(relationshipKey, relationshipConfig)
      
      const data = await relationshipConfig.model.findAll(options)
      return { relationshipKey, data }
    })

    const relationshipResults = await Promise.all(relationshipPromises)

    // LEARNING: Transform parallel results into structured response object
    // WHY: Matches expected batch response format with relationship keys as top-level properties
    // PATTERN: Reduce array of results to object keyed by relationshipKey
    const result = relationshipResults.reduce((acc, { relationshipKey, data }) => {
      acc[relationshipKey] = data
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
