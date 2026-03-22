/**
 * Joi schemas for business settings CRUD routes.
 * Domain validation (validateSettingKey, validateAvailabilitySettings) remains in handlers.
 */
import Joi from 'joi'

/** POST /business-settings: requires setting_key and setting_value. */
export const businessSettingsPostBodySchema = Joi.object({
  setting_key: Joi.string().required(),
  setting_value: Joi.object().required(),
}).required()

/** PUT/PATCH /business-settings/:key: requires setting_value. */
export const businessSettingsPutPatchBodySchema = Joi.object({
  setting_value: Joi.object().required(),
}).required()
