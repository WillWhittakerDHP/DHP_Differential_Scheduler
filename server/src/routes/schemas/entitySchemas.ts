/**
 * Joi schemas for entity CRUD routes.
 * Entity body shape varies by entityType; use minimal schema to reject non-objects and empty bodies.
 */

import Joi from 'joi'

/** Rejects non-objects and empty bodies. Entity-specific validation is in sanitizers. */
export const entityBodySchema = Joi.object().min(1).unknown(true)
