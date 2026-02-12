/**
 * Relationship Annotation Assignment Router
 * 
 * LEARNING: Special router for annotation assignment operations
 * WHY: Annotation assignments have special endpoint (PATCH by blockInstanceId/annotationId)
 * PATTERN: Express router with annotation assignment-specific endpoints
 */

import { Router, Request, Response } from 'express'
import { AnnotationAssignment } from '../../../config/app.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { ERROR_MESSAGES } from './relationshipConstants.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('RelationshipRouter')

const router = Router()

/**
 * PATCH /relationships/annotationAssignments/:blockInstanceId/:annotationId
 * Update an annotation assignment
 * 
 * LEARNING: Updates annotation assignment userTypeBlockInstanceId
 * WHY: Enables annotation assignment updates via API
 * PATTERN: Find assignment by blockInstanceId/annotationId, update field, save, return JSON
 * NOTE: This endpoint is specific to annotationAssignments for parent/child ID-based updates
 */
router.patch('/:blockInstanceId/:annotationId', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const { blockInstanceId, annotationId } = req.params
  const { userTypeBlockInstanceId } = req.body
  
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
