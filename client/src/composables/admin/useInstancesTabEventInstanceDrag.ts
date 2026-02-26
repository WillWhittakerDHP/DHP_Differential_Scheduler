/**
 * PATTERN: Event instance list, drag state, and drag-and-drop setup for Instances tab.
 * WHY: Keeps InstancesTab.vue under vue-architecture script line limit.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, type ComponentPublicInstance } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { animations } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import type { Ref, ComputedRef } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { UseInstancesTabEventInstanceDragParams } from '@/types/admin/instancesTabEventInstanceDrag'


export interface UseInstancesTabEventInstanceDragReturn {
  eventInstancesList: Ref<GlobalEntity<'eventInstance'>[]>
  eventInstanceIds: Ref<string[]>
  eventInstancesContainer: Ref<HTMLElement | null>
  eventInstancesPanelsContainer: Ref<ComponentPublicInstance | HTMLElement | null>
  filteredEventInstances: ComputedRef<GlobalEntity<'eventInstance'>[]>
  eventInstancesDragHandlers: ReturnType<typeof useEntityDragHandlers>
}

export function useInstancesTabEventInstanceDrag(params: UseInstancesTabEventInstanceDragParams): UseInstancesTabEventInstanceDragReturn {
  const { eventInstances, patchEventInstanceOrderIndex, logger } = params

  const eventInstancesList = ref<GlobalEntity<'eventInstance'>[]>([])
  const eventInstanceIds = ref<string[]>([])
  const eventInstancesContainer = ref<HTMLElement | null>(null)
  const eventInstancesPanelsContainer = ref<ComponentPublicInstance | HTMLElement | null>(null)

  const filteredEventInstances = computed(() =>
    [...eventInstances.value].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  )

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

  let eventInstancesDragInstance: ReturnType<typeof dragAndDrop> | null = null

  onMounted(() => {
    nextTick(() => {
      if (!eventInstancesPanelsContainer.value) return
      const panelsElement =
        eventInstancesPanelsContainer.value instanceof HTMLElement
          ? eventInstancesPanelsContainer.value
          : (eventInstancesPanelsContainer.value.$el?.querySelector('.v-expansion-panels') as HTMLElement)
      if (!panelsElement) return
      try {
        eventInstancesDragInstance = dragAndDrop({
          parent: panelsElement,
          values: eventInstanceIds,
          draggable: (el: HTMLElement) =>
            el instanceof HTMLElement && el.classList?.contains('draggable-event-instance'),
          plugins: [animations()],
          handleEnd: () => {
            eventInstancesDragHandlers.handleDragEnd()
          },
        })
      } catch (error) {
        logger.error('Error setting up event instances drag-and-drop', { error })
      }
    })
  })

  onBeforeUnmount(() => {
    if (eventInstancesDragInstance) {
      eventInstancesDragInstance = null
    }
  })

  return {
    eventInstancesList,
    eventInstanceIds,
    eventInstancesContainer,
    eventInstancesPanelsContainer,
    filteredEventInstances,
    eventInstancesDragHandlers,
  }
}
