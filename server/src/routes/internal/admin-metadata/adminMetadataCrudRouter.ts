/**
 * Admin Metadata CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for admin metadata
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { Op } from 'sequelize'
import { AdminMetadata } from '../../../db/models/admin/adminMetadata.js'
import { getAdminMetadata } from '../../../utils/adminMetadataComposer.js'
import { ERROR_MESSAGES } from './adminMetadataConstants.js'
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
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('AdminMetadataRouter')

const router = Router()

/**
 * GET /admin-metadata/batch
 * Get all metadata in batch format
 * 
 * LEARNING: Batch endpoint that returns all metadata in structured format
 * WHY: Provides complete metadata in a single request
 * PATTERN: Fetch all, transform to structured result
 */
router.get('/batch', async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('GET /admin-metadata/batch')

    const allMetadata = await AdminMetadata.findAll({
      order: [['display_order', 'ASC'], ['field_key', 'ASC']],
    })

    const result = buildBatchMetadataResult(allMetadata)

    logger.debug(`Batch returning: global counts = blockShape:${Object.keys(result.global.blockShape).length}, partShape:${Object.keys(result.global.partShape).length}, blockInstance:${Object.keys(result.global.blockInstance).length}, partInstance:${Object.keys(result.global.partInstance).length}, eventShape:${Object.keys(result.global.eventShape).length}, eventInstance:${Object.keys(result.global.eventInstance).length}, annotationShape:${Object.keys(result.global.annotationShape).length}, annotationInstance:${Object.keys(result.global.annotationInstance).length}, blockShapeSpecific:${Object.keys(result.blockShapeSpecific).length}`)

    res.json(result)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_BATCH_METADATA, 'fetching batch metadata')
  }
})

/**
 * GET /admin-metadata/:entityType/:entityId
 * Get metadata for a specific entity
 * 
 * LEARNING: Fetches metadata for a specific entity type and ID
 * WHY: Provides entity-specific metadata
 * PATTERN: Validate entity type, fetch metadata, return JSON
 */
router.get('/:entityType/:entityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params
    const blockShapeRef = req.query.blockShapeRef as string | undefined

    logger.debug(`GET /admin-metadata/${entityType}/${entityId}`, {
      blockShapeRef: blockShapeRef || null,
    })

    // Validate entity type
    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: entityTypeValidation.error,
        ...entityTypeValidation.details
      })
      return
    }

    const metadataRecord = await getAdminMetadata(
      entityType as 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance',
      entityId,
      blockShapeRef || null
    )

    logger.debug(`Returning ${Object.keys(metadataRecord).length} metadata entries`)

    res.json(metadataRecord)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_METADATA, 'fetching metadata')
  }
})

/**
 * POST /admin-metadata/:entityType/:entityId
 * Create or update metadata for an entity
 * 
 * LEARNING: Backend determines metadataType by checking if fieldKey is in RELATIONSHIP_KEYS
 * WHY: Matches entity pattern - backend routes based on field type
 * PATTERN: Frontend sends fieldKey, backend checks RELATIONSHIP_KEYS to set metadataType
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
      renderAs,
      statusButtonColor = null,
      panel,
      bulkEdit = false,
      inputConfig = null,
      blockShapeRef = null,
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

    // Determine metadata type and defaults
    const metadataType = determineMetadataType(fieldKey)
    const defaultRenderAs = getDefaultRenderAs(metadataType)
    const finalRenderAs = renderAs || defaultRenderAs

    const defaultPanel = getDefaultPanel(metadataType)
    const finalPanel = panel || defaultPanel

    // Validate renderAs
    const renderAsValidation = validateRenderAs(finalRenderAs)
    if (!renderAsValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: renderAsValidation.error,
        ...renderAsValidation.details
      })
      return
    }

    // Validate inputConfig
    const inputConfigValidation = validateInputConfig(finalRenderAs, inputConfig)
    if (!inputConfigValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: inputConfigValidation.error,
        ...inputConfigValidation.details
      })
      return
    }

    // Resolve entity ID and blockShapeRef for blockInstance
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

    // Build where clause and find existing
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

      res.json(existing)
    } else {
      const metadata = await AdminMetadata.create({
        entityType: entityType as any,
        entityId: finalEntityId,
        metadataType: metadataType as any,
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

      res.status(HTTP_STATUS_CODES.CREATED).json(metadata)
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_UPDATE_METADATA, 'creating/updating metadata')
  }
})

/**
 * DELETE /admin-metadata/:entityType/:entityId/:fieldKey
 * Delete metadata for an entity
 * 
 * LEARNING: Deletes metadata record for a specific entity and field
 * WHY: Enables metadata deletion via API
 * PATTERN: Validate entity type, find metadata, delete, return 204
 */
router.delete('/:entityType/:entityId/:fieldKey', async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, fieldKey } = req.params
    const blockShapeRef = req.query.blockShapeRef as string | undefined

    // Validate entity type
    const entityTypeValidation = validateEntityType(entityType)
    if (!entityTypeValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: entityTypeValidation.error,
        ...entityTypeValidation.details
      })
      return
    }

    // Determine metadata type
    const metadataType = determineMetadataType(fieldKey)

    // Resolve entity ID and blockShapeRef for blockInstance
    const { finalEntityId, finalBlockShapeRef } = resolveBlockInstanceMetadata(
      entityType,
      entityId,
      blockShapeRef
    )

    // Build where clause and find metadata
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
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: ERROR_MESSAGES.METADATA_NOT_FOUND,
        entityType,
        entityId,
        fieldKey,
        metadataType,
      })
      return
    }

    await metadata.destroy()

    res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_METADATA, 'deleting metadata')
  }
})

export { router as AdminMetadataCrudRouter }
