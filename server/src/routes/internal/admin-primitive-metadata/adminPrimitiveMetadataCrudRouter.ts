
import { Router, Request, Response } from 'express'
import { AdminPrimitiveMetadata } from '../../../db/models/admin/adminPrimitiveMetadata.js'
import { getAdminPrimitiveMetadata } from '../../../utils/adminPrimitiveMetadataComposer.js'
import { ERROR_MESSAGES, VALID_ENTITY_TYPES } from './adminPrimitiveMetadataConstants.js'

type PrimitiveEntityType = (typeof VALID_ENTITY_TYPES)[number]
import { handleRouteError } from './adminPrimitiveMetadataErrorHandler.js'
import { validateEntityType, validateRequiredFields, validateRenderAs, validateInputConfig } from './adminPrimitiveMetadataValidators.js'
import { computeRenderAs, transformMetadataToRecord } from './adminPrimitiveMetadataHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendNoContent } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection } from '../../../middlewares/security.js'

const router = Router()

router.get('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const entityType = paramString(req, 'entityType')
    const entityId = paramString(req, 'entityId')

    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    const metadata = await getAdminPrimitiveMetadata(
      entityType as PrimitiveEntityType,
      entityId
    )

    const metadataRecord = transformMetadataToRecord(metadata)

    sendSuccess(res, metadataRecord)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_METADATA, 'fetching primitive metadata')
  }
})

router.post(
  '/:entityType/:entityId',
  csrfProtection, // Security middleware: CSRF protection
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
      renderAs: providedRenderAs,
      statusButtonColor = null,
      panel = 'none',
      bulkEdit = false,
      inputConfig = null,
    } = req.body
    
    const renderAs = providedRenderAs || computeRenderAs(dataType, inputConfig, fieldKey)

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

    const renderAsValidation = validateRenderAs(renderAs)
    if (!renderAsValidation.valid) {
      sendBadRequest(res, renderAsValidation.error, renderAsValidation.details?.message as string)
      return
    }

    const inputConfigValidation = validateInputConfig(renderAs, inputConfig)
    if (!inputConfigValidation.valid) {
      sendBadRequest(res, inputConfigValidation.error, inputConfigValidation.details?.message as string)
      return
    }

    const existing = await AdminPrimitiveMetadata.findOne({
      where: {
        entityType: entityType as PrimitiveEntityType,
        entityId: entityId,
        fieldKey: fieldKey,
      },
    })

    if (existing) {
      await existing.update({
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
      })

      sendSuccess(res, existing)
    } else {
      const metadata = await AdminPrimitiveMetadata.create({
        entityType: entityType as PrimitiveEntityType,
        entityId: entityId,
        fieldKey,
        dataType,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
        renderAs,
        statusButtonColor,
        panel,
        bulkEdit,
        inputConfig,
      })

      sendCreated(res, metadata)
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_UPDATE_METADATA, 'creating/updating primitive metadata')
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

    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    const metadata = await AdminPrimitiveMetadata.findOne({
      where: {
        entityType: entityType as PrimitiveEntityType,
        entityId: entityId,
        fieldKey: fieldKey,
      },
    })

    if (!metadata) {
      sendNotFound(res, ERROR_MESSAGES.METADATA_NOT_FOUND, `${entityType}/${entityId}/${fieldKey}`)
      return
    }

    await metadata.destroy()

    sendNoContent(res)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_METADATA, 'deleting primitive metadata')
  }
  }
)

export { router as AdminPrimitiveMetadataCrudRouter }
