/**
 * WHY: Single entry for magic-link “delivery” — log in dev; SMTP reserved for a later iteration (Feature 7.3.2.1).
 * PATTERN: Callers pass full `textBody`; we never log raw secrets (redact `token=` query values).
 */

import { createLogger } from '../utils/logger.js'

const logger = createLogger('auth.magicLinkDelivery')

let warnedSmtpNotImplemented = false

/**
 * Redacts `token=` query values so logs never contain a full magic-link secret.
 */
export function redactMagicLinkBodyForLogs(text: string): string {
  return text.replace(/([?&]token=)([^&\s#]+)/gi, '$1[REDACTED]')
}

function resolveLogDeliveryReason(): void {
  const raw = process.env.MAGIC_LINK_DELIVERY_MODE?.trim().toLowerCase() ?? ''
  if (raw === '' || raw === 'log') {
    return
  }
  if (raw === 'smtp') {
    if (!warnedSmtpNotImplemented) {
      warnedSmtpNotImplemented = true
      logger.warn(
        'MAGIC_LINK_DELIVERY_MODE=smtp but SMTP transport is not implemented; using log delivery'
      )
    }
    return
  }
  logger.warn('MAGIC_LINK_DELIVERY_MODE invalid; using log delivery', {
    raw: process.env.MAGIC_LINK_DELIVERY_MODE,
  })
}

/**
 * Records outbound magic-link email intent. Production mail transport can replace the log path later.
 */
export async function sendMagicLinkDelivery(input: {
  to: string
  subject: string
  textBody: string
}): Promise<void> {
  resolveLogDeliveryReason()
  const { to, subject, textBody } = input
  logger.info('magic_link.delivery.log', {
    to,
    subject,
    bodyPreview: redactMagicLinkBodyForLogs(textBody),
  })
}
