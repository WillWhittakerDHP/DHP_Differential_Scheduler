/**
 * Beta Feedback CRUD Router
 *
 * LEARNING: CRUD router factory with custom GET all (filtering) and tag handling on create
 * WHY: Consistent patterns with other internal routers; support for tags and filtering
 * PATTERN: createCrudRouter with customGetAllHandler, validateRequest, sanitizeInput, afterCreate
 */

import { Request, Response } from 'express';
import { BetaFeedback, BetaFeedbackTag } from '../../../config/app.js';
import { createCrudRouter } from '../../helpers/createCrudRouter.js';
import { ERROR_MESSAGES } from './betaFeedbackConstants.js';
import { handleRouteError } from './betaFeedbackErrorHandler.js';
import { validateCreateBody, validateUpdateBody } from './betaFeedbackValidators.js';
import { sendSuccess } from '../../helpers/routerResponseHelpers.js';
import type { ValidationResult } from '../../helpers/routerValidators.js';
import { FIELD_NAMES, SORT_ORDERS } from '../entities/entityConstants.js';
import { asEmptyArray } from '../../../utils/safeDefaults.js';

const router = createCrudRouter({
  model: BetaFeedback,
  resourceName: 'beta feedback',
  errorMessages: {
    FETCH_ALL: ERROR_MESSAGES.FETCH_ALL,
    FETCH_ONE: ERROR_MESSAGES.FETCH_ONE,
    NOT_FOUND: ERROR_MESSAGES.NOT_FOUND,
    CREATE: ERROR_MESSAGES.CREATE,
    UPDATE: ERROR_MESSAGES.UPDATE,
    DELETE: ERROR_MESSAGES.DELETE,
  },
  defaultOrder: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
  defaultIncludes: [{ model: BetaFeedbackTag, as: 'tags', attributes: ['id', 'tag'] }],
  customGetAllHandler: async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, category, severity } = req.query;
      const where: Record<string, unknown> = {};
      if (status && typeof status === 'string') where.status = status;
      if (category && typeof category === 'string') where.category = category;
      if (severity && typeof severity === 'string') where.severity = severity;

      const list = await BetaFeedback.findAll({
        where,
        order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
        include: [{ model: BetaFeedbackTag, as: 'tags', attributes: ['id', 'tag'] }],
      });
      const transformed = list.map((row) => {
        const json = row.toJSON() as Record<string, unknown> & { tags?: { tag: string }[] };
        const tags = asEmptyArray(json.tags?.map((t) => t.tag));
        const { tags: _t, ...rest } = json;
        return { ...rest, tags };
      });
      sendSuccess(res, transformed);
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.FETCH_ALL, 'fetching beta feedback');
    }
  },
  validateRequest: (req: Request, method: 'create' | 'update' | 'patch'): ValidationResult => {
    if (method === 'create') return validateCreateBody(req.body);
    if (method === 'update' || method === 'patch') return validateUpdateBody(req.body);
    return { valid: true };
  },
  sanitizeInput: (data: unknown, method: 'create' | 'update' | 'patch'): unknown => {
    const body = data as Record<string, unknown>;
    if (method === 'create') {
      const { tags: _tags, ...rest } = body;
      return {
        ...rest,
        reporterEmail: body.reporterEmail ?? null,
        pageUrl: body.pageUrl ?? null,
        browserInfo: body.browserInfo ?? null,
        screenSize: body.screenSize ?? null,
        stepsToReproduce: body.stepsToReproduce ?? null,
        expectedBehavior: body.expectedBehavior ?? null,
        actualBehavior: body.actualBehavior ?? null,
      };
    }
    if (method === 'update' || method === 'patch') {
      return {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.resolutionNotes !== undefined && { resolutionNotes: body.resolutionNotes }),
      };
    }
    return data;
  },
  afterCreate: async (record, req: Request): Promise<void> => {
    const tags = req.body?.tags as string[] | undefined;
    if (Array.isArray(tags) && tags.length > 0) {
      await BetaFeedbackTag.bulkCreate(
        tags.slice(0, 20).map((tag: string) => ({
          feedbackId: record.id,
          tag: String(tag).slice(0, 100),
        }))
      );
    }
  },
  transformResponse: (record) => {
    const json = record.toJSON() as Record<string, unknown> & { tags?: { tag: string }[] };
    const tags = asEmptyArray(json.tags?.map((t: { tag: string }) => t.tag));
    const { tags: _t, ...rest } = json;
    return { ...rest, tags };
  },
});

export { router as BetaFeedbackCrudRouter };
