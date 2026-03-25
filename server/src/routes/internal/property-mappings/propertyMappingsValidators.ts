/**
 * Joi validation for property field / feature mapping CRUD bodies (createCrudRouter factory callbacks).
 * Mirrors Sequelize models: property_field_mapping, property_feature_mapping.
 */
import Joi from 'joi'
import type { ValidationResult } from '../../helpers/routerValidators.js'

const MATCH_TYPES = ['exists', 'contains', 'equals', 'greater_than'] as const

const fieldMappingCreateSchema = Joi.object({
  dataSource: Joi.string().max(50).optional(),
  sourceField: Joi.string().max(100).required(),
  targetField: Joi.string().max(100).required(),
  valueMapping: Joi.any().allow(null).optional(),
  fallbackValue: Joi.string().allow(null, '').optional(),
  active: Joi.boolean().optional(),
  notes: Joi.string().allow(null, '').optional(),
}).required()

const fieldMappingUpdatePatchSchema = Joi.object({
  dataSource: Joi.string().max(50).optional(),
  sourceField: Joi.string().max(100).optional(),
  targetField: Joi.string().max(100).optional(),
  valueMapping: Joi.any().allow(null).optional(),
  fallbackValue: Joi.string().allow(null, '').optional(),
  active: Joi.boolean().optional(),
  notes: Joi.string().allow(null, '').optional(),
})
  .min(1)
  .required()

const featureMappingCreateSchema = Joi.object({
  dataSource: Joi.string().max(50).optional(),
  sourceField: Joi.string().max(100).required(),
  matchType: Joi.string()
    .valid(...MATCH_TYPES)
    .required(),
  matchValue: Joi.string().allow(null, '').optional(),
  blockInstanceId: Joi.string().uuid().required(),
  active: Joi.boolean().optional(),
  priority: Joi.number().integer().optional(),
  notes: Joi.string().allow(null, '').optional(),
}).required()

const featureMappingUpdatePatchSchema = Joi.object({
  dataSource: Joi.string().max(50).optional(),
  sourceField: Joi.string().max(100).optional(),
  matchType: Joi.string()
    .valid(...MATCH_TYPES)
    .optional(),
  matchValue: Joi.string().allow(null, '').optional(),
  blockInstanceId: Joi.string().uuid().optional(),
  active: Joi.boolean().optional(),
  priority: Joi.number().integer().optional(),
  notes: Joi.string().allow(null, '').optional(),
})
  .min(1)
  .required()

function joiResult(schema: Joi.ObjectSchema, body: unknown): ValidationResult {
  const { error } = schema.validate(body, { abortEarly: false })
  if (error == null) {
    return { valid: true }
  }
  const first = error.details[0]
  const message = first != null ? first.message : 'Invalid request body'
  return {
    valid: false,
    error: 'Validation failed',
    details: { message, joi: error.details },
  }
}

export function validateFieldMappingBody(
  body: unknown,
  method: 'create' | 'update' | 'patch'
): ValidationResult {
  if (method === 'create') {
    return joiResult(fieldMappingCreateSchema, body)
  }
  return joiResult(fieldMappingUpdatePatchSchema, body)
}

export function validateFeatureMappingBody(
  body: unknown,
  method: 'create' | 'update' | 'patch'
): ValidationResult {
  if (method === 'create') {
    return joiResult(featureMappingCreateSchema, body)
  }
  return joiResult(featureMappingUpdatePatchSchema, body)
}
