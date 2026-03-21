import { Router, Request, Response } from 'express'
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord
} from '../../helpers/dataController.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'
import { validateEntityId } from './entityValidators.js'
import { sanitizeEntityDataForCreate, sanitizeEntityDataForUpdate } from './entitySanitizers.js'
import { buildFetchOptions, handleBlockInstanceVersioning, handlePartInstanceCleanup } from './entityHelpers.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'
import { AnnotationInstance, AnnotationInstanceContent } from '../../../config/app.js'
import { resolveAnnotationTextForAssignment } from '../../../services/annotations/annotationTextResolution.js'
import type { AnnotationWithContentPlain } from '../../../services/annotations/annotationTextResolution.js'
import { syncAnnotationInstanceContentFromLegacyColumns } from '../../../services/annotations/annotationInstanceContentSync.js'
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js'
import { createLogger } from '../../../utils/logger.js'
import { entityTypeParamHandler } from './entityParamMiddleware.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const logger = createLogger('EntityRouter')

const router = Router()

router.param('entityType', entityTypeParamHandler)

router.get('/:entityType', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    return
  }
  
  try {
    // WHY: Consistent pattern with relationships - annotations fetched separately, then attached during hydration
    // PATTERN: Entities fetched without associations, annotations attached in frontend transformer
    
    const entityTypeParam = paramString(req, 'entityType')
    const base = buildFetchOptions(entityConfig.model)
    const fetchOpts = {
      attributes: base.attributes,
      order: base.order,
      includes:
        entityTypeParam === ENTITY_KEYS.ANNOTATION_INSTANCE
          ? [
              {
                model: AnnotationInstanceContent,
                as: 'contentRows',
                attributes: ['id', 'text', 'userTypeBlockInstanceId'],
                required: false,
              },
            ]
          : undefined,
    }
    const data = await fetchAll(entityConfig.model, fetchOpts)

    if (entityTypeParam === ENTITY_KEYS.ANNOTATION_INSTANCE) {
      const formatted = (data as InstanceType<typeof AnnotationInstance>[]).map((row) => {
        const plain = row.get({ plain: true }) as AnnotationWithContentPlain & Record<string, unknown>
        plain.text = resolveAnnotationTextForAssignment(plain, null)
        delete plain.contentRows
        return plain
      })
      sendSuccess(res, formatted)
      return
    }

    sendSuccess(res, data)
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.FETCH_ENTITIES.replace('{displayName}', entityConfig.displayName)
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'fetching entities')
  }
})

router.get('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    return
  }
  
  try {
    const id = paramString(req, 'id')
    const entityTypeParam = paramString(req, 'entityType')

    if (entityTypeParam === ENTITY_KEYS.ANNOTATION_INSTANCE) {
      const record = await AnnotationInstance.findByPk(id, {
        attributes: getModelAttributes(AnnotationInstance),
        include: [
          {
            model: AnnotationInstanceContent,
            as: 'contentRows',
            attributes: ['id', 'text', 'userTypeBlockInstanceId'],
            required: false,
          },
        ],
      })
      if (!record) {
        const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
        sendNotFound(res, errorMessage, id)
        return
      }
      const plain = record.get({ plain: true }) as AnnotationWithContentPlain & Record<string, unknown>
      plain.text = resolveAnnotationTextForAssignment(plain, null)
      delete plain.contentRows
      sendSuccess(res, plain)
      return
    }

    const record = await fetchById(entityConfig.model, id)

    if (!record) {
      const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
      sendNotFound(res, errorMessage, id)
      return
    }

    sendSuccess(res, record)
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.FETCH_ENTITY.replace('{displayName}', entityConfig.displayName)
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'fetching entity', paramString(req, 'id'))
  }
})

router.post(
  '/:entityType',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
    const { entityConfig } = req
    if (!entityConfig) {
      sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      return
    }
    
    try {
      // PATTERN: Convert empty strings for known enum fields to their default values
      const sanitizedData = sanitizeEntityDataForCreate(req.body, paramString(req, 'entityType'))
      
      const created = await createRecord(entityConfig.model, sanitizedData)
      const createdEntityType = paramString(req, 'entityType')
      if (createdEntityType === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        await syncAnnotationInstanceContentFromLegacyColumns(created as InstanceType<typeof AnnotationInstance>)
      }
      sendCreated(res, created)
    } catch (error) {
      const errorMessage = ERROR_MESSAGES.CREATE_ENTITY.replace('{displayName}', entityConfig.displayName)
      handleRouteError(error, res, errorMessage, entityConfig.displayName, 'creating entity')
    }
  }
)

router.put(
  '/:entityType/:id',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('entity', 'id'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
    const { entityConfig } = req
    if (!entityConfig) {
      sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      return
    }
    
    const entityId = paramString(req, 'id')
    
    try {
      // PATTERN: Convert empty strings for known enum fields to their default values
      const sanitizedData = sanitizeEntityDataForUpdate(req.body, paramString(req, 'entityType'))
      
      // CRITICAL: For block instances, capture old state BEFORE update for versioning
      if (paramString(req, 'entityType') === ENTITY_KEYS.BLOCK_INSTANCE || paramString(req, 'entityType') === 'blockInstance') {
        const oldInstance = await handleBlockInstanceVersioning(entityId, true)
        
        if (!oldInstance) {
          const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
          sendNotFound(res, errorMessage, entityId)
          return
        }
      }
      
      // Perform the update (using sanitizedData to ensure enum fields are properly handled)
      const updatedCount = await updateRecord(entityConfig.model, entityId, sanitizedData)
      
      if (updatedCount === 0) {
        const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
        sendNotFound(res, errorMessage, entityId)
        return
      }

      const putEntityType = paramString(req, 'entityType')
      if (putEntityType === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        const inst = await AnnotationInstance.findByPk(entityId, {
          attributes: getModelAttributes(AnnotationInstance),
        })
        if (inst) {
          await syncAnnotationInstanceContentFromLegacyColumns(inst)
        }
      }

      // PATTERN: After successful update, find and disable old relationships
      if (putEntityType === ENTITY_KEYS.PART_INSTANCE || putEntityType === 'partInstance') {
        await handlePartInstanceCleanup(entityId)
      }

      const successMessage = ERROR_MESSAGES.UPDATE_ENTITY.replace('{displayName}', entityConfig.displayName).replace('Error ', '')
      sendSuccess(res, {
        message: `${successMessage} successfully`,
        updated: updatedCount,
      })
    } catch (error) {
      const errorMessage = ERROR_MESSAGES.UPDATE_ENTITY.replace('{displayName}', entityConfig.displayName)
      handleRouteError(error, res, errorMessage, entityConfig.displayName, 'updating entity', entityId)
    }
  }
)

router.patch(
  '/:entityType/:id',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('entity', 'id'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
    const { entityConfig } = req
    if (!entityConfig) {
      sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      return
    }
    
    const entityId = paramString(req, 'id')
    const fieldKey = req.body.key
    const newValue = req.body.value
    
    // PATTERN: Validate entity ID format before attempting database operations
    const idValidation = validateEntityId(entityId, entityConfig.displayName)
    if (!idValidation.valid) {
      sendBadRequest(res, idValidation.error, idValidation.details?.message as string, entityId)
      return
    }
    
    try {
      // WHY: Support both {key, value} format and direct field updates
      // PATTERN: Standard PATCH - parse data, update directly, let Sequelize handle validation
      let updateData: Record<string, unknown>
      if (fieldKey && newValue !== undefined) {
        updateData = { [fieldKey]: newValue }
      } else {
        updateData = req.body
      }

      // PATTERN: When setting one to true, set the other to false so the PATCH succeeds.
      const entityType = paramString(req, 'entityType')
      if (entityType === ENTITY_KEYS.BLOCK_SHAPE || entityType === 'blockShape') {
        if (updateData.canHaveParts === true) {
          updateData = { ...updateData, isStateControl: false }
        }
        if (updateData.isStateControl === true) {
          updateData = { ...updateData, canHaveParts: false }
        }
      }

      const sanitizedData = sanitizeEntityDataForUpdate(updateData, entityType)
      
      // WHY: Standard PATCH pattern - log essentials, not entire entity state
      // PATTERN: Log before update to track what's being changed
      logger.info(`PATCH: ${entityConfig.displayName} ${entityId}`, {
        fieldKey,
        value: newValue
      })
      
      // CRITICAL: For block instances, capture old state BEFORE update for versioning
      if (paramString(req, 'entityType') === ENTITY_KEYS.BLOCK_INSTANCE || paramString(req, 'entityType') === 'blockInstance') {
        await handleBlockInstanceVersioning(entityId, true)
      }
      
      // WHY: Standard REST PATCH pattern - one database query, let ORM handle validation
      // PATTERN: Call update, check result, handle errors
      const updatedCount = await patchRecord(entityConfig.model, entityId, sanitizedData)

      if (updatedCount === 0) {
        const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
        sendNotFound(res, errorMessage, entityId)
        return
      }

      const patchedEntityType = paramString(req, 'entityType')
      if (patchedEntityType === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        const inst = await AnnotationInstance.findByPk(entityId, {
          attributes: getModelAttributes(AnnotationInstance),
        })
        if (inst) {
          await syncAnnotationInstanceContentFromLegacyColumns(inst)
        }
      }

      // PATTERN: After successful update, find and disable old relationships
      if (patchedEntityType === ENTITY_KEYS.PART_INSTANCE || patchedEntityType === 'partInstance') {
        await handlePartInstanceCleanup(entityId)
      }

      sendSuccess(res, { updated: updatedCount })
    } catch (error) {
      const errorMessage = ERROR_MESSAGES.PATCH_ENTITY.replace('{displayName}', entityConfig.displayName)
      handleRouteError(error, res, errorMessage, entityConfig.displayName, 'patching entity', entityId)
    }
  }
)

router.delete(
  '/:entityType/:id',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('entity', 'id'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
    const { entityConfig } = req
    if (!entityConfig) {
      sendError(res, ERROR_MESSAGES.ENTITY_CONFIG_MISSING, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      return
    }
    
    const entityId = paramString(req, 'id')
    
    try {
      // CRITICAL: For block instances, capture old state BEFORE delete for versioning
      if (paramString(req, 'entityType') === ENTITY_KEYS.BLOCK_INSTANCE || paramString(req, 'entityType') === 'blockInstance') {
        const oldInstance = await handleBlockInstanceVersioning(entityId, false)
        
        if (!oldInstance) {
          const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
          sendNotFound(res, errorMessage, entityId)
          return
        }
      }
      
      const deletedCount = await deleteRecord(entityConfig.model, entityId)
      
      if (deletedCount === 0) {
        const errorMessage = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
        sendNotFound(res, errorMessage, entityId)
        return
      }

      const successMessage = ERROR_MESSAGES.DELETE_ENTITY.replace('{displayName}', entityConfig.displayName).replace('Error ', '')
      sendSuccess(res, { 
        message: `${successMessage} successfully`,
        deleted: deletedCount
      })
    } catch (error) {
      const errorMessage = ERROR_MESSAGES.DELETE_ENTITY.replace('{displayName}', entityConfig.displayName)
      handleRouteError(error, res, errorMessage, entityConfig.displayName, 'deleting entity', entityId)
    }
  }
)

export { router as EntityCrudRouter }
