
import { Router, Request, Response } from 'express'
import { Op } from 'sequelize'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import {
  propertyTypePostBodySchema,
  propertyTypePatchBodySchema,
  propertyTypesPutBodySchema,
} from '../../schemas/propertyTypesSchemas.js'
import { PropertyVersion, PropertyVersionType, BlockInstance, BlockShape } from '../../../config/app.js'
import { FIELD_NAMES } from '../entities/entityConstants.js'
import { ERROR_MESSAGES, DEFAULT_VALUES, REQUIRED_FIELDS } from './propertyConstants.js'
import { handleRouteError } from './propertyErrorHandler.js'
import { validateRequiredField, validateBlockShape, validateBlockInstancesForPropertyTypes } from './propertyValidators.js'
import { getBlockInstanceWithShape, buildPropertyTypeResponse, createPropertyTypesBulk, getPropertyTypesWithAssociations } from './propertyHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendNoContent, sendError } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const router = Router()

router.get('/:id/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = paramString(req, 'id')
    
    const propertyTypes = await PropertyVersionType.findAll({
      where: { propertyVersionId },
      include: [
        { model: BlockInstance, as: 'blockInstance' },
      ],
      order: [[FIELD_NAMES.ORDER_INDEX, 'ASC']],
    })
    
    sendSuccess(res, propertyTypes)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_PROPERTY_TYPES, 'fetching property types')
  }
})

router.post(
  '/:id/types',
  csrfProtection,
  validateRequest(propertyTypePostBodySchema),
  async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = paramString(req, 'id')
    const { blockInstanceId, orderIndex = DEFAULT_VALUES.ORDER_INDEX } = req.body
    
    // Validate required fields
    const fieldValidation = validateRequiredField(blockInstanceId, REQUIRED_FIELDS.PROPERTY_TYPE[0])
    if (!fieldValidation.valid) {
      sendBadRequest(res, fieldValidation.error)
      return
    }
    
    const propertyVersion = await PropertyVersion.findByPk(propertyVersionId)
    if (!propertyVersion) {
      sendNotFound(res, ERROR_MESSAGES.PROPERTY_VERSION_NOT_FOUND, propertyVersionId)
      return
    }
    
    const blockInstance = await getBlockInstanceWithShape(blockInstanceId)
    
    if (!blockInstance) {
      sendNotFound(res, ERROR_MESSAGES.BLOCK_INSTANCE_NOT_FOUND, blockInstanceId)
      return
    }
    
    const blockShapeValidation = validateBlockShape(blockInstance, blockInstanceId)
    if (!blockShapeValidation.valid) {
      sendBadRequest(res, blockShapeValidation.error, blockShapeValidation.details?.message as string, blockInstanceId)
      return
    }
    
    const propertyType = await PropertyVersionType.create({
      propertyVersionId,
      blockInstanceId,
      orderIndex,
    })
    
    const completePropertyType = await buildPropertyTypeResponse(propertyType.id)
    
    sendCreated(res, completePropertyType)
  } catch (error) {
    // Handle database constraint errors
    if (error instanceof Error && error.message.includes('block_instance_id must reference')) {
      sendBadRequest(res, ERROR_MESSAGES.INVALID_BLOCK_SHAPE, error.message)
      return
    }
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      sendError(res, ERROR_MESSAGES.PROPERTY_TYPE_ALREADY_ASSIGNED, HTTP_STATUS_CODES.CONFLICT)
      return
    }
    
    handleRouteError(error, res, ERROR_MESSAGES.ADD_PROPERTY_TYPE, 'adding property type')
  }
  }
)

router.patch(
  '/:id/types/:typeId',
  csrfProtection,
  checkOwnership('propertyType', 'typeId'),
  validateRequest(propertyTypePatchBodySchema),
  async (req: Request, res: Response): Promise<void> => {
  try {
    const typeId = paramString(req, 'typeId')
    const { orderIndex } = req.body
    
    const propertyType = await PropertyVersionType.findByPk(typeId)
    
    if (!propertyType) {
      sendNotFound(res, ERROR_MESSAGES.PROPERTY_TYPE_NOT_FOUND, typeId)
      return
    }
    
    if (orderIndex !== undefined) {
      await propertyType.update({ orderIndex })
    }
    
    const completePropertyType = await buildPropertyTypeResponse(propertyType.id)
    
    sendSuccess(res, completePropertyType)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_PROPERTY_TYPE, 'updating property type')
  }
  }
)

router.delete(
  '/:id/types/:typeId',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('propertyType', 'typeId'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
  try {
    const typeId = paramString(req, 'typeId')
    
    const propertyType = await PropertyVersionType.findByPk(typeId)
    
    if (!propertyType) {
      sendNotFound(res, ERROR_MESSAGES.PROPERTY_TYPE_NOT_FOUND, typeId)
      return
    }
    
    await propertyType.destroy()
    
    sendNoContent(res)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.REMOVE_PROPERTY_TYPE, 'removing property type')
  }
  }
)

router.put(
  '/:id/types',
  csrfProtection,
  validateRequest(propertyTypesPutBodySchema),
  async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = paramString(req, 'id')
    const { blockInstanceIds = [] } = req.body
    
    const propertyVersion = await PropertyVersion.findByPk(propertyVersionId)
    if (!propertyVersion) {
      sendNotFound(res, ERROR_MESSAGES.PROPERTY_VERSION_NOT_FOUND, propertyVersionId)
      return
    }
    
    // Validate all blockInstanceIds have BLOCK_SHAPE_NAMES.PROPERTIES block_shape
    if (blockInstanceIds.length > 0) {
      const blockInstances = await BlockInstance.findAll({
        where: { id: { [Op.in]: blockInstanceIds } },
        include: [{ model: BlockShape, as: 'block_shape' }],
      })
      
      const validation = validateBlockInstancesForPropertyTypes(blockInstances, blockInstanceIds)
      if (!validation.valid) {
        const statusCode = validation.details?.invalidBlockInstanceIds ? HTTP_STATUS_CODES.BAD_REQUEST : HTTP_STATUS_CODES.NOT_FOUND
        sendError(res, validation.error, statusCode, validation.details?.message as string)
        return
      }
    }
    
    await PropertyVersion.sequelize!.transaction(async (transaction) => {
      await createPropertyTypesBulk(propertyVersionId, blockInstanceIds, transaction)
    })
    
    const propertyTypes = await getPropertyTypesWithAssociations(propertyVersionId)
    
    sendSuccess(res, propertyTypes)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.REPLACE_PROPERTY_TYPES, 'replacing property types')
  }
  }
)

export { router as PropertyTypesRouter }
