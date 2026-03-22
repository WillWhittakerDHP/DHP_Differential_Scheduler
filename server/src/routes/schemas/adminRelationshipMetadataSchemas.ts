/**
 * Joi schemas for admin relationship metadata routes.
 * Domain validation remains in handlers.
 */
import Joi from 'joi'
import { adminMetadataCommonFields } from './adminMetadataSchemaHelpers.js'

/** POST /admin-relationship-metadata/:entityType/:entityId. */
export const adminRelationshipMetadataPostBodySchema = Joi.object({
  relationshipKey: Joi.string().required(),
  ...adminMetadataCommonFields,
}).required()
