import type { Ref, ComponentPublicInstance, ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'

export type DragEndHandler = () => Promise<void>

export interface UseDragAndDropParams {
  containerRef: Ref<HTMLElement | null>
  panelsContainerRef: Ref<ComponentPublicInstance | HTMLElement | null>
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<'blockShape'>[] | GlobalEntity<'partShape'>[]>
  filteredEntities: ComputedRef<GlobalEntity<'blockShape'>[] | GlobalEntity<'partShape'>[]>
  dragEndHandler: DragEndHandler
  group: string
  draggableClass: string
  /** When set, drag starts only from this selector (e.g. grip). Omit to allow dragging from the whole draggable panel. */
  dragHandle?: string
}

export interface UseDragAndDropReturn {
  isMounted: Ref<boolean>
}
