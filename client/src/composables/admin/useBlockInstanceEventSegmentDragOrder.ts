/**
 * Drag-and-drop order for event instances list (same pattern as former Instances tab).
 */
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  type ComputedRef,
  type ComponentPublicInstance,
} from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { mountEventInstancesDragAndDrop } from '@/utils/admin/mountEventInstancesDragAndDrop'
import { createLogger } from '@/utils/logger'
import type { UseBlockInstanceEventSegmentDragOrderReturn } from '@/types/admin/blockInstanceEventSegments'
import type { OrderIndexUpdate } from '@/types/entityCrud/entityCrudTypes'

const logger = createLogger('useBlockInstanceEventSegmentDragOrder')

export interface UseBlockInstanceEventSegmentDragOrderParams {
  filteredEventInstances: ComputedRef<GlobalEntity<'eventInstance'>[]>
  patchEventInstanceOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
}

export function useBlockInstanceEventSegmentDragOrder(
  params: UseBlockInstanceEventSegmentDragOrderParams
): UseBlockInstanceEventSegmentDragOrderReturn {
  const { filteredEventInstances, patchEventInstanceOrderIndex } = params

  const eventInstancesList = ref<GlobalEntity<'eventInstance'>[]>([])
  const eventInstanceIds = ref<string[]>([])
  const eventInstancesContainer = ref<HTMLElement | null>(null)
  const eventInstancesPanelsContainer = ref<ComponentPublicInstance | HTMLElement | null>(null)

  const eventInstancesDragHandlers = useEntityDragHandlers({
    entityIds: eventInstanceIds,
    entityList: eventInstancesList,
    filteredEntities: filteredEventInstances,
    patchOrderIndex: async (updates) => {
      await patchEventInstanceOrderIndex(updates)
    },
  })

  watch(
    filteredEventInstances,
    () => {
      eventInstancesDragHandlers.syncArrays()
    },
    { immediate: true }
  )

  onMounted(() => {
    void nextTick(() => {
      mountEventInstancesDragAndDrop({
        panelsContainerRef: eventInstancesPanelsContainer,
        eventInstanceIds,
        onDragEnd: () => eventInstancesDragHandlers.handleDragEnd(),
        logger,
      })
    })
  })

  const eventInstancesDisplay = computed((): GlobalEntity<'eventInstance'>[] => {
    const list = eventInstancesList.value
    const filtered = filteredEventInstances.value
    return list.length > 0 ? list : filtered
  })

  function bindEventInstancesContainer(el: unknown): void {
    eventInstancesContainer.value = (el as HTMLElement | null) ?? null
  }

  function bindEventInstancesPanelsContainer(el: unknown): void {
    if (el == null) {
      return
    }
    eventInstancesPanelsContainer.value = el as ComponentPublicInstance | HTMLElement
  }

  return {
    eventInstancesDisplay,
    eventInstancesList,
    eventInstancesContainer,
    eventInstancesPanelsContainer,
    bindEventInstancesContainer,
    bindEventInstancesPanelsContainer,
  }
}
