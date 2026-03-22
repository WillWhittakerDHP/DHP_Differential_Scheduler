/**
 * Joi schemas for availability routes.
 * PATTERN: Centralized schema definitions; wire via validateRequest middleware.
 */

import Joi from 'joi'

const dateRangeSchema = Joi.object({
  start: Joi.string().required(),
  end: Joi.string().required(),
})

/** Schema for POST /api/v1/internal/availability/computed-data request body. */
export const computedAvailabilityRequestSchema = Joi.object({
  dateRange: dateRangeSchema.required(),
  candidatePlaceId: Joi.string().optional(),
  appointmentId: Joi.string().optional(),
  reschedulingAppointmentId: Joi.string().optional(),
  allowedExceptions: Joi.array().items(Joi.string()).optional(),
  duration: Joi.number().min(1).required(),
  dataSource: Joi.string().valid('real', 'mock', 'none').optional(),
}).unknown(true)
