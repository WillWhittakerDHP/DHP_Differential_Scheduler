import type { Ref } from 'vue'

export interface UseMetadataModalHandlersReturn {
  partInstanceMetadataModalOpen: Ref<boolean>
  togglePartInstanceMetadataModal: () => void
  handlePartInstanceMetadataSaved: () => void
}
