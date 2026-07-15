import { BlockInstance, BlockShape, PartAssignment } from '../../../config/app.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'

type BlockInstanceWithShape = InstanceType<typeof BlockInstance> & {
  block_shape?: InstanceType<typeof BlockShape> | null
}

/** Time modifiers apply to service / time / price / event block shapes (event blocks alter calendar durations). */
const TIME_BLOCK_SHAPE_TYPES = new Set(['service', 'time', 'price', 'event'])

function bodyMentionsBaseTimeFields(body: Record<string, unknown>): boolean {
  const keys = ['baseTime', 'base_time'] as const
  return keys.some((k) => Object.prototype.hasOwnProperty.call(body, k))
}

function bodyMentionsTimeModifierFields(body: Record<string, unknown>): boolean {
  const keys = [
    'timePerUnit',
    'time_per_unit',
    'baseMultiplier',
    'base_multiplier',
    'rateMultiplier',
    'rate_multiplier',
  ] as const
  return keys.some((k) => Object.prototype.hasOwnProperty.call(body, k))
}

function bodyMentionsFeeFields(body: Record<string, unknown>): boolean {
  const keys = ['baseFee', 'base_fee', 'feePerUnit', 'fee_per_unit'] as const
  return keys.some((k) => Object.prototype.hasOwnProperty.call(body, k))
}

export function isPartInstanceEntityType(entityType: string): boolean {
  return entityType === ENTITY_KEYS.PART_INSTANCE || entityType === 'partInstance'
}

async function loadParentBlockContext(
  partInstanceId: string
): Promise<{ blockInstance: BlockInstanceWithShape; shape: InstanceType<typeof BlockShape> } | null> {
  const assignment = await PartAssignment.findOne({
    where: { childId: partInstanceId, disabled: false },
  })
  if (!assignment) {
    return null
  }
  const blockInstance = (await BlockInstance.findByPk(assignment.parentId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })) as BlockInstanceWithShape | null
  if (!blockInstance) {
    return null
  }
  const shape = blockInstance.block_shape
  if (!shape) {
    return null
  }
  return { blockInstance, shape }
}

/**
 * WHY: §10.1 — Base tier vs PerUnit tier ownership on part rows.
 * PATTERN: Single parent lookup; reject domain-invalid ledger writes at the API boundary (Phase 20.8).
 */
export async function validatePartInstanceLedgerFieldsAsync(
  partInstanceId: string,
  body: Record<string, unknown>
): Promise<string | null> {
  const mentionsBaseTime = bodyMentionsBaseTimeFields(body)
  const mentionsTimeModifier = bodyMentionsTimeModifierFields(body)
  const mentionsFee = bodyMentionsFeeFields(body)
  if (!mentionsBaseTime && !mentionsTimeModifier && !mentionsFee) {
    return null
  }

  const ctx = await loadParentBlockContext(partInstanceId)
  if (!ctx) {
    return null
  }

  const { blockInstance, shape } = ctx

  if (mentionsBaseTime || mentionsTimeModifier) {
    if (!TIME_BLOCK_SHAPE_TYPES.has(shape.semanticType)) {
      return (
        'baseTime, timePerUnit, baseMultiplier, and rateMultiplier may only be set on part instances under block shapes of type ' +
        'service, time, price, or event.'
      )
    }
  }

  if (mentionsFee) {
    if (shape.semanticType === 'service' && blockInstance.orchestrator === true) {
      return null
    }
    return (
      'baseFee and feePerUnit may only be set on part instances under a service block instance with ' +
      'orchestrator enabled (see ARCHITECTURE §10.1).'
    )
  }

  return null
}
