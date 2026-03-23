/**
 * WHY: Build verify URLs and run the “request magic link” orchestration (Feature 7.3.2.2).
 * PATTERN: Anti-enumeration — always return `{ delivered: true }` from the orchestrator; routes map to HTTP.
 */

import Joi from 'joi'
import { createLogger } from '../utils/logger.js'
import { sendMagicLinkDelivery } from './magicLinkDelivery.js'
import { issueMagicLinkForEmail } from './strategies/magicLinkStrategy.js'

const logger = createLogger('auth.magicLinkRequest')

let warnedMissingAppBaseUrl = false

/** Joi schema for `POST` body `{ email }` — reuse on the router in task 7.3.2.3. */
export const magicLinkRequestBodySchema = Joi.object({
  email: Joi.string().email().required(),
}).unknown(true)

function normalizeMagicLinkAppBaseUrl(): string {
  const primary = process.env.APP_BASE_URL
  const secondary = process.env.VITE_APP_BASE_URL
  const raw =
    primary !== undefined && primary !== null && primary.trim() !== ''
      ? primary
      : secondary !== undefined && secondary !== null && secondary.trim() !== ''
        ? secondary
        : ''
  const trimmed = raw.replace(/\/$/, '').trim()
  if (trimmed !== '') {
    return trimmed
  }
  if (!warnedMissingAppBaseUrl) {
    warnedMissingAppBaseUrl = true
    logger.warn(
      'APP_BASE_URL and VITE_APP_BASE_URL are unset; using http://localhost:3002 for magic link verify URLs'
    )
  }
  return 'http://localhost:3002'
}

/**
 * Full URL for the client verify route (session 7.3.3 will serve or redirect this path).
 */
export function buildMagicLinkVerifyUrl(rawToken: string): string {
  const base = normalizeMagicLinkAppBaseUrl()
  return `${base}/auth/verify?token=${encodeURIComponent(rawToken)}`
}

/**
 * Validates email, issues a magic link, and delivers via {@link sendMagicLinkDelivery}.
 * Always resolves to `{ delivered: true }` so callers can return a generic HTTP success without user enumeration.
 */
export async function submitMagicLinkRequest(email: string): Promise<{ delivered: boolean }> {
  const trimmed = email.trim()
  const { error } = magicLinkRequestBodySchema.validate({ email: trimmed })
  if (error) {
    return { delivered: true }
  }
  const issued = await issueMagicLinkForEmail({ email: trimmed })
  if (!issued) {
    return { delivered: true }
  }
  const verifyUrl = buildMagicLinkVerifyUrl(issued.rawToken)
  const textBody = [
    'Use this link to sign in (expires shortly):',
    '',
    verifyUrl,
    '',
    'If you did not request this, you can ignore this message.',
  ].join('\n')
  await sendMagicLinkDelivery({
    to: trimmed,
    subject: 'Your sign-in link',
    textBody,
  })
  return { delivered: true }
}
