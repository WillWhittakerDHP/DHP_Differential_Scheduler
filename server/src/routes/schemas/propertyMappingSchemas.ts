/**
 * Joi schemas for property field / feature mapping CRUD (`createCrudRouter` validateRequest).
 * Single source of truth — consumed by `propertyMappingsValidators.ts`.
 * Aligns with `property_field_mappings` and `property_feature_mappings` models.
 */

import Joi from 'joi'

/** Match types for feature mapping (includes `greater_than` beyond PROPERTY_MATCH_TYPE). */
const PROPERTY_FEATURE_MATCH_TYPES = [
  'exists',
  'contains',
  'equals',
  'greater_than',
] as const

const fieldMappingCreateFields = {
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).required(),
  targetField: Joi.string().trim().min(1).max(100).required(),
  valueMapping: Joi.any().allow(null).optional(),
  fallbackValue: Joi.string().allow(null, '').optional(),
  active: Joi.boolean().optional(),
  notes: Joi.string().allow(null, '').optional(),
}

/** POST field-mappings */
export const fieldMappingCreateSchema = Joi.object(fieldMappingCreateFields).unknown(true).required()

/** PUT/PATCH field-mappings — at least one field; partial updates allowed for both verbs in this router. */
export const fieldMappingUpdatePatchSchema = Joi.object({
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).optional(),
  targetField: Joi.string().trim().min(1).max(100).optional(),
  valueMapping: Joi.any().allow(null).optional(),
  fallbackValue: Joi.string().allow(null, '').optional(),
  active: Joi.boolean().optional(),
  notes: Joi.string().allow(null, '').optional(),
})
  .min(1)
  .unknown(true)
  .required()

const featureMappingCreateFields = {
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).required(),
  matchType: Joi.string()
    .valid(...PROPERTY_FEATURE_MATCH_TYPES)
    .required(),
  matchValue: Joi.string().allow(null, '').optional(),
  blockInstanceId: Joi.string().uuid().required(),
  active: Joi.boolean().optional(),
  priority: Joi.number().integer().optional(),
  notes: Joi.string().allow(null, '').optional(),
}

/** POST feature-mappings */
export const featureMappingCreateSchema = Joi.object(featureMappingCreateFields).unknown(true).required()

/** PUT/PATCH feature-mappings */
export const featureMappingUpdatePatchSchema = Joi.object({
  dataSource: Joi.string().trim().max(50).optional(),
  sourceField: Joi.string().trim().min(1).max(100).optional(),
  matchType: Joi.string()
    .valid(...PROPERTY_FEATURE_MATCH_TYPES)
    .optional(),
  matchValue: Joi.string().allow(null, '').optional(),
  blockInstanceId: Joi.string().uuid().optional(),
  active: Joi.boolean().optional(),
  priority: Joi.number().integer().optional(),
  notes: Joi.string().allow(null, '').optional(),
})
  .min(1)
  .unknown(true)
  .required()
