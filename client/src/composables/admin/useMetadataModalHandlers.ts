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

  /**
   * LEARNING: Toggle global PartInstance metadata modal
   * WHY: Opens/closes the modal for configuring all PartInstance field definitions
   */
  const togglePartInstanceMetadataModal = (): void => {
    partInstanceMetadataModalOpen.value = !partInstanceMetadataModalOpen.value
  }

  /**
   * LEARNING: Handle PartInstance metadata saved
   * WHY: Close modal after saving field definitions
   */
  const handlePartInstanceMetadataSaved = (): void => {
    // LEARNING: MetadataEditModal emits 'saved' with no parameters
    // WHY: Modal doesn't need to pass entity back, just signals that save completed
    // PATTERN: Handler matches emit signature (no parameters)
    partInstanceMetadataModalOpen.value = false
  }

  return {
    partInstanceMetadataModalOpen,
    togglePartInstanceMetadataModal,
    handlePartInstanceMetadataSaved
  }
}
