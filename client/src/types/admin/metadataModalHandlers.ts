import type { Ref } from 'vue'

/** Slice shared with UseShapesTabModalsReturn (single definition for part-instance modal handlers). */
export interface PartInstanceMetadataModalHandlersSlice {
  partInstanceMetadataModalOpen: Ref<boolean>
  togglePartInstanceMetadataModal: () => void
  handlePartInstanceMetadataSaved: () => void
}

