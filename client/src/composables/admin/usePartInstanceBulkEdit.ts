/**
 * WHY: Component-logic audit - move .flatMap()/.map() and .reduce() out of PartInstanceBulkEditModal.
 */
import { computed, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

export interface PartInstanceBulkEditData {
  baseTime?: number | null
  rateOverBaseTime?: number | null
  baseFee?: number | null
  rateOverBaseFee?: number | null
  [key: string]: number | null | undefined
}

export interface UsePartInstanceBulkEditOptions {
  blockInstanceId: string
  partInstances: Ref<GlobalEntity<'partInstance'>[]>
  partAssignments: Ref<GlobalRelationship[] | undefined | null>
  logger: { debug: (msg: string, ctx?: unknown) => void }
}

export function usePartInstanceBulkEdit(options: UsePartInstanceBulkEditOptions): {
  firstPartInstanceForMetadata: Ref<GlobalEntity<'partInstance'> | null>
  buildBulkEditDataFromForm: (
    filteredMetadataKeys: string[],
    formValues: Record<string, unknown>
  ) => PartInstanceBulkEditData
} {
  const { blockInstanceId, partInstances, partAssignments, logger } = options

  const firstPartInstanceForMetadata = computed<GlobalEntity<'partInstance'> | null>(() => {
    const raw = partAssignments.value
    if (raw === undefined || raw === null) {
      logger.debug('firstPartInstanceForMetadata: partAssignments missing, using []')
    }
    const relationships = raw !== undefined && raw !== null ? raw : []
    const constituentIds = new Set(
      relationships
        .filter((rel) => rel.parent.id === blockInstanceId)
        .flatMap((rel) => rel.children.map((child) => child.id))
    )
    const instances = partInstances.value.filter((pi) => constituentIds.has(pi.id))
    if (instances.length === 0) return null
    return instances[0]
  })

  function buildBulkEditDataFromForm(
    filteredMetadataKeys: string[],
    formValues: Record<string, unknown>
  ): PartInstanceBulkEditData {
    return filteredMetadataKeys.reduce<PartInstanceBulkEditData>((acc, field) => {
      const value = formValues[field]
      if (value !== null && value !== undefined && value !== '') {
        const numericValue = Number(value)
        if (!isNaN(numericValue)) {
          (acc as Record<string, number>)[field] = numericValue
        }
      }
      return acc
    }, {})
  }

  return { firstPartInstanceForMetadata, buildBulkEditDataFromForm }
}
