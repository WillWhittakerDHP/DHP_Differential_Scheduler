/**
 * Admin Primitive Metadata CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for admin primitive metadata
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { AdminPrimitiveMetadata } from '../../../db/models/admin/adminPrimitiveMetadata.js'
import { getAdminPrimitiveMetadata } from '../../../utils/adminPrimitiveMetadataComposer.js'
import { ERROR_MESSAGES } from './adminPrimitiveMetadataConstants.js'
import { handleRouteError } from './adminPrimitiveMetadataErrorHandler.js'
import { validateEntityType, validateRequiredFields, validateRenderAs, validateInputConfig } from './adminPrimitiveMetadataValidators.js'
import { computeRenderAs, transformMetadataToRecord } from './adminPrimitiveMetadataHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendNoContent } from '../../helpers/routerResponseHelpers.js'
import { csrfProtection } from '../../../middlewares/security.js'

const router = Router()

/**
 * GET /admin-primitive-metadata/:entityType/:entityId
 * Get primitive metadata for a specific entity
 * 
 * LEARNING: Fetches primitive metadata for a specific entity type and ID
 * WHY: Provides entity-specific primitive metadata
 * PATTERN: Validate entity type, fetch metadata, transform to record, return JSON
 */
router.get('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params

    // Validate entity type
    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    const metadata = await getAdminPrimitiveMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
      entityId
    )

    const metadataRecord = transformMetadataToRecord(metadata)

    sendSuccess(res, metadataRecord)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_METADATA, 'fetching primitive metadata')
  }
})

/**
 * POST /admin-primitive-metadata/:entityType/:entityId
 * Create or update primitive metadata for an entity
 * 
 * LEARNING: Creates or updates primitive metadata record
 * WHY: Enables primitive metadata management via API
 * PATTERN: Validate, compute renderAs, find or create, return JSON
 */
router.post(
  '/:entityType/:entityId',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params
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
    
    // Compute renderAs if not provided
    const renderAs = providedRenderAs || computeRenderAs(dataType, inputConfig, fieldKey)

    // Validate entity type
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

    // Validate renderAs
    const renderAsValidation = validateRenderAs(renderAs)
    if (!renderAsValidation.valid) {
      sendBadRequest(res, renderAsValidation.error, renderAsValidation.details?.message as string)
      return
    }

    // Validate inputConfig
    const inputConfigValidation = validateInputConfig(renderAs, inputConfig)
    if (!inputConfigValidation.valid) {
      sendBadRequest(res, inputConfigValidation.error, inputConfigValidation.details?.message as string)
      return
    }

    const existing = await AdminPrimitiveMetadata.findOne({
      where: {
        entityType: entityType as any,
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
        entityType: entityType as any,
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

/**
 * DELETE /admin-primitive-metadata/:entityType/:entityId/:fieldKey
 * Delete primitive metadata for an entity
 * 
 * LEARNING: Deletes primitive metadata record for a specific entity and field
 * WHY: Enables primitive metadata deletion via API
 * PATTERN: Validate entity type, find metadata, delete, return 204
 */
router.delete(
  '/:entityType/:entityId/:fieldKey',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, fieldKey } = req.params

    // Validate entity type
    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      sendBadRequest(res, entityTypeValidation.error, entityTypeValidation.details?.message as string)
      return
    }

    const metadata = await AdminPrimitiveMetadata.findOne({
      where: {
        entityType: entityType as any,
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
