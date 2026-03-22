/**
 * Relationship CRUD: errors sanitized in production (NODE_ENV) via relationshipErrorHandler and shared routerErrorHandler.
 */
import { Router, Request, Response } from 'express'
import type { Model, ModelStatic } from 'sequelize'
import { BlockInstance, AnnotationAssignment } from '../../../config/app.js'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'
import {
  findOrCreateRelationshipRow,
  relationshipModelSupportsDisabled,
  softDeleteRelationshipRows,
} from './relationshipDisabledHelpers.js'
import { formatAnnotationAssignmentsForApi } from './relationshipAnnotationFormat.js'
import { FIELD_NAMES } from '../entities/entityConstants.js'
import { ERROR_MESSAGES, type RelationshipConfig } from './relationshipConstants.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { validateRequiredFields, validateParentChildDifferent, normalizeRelationshipKind } from './relationshipValidators.js'
import {
  mapRelationshipFields,
  hasCircularReference,
  validateBlockInstancesWithShapes,
  validateBlockShapesComposable,
  validateAttendeeAssignmentEntities,
  validatePricingCascadeAgainstShapeRules,
  updateComponentActiveStates,
} from './relationshipHelpers.js'
import { buildRelationshipWhereClause, buildRelationshipQueryOptions } from './relationshipQueryBuilders.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'
import { InstanceComponent } from '../../../config/app.js'
import { relationshipTypeParamHandler } from './relationshipParamMiddleware.js'

const logger = createLogger('RelationshipRouter')

const router = Router()

router.param('relationshipType', relationshipTypeParamHandler)

router.get('/:relationshipType', async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig
  if (!relationshipConfig) {
    sendError(res, ERROR_MESSAGES.RELATIONSHIP_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    return
  }
  
  if (!relationshipConfig.model) {
    logger.error('Model is undefined for:', paramString(req, 'relationshipType'))
    sendError(res, ERROR_MESSAGES.MODEL_NOT_AVAILABLE.replace('{displayName}', relationshipConfig.displayName), HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, undefined, paramString(req, 'relationshipType'))
    return
  }
  
  try {
    const whereClause = buildRelationshipWhereClause({
      relationshipType: paramString(req, 'relationshipType'),
      relationshipConfig,
      query: req.query as Record<string, unknown>,
      logWarn: (msg) => logger.warn(msg),
    })
    const options = buildRelationshipQueryOptions({
      relationshipType: paramString(req, 'relationshipType'),
      relationshipConfig,
      whereClause,
    })
    const data = await relationshipConfig.model.findAll(options)
    const relationshipType = paramString(req, 'relationshipType')
    const payload =
      relationshipType === RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS
        ? formatAnnotationAssignmentsForApi(data as InstanceType<typeof AnnotationAssignment>[])
        : data
    sendSuccess(res, payload)
  } catch (error) {
    logger.error('Error fetching relationships:', error)
    logger.error('Relationship kind:', paramString(req, 'relationshipType'))
    logger.error('Model:', relationshipConfig.model?.name)
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.FETCH_RELATIONSHIPS,
      'fetching relationships',
      relationshipConfig.displayName,
      paramString(req, 'relationshipType')
    )
  }
})

export async function handleInstanceComponentCreate(req: Request, res: Response): Promise<void> {
  const relationshipConfig = req.relationshipConfig as RelationshipConfig
  const parentId = req.body.parentId ?? req.body.parent_id
  const childId = req.body.childId ?? req.body.child_id
  const orderIndex = req.body[FIELD_NAMES.ORDER_INDEX] ?? req.body.order_index

  const parentChildValidation = validateParentChildDifferent(parentId, childId)
  if (!parentChildValidation.valid) {
    sendBadRequest(res, parentChildValidation.error)
    return
  }

  try {
    const parentExists = await BlockInstance.findByPk(parentId)
    const childExists = await BlockInstance.findByPk(childId)
    if (!parentExists) {
      sendNotFound(res, ERROR_MESSAGES.PARENT_NOT_FOUND.replace('{id}', parentId), parentId)
      return
    }
    if (!childExists) {
      sendNotFound(res, ERROR_MESSAGES.CHILD_NOT_FOUND.replace('{id}', childId), childId)
      return
    }
    const { parentBlockShape, childBlockShape } = await validateBlockInstancesWithShapes(parentId, childId)
    validateBlockShapesComposable(parentBlockShape, childBlockShape)
  } catch (error) {
    logger.error('Error validating entities:', error)
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        sendNotFound(res, error.message)
        return
      }
      if (error.message.includes('not composable') || error.message.includes('same BlockShape')) {
        sendBadRequest(res, error.message, undefined, (error as { blockShapeId?: string }).blockShapeId)
        return
      }
    }
    handleRouteError(error, res, 'Error validating entities', 'validating entities')
    return
  }

  try {
    const hasCircular = await hasCircularReference(parentId, childId)
    if (hasCircular) {
      sendBadRequest(res, ERROR_MESSAGES.CIRCULAR_REFERENCE)
      return
    }
  } catch (error) {
    logger.error('Error checking circular references:', error)
    handleRouteError(error, res, 'Error checking circular references', 'checking circular references')
    return
  }

  const existing = await InstanceComponent.findOne({ where: { parentId, childId } })
  if (existing) {
    if (existing.disabled) {
      existing.disabled = false
      existing.orderIndex = orderIndex ?? existing.orderIndex
      await existing.save()
      sendSuccess(res, existing)
      return
    }
    sendError(res, ERROR_MESSAGES.COMPONENT_ALREADY_EXISTS, HTTP_STATUS_CODES.CONFLICT, undefined, parentId)
    return
  }

  const baseCreateData = await mapRelationshipFields(RELATIONSHIP_TYPES.INSTANCE_COMPONENTS, parentId, childId)
  const createData = {
    ...baseCreateData,
    [FIELD_NAMES.ORDER_INDEX]: orderIndex ?? 0,
    disabled: false,
  }
  const created = await relationshipConfig.model.create(createData)
  await updateComponentActiveStates(parentId, childId)
  sendCreated(res, created)
}

router.post(
  '/:relationshipType',
  csrfProtection,
  async (req: Request, res: Response): Promise<void> => {
    const relationshipConfig = req.relationshipConfig
    if (!relationshipConfig) {
      sendError(res, ERROR_MESSAGES.RELATIONSHIP_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      return
    }

    const parentId = req.body.parentId ?? req.body.parent_id
    const childId = req.body.childId ?? req.body.child_id

    const requiredFieldsValidation = validateRequiredFields({ parentId, childId })
    if (!requiredFieldsValidation.valid) {
      sendBadRequest(res, requiredFieldsValidation.error)
      return
    }

    if (paramString(req, 'relationshipType') === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS) {
      await handleInstanceComponentCreate(req, res)
      return
    }

    let createData: Record<string, unknown> | undefined
    try {
      const normalizedKind = normalizeRelationshipKind(paramString(req, 'relationshipType'))
      if (normalizedKind === RELATIONSHIP_TYPES.PRICING_CASCADES) {
        const shapeValidation = await validatePricingCascadeAgainstShapeRules(parentId, childId)
        if (!shapeValidation.valid) {
          sendBadRequest(res, shapeValidation.error)
          return
        }
      }
      if (normalizedKind === RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS) {
        try {
          await validateAttendeeAssignmentEntities(parentId, childId)
        } catch (error) {
          logger.warn('Attendee assignment entity validation failed', { error })
          if (error instanceof Error) {
            if (error.message.includes('does not exist')) {
              sendBadRequest(
                res,
                error.message.includes('EventShape') ? ERROR_MESSAGES.INVALID_PARENT_ENTITY : ERROR_MESSAGES.INVALID_CHILD_ENTITY,
                error.message,
                paramString(req, 'relationshipType')
              )
              return
            }
            if (error.message.includes('not a UserTypeBlock') || error.message.includes('non-existent BlockShape')) {
              sendBadRequest(
                res,
                error.message.includes('non-existent') ? ERROR_MESSAGES.INVALID_BLOCK_SHAPE_REFERENCE : ERROR_MESSAGES.INVALID_ATTENDEE_TYPE,
                error.message,
                paramString(req, 'relationshipType')
              )
              return
            }
          }
          throw error
        }
      }

      const mapOpts =
        normalizedKind === RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS
          ? {
              userTypeBlockInstanceId:
                req.body.userTypeBlockInstanceId ?? req.body.user_type_block_instance_id,
            }
          : undefined
      const baseCreateData = await mapRelationshipFields(
        normalizedKind,
        parentId,
        childId,
        mapOpts
      )
      createData = baseCreateData as Record<string, unknown>
      const model = relationshipConfig.model as ModelStatic<Model>
      const { row, created } = await findOrCreateRelationshipRow(model, createData, normalizedKind)
      if (created) {
        sendCreated(res, row)
      } else {
        sendSuccess(res, row)
      }
    } catch (error: unknown) {
      logger.error('Error creating relationship:', error)
      logger.error('Relationship type:', paramString(req, 'relationshipType'))
      logger.error('Create data:', createData ? JSON.stringify(createData, null, 2) : 'undefined')
      logger.error('Error details:', error instanceof Error ? error.stack : String(error))
      handleRouteError(
        error,
        res,
        ERROR_MESSAGES.CREATE_RELATIONSHIP,
        'creating relationship',
        relationshipConfig.displayName,
        paramString(req, 'relationshipType'),
        parentId,
        childId
      )
    }
  }
)

router.delete(
  '/:relationshipType/:parentId/:childId',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  const relationshipConfig = req.relationshipConfig
  if (!relationshipConfig) {
    sendError(res, ERROR_MESSAGES.RELATIONSHIP_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    return
  }
  
  const parentId = paramString(req, 'parentId')
  const childId = paramString(req, 'childId')
  const normalizedKind = normalizeRelationshipKind(paramString(req, 'relationshipType'))
  
  const whereClause = await mapRelationshipFields(normalizedKind, parentId, childId)
  const model = relationshipConfig.model as ModelStatic<Model>

  try {
    if (relationshipModelSupportsDisabled(model)) {
      const outcome = await softDeleteRelationshipRows(model, whereClause as Record<string, unknown>)
      if (outcome.status === 'not_found') {
        sendNotFound(
          res,
          ERROR_MESSAGES.RELATIONSHIP_NOT_FOUND.replace('{displayName}', relationshipConfig.displayName),
          parentId
        )
        return
      }
      const deletedCount = outcome.status === 'deleted' ? outcome.affected : 0
      sendSuccess(res, {
        message:
          outcome.status === 'already_inactive'
            ? `${relationshipConfig.displayName} was already inactive`
            : `${relationshipConfig.displayName} deleted successfully`,
        deleted: deletedCount,
        alreadyInactive: outcome.status === 'already_inactive',
      })
      return
    }

    const deletedCount = await model.destroy({
      where: whereClause,
    })

    if (deletedCount === 0) {
      sendNotFound(
        res,
        ERROR_MESSAGES.RELATIONSHIP_NOT_FOUND.replace('{displayName}', relationshipConfig.displayName),
        parentId
      )
      return
    }

    sendSuccess(res, {
      message: `${relationshipConfig.displayName} deleted successfully`,
      deleted: deletedCount,
    })
  } catch (error) {
    logger.error('Error:', error)
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.DELETE_RELATIONSHIP,
      'deleting relationship',
      relationshipConfig.displayName,
      paramString(req, 'relationshipType')
    )
  }
  }
)

export { router as RelationshipCrudRouter }
