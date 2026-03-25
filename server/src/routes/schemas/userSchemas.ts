/**
 * Joi schemas for user CRUD routes.
 * Mirrors User model fields from db/models/participantModels/Users.ts.
 */

import Joi from 'joi'

const userRoleValues = ['client', 'agent', 'transaction_manager', 'seller', 'inspector'] as const

/** POST /users: requires firstName, lastName, email, userRole. */
export const userCreateBodySchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string()
    .valid(...userRoleValues)
    .required(),
}).required()

/** PUT /users/:id: at least one field required. */
export const userUpdateBodySchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string()
    .valid(...userRoleValues)
    .optional(),
}).min(1).required()

/** PATCH /users/:id: at least one field required. */
export const userPatchBodySchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string()
    .valid(...userRoleValues)
    .optional(),
}).min(1).required()
