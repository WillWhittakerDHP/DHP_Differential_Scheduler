/**
 * Shared Joi field definitions for admin metadata POST schemas.
 * adminRelationshipMetadataSchemas (audit-fix per FUNCTION_AUTHORING_PLAYBOOK).
 */
import Joi from 'joi'

/** Common fields required by all admin metadata POST routes. */
export const adminMetadataCommonFields = {
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
} as const
