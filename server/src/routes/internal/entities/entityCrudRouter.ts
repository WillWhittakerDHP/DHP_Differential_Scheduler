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
import {
  syncAnnotationInstanceContentFromLegacyColumns,
  syncAnnotationInstanceContentRows,
  type AnnotationContentRowInput,
} from '../../../services/annotations/annotationInstanceContentSync.js'
import { countAnnotationInstancesForShape } from '../../../services/annotations/countAnnotationInstancesForShape.js'
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js'
import { createLogger } from '../../../utils/logger.js'
import { entityTypeParamHandler } from './entityParamMiddleware.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError } from '../../helpers/routerResponseHelpers.js'
import { normalizeAnnotationShapeWritePayload } from '../../../services/annotations/annotationShapeUiSlot.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const logger = createLogger('EntityRouter')

function pullAnnotationContentRowsFromBody(body: Record<string, unknown>): {
  rows: AnnotationContentRowInput[] | undefined
  rest: Record<string, unknown>
} {
  const rest = { ...body }
  const raw = rest.contentRows
  delete rest.contentRows
  if (raw === undefined) {
    return { rows: undefined, rest }
  }
  if (!Array.isArray(raw)) {
    return { rows: undefined, rest }
  }
  const rows: AnnotationContentRowInput[] = []
  for (const item of raw) {
    if (item === null || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const idRaw = o.userTypeBlockInstanceId
    const userTypeBlockInstanceId =
      idRaw === null || idRaw === undefined || idRaw === '' ? null : String(idRaw)
    const textVal = o.text
    rows.push({
      userTypeBlockInstanceId,
      text: typeof textVal === 'string' ? textVal : '',
    })
  }
  return { rows, rest }
}

function applyAnnotationShapeUiSlotNormalization(
  res: Response,
  entityType: string,
  data: Record<string, unknown>
): boolean {
  if (entityType !== ENTITY_KEYS.ANNOTATION_SHAPE && entityType !== 'annotationShape') {
    return true
  }
  const normalized = normalizeAnnotationShapeWritePayload(data)
  if (!normalized.ok) {
    sendBadRequest(res, 'Invalid annotation shape uiSlot', normalized.message)
    return false
  }
  const next = normalized.data
  for (const key of Object.keys(data)) {
    delete data[key]
  }
  Object.assign(data, next)
  return true
}

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
      const createEntityType = paramString(req, 'entityType')
      let bodyForCreate: Record<string, unknown> = { ...(req.body as Record<string, unknown>) }
      let annotationCreateContentRows: AnnotationContentRowInput[] | undefined
      if (createEntityType === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        const pulled = pullAnnotationContentRowsFromBody(bodyForCreate)
        annotationCreateContentRows = pulled.rows
        bodyForCreate = pulled.rest
      }

      // PATTERN: Convert empty strings for known enum fields to their default values
      const sanitizedData = sanitizeEntityDataForCreate(bodyForCreate, createEntityType) as Record<
        string,
        unknown
      >
      if (!applyAnnotationShapeUiSlotNormalization(res, createEntityType, sanitizedData)) {
        return
      }

      const created = await createRecord(entityConfig.model, sanitizedData)
      if (createEntityType === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        const createdInst = created as InstanceType<typeof AnnotationInstance>
        if (annotationCreateContentRows !== undefined) {
          await syncAnnotationInstanceContentRows(createdInst.id, annotationCreateContentRows)
        } else {
          await syncAnnotationInstanceContentFromLegacyColumns(createdInst)
        }
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
      const putEntityTypeEarly = paramString(req, 'entityType')
      let bodyForPut: Record<string, unknown> = { ...(req.body as Record<string, unknown>) }
      let annotationPutContentRows: AnnotationContentRowInput[] | undefined
      if (putEntityTypeEarly === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        const pulled = pullAnnotationContentRowsFromBody(bodyForPut)
        annotationPutContentRows = pulled.rows
        bodyForPut = pulled.rest
      }

      // PATTERN: Convert empty strings for known enum fields to their default values
      const sanitizedData = sanitizeEntityDataForUpdate(bodyForPut, putEntityTypeEarly) as Record<
        string,
        unknown
      >
      if (!applyAnnotationShapeUiSlotNormalization(res, putEntityTypeEarly, sanitizedData)) {
        return
      }

      // CRITICAL: For block instances, capture old state BEFORE update for versioning
      if (putEntityTypeEarly === ENTITY_KEYS.BLOCK_INSTANCE || putEntityTypeEarly === 'blockInstance') {
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

      if (putEntityTypeEarly === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        if (annotationPutContentRows !== undefined) {
          await syncAnnotationInstanceContentRows(entityId, annotationPutContentRows)
        } else {
          const inst = await AnnotationInstance.findByPk(entityId, {
            attributes: getModelAttributes(AnnotationInstance),
          })
          if (inst) {
            await syncAnnotationInstanceContentFromLegacyColumns(inst)
          }
        }
      }

      // PATTERN: After successful update, find and disable old relationships
      if (putEntityTypeEarly === ENTITY_KEYS.PART_INSTANCE || putEntityTypeEarly === 'partInstance') {
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
        updateData = { ...(req.body as Record<string, unknown>) }
      }

      const entityType = paramString(req, 'entityType')
      let annotationPatchContentRows: AnnotationContentRowInput[] | undefined
      if (entityType === ENTITY_KEYS.ANNOTATION_INSTANCE) {
        const pulled = pullAnnotationContentRowsFromBody(updateData)
        annotationPatchContentRows = pulled.rows
        updateData = pulled.rest
      }

      // PATTERN: When setting one to true, set the other to false so the PATCH succeeds.
      if (entityType === ENTITY_KEYS.BLOCK_SHAPE || entityType === 'blockShape') {
        if (updateData.canHaveParts === true) {
          updateData = { ...updateData, isStateControl: false }
        }
        if (updateData.isStateControl === true) {
          updateData = { ...updateData, canHaveParts: false }
        }
      }

      const sanitizedData = sanitizeEntityDataForUpdate(updateData, entityType) as Record<string, unknown>
      if (!applyAnnotationShapeUiSlotNormalization(res, entityType, sanitizedData)) {
        return
      }

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
        if (annotationPatchContentRows !== undefined) {
          await syncAnnotationInstanceContentRows(entityId, annotationPatchContentRows)
        } else {
          const inst = await AnnotationInstance.findByPk(entityId, {
            attributes: getModelAttributes(AnnotationInstance),
          })
          if (inst) {
            await syncAnnotationInstanceContentFromLegacyColumns(inst)
          }
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
    const deleteEntityType = paramString(req, 'entityType')

    try {
      if (
        deleteEntityType === ENTITY_KEYS.ANNOTATION_SHAPE ||
        deleteEntityType === 'annotationShape'
      ) {
        const idValidation = validateEntityId(entityId, entityConfig.displayName)
        if (!idValidation.valid) {
          sendBadRequest(res, idValidation.error, idValidation.details?.message as string, entityId)
          return
        }
        const dependentCount = await countAnnotationInstancesForShape(entityId)
        if (dependentCount > 0) {
          logger.warn('Annotation shape delete blocked: instances still reference shape', {
            shapeId: entityId,
            dependentCount,
          })
          res.status(HTTP_STATUS_CODES.CONFLICT).json({
            error: ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE,
            details: ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE_DETAILS.replace(
              '{dependentCount}',
              String(dependentCount)
            ),
            shapeId: entityId,
            dependentCount,
          })
          return
        }
      }

      // CRITICAL: For block instances, capture old state BEFORE delete for versioning
      if (deleteEntityType === ENTITY_KEYS.BLOCK_INSTANCE || deleteEntityType === 'blockInstance') {
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
