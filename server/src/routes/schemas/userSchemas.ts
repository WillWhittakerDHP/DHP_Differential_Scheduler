/**
 * Joi schemas for User CRUD (`createCrudRouter` validateRequest).
 * Aligns with `Users` model: first_name, last_name, email, user_role, phone, login_id.
 */

import Joi from 'joi'

const USER_ROLE_VALUES = [
  'client',
  'agent',
  'transaction_manager',
  'seller',
  'inspector',
  'admin',
] as const

const userMutableFields = {
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string()
    .valid(...USER_ROLE_VALUES)
    .required(),
  loginId: Joi.number().integer().allow(null).optional(),
}

/** POST /users */
export const userCreateBodySchema = Joi.object(userMutableFields).unknown(true).required()

/** PUT /users/:id — full replace semantics; same required fields as create. */
export const userUpdateBodySchema = Joi.object(userMutableFields).unknown(true).required()

/** PATCH /users/:id — partial update; at least one field. */
export const userPatchBodySchema = Joi.object({
  firstName: Joi.string().trim().min(1).optional(),
  lastName: Joi.string().trim().min(1).optional(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string()
    .valid(...USER_ROLE_VALUES)
    .optional(),
  loginId: Joi.number().integer().allow(null).optional(),
})
  .min(1)
  .unknown(true)
  .required()
