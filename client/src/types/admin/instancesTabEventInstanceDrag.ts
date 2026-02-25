import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { AppLogger } from '@/utils/logger'

export interface UseInstancesTabEventInstanceDragParams {
  eventInstances: Ref<GlobalEntity<'eventInstance'>[]>
  patchEventInstanceOrderIndex: (updates: Record<string, number>) => Promise<void>
  logger: AppLogger
}
