/**
 * Adapter to use Joi schemas with CrudRouterConfig.validateRequest.
 */

import type { Request } from 'express'
import type { ObjectSchema } from 'joi'
import type { ValidationResult } from './routerValidators.js'

/**
 * Returns a validateRequest callback that validates req.body against the given Joi schema.
 * Use for createCrudRouter config when method-specific schemas match (create/update/patch).
 *
 * @param schema - Joi ObjectSchema for req.body
 * @returns (req, method) => ValidationResult compatible with CrudRouterConfig.validateRequest
 */
export function joiValidateRequest(schema: ObjectSchema): (req: Request, _method: 'create' | 'update' | 'patch') => ValidationResult {
  return (req: Request): ValidationResult => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    if (error) {
      const message = error.details.map((d) => d.message).join('; ')
      return {
        valid: false,
        error: 'Validation failed',
        details: { message },
      }
    }
    return { valid: true }
  }
}
