/**
 * WHY: Component-logic audit - move async handleConfirm and .reduce() out of ComponentDistributionModal.
 */
import { ref, type Ref } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionStrategy } from '@/types/component'
import type { DistributionPreview } from '@/types/component'

export interface UseComponentDistributionConfirmOptions {
  preview: Ref<DistributionPreview[]>
  selectedStrategy: Ref<DistributionStrategy>
  getPropertyKey: () => string
  onConfirm: (
    strategy: DistributionStrategy,
    distributionValues?: Record<GlobalEntityId, Record<string, unknown>>
  ) => void
  onClose: () => void
}

export function useComponentDistributionConfirm(
  options: UseComponentDistributionConfirmOptions
): { handleConfirm: () => Promise<void>; isDistributing: Ref<boolean> } {
  const isDistributing = ref(false)
  const { preview, selectedStrategy, getPropertyKey, onConfirm, onClose } = options

  async function handleConfirm(): Promise<void> {
    isDistributing.value = true
    try {
      if (selectedStrategy.value === 'manual') {
        const propertyKey = getPropertyKey()
        const distributionValues = preview.value.reduce<
          Record<GlobalEntityId, Record<string, unknown>>
        >((acc, item) => {
          const existing = acc[item.componentId]
          acc[item.componentId] =
            existing !== undefined && existing !== null ? existing : {}
          acc[item.componentId][propertyKey] = item.newValue
          return acc
        }, {})
        onConfirm(selectedStrategy.value, distributionValues)
      } else {
        onConfirm(selectedStrategy.value, undefined)
      }
      onClose()
    } finally {
      isDistributing.value = false
    }
  }

  return { handleConfirm, isDistributing }
}
