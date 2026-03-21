import { Router, Request, Response } from 'express'
import Joi from 'joi'
import { AnnotationAssignment } from '../../../config/app.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { ERROR_MESSAGES } from './relationshipConstants.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'
import { sendBadRequest } from '../../helpers/routerResponseHelpers.js'

const logger = createLogger('RelationshipRouter')

const patchParamsSchema = Joi.object({
  blockInstanceId: Joi.string().required(),
  annotationId: Joi.string().required(),
}).unknown(true)

const patchBodySchema = Joi.object({
  userTypeBlockInstanceId: Joi.string().allow('').optional(),
}).unknown(true)

const router = Router()

router.patch('/:blockInstanceId/:annotationId', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const paramsValidation = patchParamsSchema.validate(req.params, { abortEarly: false })
  if (paramsValidation.error) {
    sendBadRequest(res, paramsValidation.error.message)
    return
  }
  const { blockInstanceId, annotationId } = paramsValidation.value

  const bodyValidation = patchBodySchema.validate(req.body, { abortEarly: false })
  if (bodyValidation.error) {
    sendBadRequest(res, bodyValidation.error.message)
    return
  }
  const { userTypeBlockInstanceId } = bodyValidation.value

  try {
    const assignment = await AnnotationAssignment.findOne({
      where: {
        blockInstanceId,
        annotationId,
      },
    })
    
    if (!assignment) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: ERROR_MESSAGES.ANNOTATION_ASSIGNMENT_NOT_FOUND,
        blockInstanceId,
        annotationId,
      })
      return
    }
    
    // PATTERN: Update only fields that exist on the relationship model
    if (userTypeBlockInstanceId !== undefined) {
      assignment.userTypeBlockInstanceId = userTypeBlockInstanceId || null
    }
    
    await assignment.save()
    
    res.json(assignment)
  } catch (error) {
    logger.error('Error updating annotation assignment:', error)
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_ANNOTATION_ASSIGNMENT, 'updating annotation assignment')
  }
})

export { router as RelationshipAnnotationAssignmentRouter }
