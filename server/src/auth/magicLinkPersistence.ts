/**
 * WHY: Sequelize lifecycle for `magic_links` — create pending rows and single-use consume for verify (Feature 7.3.1.2).
 * PATTERN: Mirrors `sessionManager` (models + logger); strategy task maps outcomes to `AuthOpResult`.
 */

import type { Transaction } from 'sequelize'
import type { MagicLink } from '../db/models/auth/magic_link.js'
import { models } from '../config/models.js'
import { sequelize } from '../config/database.js'
import { describeMagicLinkTokenForLogs } from './magicLinkVerifyDiagnostics.js'
import { loggableErrorFields } from '../utils/loggableError.js'
import { hashMagicLinkTokenForStorage } from './strategies/magicLinkToken.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('auth.magicLinkPersistence')

export type CreatePendingMagicLinkInput = {
  tokenHash: string
  expiresAt: Date
  email?: string | null
  userId?: string | null
  purpose?: string | null
}

export type MagicLinkConsumeResult =
  | { status: 'ok'; id: string; userId: string | null; email: string | null }
  | { status: 'not_found' }
  | { status: 'expired' }
  | { status: 'error' }

/**
 * Inserts a new magic link row. Caller supplies `tokenHash` only (never the raw token).
 */
export async function createPendingMagicLink(input: CreatePendingMagicLinkInput): Promise<MagicLink | null> {
  try {
    return await models.MagicLink.create({
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      email: input.email ?? null,
      userId: input.userId ?? null,
      purpose: input.purpose ?? null,
    })
  } catch (error) {
    logger.error('createPendingMagicLink failed:', error)
    return null
  }
}

/**
 * Returns a non-consumed row for the hash, or null (missing / error / already consumed).
 */
export async function findPendingMagicLinkByTokenHash(tokenHash: string): Promise<MagicLink | null> {
  try {
    return await models.MagicLink.findOne({
      where: { tokenHash, consumedAt: null },
    })
  } catch (error) {
    logger.error('findPendingMagicLinkByTokenHash failed:', error)
    return null
  }
}

/**
 * Single-use consume: hash raw token, lock row, reject expired, set `consumedAt`.
 * Already-consumed links are indistinguishable from missing (same `not_found` outcome).
 */
export async function consumeMagicLinkByRawToken(rawToken: string): Promise<MagicLinkConsumeResult> {
  const tokenHash = hashMagicLinkTokenForStorage(rawToken)
  const diag = describeMagicLinkTokenForLogs(rawToken)
  logger.info('magic_link.consume.start', { ...diag })
  try {
    return await sequelize.transaction(async (transaction: Transaction) => {
      const row = await models.MagicLink.findOne({
        where: { tokenHash, consumedAt: null },
        transaction,
        lock: transaction.LOCK.UPDATE,
      })
      if (!row) {
        logger.warn('magic_link.consume.not_found', {
          ...diag,
          hint: 'No pending row for this hash (wrong token, already used, or DB drift vs token_hash).',
        })
        return { status: 'not_found' }
      }
      const now = new Date()
      if (row.expiresAt <= now) {
        logger.warn('magic_link.consume.expired', {
          ...diag,
          magicLinkId: row.id,
          expiresAt: row.expiresAt.toISOString(),
          now: now.toISOString(),
        })
        return { status: 'expired' }
      }
      row.consumedAt = now
      await row.save({ transaction })
      logger.info('magic_link.consume.ok', {
        magicLinkId: row.id,
        userId: row.userId ?? null,
        email: row.email ?? null,
      })
      return {
        status: 'ok',
        id: row.id,
        userId: row.userId ?? null,
        email: row.email ?? null,
      }
    })
  } catch (error: unknown) {
    logger.error('magic_link.consume.transaction_failed', {
      ...diag,
      ...loggableErrorFields(error),
    })
    return { status: 'error' }
  }
}
