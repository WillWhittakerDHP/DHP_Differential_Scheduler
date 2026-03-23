/**
 * Notification service stub — observer/hook pattern for status change events.
 *
 * Currently logs status transitions. Feature 7 (Authentication) will extend
 * this with email transport once customer identity is available via req.user.
 *
 * Expansion points for Feature 7:
 *   1. Add email transport (e.g. nodemailer, SendGrid) in a sendEmail() helper.
 *   2. Look up customer contact info from the authenticated user context.
 *   3. Load email templates from a template system (e.g. Handlebars, MJML).
 *   4. Call sendEmail() inside onStatusChange for relevant transitions
 *      (e.g. submitted → confirmed sends "Your appointment is confirmed").
 *   5. Add onCreated / onCancelled hooks following the same pattern.
 */

import { createLogger } from '../utils/logger.js'

const logger = createLogger('NotificationService')

interface StatusChangeEvent {
  appointmentId: string
  oldStatus: string
  newStatus: string
}

/**
 * Called after a successful status transition on an appointment.
 * Non-blocking — failures here must not break the request.
 */
export async function onStatusChange(event: StatusChangeEvent): Promise<void> {
  const { appointmentId, oldStatus, newStatus } = event
  logger.info(`Status change: ${oldStatus} → ${newStatus}`, { appointmentId })

  if (newStatus === 'confirmed') {
    logger.info('Appointment confirmed — email notification hook (Feature 7)', { appointmentId })
  }

  if (newStatus === 'cancelled') {
    logger.info('Appointment cancelled — cancellation notification hook (Feature 7)', { appointmentId })
  }
}
