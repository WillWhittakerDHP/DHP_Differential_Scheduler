/**
 * Joi schemas for entity bulk routes.
 * WHY: Request body validation for entity bulk PATCH (Session 8.3.2).
 * Domain validation (validateBulkUpdateArray) remains in handlers.
 */
import Joi from 'joi'

/** PATCH /entities/:entityType/order_index: expects array of { id, orderIndex }. */
export const entityOrderIndexPatchBodySchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      orderIndex: Joi.number().integer().required(),
    }).unknown(true)
  )
  .min(1)
  .required()

/** PATCH /entities/:entityType/bulk: expects array of update objects. */
export const entityBulkPatchBodySchema = Joi.array()
  .items(Joi.object().min(1).unknown(true))
  .min(1)
  .required()
