/**
 * Joi schemas for appointment CRUD routes.
 * Minimal schema: require non-empty object; appointment-specific validation in sanitizeInput.
 */

import Joi from 'joi'

/** Rejects non-objects and empty bodies. Appointment body is complex (attendees, feeBreakdown, etc.). */
export const appointmentBodySchema = Joi.object().min(1).unknown(true)
