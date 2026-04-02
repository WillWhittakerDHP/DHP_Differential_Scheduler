/**
 * Event instances filtered to one block instance (parentBlockInstanceId) + CRUD handles.
 */
import { computed, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import type { UseBlockInstanceEventInstancesForParentReturn } from '@/types/admin/blockInstanceEventSegments'

function segmentBelongsToBlockInstance(
  entity: GlobalEntity<'eventInstance'>,
  parentId: GlobalEntityId
): boolean {
  const p = entity.parentBlockInstanceId
  return p != null && String(p).trim() !== '' && String(p) === String(parentId)
}

export function useBlockInstanceEventInstancesForParent(
  blockInstanceIdProp: Ref<string>
): UseBlockInstanceEventInstancesForParentReturn {
  const blockInstanceId = computed((): GlobalEntityId => toGlobalEntityId(blockInstanceIdProp.value))

  const {
    entities: eventInstances,
    create: createEventInstance,
    patchOrderIndex: patchEventInstanceOrderIndex,
    remove: removeEventInstance,
  } = useEntityCrud('eventInstance')

  const filteredEventInstances = computed((): GlobalEntity<'eventInstance'>[] => {
    const pid = blockInstanceId.value
    return [...eventInstances.value]
      .filter((e) => segmentBelongsToBlockInstance(e, pid))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })

  const hasEventInstances = computed(() => filteredEventInstances.value.length > 0)
  const isLoadingEventInstances = computed(() => false)

  return {
    blockInstanceId,
    filteredEventInstances,
    hasEventInstances,
    isLoadingEventInstances,
    createEventInstance,
    patchEventInstanceOrderIndex,
    removeEventInstance,
  }
}
