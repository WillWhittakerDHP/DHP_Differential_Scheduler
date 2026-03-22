/**
 * Joi schemas for relationship routes.
 * WHY: Request body validation for relationship CRUD POST (Session 8.3.2).
 * relationshipAnnotationAssignmentRouter and relationshipInstanceComponentRouter already use Joi inline.
 */
import Joi from 'joi'

/** Rejects non-objects and empty bodies. validateRequiredFields enforces parentId/parent_id and childId/child_id. */
export const relationshipPostBodySchema = Joi.object().min(1).unknown(true)
