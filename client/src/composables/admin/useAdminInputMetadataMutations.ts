/**
 * LEARNING: Admin Input Metadata Mutations Composable
 * WHY: Provides mutations for saving/deleting admin input metadata
 * PATTERN: Vue Query mutations with proper cache invalidation
 * 
 * This composable handles:
 * - Saving field rendering configuration (POST with full entry)
 * - Deleting field overrides (DELETE)
 * - Invalidating Vue Query cache after mutations
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminInputMetadataEndpoint } from '@/utils/api'
import type { EntityMetadataType, FieldMetadataEntry } from '@/types/entityMetadata'
import { useAdminConfig } from '@/composables/useAdminConfig'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * Save field rendering configuration
 * Merges rendering updates with existing canonical fields and POSTs full entry
 * 
 * @param entityType - Entity type (blockShape, partShape, blockInstance, partInstance)
 * @param entityId - Entity ID (sentinel UUID for shapes, actual ID for instances)
 * @param fieldKey - Field key to update
 * @param renderingUpdates - Rendering field updates (visibility, layout, displayOrder, etc.)
 */
export function useAdminInputMetadataMutations() {
  const queryClient = useQueryClient()
  const adminConfig = useAdminConfig()

  const saveFieldRenderingMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      renderingUpdates,
      existingMetadata,
    }: {
      entityType: EntityMetadataType
      entityId: string
      fieldKey: string
      renderingUpdates: Partial<FieldMetadataEntry>
      existingMetadata: FieldMetadataEntry | undefined
    }) => {
      // LEARNING: NO FALLBACKS - existingMetadata is required for new fields
      // WHY: Canonical fields must be explicitly provided - no derivation from formFieldConfig
      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminInputMetadataMutations] Missing existingMetadata for ${entityType}.${fieldKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-input-metadata before updating rendering config.`
        )
      }

      // Use existing canonical fields
      const canonicalFields = {
        dataType: existingMetadata.dataType,
        label: existingMetadata.label,
        isRequired: existingMetadata.isRequired,
      }

      const fullEntry: {
        fieldKey: string
        dataType: 'string' | 'number' | 'boolean' | 'array' | 'reference'
        label: string
        isRequired: boolean
        visibility: FieldMetadataEntry['visibility']
        layout: FieldMetadataEntry['layout']
        displayOrder: number
        section?: string | null
        renderAs: FieldMetadataEntry['renderAs']
        statusButtonColor?: string | null
        panel: FieldMetadataEntry['panel']
        bulkEdit: boolean
        inheritsFromEntityType?: 'blockShape' | 'partShape' | null
        inheritsFromEntityId?: string | null
      } = {
        fieldKey,
        // Canonical fields (from existing metadata or derived)
        dataType: canonicalFields.dataType,
        label: canonicalFields.label,
        isRequired: canonicalFields.isRequired,
        // Rendering fields: use updates if provided, otherwise existing values - NO DEFAULTS
        visibility: renderingUpdates.visibility ?? existingMetadata.visibility,
        layout: renderingUpdates.layout ?? existingMetadata.layout,
        displayOrder: renderingUpdates.displayOrder ?? existingMetadata.displayOrder,
        section: renderingUpdates.section ?? existingMetadata.section,
        renderAs: renderingUpdates.renderAs ?? existingMetadata.renderAs,
        statusButtonColor: renderingUpdates.statusButtonColor ?? existingMetadata.statusButtonColor,
        panel: renderingUpdates.panel ?? existingMetadata.panel,
        bulkEdit: renderingUpdates.bulkEdit ?? existingMetadata.bulkEdit,
        inheritsFromEntityType: existingMetadata.inheritsFromEntityType ?? null,
        inheritsFromEntityId: existingMetadata.inheritsFromEntityId ?? null,
      }

      const endpoint = getAdminInputMetadataEndpoint(entityType, entityId)
      const response = await apiClient.post(endpoint, fullEntry)
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
          return (
            queryKey[0] === 'adminInputMetadata' &&
            queryKey[1] === variables.entityType &&
            queryKey[2] === variables.entityId
          )
        },
      })
    },
  })

  const deleteFieldOverrideMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
    }: {
      entityType: EntityMetadataType
      entityId: string
      fieldKey: string
    }) => {
      const endpoint = `${getAdminInputMetadataEndpoint(entityType, entityId)}/${fieldKey}`
      await apiClient.delete(endpoint)
    },
    onSuccess: (_, variables) => {
      // LEARNING: Invalidate metadata queries using predicate for robust matching
      // WHY: Ensures all queries with matching entityType and entityId are invalidated
      //      This handles cases where query keys might be constructed differently
      // PATTERN: Use predicate to match query key pattern instead of exact key
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return (
            queryKey[0] === 'adminInputMetadata' &&
            queryKey[1] === variables.entityType &&
            queryKey[2] === variables.entityId
          )
        },
      })
    },
  })

  return {
    /**
     * Save field rendering configuration
     * Merges rendering updates with existing canonical fields
     */
    saveFieldRendering: async (
      entityType: EntityMetadataType,
      entityId: string,
      fieldKey: string,
      renderingUpdates: Partial<FieldMetadataEntry>,
      existingMetadata?: FieldMetadataEntry
    ) => {
      return saveFieldRenderingMutation.mutateAsync({
        entityType,
        entityId,
        fieldKey,
        renderingUpdates,
        existingMetadata,
      })
    },

    /**
     * Delete field override (instanceOverride mode only)
     */
    deleteFieldOverride: async (
      entityType: EntityMetadataType,
      entityId: string,
      fieldKey: string
    ) => {
      return deleteFieldOverrideMutation.mutateAsync({
        entityType,
        entityId,
        fieldKey,
      })
    },

    /**
     * Loading state for save operation
     */
    isSaving: saveFieldRenderingMutation.isPending || deleteFieldOverrideMutation.isPending,
  }
}
