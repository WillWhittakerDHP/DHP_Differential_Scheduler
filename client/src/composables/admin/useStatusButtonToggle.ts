/**
 * WHY: Reusable status button toggle composable
PATTERN: Pure configuration-bas...
 */
import { ref, computed } from 'vue'
import { usePrimitiveMutation } from '@/composables/entityCrud/usePrimitiveMutation'
import { useGlobal } from '../useGlobal'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import type { UseStatusButtonToggleOptions, UseStatusButtonToggleReturn } from '@/types/admin/statusButtonToggle'
import {
  buildBooleanTogglePayloads,
  buildTernaryTogglePayloads,
  isTernaryStringValue,
  type StatusToggleMutationPayload,
} from '@/utils/admin/statusButtonTogglePayloads'

const logger = createLogger('useStatusButtonToggle')

/**
 * WHY: Reusable status button toggle composable
PATTERN: Pure composable that h...
 */
export function useStatusButtonToggle<GE extends GlobalEntityKey>(
  options: UseStatusButtonToggleOptions<GE>
): UseStatusButtonToggleReturn<GE> {
  const { entityKey, entityId, onToggle } = options

  const { getGlobalEntityById } = useGlobal()

  const entityIdRef = computed(() => (typeof entityId === 'string' ? entityId : entityId.value))

  const entityRef = computed<GlobalEntity<GE> | undefined>(() =>
    getGlobalEntityById(entityKey, entityIdRef.value)
  )

  const { mutateAsync } = usePrimitiveMutation(entityKey)

  const pendingToggles = ref(new Set<string>())

  const runTogglePayloads = async (payloads: StatusToggleMutationPayload[]): Promise<void> => {
    for (const payload of payloads) {
      await mutateAsync(payload)
    }
  }

  const toggleStatusButton = async (fieldKey: GlobalFieldKey<GE>, event?: Event): Promise<void> => {
    const currentEntity = entityRef.value
    if (!currentEntity) {
      return
    }

    const toggleKey = `${currentEntity.id}-${String(fieldKey)}`

    if (pendingToggles.value.has(toggleKey)) {
      return
    }

    pendingToggles.value.add(toggleKey)

    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }

    try {
      const currentRaw = currentEntity[fieldKey]

      if (isTernaryStringValue(currentRaw)) {
        const payloads = buildTernaryTogglePayloads(currentEntity.id, String(fieldKey), currentRaw)
        await runTogglePayloads(payloads)
        onToggle?.(String(fieldKey))
        return
      }

      const boolPayloads = buildBooleanTogglePayloads(entityKey, currentEntity, fieldKey, currentRaw)
      if (!boolPayloads) {
        pendingToggles.value.delete(toggleKey)
        return
      }

      await runTogglePayloads(boolPayloads)
      onToggle?.(String(fieldKey))
    } catch (error) {
      logger.warn('Failed to toggle status button', { error, entityKey, entityId, fieldKey })
    } finally {
      pendingToggles.value.delete(toggleKey)
    }
  }

  return {
    toggleStatusButton,
  }
}
