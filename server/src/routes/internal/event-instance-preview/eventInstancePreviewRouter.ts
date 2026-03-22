import { Router, type Request, type Response } from 'express'
import { sendError, sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { previewEventInstanceTemplates } from '../../../services/invites/eventInstancePreviewService.js'
import type { EventInstancePreviewRequestBody } from '@shared/types/eventInstancePreview.js'

const router = Router()

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/** POST /event-instance-preview — resolve templates with invite context for a real appointment. */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const b = req.body as Record<string, unknown>
    if (!isNonEmptyString(b.appointmentId) || !isNonEmptyString(b.eventShapeRef)) {
      sendError(res, 'appointmentId and eventShapeRef are required', HTTP_STATUS_CODES.BAD_REQUEST)
      return
    }

    const body: EventInstancePreviewRequestBody = {
      appointmentId: String(b.appointmentId).trim(),
      eventShapeRef: String(b.eventShapeRef).trim(),
      titleTemplate: typeof b.titleTemplate === 'string' ? b.titleTemplate : null,
      descriptionTemplate: typeof b.descriptionTemplate === 'string' ? b.descriptionTemplate : null,
      locationTemplate: typeof b.locationTemplate === 'string' ? b.locationTemplate : null,
    }

    const result = await previewEventInstanceTemplates(body)
    sendSuccess(res, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Preview failed'
    if (message === 'Appointment not found') {
      sendError(res, message, HTTP_STATUS_CODES.NOT_FOUND)
      return
    }
    sendError(res, message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
})

export { router as EventInstancePreviewRouter }
