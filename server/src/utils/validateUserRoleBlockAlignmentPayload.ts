import { USER_ROLE_VALUES, type UserRoleValue } from '../../../shared/constants/roleConstants.js'
import { BlockInstance, BlockShape } from '../config/app.js'
import { createLogger } from './logger.js'

const logger = createLogger('validateUserRoleBlockAlignmentPayload')

const USER_ROLE_SET = new Set<string>(USER_ROLE_VALUES)

function isUuidString(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export type ValidateAlignmentResult =
  | { ok: true; normalized: Partial<Record<UserRoleValue, string | null>> }
  | { ok: false; error: string }

/**
 * Validates PUT payload: keys must be USER_ROLE_VALUES only; values null or UUID;
 * each UUID must reference a block instance whose shape type is user.
 */
export async function validateUserRoleBlockAlignmentPayload(
  body: unknown
): Promise<ValidateAlignmentResult> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be an object' }
  }
  const alignmentsRaw = (body as { alignments?: unknown }).alignments
  if (alignmentsRaw === null || typeof alignmentsRaw !== 'object' || Array.isArray(alignmentsRaw)) {
    return { ok: false, error: 'Field alignments must be an object' }
  }

  const normalized: Partial<Record<UserRoleValue, string | null>> = {}
  for (const key of Object.keys(alignmentsRaw as Record<string, unknown>)) {
    if (!USER_ROLE_SET.has(key)) {
      return { ok: false, error: `Unknown role key: ${key}` }
    }
    const v = (alignmentsRaw as Record<string, unknown>)[key]
    if (v === null) {
      normalized[key as UserRoleValue] = null
      continue
    }
    if (typeof v !== 'string') {
      return { ok: false, error: `Alignment for ${key} must be a string UUID or null` }
    }
    if (!isUuidString(v)) {
      return { ok: false, error: `Alignment for ${key} must be a valid UUID` }
    }
    const instance = await BlockInstance.findByPk(v, {
      include: [
        {
          model: BlockShape,
          as: 'block_shape',
          required: true,
          attributes: ['id', 'type'],
        },
      ],
    })
    if (instance === null) {
      return { ok: false, error: `block_instance_id not found for role ${key}` }
    }
    const shape = (instance as typeof instance & {
      block_shape?: { type: string }
    }).block_shape
    if (shape === undefined) {
      logger.warn('BlockInstance missing block_shape include', { blockInstanceId: v })
      return { ok: false, error: `Invalid block instance for role ${key}` }
    }
    if (shape.type !== 'user') {
      return {
        ok: false,
        error: `Instance for ${key} must be a user-type block (block shape type user)`,
      }
    }
    normalized[key as UserRoleValue] = v
  }

  return { ok: true, normalized }
}
