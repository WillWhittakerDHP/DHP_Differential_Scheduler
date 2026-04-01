import type { Ref, ComponentPublicInstance, ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export type DragEndHandler = () => Promise<void>

export interface UseDragAndDropParams<EntityKey extends GlobalEntityKey = GlobalEntityKey> {
  containerRef: Ref<HTMLElement | undefined>
  panelsContainerRef: Ref<ComponentPublicInstance | HTMLElement | undefined>
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<EntityKey>[]>
  filteredEntities: ComputedRef<GlobalEntity<EntityKey>[]>
  dragEndHandler: DragEndHandler
  group: string
  draggableClass: string
  /** When set, drag starts only from this selector (e.g. grip). Omit to allow dragging from the whole draggable panel. */
  dragHandle?: string
}

export interface UseDragAndDropReturn {
  isMounted: Ref<boolean>
}
