/**
 * Joi schemas for admin primitive metadata routes.
 * WHY: Request body validation for admin-primitive-metadata POST (Session 8.3.2).
 * Domain validation remains in handlers.
 */
import Joi from 'joi'

/** POST /admin-primitive-metadata/:entityType/:entityId. */
export const adminPrimitiveMetadataPostBodySchema = Joi.object({
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
}).required()
