/**
 * Joi schemas for wizard settings routes.
 * WHY: Request body validation for wizard settings PUT (Session 8.3.2).
 * Domain validation remains in handlers.
 */
import Joi from 'joi'

/** PUT /wizard-settings: requires setting_value object. */
export const wizardSettingsPutBodySchema = Joi.object({
  setting_value: Joi.object().required(),
}).required()
