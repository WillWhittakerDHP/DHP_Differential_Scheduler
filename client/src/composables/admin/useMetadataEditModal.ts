/**
 * WHY: Component-logic audit - move async handleSave out of MetadataEditModal.
 */
import type { Ref } from 'vue'

export interface MetadataEditorSaveRef {
  save: () => Promise<void>
}

export interface UseMetadataEditModalOptions {
  editorRef: Ref<MetadataEditorSaveRef | null>
  showError: (message: string) => void
  getErrorMessage: (err: unknown) => string
  logger: { error: (msg: string, ctx?: unknown) => void }
}

export function useMetadataEditModal(options: UseMetadataEditModalOptions): {
  handleSave: () => Promise<void>
} {
  const { editorRef, showError, getErrorMessage, logger } = options

  async function handleSave(): Promise<void> {
    if (!editorRef.value) {
      showError('Editor not available')
      return
    }
    try {
      await editorRef.value.save()
    } catch (err) {
      logger.error('Error saving metadata', { err })
      showError(getErrorMessage(err))
    }
  }
  return { handleSave }
}
