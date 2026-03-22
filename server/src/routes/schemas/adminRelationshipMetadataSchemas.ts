/**
 * Joi schemas for admin relationship metadata routes.
 * Domain validation remains in handlers.
 */
import Joi from 'joi'

/** POST /admin-relationship-metadata/:entityType/:entityId. */
export const adminRelationshipMetadataPostBodySchema = Joi.object({
  relationshipKey: Joi.string().required(),
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
