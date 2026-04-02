/**
 * Joi schemas for user role ↔ user-type block instance alignment routes.
 */
import Joi from 'joi'
import { USER_ROLE_VALUES } from '../../../../shared/constants/roleConstants.js'

/** PUT body: full replace of stored alignments; only canonical role keys allowed. */
export const userRoleBlockAlignmentPutBodySchema = Joi.object({
  alignments: Joi.object()
    .pattern(Joi.string().valid(...USER_ROLE_VALUES), Joi.string().uuid().allow(null))
    .unknown(false)
    .required(),
}).required()
