/**
 * WHY: Entity Card Store Sync Composable
 * PATTERN: Composable that handles form ...
 */
import { computed, watch } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseEntityCardStoreSyncOptions, UseEntityCardStoreSyncReturn } from '@/types/admin/entityCardStoreSync'
import {
  applyEntityCardStoreSyncStep,
  planEntityCardStoreSync,
} from '@/utils/admin/entityCardStoreSyncSteps'

export function useEntityCardStoreSync<GE extends GlobalEntityKey>(
  options: UseEntityCardStoreSyncOptions<GE>
): UseEntityCardStoreSyncReturn<GE> {
  const { entityId, form, isNew, getStoreEntity, initialEntity } = options

  const storeEntity = computed(() => {
    if (isNew) {
      return undefined
    }
    return getStoreEntity()
  })

  if (!isNew) {
    let lastEntityId = String(entityId.value)

    watch(
      storeEntity,
      (newStoreEntity, oldStoreEntity) => {
        if (!newStoreEntity) {
          return
        }

        const formFieldKeys = form.values ? Object.keys(form.values) : []
        const step = planEntityCardStoreSync({
          newStoreEntity,
          oldStoreEntity,
          lastEntityId,
          initialEntity,
          formFieldKeys,
        })

        if (step.kind === 'reset') {
          lastEntityId = step.nextLastId
        }

        applyEntityCardStoreSyncStep(step, form)
      },
      { immediate: true, deep: true }
    )
  }

  return {
    storeEntity,
  }
}
