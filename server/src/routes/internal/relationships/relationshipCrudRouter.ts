/**
 * Relationship CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for relationships
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { 
  EventInstance, 
  EventShape, 
  AnnotationInstance, 
  AnnotationShape, 
  BlockInstance 
} from '../../../config/app.js'
import { getModelAttributes, isModelUnderscored } from '../../../utils/sequelizeHelpers.js'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'
import { ERROR_MESSAGES, RELATIONSHIP_REGISTRY, type RelationshipConfig } from './relationshipConstants.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { validateRequiredFields, validateParentChildDifferent, normalizeRelationshipKind } from './relationshipValidators.js'
import {
  mapRelationshipFields,
  hasCircularReference,
  validateBlockInstancesWithShapes,
  validateBlockShapesComposable,
  validateAttendeeAssignmentEntities,
  updateComponentActiveStates,
} from './relationshipHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError } from '../../helpers/routerResponseHelpers.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'
import { InstanceComponent } from '../../../config/app.js'
import { relationshipTypeParamHandler } from './relationshipParamMiddleware.js'

const logger = createLogger('RelationshipRouter')

const router = Router()

// Register param handler for relationshipType parameter
// LEARNING: router.param() must be registered on the router that defines routes with :relationshipType
// WHY: Express param callbacks only fire for params on routes defined on that specific router
router.param('relationshipType', relationshipTypeParamHandler)

/**
 * Build where clause for relationship queries
 * LEARNING: Builds Sequelize where clause based on relationship type and query parameters
 * WHY: Handles different field names and filtering requirements for different relationship types
 * PATTERN: Build where clause conditionally with spread operator
 * 
 * @param relationshipType - Relationship type
 * @param relationshipConfig - Relationship configuration
 * @param query - Request query parameters
 * @returns Sequelize where clause
 */
function buildRelationshipWhereClause(
  relationshipType: string,
  relationshipConfig: RelationshipConfig,
  query: any
): any {
  const { parent_id, blockInstanceId } = query
  
  const modelAttributes = relationshipConfig.model.getAttributes()
  const baseWhere: any = {}
  
  const whereWithDisabled = 'disabled' in modelAttributes
    ? { ...baseWhere, disabled: false }
    : baseWhere
  
  // PATTERN: Only filter if parent_id is provided and looks like a UUID
  const whereWithParentId = (() => {
    if (relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS && parent_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (typeof parent_id === 'string' && uuidRegex.test(parent_id)) {
        return { ...whereWithDisabled, parent_id }
      } else {
        logger.warn(`Invalid parent_id format: ${parent_id}. Expected UUID, ignoring filter.`)
      }
    }
    return whereWithDisabled
  })()
  
  // PATTERN: Filter by model-specific field name when query parameter matches
  const whereClause = (() => {
    if (relationshipType === 'annotationAssignments' && blockInstanceId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (typeof blockInstanceId === 'string' && uuidRegex.test(blockInstanceId)) {
        return { ...whereWithParentId, blockInstanceId }
      } else {
        logger.warn(`Invalid blockInstanceId format: ${blockInstanceId}. Expected UUID, ignoring filter.`)
      }
    }
    return whereWithParentId
  })()
  
  return whereClause
}

/**
 * Build query options for relationship queries
 * LEARNING: Builds Sequelize query options with includes and ordering
 * WHY: Handles different relationship types with different include requirements
 * PATTERN: Build options conditionally based on relationship type
 * 
 * @param relationshipType - Relationship type
 * @param relationshipConfig - Relationship configuration
 * @param whereClause - Where clause for query
 * @returns Sequelize query options
 */
function buildRelationshipQueryOptions(
  relationshipType: string,
  relationshipConfig: RelationshipConfig,
  whereClause: any
): any {
  const options: any = {
    where: whereClause
  }
  
  // PATTERN: Use attribute names in Sequelize queries, not database column names
  if (relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS) {
    options.order = [['orderIndex', 'ASC']]
  }
  
  // PATTERN: Conditional includes based on relationship type
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
  
  // PATTERN: Conditional includes based on relationship type
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
 * GET /relationships/:relationshipType
 * List all relationships of a specific type
 * 
 * LEARNING: Fetches all relationships of a specific type with optional filtering
 * WHY: Provides flexible querying of relationships
 * PATTERN: Build where clause and options, fetch with model, return JSON
 */
router.get('/:relationshipType', async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig
  if (!relationshipConfig) {
    sendError(res, ERROR_MESSAGES.RELATIONSHIP_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    return
  }
  
  if (!relationshipConfig.model) {
    logger.error('Model is undefined for:', req.params.relationshipType)
    sendError(res, ERROR_MESSAGES.MODEL_NOT_AVAILABLE.replace('{displayName}', relationshipConfig.displayName), HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, undefined, req.params.relationshipType)
    return
  }
  
  try {
    const whereClause = buildRelationshipWhereClause(
      req.params.relationshipType,
      relationshipConfig,
      req.query
    )
    
    const options = buildRelationshipQueryOptions(
      req.params.relationshipType,
      relationshipConfig,
      whereClause
    )
    
    const data = await relationshipConfig.model.findAll(options)
    sendSuccess(res, data)
  } catch (error) {
    logger.error('Error fetching relationships:', error)
    logger.error('Relationship kind:', req.params.relationshipType)
    logger.error('Model:', relationshipConfig.model?.name)
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.FETCH_RELATIONSHIPS,
      'fetching relationships',
      relationshipConfig.displayName,
      req.params.relationshipType
    )
  }
})

/**
 * POST /relationships/:relationshipType
 * Create a new relationship
 * 
 * LEARNING: Creates relationship with validation and special handling for instance components
 * WHY: Enables relationship creation via API with full feature support
 * PATTERN: Validate, check special cases, map fields, create record, update related entities
 */
router.post(
  '/:relationshipType',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig
  if (!relationshipConfig) {
    sendError(res, ERROR_MESSAGES.RELATIONSHIP_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    return
  }
  
  const { parent_id, child_id, order_index } = req.body
  
  // Validate required fields
  const requiredFieldsValidation = validateRequiredFields({ parent_id, child_id })
  if (!requiredFieldsValidation.valid) {
    sendBadRequest(res, requiredFieldsValidation.error)
    return
  }
  
  // Special handling for instance components
  if (req.params.relationshipType === 'instanceComponents') {
    // Validate that parent and child are different
    const parentChildValidation = validateParentChildDifferent(parent_id, child_id)
    if (!parentChildValidation.valid) {
      sendBadRequest(res, parentChildValidation.error)
      return
    }
    
    // Validate that parent and child exist
    try {
      const parentExists = await BlockInstance.findByPk(parent_id)
      const childExists = await BlockInstance.findByPk(child_id)
      
      if (!parentExists) {
        sendNotFound(res, ERROR_MESSAGES.PARENT_NOT_FOUND.replace('{id}', parent_id), parent_id)
        return
      }
      
      if (!childExists) {
        sendNotFound(res, ERROR_MESSAGES.CHILD_NOT_FOUND.replace('{id}', child_id), child_id)
        return
      }
      
      const { parentBlockShape, childBlockShape } = await validateBlockInstancesWithShapes(
        parent_id,
        child_id
      )
      
      validateBlockShapesComposable(parentBlockShape, childBlockShape)
    } catch (error) {
      logger.error('Error validating entities:', error)
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          sendNotFound(res, error.message)
          return
        }
        if (error.message.includes('not composable') || error.message.includes('same BlockShape')) {
          sendBadRequest(res, error.message, undefined, (error as any).blockShapeId)
          return
        }
      }
      handleRouteError(error, res, 'Error validating entities', 'validating entities')
      return
    }
    
    try {
      const hasCircular = await hasCircularReference(parent_id, child_id)
      
      if (hasCircular) {
        sendBadRequest(res, ERROR_MESSAGES.CIRCULAR_REFERENCE)
        return
      }
    } catch (error) {
      logger.error('Error checking circular references:', error)
      handleRouteError(error, res, 'Error checking circular references', 'checking circular references')
      return
    }
    
    const existing = await InstanceComponent.findOne({
      where: {
        parent_id: parent_id,
        child_id: child_id,
      },
    })
    
    if (existing) {
      if (existing.disabled) {
        existing.disabled = false
        existing.orderIndex = order_index ?? existing.orderIndex
        await existing.save()
        sendSuccess(res, existing)
        return
      } else {
        sendError(res, ERROR_MESSAGES.COMPONENT_ALREADY_EXISTS, HTTP_STATUS_CODES.CONFLICT, undefined, parent_id)
        return
      }
    }
  }
  
  let createData: any
  try {
    const normalizedKind = normalizeRelationshipKind(req.params.relationshipType)
    
    // PATTERN: Check entity existence before creating relationship
    if (normalizedKind === RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS) {
      try {
        await validateAttendeeAssignmentEntities(parent_id, child_id)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('does not exist')) {
            sendBadRequest(res, error.message.includes('EventShape') 
              ? ERROR_MESSAGES.INVALID_PARENT_ENTITY
              : ERROR_MESSAGES.INVALID_CHILD_ENTITY, error.message, req.params.relationshipType)
            return
          }
          if (error.message.includes('not a UserTypeBlock') || error.message.includes('non-existent BlockShape')) {
            sendBadRequest(res, error.message.includes('non-existent') 
              ? ERROR_MESSAGES.INVALID_BLOCK_SHAPE_REFERENCE
              : ERROR_MESSAGES.INVALID_ATTENDEE_TYPE, error.message, req.params.relationshipType)
            return
          }
        }
        throw error
      }
    }
    
    const baseCreateData = await mapRelationshipFields(normalizedKind, parent_id, child_id)
    
    // PATTERN: Build final object with spread operator
    createData = req.params.relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS
      ? {
          ...baseCreateData,
          orderIndex: order_index ?? 0,
          disabled: false,
        }
      : baseCreateData
    
    const created = await relationshipConfig.model.create(createData)
    
    if (req.params.relationshipType === 'instanceComponents') {
      // PATTERN: Update component active when component relationship is created
      await updateComponentActiveStates(parent_id, child_id)
    }
    
    sendCreated(res, created)
  } catch (error: any) {
    logger.error('Error creating relationship:', error)
    logger.error('Relationship type:', req.params.relationshipType)
    logger.error('Create data:', createData ? JSON.stringify(createData, null, 2) : 'undefined')
    logger.error('Error details:', error instanceof Error ? error.stack : String(error))
    
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.CREATE_RELATIONSHIP,
      'creating relationship',
      relationshipConfig.displayName,
      req.params.relationshipType,
      parent_id,
      child_id
    )
  }
  }
)

/**
 * DELETE /relationships/:relationshipType/:parentId/:childId
 * Delete a relationship
 * 
 * LEARNING: Deletes relationship record
 * WHY: Enables relationship deletion via API
 * PATTERN: Map fields, delete record, return 404 if not found, return success message
 */
router.delete(
  '/:relationshipType/:parentId/:childId',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig
  if (!relationshipConfig) {
    sendError(res, ERROR_MESSAGES.RELATIONSHIP_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    return
  }
  
  const { parentId, childId } = req.params
  const normalizedKind = normalizeRelationshipKind(req.params.relationshipType)
  
  const whereClause = await mapRelationshipFields(normalizedKind, parentId, childId)
  
  try {
    const deletedCount = await relationshipConfig.model.destroy({
      where: whereClause
    })
    
    if (deletedCount === 0) {
      sendNotFound(res, ERROR_MESSAGES.RELATIONSHIP_NOT_FOUND.replace('{displayName}', relationshipConfig.displayName), parentId)
      return
    }
    
    sendSuccess(res, { 
      message: `${relationshipConfig.displayName} deleted successfully`,
      deleted: deletedCount
    })
  } catch (error) {
    logger.error('Error:', error)
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.DELETE_RELATIONSHIP,
      'deleting relationship',
      relationshipConfig.displayName,
      req.params.relationshipType
    )
  }
  }
)

export { router as RelationshipCrudRouter }
