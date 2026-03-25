/**
 * Joi schemas for property field / feature mapping CRUD (`createCrudRouter` validateRequest).
 * Aligns with `property_field_mappings` and `property_feature_mappings` models.
 */

import Joi from 'joi'

const fieldMappingFields = {
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).required(),
  targetField: Joi.string().trim().min(1).max(100).required(),
  valueMapping: Joi.object().allow(null).unknown(true).optional(),
  fallbackValue: Joi.string().allow(null, '').optional(),
  active: Joi.boolean().optional(),
  notes: Joi.string().allow(null, '').optional(),
}

/** POST /field-mappings */
export const fieldMappingCreateBodySchema = Joi.object(fieldMappingFields).unknown(true).required()

/** PUT /field-mappings/:id */
export const fieldMappingUpdateBodySchema = Joi.object(fieldMappingFields).unknown(true).required()

/** PATCH /field-mappings/:id */
export const fieldMappingPatchBodySchema = Joi.object({
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).optional(),
  targetField: Joi.string().trim().min(1).max(100).optional(),
  valueMapping: Joi.object().allow(null).unknown(true).optional(),
  fallbackValue: Joi.string().allow(null, '').optional(),
  active: Joi.boolean().optional(),
  notes: Joi.string().allow(null, '').optional(),
})
  .min(1)
  .unknown(true)
  .required()

const featureMappingFields = {
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).required(),
  matchType: Joi.string().trim().min(1).max(30).required(),
  matchValue: Joi.string().allow(null, '').optional(),
  blockInstanceId: Joi.string().uuid().required(),
  active: Joi.boolean().optional(),
  priority: Joi.number().integer().optional(),
  notes: Joi.string().allow(null, '').optional(),
}

/** POST /feature-mappings */
export const featureMappingCreateBodySchema = Joi.object(featureMappingFields).unknown(true).required()

/** PUT /feature-mappings/:id */
export const featureMappingUpdateBodySchema = Joi.object(featureMappingFields).unknown(true).required()

/** PATCH /feature-mappings/:id */
export const featureMappingPatchBodySchema = Joi.object({
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).optional(),
  matchType: Joi.string().trim().min(1).max(30).optional(),
  matchValue: Joi.string().allow(null, '').optional(),
  blockInstanceId: Joi.string().uuid().optional(),
  active: Joi.boolean().optional(),
  priority: Joi.number().integer().optional(),
  notes: Joi.string().allow(null, '').optional(),
})
  .min(1)
  .unknown(true)
  .required()
