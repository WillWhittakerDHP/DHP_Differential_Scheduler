/**
 * Joi schemas for admin metadata routes.
 * Domain validation (validateEntityType, validateRequiredFields, etc.) remains in handlers.
 */
import Joi from 'joi'
import { adminMetadataCommonFields } from './adminMetadataSchemaHelpers.js'

/** POST /admin-metadata/:entityType/:entityId: required fields per adminMetadataConstants. */
export const adminMetadataPostBodySchema = Joi.object({
  fieldKey: Joi.string().required(),
  ...adminMetadataCommonFields,
  blockShapeRef: Joi.string().allow(null).optional(),
}).required()
