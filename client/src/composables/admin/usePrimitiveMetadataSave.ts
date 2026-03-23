/**
 */
import { useQueryClient } from '@tanstack/vue-query'
import type { EntityMetadataType } from '@/constants/fieldMetadata'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { SaveFieldMetadataMutationVariables } from '@/types/admin/fieldMetadataMutationVariables'

interface UsePrimitiveMetadataSaveOptions {
  getEntityType: () => EntityMetadataType | null
  getEntityId: () => string | null
  getPendingChanges: () => Record<string, Partial<FieldMetadataEntry>>
  getFieldMetadata: (fieldKey: string) => FieldMetadataEntry | undefined
  clearPendingState: () => void
  saveFieldMetadata: (params: SaveFieldMetadataMutationVariables) => Promise<unknown>
  getBlockShapeRef: () => string | undefined | null
  onSaved: () => void
  logger: { error: (msg: string, ctx?: unknown) => void; debug: (msg: string, ctx?: unknown) => void }
}

export function usePrimitiveMetadataSave(
  options: UsePrimitiveMetadataSaveOptions
): { handleSave: () => Promise<void> } {
  const queryClient = useQueryClient()
  const {
    getEntityType,
    getEntityId,
    getPendingChanges,
    getFieldMetadata,
    clearPendingState,
    saveFieldMetadata,
    getBlockShapeRef,
    onSaved,
    logger,
  } = options

  async function handleSave(): Promise<void> {
    const entityType = getEntityType()
    const entityId = getEntityId()
    if (!entityType || !entityId) {
      logger.error('Cannot save: invalid entityType or entityId')
      return
    }

    const pendingChanges = getPendingChanges()
    try {
      logger.debug('Starting save:', {
        entityType,
        entityId,
        blockShapeRef: getBlockShapeRef() || null,
        pendingChangesCount: Object.keys(pendingChanges).length,
        pendingChanges: Object.keys(pendingChanges),
      })

      for (const [fieldKey, updates] of Object.entries(pendingChanges)) {
        const existingMeta = getFieldMetadata(fieldKey)
        const finalUpdates = { ...updates }

        logger.debug('Saving field:', {
          fieldKey,
          updates: finalUpdates,
          hasExistingMeta: !!existingMeta,
          existingMeta,
        })

        await saveFieldMetadata({
          entityType,
          entityId,
          fieldKey,
          renderingUpdates: finalUpdates,
          existingMetadata: existingMeta,
          blockShapeRef: getBlockShapeRef() || null,
        })
      }

      try {
        await queryClient.refetchQueries({ queryKey: ['adminMetadata'] })
        logger.debug('Metadata cache refetched successfully')
      } catch (refetchError) {
        logger.error('Error refetching metadata cache:', refetchError)
      }

      clearPendingState()
      onSaved()
    } catch (error) {
      logger.error('Error saving metadata', error)
      throw error
    }
  }

  return { handleSave }
}
