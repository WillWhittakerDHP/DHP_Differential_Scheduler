/**
 * Composable for metadata modal handlers
 * WHY: Extracts metadata modal handler logic from ShapesTab
 * PATTERN: Composable that manages modal state and handlers
 */

import { ref, type Ref } from 'vue'

export interface UseMetadataModalHandlersReturn {
  partInstanceMetadataModalOpen: Ref<boolean>
  togglePartInstanceMetadataModal: () => void
  handlePartInstanceMetadataSaved: () => void
}

/**
 * Composable for managing metadata modal
 * WHY: Centralizes metadata modal state and handlers
 * PATTERN: Returns reactive state and handler functions
 */
export function useMetadataModalHandlers(): UseMetadataModalHandlersReturn {
  /**
   * LEARNING: Track if the global PartInstance metadata modal is open
   * WHY: Single modal for configuring all PartInstance field definitions globally
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
