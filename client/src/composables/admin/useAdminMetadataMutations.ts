/**
 * LEARNING: Unified Admin Metadata Mutations Composable
 * WHY: Single composable for saving/deleting all metadata (primitives + relationships)
 *      Follows entity pattern - single mutation, backend routes based on fieldKey type
 * PATTERN: Vue Query mutations with proper cache invalidation
 * 
 * This composable handles:
 * - Saving field rendering configuration (POST with full entry)
 * - Deleting field overrides (DELETE)
 * - Invalidating Vue Query cache after mutations
 * 
 * LEARNING: No metadataType parameter - backend determines type by checking RELATIONSHIP_KEYS
 * WHY: Matches entity pattern where mutations accept all fields, backend routes based on type
 * PATTERN: Frontend sends fieldKey, backend checks RELATIONSHIP_KEYS to determine metadataType
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminMetadataEndpoint } from '@/utils/api'
import type { EntityMetadataType, FieldMetadataEntry } from '@/types/entityMetadata'
import { buildMetadataEntry } from '@/utils/admin/buildMetadataEntry'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAdminMetadataMutations')

/**
 * Save field rendering configuration
 * Merges rendering updates with existing canonical fields and POSTs full entry
 * 
 * LEARNING: Accepts fieldKey (not relationshipKey) - backend determines metadataType
 * WHY: Matches entity pattern - mutations accept all fields, backend routes based on type
 * PATTERN: Frontend doesn't need to know type - backend checks RELATIONSHIP_KEYS
 * 
 * @param entityType - Entity type (blockShape, partShape, blockInstance, partInstance)
 * @param entityId - Entity ID (sentinel UUID for shapes, actual ID for instances)
 * @param fieldKey - Field key to update (unified - works for both primitives and relationships)
 * @param renderingUpdates - Rendering field updates (visibility, layout, displayOrder, etc.)
 */
export function useAdminMetadataMutations() {
  const queryClient = useQueryClient()
  const { getFieldMetadata } = useMetadataCache()

  const saveFieldMetadataMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      renderingUpdates,
      existingMetadata,
      blockShapeRef,
    }: {
      entityType: EntityMetadataType
      entityId: string
      fieldKey: string
      renderingUpdates: Partial<FieldMetadataEntry>
      existingMetadata: FieldMetadataEntry | undefined
      blockShapeRef?: string | null
    }) => {
      // LEARNING: Use existingMetadata as-is (like dehydrateEntity accepts fields as-is)
      // WHY: Accept what's passed, don't filter or validate - declarative transformation only
      // PATTERN: Like entity mutations accept fields (primitives + relationships) and dehydrate together
      //          Metadata mutations should accept existingMetadata and use it directly
      
      // LEARNING: Get existingMetadata from metadata cache if not provided
      // WHY: Ensure we're using the correct source for metadata entries
      // PATTERN: Use lazy-loaded metadata cache instead of globalData
      if (!existingMetadata) {
        existingMetadata = getFieldMetadata(entityType, fieldKey, blockShapeRef)
      }

      // LEARNING: NO FALLBACKS - existingMetadata is required for new fields
      // WHY: Canonical fields must be explicitly provided - no derivation from formFieldConfig
      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminMetadataMutations] Missing existingMetadata for ${entityType}.${fieldKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-metadata before updating rendering config.`
        )
      }

      // LEARNING: Determine if this is a relationship key (for buildMetadataEntry)
      // WHY: buildMetadataEntry needs to know if it's a relationship for proper defaults
      // PATTERN: Check RELATIONSHIP_KEYS to determine type (matches backend logic)
      const isRelationship = fieldKey in RELATIONSHIP_KEYS

      // LEARNING: Use shared utility to build metadata entry
      // WHY: Eliminates duplication, consistent entry building
      // PATTERN: Extract common logic to shared utility function
      const fullEntry = {
        ...buildMetadataEntry({
          key: fieldKey,
          renderingUpdates,
          existingMetadata,
          isRelationship
        }),
        fieldKey,
        blockShapeRef: blockShapeRef || null, // Include blockShapeRef for BlockShape-specific instance metadata
      } as { fieldKey: string; blockShapeRef: string | null } & Record<string, unknown>

      const endpoint = getAdminMetadataEndpoint(entityType, entityId)
      
      // LEARNING: Debug logging to trace save flow
      // WHY: Help diagnose why saves aren't persisting
      logger.debug('Saving metadata:', {
        endpoint,
        entityType,
        entityId,
        fieldKey,
        blockShapeRef: blockShapeRef || null,
        fullEntry,
        hasExistingMetadata: !!existingMetadata,
        isRelationship
      })
      
      const response = await apiClient.post(endpoint, fullEntry)
      
      logger.debug('Save response:', response.data)
      
      return response.data
    },
    onSuccess: () => {
      // LEARNING: Refetch handled manually in handleSave to await completion
      // WHY: Need to await refetch before clearing pendingChanges to prevent UI flash
      // PATTERN: Manual refetch in handleSave after mutations complete
    },
  })

  const deleteFieldMetadataMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      blockShapeRef,
    }: {
      entityType: EntityMetadataType
      entityId: string
      fieldKey: string
      blockShapeRef?: string | null
    }) => {
      const endpoint = `${getAdminMetadataEndpoint(entityType, entityId)}/${fieldKey}`
      // Include blockShapeRef as query parameter for DELETE
      const url = blockShapeRef ? `${endpoint}?blockShapeRef=${blockShapeRef}` : endpoint
      await apiClient.delete(url)
    },
    onSuccess: () => {
      // LEARNING: Refetch handled manually in handleSave to await completion
      // WHY: Need to await refetch before clearing pendingChanges to prevent UI flash
      // PATTERN: Manual refetch in handleSave after mutations complete
    },
  })

  return {
    saveFieldMetadata: saveFieldMetadataMutation.mutateAsync,
    deleteFieldMetadata: deleteFieldMetadataMutation.mutateAsync,
    isSaving: saveFieldMetadataMutation.isPending,
    isDeleting: deleteFieldMetadataMutation.isPending,
  }
}
