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
import { useGlobal } from '@/composables/useGlobal'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'

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
  const { getGlobalData } = useGlobal()

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
      
      // LEARNING: Get existingMetadata from unified metadata source (declarative - like dehydrateEntity gets from entity)
      // WHY: Ensure we're using the correct source for metadata entries
      // PATTERN: Get unified metadata from GlobalData, extract fieldKey entry (declarative object access)
      // Session 1.4.10: Unified metadata - single structure, no separation
      const globalData = getGlobalData()
      if (globalData?.metadata && !existingMetadata) {
        const metadata = globalData.metadata[entityType]?.[entityId] || {}
        // LEARNING: Direct access to fieldKey entry (declarative - like dehydrateEntity accesses entity fields)
        // WHY: Get existingMetadata from unified metadata source if not provided
        // PATTERN: Simple object property access, no filtering
        existingMetadata = metadata[fieldKey]
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
      console.log('[useAdminMetadataMutations] Saving metadata:', {
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
      
      console.log('[useAdminMetadataMutations] Save response:', response.data)
      
      return response.data
    },
    onSuccess: (_, variables) => {
      // LEARNING: Invalidate metadata queries using predicate for robust matching
      // WHY: Ensures all queries with matching entityType and entityId are invalidated
      //      This handles cases where query keys might be constructed differently
      // PATTERN: Use predicate to match query key pattern instead of exact key
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          // Match unified metadata endpoint pattern: ['globalData'] or ['admin-metadata', ...]
          return (
            (Array.isArray(queryKey) && queryKey[0] === 'globalData') ||
            (Array.isArray(queryKey) && queryKey[0] === 'admin-metadata' && 
             queryKey[1] === variables.entityType && queryKey[2] === variables.entityId)
          )
        },
      })
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
    onSuccess: (_, variables) => {
      // LEARNING: Invalidate metadata queries using predicate for robust matching
      // WHY: Ensures all queries with matching entityType and entityId are invalidated
      // PATTERN: Use predicate to match query key pattern instead of exact key
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          // Match unified metadata endpoint pattern: ['globalData'] or ['admin-metadata', ...]
          return (
            (Array.isArray(queryKey) && queryKey[0] === 'globalData') ||
            (Array.isArray(queryKey) && queryKey[0] === 'admin-metadata' && 
             queryKey[1] === variables.entityType && queryKey[2] === variables.entityId)
          )
        },
      })
    },
  })

  return {
    saveFieldMetadata: saveFieldMetadataMutation.mutate,
    deleteFieldMetadata: deleteFieldMetadataMutation.mutate,
    isSaving: saveFieldMetadataMutation.isPending,
    isDeleting: deleteFieldMetadataMutation.isPending,
  }
}
