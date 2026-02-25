/**
 * WHY: Component-logic audit - move .map() out of ServiceSelectCards.
 */
import { computed, type Ref } from 'vue'

export function useServiceSelectMapper(
  selectedServiceTypeBlocks: Ref<Array<{ id: string }>>
): Ref<string[]> {
  return computed(() => selectedServiceTypeBlocks.value.map((s) => s.id))
}
