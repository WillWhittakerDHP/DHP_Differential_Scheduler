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
import { ERROR_MESSAGES, VALID_ENTITY_TYPES } from './adminRelationshipMetadataConstants.js'

type RelationshipEntityType = (typeof VALID_ENTITY_TYPES)[number]
import { handleRouteError } from './adminRelationshipMetadataErrorHandler.js'
import { validateEntityType, validateRequiredFields, validateInputConfig } from './adminRelationshipMetadataValidators.js'
import { transformMetadataToRecord } from './adminRelationshipMetadataHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendNoContent } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection } from '../../../middlewares/security.js'

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
    const entityType = paramString(req, 'entityType')
    const entityId = paramString(req, 'entityId')

    // Validate entity type
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

/**
 * POST /admin-relationship-metadata/:entityType/:entityId
 * Create or update relationship metadata for an entity
 * 
 * LEARNING: Creates or updates relationship metadata record
 * WHY: Enables relationship metadata management via API
 * PATTERN: Validate, find or create, return JSON
 */
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

    // Validate entity type
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

    // Validate inputConfig
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
      const metadata = await AdminRelationshipMetadata.create({
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
        inputConfig,
      })

      sendCreated(res, metadata)
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_UPDATE_METADATA, 'creating/updating relationship metadata')
  }
  }
)

/**
 * DELETE /admin-relationship-metadata/:entityType/:entityId/:relationshipKey
 * Delete relationship metadata for an entity
 * 
 * LEARNING: Deletes relationship metadata record for a specific entity and relationship key
 * WHY: Enables relationship metadata deletion via API
 * PATTERN: Validate entity type, find metadata, delete, return 204
 */
router.delete(
  '/:entityType/:entityId/:relationshipKey',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  try {
    const entityType = paramString(req, 'entityType')
    const entityId = paramString(req, 'entityId')
    const relationshipKey = paramString(req, 'relationshipKey')

    // Validate entity type
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
