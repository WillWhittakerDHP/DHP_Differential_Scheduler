/**
 * Joi schemas for admin metadata routes.
 * Domain validation (validateEntityType, validateRequiredFields, etc.) remains in handlers.
 */
import Joi from 'joi'

/** POST /admin-metadata/:entityType/:entityId: required fields per adminMetadataConstants. */
export const adminMetadataPostBodySchema = Joi.object({
  fieldKey: Joi.string().required(),
  dataType: Joi.string().required(),
  label: Joi.string().required(),
  visibility: Joi.string().required(),
  layout: Joi.string().required(),
  displayOrder: Joi.number().required(),
  isRequired: Joi.boolean().optional(),
  renderAs: Joi.string().optional(),
  statusButtonColor: Joi.string().allow(null).optional(),
  panel: Joi.string().optional(),
  bulkEdit: Joi.boolean().optional(),
  inputConfig: Joi.any().optional(),
  blockShapeRef: Joi.string().allow(null).optional(),
}).required()
