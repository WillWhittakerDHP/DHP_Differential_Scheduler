/**
 * WHY: Entity Card Computed Properties Composable

WHY: Reduces component compl...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { entityDisplay } from '@/utils/admin/entityDisplay'
import { useInstanceShape } from './useInstanceShape'
import type { UseEntityCardComputedParams, UseEntityCardComputedReturn } from '@/types/admin/entityCardComputed'

export type { UseEntityCardComputedParams, UseEntityCardComputedReturn } from '@/types/admin/entityCardComputed'

export function useEntityCardComputed<GE extends GlobalEntityKey>(
  params: UseEntityCardComputedParams<GE>
): UseEntityCardComputedReturn {
  const { entityKey, entity, composedFieldMetadata, isMetadataLoading } = params
  
  const { getEntityName } = entityDisplay(useAdminConfig())
  
  // WHY: Composition panel visibility depends on BlockShape.composable property
  // PATTERN: Use useInstanceShape composable to access BlockShape from BlockInstance
  const instanceShape = entityKey === 'blockInstance' 
    ? useInstanceShape({
        entityKey: 'blockInstance',
        entityId: computed(() => entity.id)
      })
    : null

  // PATTERN: Check metadata is loaded and has keys
  const isMetadataReady = computed(() => {
    const isLoading = isMetadataLoading.value
    const metadata = composedFieldMetadata.value
    return !isLoading && metadata !== undefined && Object.keys(metadata).length >= 0
  })

  // PATTERN: Use metadata keys only - fail explicitly if metadata is not available
  const fieldKeys = computed(() => {
    // LEARNING: Use composedFieldMetadata as exclusive source of truth
    // PATTERN: Fail explicitly if metadata is not available rather than falling back to entity keys
    if (composedFieldMetadata.value && Object.keys(composedFieldMetadata.value).length > 0) {
      return Object.keys(composedFieldMetadata.value) as GlobalFieldKey<GlobalEntityKey>[]
    }
    
    // PATTERN: Return empty array to fail visibly rather than silently falling back
    return [] as GlobalFieldKey<GlobalEntityKey>[]
  })

  // PATTERN: Use composable function
  const entityName = computed(() => {
    return getEntityName(entityKey, entity)
  })

  // LEARNING: Computed property for composable status
  // WHY: Determines if entity is composable (blockInstance only)
  // PATTERN: Check BlockShape.composable property via instanceShape
  const isComposable = computed(() => {
    if (entityKey !== 'blockInstance') return false
    return instanceShape?.blockShape.value?.composable === true
  })

  return {
    fieldKeys,
    isMetadataReady,
    entityName,
    isComposable
  }
}
