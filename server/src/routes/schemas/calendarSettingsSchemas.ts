/**
 * Joi schemas for calendar settings routes.
 * Domain validation remains in handlers.
 */
import Joi from 'joi'

/** PUT /calendar-settings: requires setting_value object. */
export const calendarSettingsPutBodySchema = Joi.object({
  setting_value: Joi.object().required(),
}).required()
