/**
 * PATTERN: Composable for metadata modal handlers
PATTERN: Composable that manages ...
 */
import { ref } from 'vue'
import type { UseMetadataModalHandlersReturn } from '@/types/admin/metadataModalHandlers'

export type { UseMetadataModalHandlersReturn } from '@/types/admin/metadataModalHandlers'

/**
 * WHY: Composable for managing metadata modal
WHY: Centralizes metadata modal s...
 */
export function useMetadataModalHandlers(): UseMetadataModalHandlersReturn {
  /**
   * PATTERN: Simple boolean ref for single modal state
   */
  const partInstanceMetadataModalOpen = ref(false)

  const togglePartInstanceMetadataModal = (): void => {
    partInstanceMetadataModalOpen.value = !partInstanceMetadataModalOpen.value
  }

  const handlePartInstanceMetadataSaved = (): void => {
    // PATTERN: Handler matches emit signature (no parameters)
    partInstanceMetadataModalOpen.value = false
  }

  return {
    partInstanceMetadataModalOpen,
    togglePartInstanceMetadataModal,
    handlePartInstanceMetadataSaved
  }
}
