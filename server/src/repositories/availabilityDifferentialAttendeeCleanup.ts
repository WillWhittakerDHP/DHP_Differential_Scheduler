/**
 * availability_differential_attendees.value references block_instances.id (state-control shapes only)
 * but has no FK. Remove rows when instances are deleted or shapes/instances no longer qualify.
 */
import { Op, type Transaction } from 'sequelize'
import {
  AvailabilityDifferentialAttendee,
  BlockInstance,
  BlockShape,
} from '../config/app.js'

export async function removeDifferentialAttendeesForBlockInstanceIds(
  instanceIds: readonly string[],
  transaction?: Transaction
): Promise<number> {
  const unique = [...new Set(instanceIds.map((id) => String(id)).filter(Boolean))]
  if (unique.length === 0) {
    return 0
  }
  return AvailabilityDifferentialAttendee.destroy({
    where: { value: { [Op.in]: unique } },
    transaction,
  })
}

/** After block_instance row changes: drop availability row if shape is not user type. */
export async function reconcileBlockInstanceStateControlEligibility(
  blockInstanceId: string,
  transaction?: Transaction
): Promise<void> {
  const inst = await BlockInstance.findByPk(blockInstanceId, {
    attributes: ['id', 'blockShapeRef'],
    transaction,
  })
  if (!inst) {
    return
  }
  const shape = await BlockShape.findByPk(inst.blockShapeRef, {
    attributes: ['semanticType'],
    transaction,
  })
  if (shape?.semanticType === 'user') {
    return
  }
  await removeDifferentialAttendeesForBlockInstanceIds([String(inst.id)], transaction)
}

/** After block_shape is no longer user type: drop all instances of that shape from differential lists. */
export async function reconcileBlockShapeStateControlEligibility(
  blockShapeId: string,
  transaction?: Transaction
): Promise<void> {
  const shape = await BlockShape.findByPk(blockShapeId, {
    attributes: ['semanticType'],
    transaction,
  })
  if (!shape || shape.semanticType === 'user') {
    return
  }
  const rows = await BlockInstance.findAll({
    where: { blockShapeRef: blockShapeId },
    attributes: ['id'],
    transaction,
  })
  await removeDifferentialAttendeesForBlockInstanceIds(
    rows.map((r) => String(r.id)),
    transaction
  )
}
