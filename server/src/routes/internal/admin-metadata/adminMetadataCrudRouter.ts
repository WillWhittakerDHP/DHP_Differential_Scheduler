
import { Router, Request, Response } from 'express'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { adminMetadataPostBodySchema } from '../../schemas/adminMetadataSchemas.js'
import { AdminMetadata } from '../../../db/models/admin/adminMetadata.js'
import { getAdminMetadata } from '../../../utils/adminMetadataComposer.js'
import { ERROR_MESSAGES, VALID_ENTITY_TYPES } from './adminMetadataConstants.js'

type AdminMetadataEntityType = (typeof VALID_ENTITY_TYPES)[number]
import { handleRouteError } from './adminMetadataErrorHandler.js'
import { validateEntityType, validateRequiredFields, validateRenderAs, validateInputConfig } from './adminMetadataValidators.js'
import {
  determineMetadataType,
  getDefaultRenderAs,
  getDefaultPanel,
  resolveBlockInstanceMetadata,
  buildMetadataWhereClause,
  buildBatchMetadataResult,
} from './adminMetadataHelpers.js'
import { createLogger } from '../../../utils/logger.js'
import { sendSuccess, sendCreated, sendNoContent, sendBadRequest, sendError } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const logger = createLogger('AdminMetadataRouter')

const router = Router()

router.get('/batch', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('GET /admin-metadata/batch')

    const allMetadata = await AdminMetadata.findAll({
      order: [['display_order', 'ASC'], ['field_key', 'ASC']],
    })

    const result = buildBatchMetadataResult(allMetadata)

    logger.debug(`Batch returning: global counts = blockShape:${Object.keys(result.global.blockShape).length}, partShape:${Object.keys(result.global.partShape).length}, blockInstance:${Object.keys(result.global.blockInstance).length}, partInstance:${Object.keys(result.global.partInstance).length}, eventShape:${Object.keys(result.global.eventShape).length}, eventInstance:${Object.keys(result.global.eventInstance).length}, annotationShape:${Object.keys(result.global.annotationShape).length}, annotationInstance:${Object.keys(result.global.annotationInstance).length}, blockShapeSpecific:${Object.keys(result.blockShapeSpecific).length}`)

    sendSuccess(res, result)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_BATCH_METADATA, 'fetching batch metadata')
  }
})

router.get('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const entityType = paramString(req, 'entityType')
    const entityId = paramString(req, 'entityId')
    const blockShapeRef = req.query.blockShapeRef as string | undefined

    logger.debug(`GET /admin-metadata/${entityType}/${entityId}`, {
      blockShapeRef: blockShapeRef || null,
    })

    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    const metadataRecord = await getAdminMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance',
      entityId,
      blockShapeRef || null
    )

    logger.debug(`Returning ${Object.keys(metadataRecord).length} metadata entries`)

    sendSuccess(res, metadataRecord)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_METADATA, 'fetching metadata')
  }
})

router.post(
  '/:entityType/:entityId',
  csrfProtection,
  validateRequest(adminMetadataPostBodySchema),
  async (req: Request, res: Response): Promise<void> => {
  try {
    const entityType = paramString(req, 'entityType')
    const entityId = paramString(req, 'entityId')
    const {
      fieldKey,
      dataType,
      label,
      isRequired = false,
      visibility,
      layout,
      displayOrder,
      renderAs,
      statusButtonColor = null,
      panel,
      bulkEdit = false,
      inputConfig = null,
      blockShapeRef = null,
    } = req.body

    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields({
      fieldKey,
      dataType,
      label,
      visibility,
      layout,
      displayOrder,
    })
    if (!requiredFieldsValidation.valid) {
      sendBadRequest(res, requiredFieldsValidation.error, requiredFieldsValidation.details?.message as string)
      return
    }

    const metadataType = determineMetadataType(fieldKey)
    const defaultRenderAs = getDefaultRenderAs(metadataType)
    const finalRenderAs = renderAs || defaultRenderAs

    const defaultPanel = getDefaultPanel(metadataType)
    const finalPanel = panel || defaultPanel

    const renderAsValidation = validateRenderAs(finalRenderAs)
    if (!renderAsValidation.valid) {
      sendBadRequest(res, renderAsValidation.error, renderAsValidation.details?.message as string)
      return
    }

    const inputConfigValidation = validateInputConfig(finalRenderAs, inputConfig)
    if (!inputConfigValidation.valid) {
      sendBadRequest(res, inputConfigValidation.error, inputConfigValidation.details?.message as string)
      return
    }

    const { finalEntityId, finalBlockShapeRef } = resolveBlockInstanceMetadata(
      entityType,
      entityId,
      blockShapeRef
    )

    logger.debug(`POST /admin-metadata/${entityType}/${entityId}`, {
      fieldKey,
      blockShapeRef: finalBlockShapeRef || null,
      finalEntityId,
    })

    const existingWhere = buildMetadataWhereClause(
      entityType,
      finalEntityId,
      metadataType,
      fieldKey,
      finalBlockShapeRef
    )

    const existing = await AdminMetadata.findOne({
      where: existingWhere,
    })

    if (existing) {
      await existing.update({
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs: finalRenderAs,
        statusButtonColor,
        panel: finalPanel,
        bulkEdit,
        inputConfig,
        blockShapeRef: finalBlockShapeRef,
      })

      sendSuccess(res, existing)
    } else {
      const metadata = await AdminMetadata.create({
        entityType: entityType as AdminMetadataEntityType,
        entityId: finalEntityId,
        metadataType,
        fieldKey,
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs: finalRenderAs,
        statusButtonColor,
        panel: finalPanel,
        bulkEdit,
        inputConfig,
        blockShapeRef: finalBlockShapeRef,
      })

      sendCreated(res, metadata)
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_UPDATE_METADATA, 'creating/updating metadata')
  }
  }
)

router.delete(
  '/:entityType/:entityId/:fieldKey',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
    try {
      const entityType = paramString(req, 'entityType')
      const entityId = paramString(req, 'entityId')
      const fieldKey = paramString(req, 'fieldKey')
      const blockShapeRef = req.query.blockShapeRef as string | undefined

      const entityTypeValidation = validateEntityType(entityType)
      if (!entityTypeValidation.valid) {
        sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
        return
      }

    const metadataType = determineMetadataType(fieldKey)

    const { finalEntityId, finalBlockShapeRef } = resolveBlockInstanceMetadata(
      entityType,
      entityId,
      blockShapeRef
    )

    const whereClause = buildMetadataWhereClause(
      entityType,
      finalEntityId,
      metadataType,
      fieldKey,
      finalBlockShapeRef
    )

    const metadata = await AdminMetadata.findOne({
      where: whereClause,
    })

      if (!metadata) {
        sendError(res, ERROR_MESSAGES.METADATA_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND, undefined, `${entityType}/${entityId}/${fieldKey}`)
        return
      }

      await metadata.destroy()

      sendNoContent(res)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.DELETE_METADATA, 'deleting metadata')
    }
  }
)

export { router as AdminMetadataCrudRouter }
