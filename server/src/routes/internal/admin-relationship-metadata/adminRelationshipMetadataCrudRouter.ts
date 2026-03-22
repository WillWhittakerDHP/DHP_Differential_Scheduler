
import { Router, Request, Response } from 'express'
import { AdminRelationshipMetadata } from '../../../db/models/admin/adminRelationshipMetadata.js'
import { sequelize } from '../../../config/database.js'
import { getAdminRelationshipMetadata } from '../../../utils/adminRelationshipMetadataComposer.js'
import { relationshipMetadataToHttpPayload } from '../../../utils/adminPrimitiveRelationshipAssembly.js'
import {
  replaceSelectOptionsForRelationshipMetadata,
  splitInputConfigForPersistence,
} from '../../../utils/adminMetadataInputConfigPersist.js'
import { ERROR_MESSAGES, VALID_ENTITY_TYPES } from './adminRelationshipMetadataConstants.js'

type RelationshipEntityType = (typeof VALID_ENTITY_TYPES)[number]
import { handleRouteError } from './adminRelationshipMetadataErrorHandler.js'
import { validateEntityType, validateRequiredFields, validateInputConfig } from './adminRelationshipMetadataValidators.js'
import { transformMetadataToRecord } from './adminRelationshipMetadataHelpers.js'
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendNoContent,
  sendError,
} from '../../helpers/routerResponseHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
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

    const metadata = await getAdminRelationshipMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
      entityId
    )

    const metadataRecord = transformMetadataToRecord(metadata)

    sendSuccess(res, metadataRecord)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_METADATA, 'fetching relationship metadata')
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
      relationshipKey,
      dataType,
      label,
      isRequired = false,
      visibility,
      layout,
      displayOrder,
      renderAs = 'reference',
      statusButtonColor = null,
      panel = 'relationships',
      bulkEdit = false,
      inputConfig = null,
    } = req.body

    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields({
      relationshipKey,
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

    const inputConfigValidation = validateInputConfig(renderAs, inputConfig)
    if (!inputConfigValidation.valid) {
      sendBadRequest(res, inputConfigValidation.error, inputConfigValidation.details?.message as string)
      return
    }

    const existing = await AdminRelationshipMetadata.findOne({
      where: {
        entityType: entityType as RelationshipEntityType,
        entityId: entityId,
        relationshipKey: relationshipKey,
      },
    })

    const { icFields, options } = splitInputConfigForPersistence(inputConfig)

    if (existing) {
      await sequelize.transaction(async (transaction) => {
        await existing.update(
          {
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
            ...icFields,
          },
          { transaction }
        )
        await replaceSelectOptionsForRelationshipMetadata(existing.id, options, transaction)
      })
      const reloaded = await AdminRelationshipMetadata.findOne({
        where: {
          entityType: entityType as RelationshipEntityType,
          entityId: entityId,
          relationshipKey: relationshipKey,
        },
      })
      if (!reloaded) {
        sendError(res, 'Relationship metadata row missing after update', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        return
      }
      sendSuccess(res, await relationshipMetadataToHttpPayload(reloaded))
    } else {
      let created: AdminRelationshipMetadata | null = null
      await sequelize.transaction(async (transaction) => {
        const row = await AdminRelationshipMetadata.create(
          {
            entityType: entityType as RelationshipEntityType,
            entityId: entityId,
            relationshipKey,
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
            ...icFields,
          },
          { transaction }
        )
        await replaceSelectOptionsForRelationshipMetadata(row.id, options, transaction)
        created = row
      })
      if (!created) {
        sendError(res, 'Relationship metadata create failed', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        return
      }
      sendCreated(res, await relationshipMetadataToHttpPayload(created))
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_UPDATE_METADATA, 'creating/updating relationship metadata')
  }
  }
)

router.delete(
  '/:entityType/:entityId/:relationshipKey',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  try {
    const entityType = paramString(req, 'entityType')
    const entityId = paramString(req, 'entityId')
    const relationshipKey = paramString(req, 'relationshipKey')

    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    const metadata = await AdminRelationshipMetadata.findOne({
      where: {
        entityType: entityType as RelationshipEntityType,
        entityId: entityId,
        relationshipKey: relationshipKey,
      },
    })

    if (!metadata) {
      sendNotFound(res, ERROR_MESSAGES.METADATA_NOT_FOUND, `${entityType}/${entityId}/${relationshipKey}`)
      return
    }

    await metadata.destroy()

    sendNoContent(res)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_METADATA, 'deleting relationship metadata')
  }
  }
)

export { router as AdminRelationshipMetadataCrudRouter }
