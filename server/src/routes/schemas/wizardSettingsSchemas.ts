/**
 * Joi schemas for wizard settings routes.
 * Domain validation remains in handlers.
 */
import Joi from 'joi'

/** Empty string or exactly 6 hex digits, optional leading # (brand anchor). */
const optionalHexColor = Joi.string()
  .allow(null, '')
  .pattern(/^$|^#?[0-9A-Fa-f]{6}$/)

const optionalLabelString = Joi.string().allow(null, '').optional()

/** PUT body.setting_value — all keys optional so partial payloads remain valid. */
const wizardSettingsDataSchema = Joi.object({
  showApplyCoupon: Joi.boolean().optional(),
  useBrandColors: Joi.boolean().optional(),
  majorLabel: optionalLabelString,
  minorLabel: optionalLabelString,
  moveableFallbackLabel: optionalLabelString,
  differentialGraphDefaultLabel: optionalLabelString,
  majorStateLabel: optionalLabelString,
  minorStateLabel: optionalLabelString,
  selectTimeSlotLabel: optionalLabelString,
  subStepLabelPickDay: optionalLabelString,
  subStepLabelOptions: optionalLabelString,
  subStepLabelPickTime: optionalLabelString,
  subStepLabelConfirmMoveable: optionalLabelString,
  moveableNoFeasibleCompletionSlotsMessage: optionalLabelString,
  brandPrimaryHex: optionalHexColor.optional(),
  brandSecondaryHex: optionalHexColor.optional(),
  logoUrl: Joi.string().max(2048).allow(null, '').optional(),
  selectionCardTooltipOpenDelayMs: Joi.number().integer().min(0).max(600_000).optional(),
}).unknown(true)

/** PUT /wizard-settings: requires setting_value object. */
export const wizardSettingsPutBodySchema = Joi.object({
  setting_value: wizardSettingsDataSchema.required(),
}).required()
