/**
 * User-semantic block instances: at most one instance per canonical semantic_type (role key).
 */
import { Op, type Transaction } from 'sequelize'
import { BlockInstance, BlockShape } from '../config/app.js'

export async function reconcileUserShapeInstanceSemanticTypeUniqueness(
  blockInstanceId: string,
  transaction?: Transaction
): Promise<void> {
  const inst = await BlockInstance.findByPk(blockInstanceId, {
    attributes: ['id', 'blockShapeRef', 'semanticType'],
    transaction,
  })
  if (!inst || inst.semanticType === null || inst.semanticType === '') {
    return
  }
  const shape = await BlockShape.findByPk(inst.blockShapeRef, {
    attributes: ['semanticType'],
    transaction,
  })
  if (!shape || shape.semanticType !== 'user') {
    return
  }
  await BlockInstance.update(
    { semanticType: null },
    {
      where: {
        blockShapeRef: inst.blockShapeRef,
        id: { [Op.ne]: inst.id },
        semanticType: inst.semanticType,
      },
      transaction,
    }
  )
}
