/**
 */
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

interface UseBlockInstanceCreateOptions {
  modelValue: () => boolean
  entityCardRef: Ref<{ handleSave: () => Promise<void> } | null>
}

export function useBlockInstanceCreate(options: UseBlockInstanceCreateOptions): {
  tempEntityId: Ref<string>
  handleCreate: () => Promise<void>
} {
  const tempEntityId = ref<string>(`new-${Date.now()}`)

  watch(
    options.modelValue,
    (isOpen) => {
      if (isOpen) {
        tempEntityId.value = `new-${Date.now()}`
      }
    }
  )

  async function handleCreate(): Promise<void> {
    const ref = options.entityCardRef.value
    if (!ref) return
    await ref.handleSave()
  }

  return { tempEntityId, handleCreate }
}
