import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { AppLogger } from '@/utils/logger'
import type { OrderIndexUpdate } from '@/types/entityCrud/entityCrudTypes'

export interface UseInstancesTabEventInstanceDragParams {
  eventInstances: Ref<GlobalEntity<'eventInstance'>[]>
  patchEventInstanceOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
  logger: AppLogger
}
