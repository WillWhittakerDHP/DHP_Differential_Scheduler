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
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

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
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: entityTypeValidation.error,
        ...entityTypeValidation.details
      })
      return
    }

    const metadata = await getAdminPrimitiveMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
      entityId
    )

    const metadataRecord = transformMetadataToRecord(metadata)

    res.json(metadataRecord)
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
router.post('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
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
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: entityTypeValidation.error,
        ...entityTypeValidation.details
      })
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
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: requiredFieldsValidation.error,
        ...requiredFieldsValidation.details
      })
      return
    }

    // Validate renderAs
    const renderAsValidation = validateRenderAs(renderAs)
    if (!renderAsValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: renderAsValidation.error,
        ...renderAsValidation.details
      })
      return
    }

    // Validate inputConfig
    const inputConfigValidation = validateInputConfig(renderAs, inputConfig)
    if (!inputConfigValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: inputConfigValidation.error,
        ...inputConfigValidation.details
      })
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

      res.json(existing)
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

      res.status(HTTP_STATUS_CODES.CREATED).json(metadata)
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_UPDATE_METADATA, 'creating/updating primitive metadata')
  }
})

/**
 * DELETE /admin-primitive-metadata/:entityType/:entityId/:fieldKey
 * Delete primitive metadata for an entity
 * 
 * LEARNING: Deletes primitive metadata record for a specific entity and field
 * WHY: Enables primitive metadata deletion via API
 * PATTERN: Validate entity type, find metadata, delete, return 204
 */
router.delete('/:entityType/:entityId/:fieldKey', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, fieldKey } = req.params

    // Validate entity type
    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: entityTypeValidation.error,
        ...entityTypeValidation.details
      })
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
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: ERROR_MESSAGES.METADATA_NOT_FOUND,
        entityType,
        entityId,
        fieldKey,
      })
      return
    }

    await metadata.destroy()

    res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_METADATA, 'deleting primitive metadata')
  }
})

export { router as AdminPrimitiveMetadataCrudRouter }
