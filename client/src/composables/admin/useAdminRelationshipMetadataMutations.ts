/**
 * LEARNING: Admin Relationship Metadata Mutations Composable
 * WHY: Provides mutations for saving/deleting admin relationship metadata
 * PATTERN: Vue Query mutations with proper cache invalidation
 * 
 * This composable handles:
 * - Saving relationship field rendering configuration (POST with full entry)
 * - Deleting relationship field overrides (DELETE)
 * - Invalidating Vue Query cache after mutations
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminRelationshipMetadataEndpoint } from '@/utils/api'
import type { EntityMetadataType, FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * Save relationship field rendering configuration
 * Merges rendering updates with existing canonical fields and POSTs full entry
 * 
 * @param entityType - Entity type (blockShape, partShape, blockInstance, partInstance)
 * @param entityId - Entity ID (sentinel UUID for shapes, actual ID for instances)
 * @param relationshipKey - Relationship key to update (e.g., 'activeParts')
 * @param renderingUpdates - Rendering field updates (visibility, layout, displayOrder, etc.)
 */
export function useAdminRelationshipMetadataMutations() {
  const queryClient = useQueryClient()

  const saveRelationshipFieldRenderingMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      relationshipKey,
      renderingUpdates,
      existingMetadata,
    }: {
      entityType: EntityMetadataType
      entityId: string
      relationshipKey: string
      renderingUpdates: Partial<FieldMetadataEntry>
      existingMetadata: FieldMetadataEntry | undefined
    }) => {
      // LEARNING: NO FALLBACKS - existingMetadata is required for new fields
      // WHY: Canonical fields must be explicitly provided - no derivation from formFieldConfig
      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminRelationshipMetadataMutations] Missing existingMetadata for ${entityType}.${relationshipKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-relationship-metadata before updating rendering config.`
        )
      }

      // Use existing canonical fields
      const canonicalFields = {
        dataType: existingMetadata.dataType,
        label: existingMetadata.label,
        isRequired: existingMetadata.isRequired,
      }

      const fullEntry: {
        relationshipKey: string
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
        inputConfig?: Record<string, unknown> | null
        inheritsFromEntityType?: 'blockShape' | 'partShape' | null
        inheritsFromEntityId?: string | null
      } = {
        relationshipKey,
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
        // LEARNING: Include inputConfig from updates or existing metadata
        // WHY: inputConfig is required for select/multiselect/reference/partsCollection fields
        // PATTERN: Preserve inputConfig when updating rendering config
        inputConfig: renderingUpdates.inputConfig !== undefined 
          ? renderingUpdates.inputConfig 
          : existingMetadata.inputConfig ?? null,
        inheritsFromEntityType: existingMetadata.inheritsFromEntityType ?? null,
        inheritsFromEntityId: existingMetadata.inheritsFromEntityId ?? null,
      }

      const endpoint = getAdminRelationshipMetadataEndpoint(entityType, entityId)
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
            queryKey[0] === 'adminRelationshipMetadata' &&
            queryKey[1] === variables.entityType &&
            queryKey[2] === variables.entityId
          )
        },
      })
      // Also invalidate GlobalData cache since metadata is part of GlobalData
      queryClient.invalidateQueries({
        queryKey: ['globalData'],
      })
    },
  })

  const deleteRelationshipFieldOverrideMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      relationshipKey,
    }: {
      entityType: EntityMetadataType
      entityId: string
      relationshipKey: string
    }) => {
      const endpoint = `${getAdminRelationshipMetadataEndpoint(entityType, entityId)}/${relationshipKey}`
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
            queryKey[0] === 'adminRelationshipMetadata' &&
            queryKey[1] === variables.entityType &&
            queryKey[2] === variables.entityId
          )
        },
      })
      // Also invalidate GlobalData cache since metadata is part of GlobalData
      queryClient.invalidateQueries({
        queryKey: ['globalData'],
      })
    },
  })

  return {
    /**
     * Save relationship field rendering configuration
     * Merges rendering updates with existing canonical fields
     */
    saveRelationshipFieldRendering: async (
      entityType: EntityMetadataType,
      entityId: string,
      relationshipKey: string,
      renderingUpdates: Partial<FieldMetadataEntry>,
      existingMetadata?: FieldMetadataEntry
    ) => {
      return saveRelationshipFieldRenderingMutation.mutateAsync({
        entityType,
        entityId,
        relationshipKey,
        renderingUpdates,
        existingMetadata,
      })
    },

    /**
     * Delete relationship field override (instanceOverride mode only)
     */
    deleteRelationshipFieldOverride: async (
      entityType: EntityMetadataType,
      entityId: string,
      relationshipKey: string
    ) => {
      return deleteRelationshipFieldOverrideMutation.mutateAsync({
        entityType,
        entityId,
        relationshipKey,
      })
    },

    /**
     * Loading state for save operation
     */
    isSaving: saveRelationshipFieldRenderingMutation.isPending || deleteRelationshipFieldOverrideMutation.isPending,
  }
}
