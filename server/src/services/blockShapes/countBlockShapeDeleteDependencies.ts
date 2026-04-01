import { Op } from 'sequelize'
import {
  BlockInstance,
  ValidAnnotationAssignment,
  ValidBookingCascade,
  ValidEventCascade,
  ValidPartCascade,
} from '../../config/app.js'

export interface BlockShapeDeleteDependencyCounts {
  blockInstanceCount: number
  validBookingCascadeCount: number
  validPartCascadeParentCount: number
  validAnnotationAssignmentParentCount: number
  validEventCascadeParentCount: number
  totalCount: number
}

/**
 * WHY: Block shapes sit at the center of instance + validity graphs; delete must use one counter set.
 */
export async function countBlockShapeDeleteDependencies(shapeId: string): Promise<BlockShapeDeleteDependencyCounts> {
  const [
    blockInstanceCount,
    validBookingCascadeCount,
    validPartCascadeParentCount,
    validAnnotationAssignmentParentCount,
    validEventCascadeParentCount,
  ] = await Promise.all([
    BlockInstance.count({ where: { blockShapeRef: shapeId } }),
    ValidBookingCascade.count({
      where: { [Op.or]: [{ parentId: shapeId }, { childId: shapeId }] },
    }),
    ValidPartCascade.count({ where: { parentId: shapeId } }),
    ValidAnnotationAssignment.count({ where: { parentId: shapeId } }),
    ValidEventCascade.count({ where: { parentId: shapeId } }),
  ])

  return {
    blockInstanceCount,
    validBookingCascadeCount,
    validPartCascadeParentCount,
    validAnnotationAssignmentParentCount,
    validEventCascadeParentCount,
    totalCount:
      blockInstanceCount +
      validBookingCascadeCount +
      validPartCascadeParentCount +
      validAnnotationAssignmentParentCount +
      validEventCascadeParentCount,
  }
}
