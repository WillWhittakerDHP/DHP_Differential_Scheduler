/**
 * WHY: Magic-link “delivery” — log in dev; Gmail API when tokens exist or MAGIC_LINK_DELIVERY_MODE=gmail.
 * PATTERN: Callers pass full `textBody`; we never log raw secrets (redact `token=` query values).
 */

import { hasCredentials } from '../config/googleOAuth.js'
import { sendGmailRawMessage } from '../services/google/gmail/sendGmailRawMessage.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('auth.magicLinkDelivery')

const DEFAULT_MAGIC_LINK_FROM = 'will@districthomepro.com'

let warnedSmtpNotImplemented = false
let warnedInvalidDeliveryMode = false

/**
 * Redacts `token=` query values so logs never contain a full magic-link secret.
 */
export function redactMagicLinkBodyForLogs(text: string): string {
  return text.replace(/([?&]token=)([^&\s#]+)/gi, '$1[REDACTED]')
}

function getMagicLinkFromAddress(): string {
  const raw = process.env.MAGIC_LINK_FROM_EMAIL?.trim()
  if (raw !== undefined && raw !== '') {
    return raw
  }
  return DEFAULT_MAGIC_LINK_FROM
}

/**
 * `gmail` — send via Gmail API (requires OAuth tokens).
 * `log` — log only.
 * unset — Gmail when {@link hasCredentials} is true, else log.
 */
function resolveDeliveryMode(): 'gmail' | 'log' | 'smtp_invalid' | 'unknown' {
  const raw = process.env.MAGIC_LINK_DELIVERY_MODE?.trim().toLowerCase() ?? ''
  if (raw === 'gmail') {
    return 'gmail'
  }
  if (raw === 'log') {
    return 'log'
  }
  if (raw === 'smtp') {
    return 'smtp_invalid'
  }
  if (raw === '') {
    return hasCredentials() ? 'gmail' : 'log'
  }
  return 'unknown'
}

async function deliverViaGmail(input: { to: string; subject: string; textBody: string }): Promise<void> {
  if (!hasCredentials()) {
    logger.error(
      'Gmail magic-link delivery selected but Google OAuth tokens are missing. Complete OAuth (e.g. Calendar auth URL) so .google-tokens.json includes a refresh_token with Gmail scope.'
    )
    throw new Error('Gmail magic-link delivery requires Google OAuth tokens')
  }
  const from = getMagicLinkFromAddress()
  const { to, subject, textBody } = input
  try {
    await sendGmailRawMessage({ from, to, subject, textBody })
    logger.info('magic_link.delivery.gmail_ok', { to, subject, from })
  } catch (err: unknown) {
    logger.error('magic_link.delivery.gmail_failed', { err, to, from })
    throw err
  }
}

function deliverViaLog(input: { to: string; subject: string; textBody: string }): void {
  const { to, subject, textBody } = input
  logger.info('magic_link.delivery.log', {
    to,
    subject,
    bodyPreview: redactMagicLinkBodyForLogs(textBody),
  })
}

/**
 * Records outbound magic-link email intent, or sends via Gmail when configured.
 */
export async function sendMagicLinkDelivery(input: {
  to: string
  subject: string
  textBody: string
}): Promise<void> {
  const mode = resolveDeliveryMode()

  if (mode === 'smtp_invalid' && !warnedSmtpNotImplemented) {
    warnedSmtpNotImplemented = true
    logger.warn(
      'MAGIC_LINK_DELIVERY_MODE=smtp but SMTP transport is not implemented; using log delivery'
    )
    deliverViaLog(input)
    return
  }

  if (mode === 'unknown' && !warnedInvalidDeliveryMode) {
    warnedInvalidDeliveryMode = true
    logger.warn('MAGIC_LINK_DELIVERY_MODE invalid; using log delivery', {
      raw: process.env.MAGIC_LINK_DELIVERY_MODE,
    })
    deliverViaLog(input)
    return
  }

  if (mode === 'gmail') {
    await deliverViaGmail(input)
    return
  }

  deliverViaLog(input)
}
