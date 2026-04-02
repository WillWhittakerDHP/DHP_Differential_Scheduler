/**
 * WHY: FormKit drag setup for event instance expansion panels (e.g. block-instance segment list).
 */

import type { Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { animations } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import type { AppLogger } from '@/utils/logger'

export function mountEventInstancesDragAndDrop(input: {
  panelsContainerRef: Ref<ComponentPublicInstance | HTMLElement | null>
  eventInstanceIds: Ref<string[]>
  onDragEnd: () => void | Promise<void>
  logger: AppLogger
}): ReturnType<typeof dragAndDrop> | null {
  const { panelsContainerRef, eventInstanceIds, onDragEnd, logger } = input

  if (!panelsContainerRef.value) {
    return null
  }

  const holder = panelsContainerRef.value
  const panelsElement =
    holder instanceof HTMLElement
      ? holder
      : (holder.$el?.querySelector('.v-expansion-panels') as HTMLElement | null)

  if (!panelsElement) {
    return null
  }

  try {
    return dragAndDrop({
      parent: panelsElement,
      values: eventInstanceIds,
      draggable: (el: HTMLElement) =>
        el instanceof HTMLElement && el.classList?.contains('draggable-event-instance'),
      plugins: [animations()],
      handleEnd: () => {
        void onDragEnd()
      },
    })
  } catch (error) {
    logger.error('Error setting up event instances drag-and-drop', { error })
    return null
  }
}
