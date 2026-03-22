/**
 * Joi schemas for property types routes.
 * Domain validation (validateBlockShape, etc.) remains in handlers.
 */
import Joi from 'joi'

/** POST /properties/:id/types: requires blockInstanceId. */
export const propertyTypePostBodySchema = Joi.object({
  blockInstanceId: Joi.string().required(),
  orderIndex: Joi.number().integer().optional(),
}).required()

/** PATCH /properties/:id/types/:typeId: optional orderIndex. */
export const propertyTypePatchBodySchema = Joi.object({
  orderIndex: Joi.number().integer().optional(),
}).min(1).required()

/** PUT /properties/:id/types: optional blockInstanceIds array. */
export const propertyTypesPutBodySchema = Joi.object({
  blockInstanceIds: Joi.array().items(Joi.string()).optional(),
}).required()
