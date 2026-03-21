
import { Router, Request, Response } from 'express';
import { BetaFeedback } from '../../../config/app.js';
import { BetaFeedbackCrudRouter } from './betaFeedbackCrudRouter.js';
import { ERROR_MESSAGES } from './betaFeedbackConstants.js';
import { handleRouteError } from './betaFeedbackErrorHandler.js';
import { sendSuccess } from '../../helpers/routerResponseHelpers.js';

const router = Router();

/** GET /beta-feedback/stats - Summary counts by status, category, severity */
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [byStatus, byCategory, bySeverity, total] = await Promise.all([
      BetaFeedback.findAll({
        attributes: ['status'],
        raw: true,
      }).then((rows) => {
        const counts: Record<string, number> = {};
        for (const row of rows) {
          const s = row.status ?? 'unknown';
          counts[s] = (counts[s] ?? 0) + 1;
        }
        return counts;
      }),
      BetaFeedback.findAll({
        attributes: ['category'],
        raw: true,
      }).then((rows) => {
        const counts: Record<string, number> = {};
        for (const row of rows) {
          const c = row.category ?? 'unknown';
          counts[c] = (counts[c] ?? 0) + 1;
        }
        return counts;
      }),
      BetaFeedback.findAll({
        attributes: ['severity'],
        raw: true,
      }).then((rows) => {
        const counts: Record<string, number> = {};
        for (const row of rows) {
          const v = row.severity ?? 'unknown';
          counts[v] = (counts[v] ?? 0) + 1;
        }
        return counts;
      }),
      BetaFeedback.count(),
    ]);

    sendSuccess(res, {
      total,
      byStatus,
      byCategory,
      bySeverity,
    });
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_STATS, 'fetching beta feedback stats');
  }
});

router.use('/', BetaFeedbackCrudRouter);

export { router as BetaFeedbackRouter };
