
import { Router, Request, Response } from 'express'
import { InstanceComponent } from '../../../config/app.js'
import { ERROR_MESSAGES } from './relationshipConstants.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { restoreComponentActiveState } from './relationshipHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { paramString } from '../../helpers/requestHelpers.js'

const logger = createLogger('RelationshipRouter')

const router = Router()

router.patch('/:id', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const id = paramString(req, 'id')
  const orderIndex = req.body.orderIndex ?? req.body.order_index
  const { disabled } = req.body

  try {
    const component = await InstanceComponent.findByPk(id)

    if (!component) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: ERROR_MESSAGES.INSTANCE_COMPONENT_NOT_FOUND,
        id,
      })
      return
    }

    if (orderIndex !== undefined) {
      component.orderIndex = orderIndex
    }
    
    if (disabled !== undefined) {
      component.disabled = disabled
    }
    
    await component.save()
    
    res.json(component)
  } catch (error) {
    logger.error('Error updating instance component:', error)
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_INSTANCE_COMPONENT, 'updating instance component')
  }
})

router.delete('/:id', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const id = paramString(req, 'id')
  
  try {
    const component = await InstanceComponent.findByPk(id)
    
    if (!component) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: ERROR_MESSAGES.INSTANCE_COMPONENT_NOT_FOUND,
        id,
      })
      return
    }
    
    component.disabled = true
    await component.save()
    
    // PATTERN: Restore active when no longer in any component relationships
    await restoreComponentActiveState(component.childId)
    
    res.json({
      message: ERROR_MESSAGES.INSTANCE_COMPONENT_DELETED,
      id,
    })
  } catch (error) {
    logger.error('Error deleting instance component:', error)
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_INSTANCE_COMPONENT, 'deleting instance component')
  }
})

export { router as RelationshipInstanceComponentRouter }
