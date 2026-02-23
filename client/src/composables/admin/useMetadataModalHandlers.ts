/**
 * PATTERN: Composable for metadata modal handlers
PATTERN: Composable that manages ...
 */
import { ref, type Ref } from 'vue'

export interface UseMetadataModalHandlersReturn {
  partInstanceMetadataModalOpen: Ref<boolean>
  togglePartInstanceMetadataModal: () => void
  handlePartInstanceMetadataSaved: () => void
}

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
