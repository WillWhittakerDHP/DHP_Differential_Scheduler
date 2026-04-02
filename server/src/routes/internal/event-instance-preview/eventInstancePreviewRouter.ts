import { Router, type Request, type Response } from 'express'
import { sendError, sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { previewEventInstanceTemplates } from '../../../services/invites/eventInstancePreviewService.js'
import type { EventInstancePreviewRequestBody } from '@shared/types/eventInstancePreview.js'
import { createLogger } from '../../../utils/logger.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { eventInstancePreviewPostBodySchema } from '../../schemas/eventInstancePreviewBodySchema.js'

const logger = createLogger('EventInstancePreviewRouter')
const router = Router()

function toPreviewBody(raw: Record<string, unknown>): EventInstancePreviewRequestBody {
  return {
    appointmentId: String(raw.appointmentId).trim(),
    eventInstanceId: String(raw.eventInstanceId).trim(),
    titleTemplate: typeof raw.titleTemplate === 'string' ? raw.titleTemplate : null,
    descriptionTemplate: typeof raw.descriptionTemplate === 'string' ? raw.descriptionTemplate : null,
    locationTemplate: typeof raw.locationTemplate === 'string' ? raw.locationTemplate : null,
  }
}

/** POST /event-instance-preview — resolve templates with invite context for a real appointment. */
router.post(
  '/',
  csrfProtection,
  validateRequest(eventInstancePreviewPostBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const body = toPreviewBody(req.body as Record<string, unknown>)

      const result = await previewEventInstanceTemplates(body)
      sendSuccess(res, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Preview failed'
      logger.error('Event instance preview failed', { error, message })
      if (message === 'Appointment not found' || message === 'Event instance not found') {
        sendError(res, message, HTTP_STATUS_CODES.NOT_FOUND)
        return
      }
      sendError(res, message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    }
  }
)

export { router as EventInstancePreviewRouter }
