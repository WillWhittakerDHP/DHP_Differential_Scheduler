/**
 * Joi schemas for admin primitive metadata routes.
 * Domain validation remains in handlers.
 */
import Joi from 'joi'
import { adminMetadataCommonFields } from './adminMetadataSchemaHelpers.js'

/** POST /admin-primitive-metadata/:entityType/:entityId. */
export const adminPrimitiveMetadataPostBodySchema = Joi.object({
  fieldKey: Joi.string().required(),
  ...adminMetadataCommonFields,
}).required()
