/**
 * Admin Relationship Metadata CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for admin relationship metadata
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { AdminRelationshipMetadata } from '../../../db/models/admin/adminRelationshipMetadata.js'
import { getAdminRelationshipMetadata } from '../../../utils/adminRelationshipMetadataComposer.js'
import { ERROR_MESSAGES } from './adminRelationshipMetadataConstants.js'
import { handleRouteError } from './adminRelationshipMetadataErrorHandler.js'
import { validateEntityType, validateRequiredFields, validateInputConfig } from './adminRelationshipMetadataValidators.js'
import { transformMetadataToRecord } from './adminRelationshipMetadataHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const router = Router()

/**
 * GET /admin-relationship-metadata/:entityType/:entityId
 * Get relationship metadata for a specific entity
 * 
 * LEARNING: Fetches relationship metadata for a specific entity type and ID
 * WHY: Provides entity-specific relationship metadata
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

    const metadata = await getAdminRelationshipMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance',
      entityId
    )

    const metadataRecord = transformMetadataToRecord(metadata)

    res.json(metadataRecord)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_METADATA, 'fetching relationship metadata')
  }
})

/**
 * POST /admin-relationship-metadata/:entityType/:entityId
 * Create or update relationship metadata for an entity
 * 
 * LEARNING: Creates or updates relationship metadata record
 * WHY: Enables relationship metadata management via API
 * PATTERN: Validate, find or create, return JSON
 */
router.post('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params
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
      relationshipKey,
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

    // Validate inputConfig
    const inputConfigValidation = validateInputConfig(renderAs, inputConfig)
    if (!inputConfigValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: inputConfigValidation.error,
        ...inputConfigValidation.details
      })
      return
    }

    const existing = await AdminRelationshipMetadata.findOne({
      where: {
        entityType: entityType as any,
        entityId: entityId,
        relationshipKey: relationshipKey,
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
      const metadata = await AdminRelationshipMetadata.create({
        entityType: entityType as any,
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
        inputConfig,
      })

      res.status(HTTP_STATUS_CODES.CREATED).json(metadata)
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_UPDATE_METADATA, 'creating/updating relationship metadata')
  }
})

/**
 * DELETE /admin-relationship-metadata/:entityType/:entityId/:relationshipKey
 * Delete relationship metadata for an entity
 * 
 * LEARNING: Deletes relationship metadata record for a specific entity and relationship key
 * WHY: Enables relationship metadata deletion via API
 * PATTERN: Validate entity type, find metadata, delete, return 204
 */
router.delete('/:entityType/:entityId/:relationshipKey', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, relationshipKey } = req.params

    // Validate entity type
    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: entityTypeValidation.error,
        ...entityTypeValidation.details
      })
      return
    }

    const metadata = await AdminRelationshipMetadata.findOne({
      where: {
        entityType: entityType as any,
        entityId: entityId,
        relationshipKey: relationshipKey,
      },
    })

    if (!metadata) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: ERROR_MESSAGES.METADATA_NOT_FOUND,
        entityType,
        entityId,
        relationshipKey,
      })
      return
    }

    await metadata.destroy()

    res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_METADATA, 'deleting relationship metadata')
  }
})

export { router as AdminRelationshipMetadataCrudRouter }
