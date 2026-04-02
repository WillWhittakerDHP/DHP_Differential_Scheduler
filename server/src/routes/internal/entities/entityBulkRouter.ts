
import { Router, Request, Response } from 'express'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import {
  entityOrderIndexPatchBodySchema,
  entityBulkPatchBodySchema,
} from '../../schemas/entityBulkSchemas.js'
import { bulkPatch } from '../../helpers/dataController.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'
import { validateBulkUpdateArray } from './entityValidators.js'
import { ensureBlockInstanceVersionsBeforeBulkUpdate } from './entityHelpers.js'
import { entityTypeParamHandler } from './entityParamMiddleware.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection, requireAuth } from '../../../middlewares/security.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'
import { normalizeAnnotationShapeWritePayload } from '../../../services/annotations/annotationShapeUiSlot.js'
import { sendBadRequest } from '../../helpers/routerResponseHelpers.js'
import { validateBlockInstanceBooleanFields } from './blockInstanceEntityValidation.js'
import { validateEventShapeWritePayload } from './eventShapeEntityValidation.js'
import { validateEventInstanceWritePayload } from './eventInstanceEntityValidation.js'

const router = Router()

router.param('entityType', entityTypeParamHandler)

router.patch('/:entityType/order_index', csrfProtection, requireAuth, validateRequest(entityOrderIndexPatchBodySchema), async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    res.status(500).json({ error: ERROR_MESSAGES.ENTITY_CONFIG_MISSING })
    return
  }
  
  try {
    const entityType = paramString(req, 'entityType')
    const body = req.body as Array<{ id: string } & Record<string, unknown>>
    if (entityType === ENTITY_KEYS.ANNOTATION_SHAPE || entityType === 'annotationShape') {
      for (const row of body) {
        const normalized = normalizeAnnotationShapeWritePayload(row)
        if (!normalized.ok) {
          sendBadRequest(res, 'Invalid annotation shape uiSlot', normalized.message)
          return
        }
        const next = normalized.data
        for (const key of Object.keys(row)) {
          delete row[key]
        }
        Object.assign(row, next)
      }
    }
    if (entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance') {
      for (const row of body) {
        const blockInstanceErr = validateBlockInstanceBooleanFields(row as Record<string, unknown>)
        if (blockInstanceErr !== null) {
          sendBadRequest(res, blockInstanceErr, blockInstanceErr)
          return
        }
      }
    }
    if (entityType === ENTITY_KEYS.EVENT_SHAPE) {
      for (const row of body) {
        const eventShapeErr = validateEventShapeWritePayload(row as Record<string, unknown>)
        if (eventShapeErr !== null) {
          sendBadRequest(res, eventShapeErr, eventShapeErr)
          return
        }
      }
    }
    if (entityType === ENTITY_KEYS.EVENT_INSTANCE) {
      for (const row of body) {
        const eventInstanceErr = validateEventInstanceWritePayload(row as Record<string, unknown>, 'update')
        if (eventInstanceErr !== null) {
          sendBadRequest(res, eventInstanceErr, eventInstanceErr)
          return
        }
      }
    }
    // PATTERN: Client sends camelCase (orderIndex); Sequelize model uses underscored: true
    const updatedCount = await bulkPatch(entityConfig.model, body)
    res.json({ updated: updatedCount })
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.BULK_UPDATE_ENTITIES.replace('{displayName}', entityConfig.displayName)
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'bulk updating order indices')
  }
})

router.patch('/:entityType/bulk', csrfProtection, requireAuth, validateRequest(entityBulkPatchBodySchema), async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    res.status(500).json({ error: ERROR_MESSAGES.ENTITY_CONFIG_MISSING })
    return
  }

  try {
    const updates = req.body

    const validation = validateBulkUpdateArray(updates)
    if (!validation.valid) {
      res.status(400).json({
        error: validation.error,
        ...validation.details
      })
      return
    }

    const entityType = paramString(req, 'entityType')
    const isBlockInstance =
      entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance'
    if (isBlockInstance) {
      for (const row of updates) {
        const blockInstanceErr = validateBlockInstanceBooleanFields(row as Record<string, unknown>)
        if (blockInstanceErr !== null) {
          sendBadRequest(res, blockInstanceErr, blockInstanceErr)
          return
        }
      }
      await ensureBlockInstanceVersionsBeforeBulkUpdate(updates)
    }

    if (entityType === ENTITY_KEYS.ANNOTATION_SHAPE || entityType === 'annotationShape') {
      for (const row of updates) {
        const normalized = normalizeAnnotationShapeWritePayload(row as Record<string, unknown>)
        if (!normalized.ok) {
          sendBadRequest(res, 'Invalid annotation shape uiSlot', normalized.message)
          return
        }
        const next = normalized.data
        for (const key of Object.keys(row)) {
          delete row[key]
        }
        Object.assign(row, next)
      }
    }

    if (entityType === ENTITY_KEYS.EVENT_SHAPE) {
      for (const row of updates) {
        const eventShapeErr = validateEventShapeWritePayload(row as Record<string, unknown>)
        if (eventShapeErr !== null) {
          sendBadRequest(res, eventShapeErr, eventShapeErr)
          return
        }
      }
    }

    if (entityType === ENTITY_KEYS.EVENT_INSTANCE) {
      for (const row of updates) {
        const eventInstanceErr = validateEventInstanceWritePayload(row as Record<string, unknown>, 'update')
        if (eventInstanceErr !== null) {
          sendBadRequest(res, eventInstanceErr, eventInstanceErr)
          return
        }
      }
    }

    const updatedCount = await bulkPatch(entityConfig.model, updates)
    res.json({ updated: updatedCount })
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.BULK_UPDATE_FAILED.replace('{displayName}', entityConfig.displayName)
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'bulk updating entities')
  }
})

export { router as EntityBulkRouter }
