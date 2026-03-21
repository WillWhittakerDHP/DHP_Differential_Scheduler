import type { Ref } from 'vue'
import type { AppLogger } from '@/utils/logger'

export interface UseMetadataFieldDragParams {
  expansionPanelsRef: Ref<HTMLElement | { $el?: HTMLElement } | null>
  draggableFieldKeys: Ref<string[]>
  handleDragEnd: () => void
  logger: AppLogger
}
