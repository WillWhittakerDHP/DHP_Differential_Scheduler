/**
 * PATTERN: Part-ledger rows for block instances whose blockShape.type is in an allowed set.
 * Same partAssignments resolution lineage as usePartsTotals / useServiceAtomicPartRows.
 */
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { BLOCK_SHAPE_TYPES, type BlockShapeType } from '@/constants/blockShapeTypes'
import type { GlobalEntity, PartInstanceEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import type { ServiceAtomicPartRow, UseAtomicPartLedgerRowsReturn } from '@/types/admin/serviceAtomicPartRows'
import {
  activeChildIdsForBlockParent,
  resolvePartInstancesByChildIds,
} from '@/utils/admin/blockInstancePartsTotalsResolution'

const logger = createLogger('useAtomicPartLedgerRows')

export function useAtomicPartLedgerRows(
  blockInstanceId: MaybeRefOrGetter<string>,
  allowedShapeTypes: MaybeRefOrGetter<readonly BlockShapeType[]>
): UseAtomicPartLedgerRowsReturn {
  const { getGlobalEntityById } = useGlobal()
  const { relationships: partAssignments } = useRelationshipCrud('partAssignments')
  const { entities: partInstances } = useEntityCrud('partInstance')

  const matchesShapeGate = computed((): boolean => {
    const id = toValue(blockInstanceId)
    const allowed = toValue(allowedShapeTypes)
    if (allowed.length === 0) {
      return false
    }
    const blockInstance = getGlobalEntityById('blockInstance', id)
    if (!blockInstance) {
      return false
    }
    const bi = blockInstance as GlobalEntity<'blockInstance'>
    const blockShape = getGlobalEntityById('blockShape', bi.blockShapeRef)
    if (!blockShape) {
      return false
    }
    const t = (blockShape as GlobalEntity<'blockShape'>).type
    return allowed.includes(t)
  })

  const rows = computed((): ServiceAtomicPartRow[] => {
    const id = toValue(blockInstanceId)
    if (!matchesShapeGate.value) {
      return []
    }
    const { childIds, hadDuplicates, beforeDedup } = activeChildIdsForBlockParent(
      partAssignments.value ?? null,
      id
    )
    if (hadDuplicates) {
      logger.warn('Found duplicate child_ids', {
        entityId: id,
        beforeDedup,
        afterDedup: childIds,
        duplicates: beforeDedup.filter((cid, index) => beforeDedup.indexOf(cid) !== index),
      })
    }
    const { resolved, missingIds } = resolvePartInstancesByChildIds(partInstances.value, childIds)
    if (missingIds.length > 0) {
      logger.warn('Missing part instances', { entityId: id, missingIds })
    }
    return resolved.map((entity) => {
      const partInstance = entity as PartInstanceEntity
      const partShape = getGlobalEntityById('partShape', partInstance.partShapeRef)
      if (!partShape) {
        logger.debug('Missing part shape for part instance', {
          blockInstanceId: id,
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
    matchesShapeGate,
    rows,
  }
}

const TIME_PRICE_TYPES: readonly BlockShapeType[] = [BLOCK_SHAPE_TYPES.TIME, BLOCK_SHAPE_TYPES.PRICE]

export interface UseTimePriceAtomicPartRowsReturn {
  isTimeOrPriceBlockInstance: UseAtomicPartLedgerRowsReturn['matchesShapeGate']
  rows: UseAtomicPartLedgerRowsReturn['rows']
}

export function useTimePriceAtomicPartRows(blockInstanceId: MaybeRefOrGetter<string>): UseTimePriceAtomicPartRowsReturn {
  const { matchesShapeGate, rows } = useAtomicPartLedgerRows(blockInstanceId, TIME_PRICE_TYPES)
  return {
    isTimeOrPriceBlockInstance: matchesShapeGate,
    rows,
  }
}
