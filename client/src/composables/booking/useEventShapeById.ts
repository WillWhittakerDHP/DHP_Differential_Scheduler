/**
 * WHY: Component-logic audit - move .map() out of DevPanelsContainer.
 * Returns a computed Map from event shape id to EventShape.
 */
import { computed, type Ref } from 'vue'
import type { EventShape } from '@/types/events'

export function useEventShapeById(eventShapes: Ref<EventShape[]>) {
  return computed(() => new Map(eventShapes.value.map((es) => [es.id, es])))
}
