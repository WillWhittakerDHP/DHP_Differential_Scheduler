/**
 * PATTERN: Service-only part rows for admin atomic / convergence table (session 20.3.2).
 * Same partAssignments resolution lineage as usePartsTotals; gated on blockShape.type === 'service'.
 */
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { GlobalEntity, PartInstanceEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import type { UseServiceAtomicPartRowsReturn, ServiceAtomicPartRow } from '@/types/admin/serviceAtomicPartRows'
import {
  activeChildIdsForBlockParent,
  resolvePartInstancesByChildIds,
} from '@/utils/admin/blockInstancePartsTotalsResolution'

const logger = createLogger('useServiceAtomicPartRows')

export function useServiceAtomicPartRows(blockInstanceId: string): UseServiceAtomicPartRowsReturn {
  const { getGlobalEntityById } = useGlobal()
  const { relationships: partAssignments } = useRelationshipCrud('partAssignments')
  const { entities: partInstances } = useEntityCrud('partInstance')

  const isServiceBlockInstance = computed((): boolean => {
    const blockInstance = getGlobalEntityById('blockInstance', blockInstanceId)
    if (!blockInstance) {
      return false
    }
    const bi = blockInstance as GlobalEntity<'blockInstance'>
    const blockShape = getGlobalEntityById('blockShape', bi.blockShapeRef)
    if (!blockShape) {
      return false
    }
    return (blockShape as GlobalEntity<'blockShape'>).type === BLOCK_SHAPE_TYPES.SERVICE
  })

  const rows = computed((): ServiceAtomicPartRow[] => {
    if (!isServiceBlockInstance.value) {
      return []
    }
    const { childIds, hadDuplicates, beforeDedup } = activeChildIdsForBlockParent(
      partAssignments.value ?? null,
      blockInstanceId
    )
    if (hadDuplicates) {
      logger.warn('Found duplicate child_ids', {
        entityId: blockInstanceId,
        beforeDedup,
        afterDedup: childIds,
        duplicates: beforeDedup.filter((id, index) => beforeDedup.indexOf(id) !== index),
      })
    }
    const { resolved, missingIds } = resolvePartInstancesByChildIds(partInstances.value, childIds)
    if (missingIds.length > 0) {
      logger.warn('Missing part instances', { entityId: blockInstanceId, missingIds })
    }
    return resolved.map((entity) => {
      const partInstance = entity as PartInstanceEntity
      const partShape = getGlobalEntityById('partShape', partInstance.partShapeRef)
      if (!partShape) {
        logger.debug('Missing part shape for part instance', {
          blockInstanceId,
          partInstanceId: partInstance.id,
          partShapeRef: partInstance.partShapeRef,
        })
      }
      const shape = partShape as GlobalEntity<'partShape'> | null
      const partShapeName = shape?.name != null ? String(shape.name) : ''
      return {
        name: partInstance.name,
        baseTime: partInstance.baseTime,
        baseFee: partInstance.baseFee,
        rateOverBaseTime: partInstance.rateOverBaseTime,
        rateOverBaseFee: partInstance.rateOverBaseFee,
        zeroOutPart: partInstance.zeroOutPart,
        partShapeName,
        partInstance,
      }
    })
  })

  return {
    isServiceBlockInstance,
    rows,
  }
}
