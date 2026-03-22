/**
 * Joi schemas for property CRUD routes.
 * Domain validation (validateAddressFields, validatePropertyDetailsPatchBody) remains in handlers.
 */

import Joi from 'joi'

const foundationAccessValues = ['basement', 'crawlspace', 'slab'] as const
const sourceValues = ['api', 'manual', 'client'] as const

/** POST /properties: requires address fields; allows optional property details. */
export const propertyCreateBodySchema = Joi.object({
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  unit: Joi.string().allow(null, '').optional(),
  placeId: Joi.string().allow(null, '').optional(),
  latitude: Joi.number().allow(null).optional(),
  longitude: Joi.number().allow(null).optional(),
  mlsNumber: Joi.string().allow(null, '').optional(),
  squareFootage: Joi.number().integer().allow(null).optional(),
  bedrooms: Joi.number().integer().allow(null).optional(),
  bathrooms: Joi.number().allow(null).optional(),
  foundationAccess: Joi.string()
    .valid(...foundationAccessValues)
    .allow(null)
    .optional(),
  additionalUnits: Joi.number().integer().allow(null).optional(),
  source: Joi.string()
    .valid(...sourceValues)
    .optional(),
}).required()

/** PUT /properties/:id: optional property details; at least one field. */
export const propertyUpdateBodySchema = Joi.object({
  mlsNumber: Joi.string().allow(null, '').optional(),
  squareFootage: Joi.number().integer().allow(null).optional(),
  bedrooms: Joi.number().integer().allow(null).optional(),
  bathrooms: Joi.number().allow(null).optional(),
  foundationAccess: Joi.string()
    .valid(...foundationAccessValues)
    .allow(null)
    .optional(),
  additionalUnits: Joi.number().integer().allow(null).optional(),
  source: Joi.string()
    .valid(...sourceValues)
    .optional(),
}).min(1).required()

/** Rejects non-objects and empty bodies. Allowlist enforced by validatePropertyDetailsPatchBody. */
export const propertyPatchBodySchema = Joi.object().min(1).unknown(true)
