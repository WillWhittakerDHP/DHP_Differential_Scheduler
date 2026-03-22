/**
 * Joi schema for POST /event-instance-preview (admin template preview).
 */
import Joi from 'joi'

export const eventInstancePreviewPostBodySchema = Joi.object({
  appointmentId: Joi.string().trim().min(1).required(),
  eventShapeRef: Joi.string().trim().min(1).required(),
  titleTemplate: Joi.string().allow(null).optional(),
  descriptionTemplate: Joi.string().allow(null).optional(),
  locationTemplate: Joi.string().allow(null).optional(),
}).required()
