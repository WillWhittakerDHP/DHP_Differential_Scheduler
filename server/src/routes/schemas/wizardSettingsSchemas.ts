/**
 * Joi schemas for wizard settings routes.
 * Domain validation remains in handlers.
 */
import Joi from 'joi'

/** PUT /wizard-settings: requires setting_value object. */
export const wizardSettingsPutBodySchema = Joi.object({
  setting_value: Joi.object().required(),
}).required()
