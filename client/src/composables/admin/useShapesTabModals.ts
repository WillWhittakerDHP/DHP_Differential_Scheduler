/**
 * PATTERN: Modal state and toggles for Shapes tab metadata modals.
 * WHY: Keeps ShapesTab.vue under vue-architecture limits (script size, function count).
 */
import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UseShapesTabModalsReturn {
  blockShapeMetadataModalOpen: Ref<boolean>
  partShapeMetadataModalOpen: Ref<boolean>
  partInstanceMetadataModalOpen: Ref<boolean>
  annotationShapeMetadataModalOpen: Ref<boolean>
  annotationInstanceMetadataModalOpen: Ref<boolean>
  eventShapeMetadataModalOpen: Ref<boolean>
  eventInstanceMetadataModalOpen: Ref<boolean>
  toggleBlockShapeMetadataModal: () => void
  togglePartShapeMetadataModal: () => void
  togglePartInstanceMetadataModal: () => void
  handlePartInstanceMetadataSaved: () => void
  toggleAnnotationShapeMetadataModal: () => void
  toggleAnnotationInstanceMetadataModal: () => void
  handleAnnotationInstanceMetadataSaved: () => void
  toggleEventShapeMetadataModal: () => void
  toggleEventInstanceMetadataModal: () => void
  handleEventInstanceMetadataSaved: () => void
}

export function useShapesTabModals(): UseShapesTabModalsReturn {
  const blockShapeMetadataModalOpen = ref(false)
  const partShapeMetadataModalOpen = ref(false)
  const partInstanceMetadataModalOpen = ref(false)
  const annotationShapeMetadataModalOpen = ref(false)
  const annotationInstanceMetadataModalOpen = ref(false)
  const eventShapeMetadataModalOpen = ref(false)
  const eventInstanceMetadataModalOpen = ref(false)

  const toggleBlockShapeMetadataModal = (): void => {
    blockShapeMetadataModalOpen.value = !blockShapeMetadataModalOpen.value
  }

  const togglePartShapeMetadataModal = (): void => {
    partShapeMetadataModalOpen.value = !partShapeMetadataModalOpen.value
  }

  const togglePartInstanceMetadataModal = (): void => {
    partInstanceMetadataModalOpen.value = !partInstanceMetadataModalOpen.value
  }

  const handlePartInstanceMetadataSaved = (): void => {
    partInstanceMetadataModalOpen.value = false
  }

  const toggleAnnotationShapeMetadataModal = (): void => {
    annotationShapeMetadataModalOpen.value = !annotationShapeMetadataModalOpen.value
  }

  const toggleAnnotationInstanceMetadataModal = (): void => {
    annotationInstanceMetadataModalOpen.value = !annotationInstanceMetadataModalOpen.value
  }

  const handleAnnotationInstanceMetadataSaved = (): void => {
    annotationInstanceMetadataModalOpen.value = false
  }

  const toggleEventShapeMetadataModal = (): void => {
    eventShapeMetadataModalOpen.value = !eventShapeMetadataModalOpen.value
  }

  const toggleEventInstanceMetadataModal = (): void => {
    eventInstanceMetadataModalOpen.value = !eventInstanceMetadataModalOpen.value
  }

  const handleEventInstanceMetadataSaved = (): void => {
    eventInstanceMetadataModalOpen.value = false
  }

  return {
    blockShapeMetadataModalOpen,
    partShapeMetadataModalOpen,
    partInstanceMetadataModalOpen,
    annotationShapeMetadataModalOpen,
    annotationInstanceMetadataModalOpen,
    eventShapeMetadataModalOpen,
    eventInstanceMetadataModalOpen,
    toggleBlockShapeMetadataModal,
    togglePartShapeMetadataModal,
    togglePartInstanceMetadataModal,
    handlePartInstanceMetadataSaved,
    toggleAnnotationShapeMetadataModal,
    toggleAnnotationInstanceMetadataModal,
    handleAnnotationInstanceMetadataSaved,
    toggleEventShapeMetadataModal,
    toggleEventInstanceMetadataModal,
    handleEventInstanceMetadataSaved,
  }
}
