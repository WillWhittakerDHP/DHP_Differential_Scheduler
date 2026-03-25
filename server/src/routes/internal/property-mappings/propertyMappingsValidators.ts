/**
 * Joi validation for property field / feature mapping CRUD bodies (createCrudRouter factory callbacks).
 * Schemas: `server/src/routes/schemas/propertyMappingSchemas.ts`.
 */
import Joi from 'joi'
import type { ValidationResult } from '../../helpers/routerValidators.js'
import {
  fieldMappingCreateSchema,
  fieldMappingUpdatePatchSchema,
  featureMappingCreateSchema,
  featureMappingUpdatePatchSchema,
} from '../../schemas/propertyMappingSchemas.js'

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
