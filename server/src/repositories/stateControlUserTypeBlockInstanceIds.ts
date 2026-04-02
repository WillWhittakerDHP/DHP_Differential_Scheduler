/**
 * IDs of block_instances whose shape is a state-control user type (matches client getAllUserTypeBlockIds).
 * WHY: availability_differential_attendees.value has no FK; entity CRUD + migration prune orphans; this set filters read/persist.
 */
import { Op } from 'sequelize'
import type { Transaction } from 'sequelize'
import { BlockInstance, BlockShape } from '../config/app.js'

export async function getStateControlUserTypeBlockInstanceIdSet(
  transaction?: Transaction
): Promise<Set<string>> {
  const stateShapes = await BlockShape.findAll({
    attributes: ['id'],
    where: { type: 'user' },
    transaction,
  })
  const shapeIds = stateShapes.map((s) => s.id)
  if (shapeIds.length === 0) {
    return new Set()
  }
  const instances = await BlockInstance.findAll({
    attributes: ['id'],
    where: { blockShapeRef: { [Op.in]: shapeIds } },
    transaction,
  })
  return new Set(instances.map((i) => String(i.id)))
}
