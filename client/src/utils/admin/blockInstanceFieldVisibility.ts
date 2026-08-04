import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { BLOCK_SHAPE_TYPES, type BlockShapeType } from '@/constants/blockShapeTypes'

/**
 * WHY: Phase 1 grab-bag cleanup — block_instances used to expose every domain flag on
 * every card. Admin cards should only surface fields that belong to the parent shape.
 *
 * PATTERN: Central allowlist keyed by `block_shapes.semantic_type`, not by display name.
 */
const TIME_BLOCK_INSTANCE_FIELDS = new Set([
  'requiresUnitNumber',
  'isMultiFamily',
  'propertyFactKey',
])

const SERVICE_BLOCK_INSTANCE_FIELDS = new Set([
  'requiresAgent',
  'preClosing',
  // Accumulator is atomic-service → atomic-time only (not packages/orchestrator packages).
  'accumulator',
  'accumulationLinks',
])

const USER_BLOCK_INSTANCE_FIELDS = new Set(['semanticType'])

const BLOCK_INSTANCE_FIELDS_BY_SEMANTIC_TYPE: Partial<
  Record<BlockShapeType, ReadonlySet<string>>
> = {
  [BLOCK_SHAPE_TYPES.TIME]: TIME_BLOCK_INSTANCE_FIELDS,
  [BLOCK_SHAPE_TYPES.SERVICE]: SERVICE_BLOCK_INSTANCE_FIELDS,
  [BLOCK_SHAPE_TYPES.USER]: USER_BLOCK_INSTANCE_FIELDS,
}

export function shouldShowBlockInstanceField(
  fieldKey: GlobalFieldKey<'blockInstance'>,
  semanticType: BlockShapeType | null | undefined
): boolean {
  const key = String(fieldKey)

  // Dropped in Phase 1 — no live booking/admin behaviour depends on these columns.
  if (key === 'baseSqFt' || key === 'agentPermissions') {
    return false
  }

  // Service cards use semantic controls for Active time blocks / Active fee blocks instead
  // of the generic mixed downstream relationship field.
  if (semanticType === BLOCK_SHAPE_TYPES.SERVICE && key === 'bookingCascades') {
    return false
  }

  // Service cards use the dedicated Default/Optional event selectors in Service activation.
  if (semanticType === BLOCK_SHAPE_TYPES.SERVICE && key === 'eventAssignments') {
    return false
  }

  // Event cards own segments (event instances) and may package atomic events via
  // instanceComponents. Hide lateral time activation and nested eventAssignments grab-bag.
  if (
    semanticType === BLOCK_SHAPE_TYPES.EVENT &&
    (key === 'bookingCascades' || key === 'eventAssignments')
  ) {
    return false
  }

  // Work-item ledger / event part-shape UI owns add/edit of parts — hide the
  // duplicate RelationshipCollection placeholders (“Click to create part instance”).
  if (
    (semanticType === BLOCK_SHAPE_TYPES.SERVICE ||
      semanticType === BLOCK_SHAPE_TYPES.TIME ||
      semanticType === BLOCK_SHAPE_TYPES.PRICE ||
      semanticType === BLOCK_SHAPE_TYPES.EVENT) &&
    key === 'partAssignments'
  ) {
    return false
  }

  if (!semanticType) {
    return !TIME_BLOCK_INSTANCE_FIELDS.has(key) &&
      !SERVICE_BLOCK_INSTANCE_FIELDS.has(key) &&
      !USER_BLOCK_INSTANCE_FIELDS.has(key)
  }

  const allowed = BLOCK_INSTANCE_FIELDS_BY_SEMANTIC_TYPE[semanticType]
  if (!allowed) {
    return !TIME_BLOCK_INSTANCE_FIELDS.has(key) &&
      !SERVICE_BLOCK_INSTANCE_FIELDS.has(key) &&
      !USER_BLOCK_INSTANCE_FIELDS.has(key)
  }

  if (allowed.has(key)) {
    return true
  }

  return !TIME_BLOCK_INSTANCE_FIELDS.has(key) &&
    !SERVICE_BLOCK_INSTANCE_FIELDS.has(key) &&
    !USER_BLOCK_INSTANCE_FIELDS.has(key)
}

export function shouldShowEntityField<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  blockInstanceSemanticType?: BlockShapeType | null
): boolean {
  if (entityKey !== 'blockInstance') {
    return true
  }
  return shouldShowBlockInstanceField(
    fieldKey as GlobalFieldKey<'blockInstance'>,
    blockInstanceSemanticType
  )
}
