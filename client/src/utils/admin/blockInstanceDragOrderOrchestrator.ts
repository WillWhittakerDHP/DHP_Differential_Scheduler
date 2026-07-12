/**
 * WHY: Single place for block instance `orderIndex` updates after drag (main + grouped zones).
 * PATTERN: Instance tab FormKit zones call these handlers; persistence is always `patchOrderIndex` on blockInstance.
 */
import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'
import { sortEntitiesByOrderIndex } from '@/utils/admin/sortEntitiesByOrderIndex'
import { isAdminStandaloneSection } from '@/composables/admin/useInstanceDragAndDropGrouped'
import { createLogger } from '@/utils/logger'

const logger = createLogger('blockInstanceDragOrderOrchestrator')

export async function patchBlockInstanceOrderAfterMainZoneDrag(input: {
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<'blockInstance'>[]>
  filteredEntities: ComputedRef<GlobalEntity<'blockInstance'>[]>
  patchOrderIndex: PatchOrderIndex
}): Promise<void> {
  const { entityIds, entityList, filteredEntities, patchOrderIndex } = input
  try {
    const allEntities = filteredEntities.value
    const entityMap = new Map<string, GlobalEntity<'blockInstance'>>()
    allEntities.forEach((entity) => {
      entityMap.set(String(entity.id), entity)
    })
    const draggedIds = new Set(entityIds.value.map((id) => String(id)))
    const draggedEntities = entityIds.value
      .map((id) => entityMap.get(String(id)))
      .filter((entity): entity is GlobalEntity<'blockInstance'> => entity !== undefined)
    const nonDraggedEntities = allEntities.filter((entity) => !draggedIds.has(String(entity.id)))
    const reordered = [...draggedEntities, ...nonDraggedEntities]
    const normalized: GlobalEntity<'blockInstance'>[] = reordered.map((entity, index) => ({
      ...entity,
      orderIndex: index,
    }))
    entityList.value = normalized
    const updates = normalized.map((entity, index) => ({
      id: entity.id,
      orderIndex: index,
    }))
    await patchOrderIndex(updates)
  } catch (error) {
    logger.error('Failed to patch order index after main-zone instance drag', { error })
    syncMainZoneBlockInstanceLists(input)
  }
}

export function syncMainZoneBlockInstanceLists(input: {
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<'blockInstance'>[]>
  filteredEntities: ComputedRef<GlobalEntity<'blockInstance'>[]>
}): void {
  const { entityIds, entityList, filteredEntities } = input
  const sorted = sortEntitiesByOrderIndex<'blockInstance'>([...filteredEntities.value])
  entityList.value = sorted
  entityIds.value = sorted.map((entity) => entity.id)
}

export function syncGroupedZoneFromFiltered(input: {
  groupedEntityIds: Ref<string[]>
  groupedEntityList: Ref<GlobalEntity<'blockInstance'>[]>
  filteredGrouped: ComputedRef<GlobalEntity<'blockInstance'>[]>
}): void {
  const { groupedEntityIds, groupedEntityList, filteredGrouped } = input
  const sorted = sortEntitiesByOrderIndex<'blockInstance'>([...filteredGrouped.value])
  groupedEntityList.value = sorted
  groupedEntityIds.value = sorted.map((e) => e.id)
}

export function syncGroupedZoneFromBlockInstancesByShape(input: {
  blockShapeId: string
  groupedEntityIds: Ref<string[]>
  groupedEntityList: Ref<GlobalEntity<'blockInstance'>[]>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
}): void {
  const { blockShapeId, groupedEntityIds, groupedEntityList, blockInstancesByShape } = input
  const shapeList = (blockInstancesByShape.value.get(blockShapeId) ?? []) as GlobalEntity<'blockInstance'>[]
  const grouped = shapeList.filter((e) => !isAdminStandaloneSection(e))
  groupedEntityList.value = [...grouped]
  groupedEntityIds.value = grouped.map((e) => e.id)
}

export async function patchBlockInstanceOrderAfterGroupedZoneDrag(input: {
  blockShapeId: string
  groupedEntityIds: Ref<string[]>
  groupedEntityList: Ref<GlobalEntity<'blockInstance'>[]>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchOrderIndex: PatchOrderIndex
}): Promise<void> {
  const { blockShapeId, groupedEntityIds, groupedEntityList, blockInstancesByShape, patchOrderIndex } = input
  try {
    const all = (blockInstancesByShape.value.get(blockShapeId) ?? []) as GlobalEntity<'blockInstance'>[]
    const idToEntity = new Map(all.map((e) => [e.id, e]))
    const mainOrderedStable = all.filter((e) => isAdminStandaloneSection(e))
    const groupedOrdered = groupedEntityIds.value
      .map((id) => idToEntity.get(id as GlobalEntityId))
      .filter((e): e is GlobalEntity<'blockInstance'> => e !== undefined)
    const merged = [...mainOrderedStable, ...groupedOrdered]
    const updates = merged.map((entity, index) => ({
      id: entity.id,
      orderIndex: index,
    }))
    groupedEntityList.value = groupedOrdered
    await patchOrderIndex(updates)
  } catch (error) {
    logger.error('Failed to patch order index after grouped-zone instance drag', { error, blockShapeId })
    syncGroupedZoneFromBlockInstancesByShape({
      blockShapeId,
      groupedEntityIds,
      groupedEntityList,
      blockInstancesByShape,
    })
  }
}
