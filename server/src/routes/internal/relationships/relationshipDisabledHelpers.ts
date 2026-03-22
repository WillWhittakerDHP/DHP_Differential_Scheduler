/**
 */
import type { Model, ModelStatic } from 'sequelize'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'

/**
 * POST is idempotent for these kinds: find by create payload first, then create if missing.
 */
const IDEMPOTENT_RELATIONSHIP_POST_KINDS: ReadonlySet<string> = new Set([
  RELATIONSHIP_TYPES.VALID_CASCADES,
  RELATIONSHIP_TYPES.VALID_PARTS,
  RELATIONSHIP_TYPES.VALID_ANNOTATIONS,
  RELATIONSHIP_TYPES.VALID_EVENTS,
  RELATIONSHIP_TYPES.VALID_PRICING_CASCADES,
  RELATIONSHIP_TYPES.DEPENDENT_INSTANCES,
  RELATIONSHIP_TYPES.BOOKING_CASCADES,
  RELATIONSHIP_TYPES.PRICING_CASCADES,
  RELATIONSHIP_TYPES.PART_ASSIGNMENTS,
  RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS,
  RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS,
  RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS,
])

export function relationshipModelSupportsDisabled(model: ModelStatic<Model>): boolean {
  return 'disabled' in model.getAttributes()
}

export function whereActiveRelationships(
  model: ModelStatic<Model>,
  baseWhere: Record<string, unknown>
): Record<string, unknown> {
  if (!relationshipModelSupportsDisabled(model)) {
    return baseWhere
  }
  return { ...baseWhere, disabled: false }
}

async function reenableRelationshipRowIfDisabled(model: ModelStatic<Model>, row: Model): Promise<void> {
  if (!relationshipModelSupportsDisabled(model)) {
    return
  }
  if (row.get('disabled') === true) {
    row.set('disabled', false)
    await row.save()
  }
}

export async function findOrCreateRelationshipRow(
  model: ModelStatic<Model>,
  createData: Record<string, unknown>,
  normalizedKind: string
): Promise<{ row: Model; created: boolean }> {
  if (!IDEMPOTENT_RELATIONSHIP_POST_KINDS.has(normalizedKind)) {
    const row = await model.create(createData)
    return { row, created: true }
  }
  const existing = await model.findOne({ where: createData })
  if (existing) {
    await reenableRelationshipRowIfDisabled(model, existing)
    return { row: existing, created: false }
  }
  const row = await model.create(createData)
  return { row, created: true }
}

export type SoftDeleteRelationshipOutcome =
  | { status: 'deleted'; affected: number }
  | { status: 'already_inactive' }
  | { status: 'not_found' }

/**
 * Soft-delete active rows matching `where`. Idempotent: already-disabled rows yield `already_inactive`.
 */
export async function softDeleteRelationshipRows(
  model: ModelStatic<Model>,
  where: Record<string, unknown>
): Promise<SoftDeleteRelationshipOutcome> {
  const activeWhere = whereActiveRelationships(model, where)
  const [updatedCount] = await model.update({ disabled: true }, { where: activeWhere })
  if (updatedCount > 0) {
    return { status: 'deleted', affected: updatedCount }
  }
  const existing = await model.findOne({ where })
  if (!existing) {
    return { status: 'not_found' }
  }
  if (existing.get('disabled') === true) {
    return { status: 'already_inactive' }
  }
  return { status: 'not_found' }
}
