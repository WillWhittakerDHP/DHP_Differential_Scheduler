/**
 * Relationship Instance Component Router
 * 
 * LEARNING: Special router for instance component operations
 * WHY: Instance components have special endpoints (PATCH, DELETE by ID) and complex validation
 * PATTERN: Express router with instance component-specific endpoints
 */

import { Router, Request, Response } from 'express'
import { InstanceComponent, BlockInstance } from '../../../config/app.js'
import { ERROR_MESSAGES } from './relationshipConstants.js'
import { handleRouteError } from './relationshipErrorHandler.js'
import { restoreComponentActiveState } from './relationshipHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('RelationshipRouter')

const router = Router()

/**
 * PATCH /relationships/instanceComponents/:id
 * Update an instance component
 * 
 * LEARNING: Updates instance component order_index and disabled status
 * WHY: Enables instance component updates via API
 * PATTERN: Find component, update fields, save, return JSON
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { order_index, disabled } = req.body
  
  try {
    const component = await InstanceComponent.findByPk(id)
    
    if (!component) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: ERROR_MESSAGES.INSTANCE_COMPONENT_NOT_FOUND,
        id,
      })
      return
    }
    
    if (order_index !== undefined) {
      component.orderIndex = order_index
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

/**
 * DELETE /relationships/instanceComponents/:id
 * Delete an instance component (soft delete)
 * 
 * LEARNING: Soft deletes instance component and restores active state if needed
 * WHY: Enables instance component deletion via API with active state management
 * PATTERN: Find component, set disabled, restore active if no other components, return success message
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  
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
    await restoreComponentActiveState(component.child_id)
    
    res.json({
      message: 'Instance component deleted successfully',
      id,
    })
  } catch (error) {
    logger.error('Error deleting instance component:', error)
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_INSTANCE_COMPONENT, 'deleting instance component')
  }
})

export { router as RelationshipInstanceComponentRouter }
