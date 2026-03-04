/**
 */
import { watch, type Ref } from 'vue'
import type { GlobalEntityId } from '@/types/entities'

export function useEntityIdReset(
  entityId: () => GlobalEntityId | undefined | null,
  currentEntityId: Ref<GlobalEntityId>
): void {
  watch(
    entityId,
    (newId) => {
      if (newId) {
        currentEntityId.value = newId
      }
    },
    { immediate: true }
  )
}
