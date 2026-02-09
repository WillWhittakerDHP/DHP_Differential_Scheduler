/**
 * Property Types Router
 * 
 * LEARNING: Extracted property types operations
 * WHY: Separates property types operations from CRUD operations, improves maintainability
 * PATTERN: Express router with RESTful endpoints for property type management
 */

import { Router, Request, Response } from 'express'
import { Op } from 'sequelize'
import { PropertyVersion, PropertyVersionType, BlockInstance, BlockShape } from '../../../config/app.js'
import { ERROR_MESSAGES, DEFAULT_VALUES, REQUIRED_FIELDS } from './propertyConstants.js'
import { handleRouteError } from './propertyErrorHandler.js'
import { validateRequiredField, validateBlockShape, validateBlockInstancesForPropertyTypes } from './propertyValidators.js'
import { getBlockInstanceWithShape, buildPropertyTypeResponse, createPropertyTypesBulk, getPropertyTypesWithAssociations } from './propertyHelpers.js'

const router = Router()

/**
 * GET /properties/:id/types
 * List all property types for a property version
 * 
 * LEARNING: Fetches property types with block instance associations
 * WHY: Provides complete property type data including block instance details
 * PATTERN: Sequelize findAll with includes, ordered by orderIndex
 */
router.get('/:id/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = req.params.id
    
    const propertyTypes = await PropertyVersionType.findAll({
      where: { propertyVersionId },
      include: [
        { model: BlockInstance, as: 'blockInstance' },
      ],
      order: [['orderIndex', 'ASC']],
    })
    
    res.json(propertyTypes)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_PROPERTY_TYPES, 'fetching property types')
  }
})

/**
 * POST /properties/:id/types
 * Add a property type to a property version
 * 
 * Request body:
 * - blockInstanceId: UUID of the block_instance (must be "Properties" block_shape)
 * - orderIndex (optional): Order position
 * 
 * LEARNING: Application-level validation complements database trigger
 * WHY: Better error messages and prevents bad data from being attempted
 * PATTERN: Validate block_shape is "Properties" before attempting insert
 */
router.post('/:id/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = req.params.id
    const { blockInstanceId, orderIndex = DEFAULT_VALUES.ORDER_INDEX } = req.body
    
    // Validate required fields
    const fieldValidation = validateRequiredField(blockInstanceId, REQUIRED_FIELDS.PROPERTY_TYPE[0])
    if (!fieldValidation.valid) {
      res.status(400).json({
        error: fieldValidation.error,
      })
      return
    }
    
    const propertyVersion = await PropertyVersion.findByPk(propertyVersionId)
    if (!propertyVersion) {
      res.status(404).json({
        error: ERROR_MESSAGES.PROPERTY_VERSION_NOT_FOUND,
        propertyVersionId,
      })
      return
    }
    
    const blockInstance = await getBlockInstanceWithShape(blockInstanceId)
    
    if (!blockInstance) {
      res.status(404).json({
        error: ERROR_MESSAGES.BLOCK_INSTANCE_NOT_FOUND,
        blockInstanceId,
      })
      return
    }
    
    const blockShapeValidation = validateBlockShape(blockInstance, blockInstanceId)
    if (!blockShapeValidation.valid) {
      res.status(400).json({
        error: blockShapeValidation.error,
        blockInstanceId,
        ...blockShapeValidation.details,
      })
      return
    }
    
    const propertyType = await PropertyVersionType.create({
      propertyVersionId,
      blockInstanceId,
      orderIndex,
    })
    
    const completePropertyType = await buildPropertyTypeResponse(propertyType.id)
    
    res.status(201).json(completePropertyType)
  } catch (error) {
    // Handle database constraint errors
    if (error instanceof Error && error.message.includes('block_instance_id must reference')) {
      res.status(400).json({
        error: ERROR_MESSAGES.INVALID_BLOCK_SHAPE,
        details: error.message,
      })
      return
    }
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        error: ERROR_MESSAGES.PROPERTY_TYPE_ALREADY_ASSIGNED,
      })
      return
    }
    
    handleRouteError(error, res, ERROR_MESSAGES.ADD_PROPERTY_TYPE, 'adding property type')
  }
})

/**
 * PATCH /properties/:id/types/:typeId
 * Update property type order
 * 
 * LEARNING: Updates orderIndex for property type
 * WHY: Allows reordering of property types
 * PATTERN: Find by ID, update orderIndex, reload with associations
 */
router.patch('/:id/types/:typeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { typeId } = req.params
    const { orderIndex } = req.body
    
    const propertyType = await PropertyVersionType.findByPk(typeId)
    
    if (!propertyType) {
      res.status(404).json({
        error: ERROR_MESSAGES.PROPERTY_TYPE_NOT_FOUND,
        typeId,
      })
      return
    }
    
    if (orderIndex !== undefined) {
      await propertyType.update({ orderIndex })
    }
    
    const completePropertyType = await buildPropertyTypeResponse(propertyType.id)
    
    res.json(completePropertyType)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_PROPERTY_TYPE, 'updating property type')
  }
})

/**
 * DELETE /properties/:id/types/:typeId
 * Remove property type from property version
 * 
 * LEARNING: Deletes property type assignment
 * WHY: Removes property type from property
 * PATTERN: Find by ID, destroy if found, return 204 on success
 */
router.delete('/:id/types/:typeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { typeId } = req.params
    
    const propertyType = await PropertyVersionType.findByPk(typeId)
    
    if (!propertyType) {
      res.status(404).json({
        error: ERROR_MESSAGES.PROPERTY_TYPE_NOT_FOUND,
        typeId,
      })
      return
    }
    
    await propertyType.destroy()
    
    res.status(204).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.REMOVE_PROPERTY_TYPE, 'removing property type')
  }
})

/**
 * PUT /properties/:id/types
 * Replace all property types for a property version
 * 
 * Request body:
 * - blockInstanceIds: Array of block_instance UUIDs
 * 
 * LEARNING: Bulk replacement for property types
 * WHY: Booking wizard typically selects all property types at once
 * PATTERN: Delete all existing, then create new ones in transaction
 * 
 * NOTE: Complexity reduction will extract validation and bulk creation logic
 */
router.put('/:id/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = req.params.id
    const { blockInstanceIds = [] } = req.body
    
    const propertyVersion = await PropertyVersion.findByPk(propertyVersionId)
    if (!propertyVersion) {
      res.status(404).json({
        error: ERROR_MESSAGES.PROPERTY_VERSION_NOT_FOUND,
        propertyVersionId,
      })
      return
    }
    
    // Validate all blockInstanceIds have "Properties" block_shape
    if (blockInstanceIds.length > 0) {
      const blockInstances = await BlockInstance.findAll({
        where: { id: { [Op.in]: blockInstanceIds } },
        include: [{ model: BlockShape, as: 'block_shape' }],
      })
      
      const validation = validateBlockInstancesForPropertyTypes(blockInstances, blockInstanceIds)
      if (!validation.valid) {
        res.status(validation.details?.invalidBlockInstanceIds ? 400 : 404).json({
          error: validation.error,
          ...validation.details,
        })
        return
      }
    }
    
    // Replace all property types in transaction
    await PropertyVersion.sequelize!.transaction(async (transaction) => {
      await createPropertyTypesBulk(propertyVersionId, blockInstanceIds, transaction)
    })
    
    const propertyTypes = await getPropertyTypesWithAssociations(propertyVersionId)
    
    res.json(propertyTypes)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.REPLACE_PROPERTY_TYPES, 'replacing property types')
  }
})

export { router as PropertyTypesRouter }
