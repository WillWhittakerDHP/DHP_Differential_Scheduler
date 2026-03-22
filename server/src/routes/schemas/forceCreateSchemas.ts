/**
 * Joi schemas for admin force-create appointment.
 * WHY: Request body validation for POST /appointments/force-create (Session 8.3.2).
 * Domain validation (slot dates, duration) remains in handler.
 */
import Joi from 'joi'

/** POST /appointments/force-create: requires slotStart and slotEnd. */
export const forceCreateBodySchema = Joi.object({
  slotStart: Joi.string().required(),
  slotEnd: Joi.string().required(),
  reason: Joi.string().allow(null, '').max(500).optional(),
  attendees: Joi.array().optional(),
  feeBreakdown: Joi.any().optional(),
}).required().unknown(true)
