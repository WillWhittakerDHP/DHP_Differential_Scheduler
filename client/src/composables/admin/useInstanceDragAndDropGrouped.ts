/**
 * WHY: Keeps useInstanceDragAndDrop thin so composable-logic audit stays within thresholds.
 */
import type { ComputedRef, Ref } from 'vue'
import { rawBookingModeIsStandaloneOnly } from '@shared/utils/ternaryAliasUtils'
import { nilToEmptyArray } from '@shared/utils/nilDefaults'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { createLogger } from '@/utils/logger'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'

const logger = createLogger('useInstanceDragAndDropGrouped')

const DEFAULT_BOOKING_MODE_STORAGE = DEFAULT_VALUES.DEFAULT_TERNARY_BOOKING_MODE

export function isAdminStandaloneSection(instance: GlobalEntity<'blockInstance'>): boolean {
  const mode = instance.bookingMode ?? DEFAULT_BOOKING_MODE_STORAGE
  return rawBookingModeIsStandaloneOnly(mode)
}

/** Distinct FormKit / map key for the "not standalone-only" expansion panels (per block shape). */
export function groupedInstanceDragZoneKey(blockShapeId: string): string {
  return `${blockShapeId}::grouped`
}

export function listMembershipSignature(instancesMap: Map<string, GlobalEntity<'blockInstance'>[]>): string {
  return Array.from(instancesMap.entries())
    .map(([shapeId, list]) => `${shapeId}:${[...list].map((i) => i.id).sort().join(',')}`)
    .sort()
    .join('|')
}

export function dragLayoutSignature(
  mainMap: Map<string, GlobalEntity<'blockInstance'>[]>,
  groupedMap: Map<string, GlobalEntity<'blockInstance'>[]>
): string {
  return `${listMembershipSignature(mainMap)}||${listMembershipSignature(groupedMap)}`
}

export function createGroupedZoneDragEndHandler(params: {
  blockShapeId: string
  groupedEntityIds: Ref<string[]>
  groupedEntityList: Ref<GlobalEntity<'blockInstance'>[]>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchOrderIndex: PatchOrderIndex
}): () => Promise<void> {
  const { blockShapeId, groupedEntityIds, groupedEntityList, blockInstancesByShape, patchOrderIndex } = params

  const syncGroupedFromSource = (): void => {
    const grouped = nilToEmptyArray(
      blockInstancesByShape.value.get(blockShapeId)?.filter((e) => !isAdminStandaloneSection(e))
    )
    groupedEntityList.value = [...grouped]
    groupedEntityIds.value = grouped.map((e) => e.id)
  }

  return async (): Promise<void> => {
    try {
      const all = nilToEmptyArray(blockInstancesByShape.value.get(blockShapeId))
      const idToEntity = new Map(all.map((e) => [e.id, e]))
      const mainOrderedStable = all.filter((e) => isAdminStandaloneSection(e))
      const groupedOrdered = groupedEntityIds.value
        .map((id) => idToEntity.get(id as GlobalEntityId))
        .filter((e): e is GlobalEntity<'blockInstance'> => e !== undefined)
      const merged = [...mainOrderedStable, ...groupedOrdered]
      const updates = merged.map((entity, index) => ({
        id: entity.id,
        orderIndex: index
      }))
      groupedEntityList.value = groupedOrdered
      await patchOrderIndex(updates)
    } catch (_error) {
      logger.error('Failed to patch order index after grouped-zone drag', { error: _error, blockShapeId })
      syncGroupedFromSource()
    }
  }
}
