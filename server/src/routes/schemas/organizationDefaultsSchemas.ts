/**
 * Joi schemas for organization defaults routes.
 */
import Joi from 'joi'

/** PUT /organization-defaults: requires setting_value object. */
export const organizationDefaultsPutBodySchema = Joi.object({
  setting_value: Joi.object().required(),
}).required()
