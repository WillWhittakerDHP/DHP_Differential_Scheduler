/**
 * Joi schemas for appointment CRUD routes.
 * WHY: Request body validation for appointment POST/PUT/PATCH (Session 8.3.2).
 * Minimal schema: require non-empty object; appointment-specific validation in sanitizeInput.
 */

import Joi from 'joi'

/** Rejects non-objects and empty bodies. Appointment body is complex (attendees, feeBreakdown, etc.). */
export const appointmentBodySchema = Joi.object().min(1).unknown(true)
