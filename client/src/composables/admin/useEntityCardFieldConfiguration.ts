/**
 * Entity Card Field Configuration Composable
 * 
 * LEARNING: Extracts field configuration computed properties from EntityCard component
 * WHY: Reduces component complexity by moving field configuration logic to composable
 * PATTERN: Composable that provides field keys and layout configuration
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { useFieldLocation } from './useFieldLocation'

/**
 * Parameters for entity card field configuration
 */
export interface UseEntityCardFieldConfigurationParams {
  /**
   * Entity key
   */
  entityKey: GlobalEntityKey
  
  /**
   * Base field keys from metadata (before filtering)
   */
  fieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Composed field metadata (filtered or fetched)
   */
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  
  /**
   * Whether card is expanded
   */
  isExpanded: ComputedRef<boolean>
  
  /**
   * Optional filtered metadata from props
   */
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

/**
 * Return type for entity card field configuration
 */
export interface UseEntityCardFieldConfigurationReturn {
  /**
   * Final field keys (filtered if filteredMetadata provided, otherwise base fieldKeys)
   */
  finalFieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Field location categorization
   */
  fieldLocation: ReturnType<typeof useFieldLocation>
  
  /**
   * Inline fields configuration
   */
  inlineFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Stacked fields configuration
   */
  stackedFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

/**
 * LEARNING: Extract field configuration computed properties from EntityCard
 * WHY: Reduces component complexity by moving field configuration logic to composable
 * PATTERN: Composable that provides field keys and layout configuration
 */
export function useEntityCardFieldConfiguration(
  params: UseEntityCardFieldConfigurationParams
): UseEntityCardFieldConfigurationReturn {
  const { fieldKeys, composedFieldMetadata, isExpanded, filteredMetadata } = params

  // LEARNING: Handle filtered metadata prop for fieldKeys
  // WHY: When parent provides filtered metadata, use those keys exclusively
  // PATTERN: Override fieldKeys if filtered metadata is provided
  const finalFieldKeys = computed(() => {
    if (filteredMetadata && Object.keys(filteredMetadata).length > 0) {
      return Object.keys(filteredMetadata) as GlobalFieldKey<GlobalEntityKey>[]
    }
    return fieldKeys.value
  })

  /**
   * LEARNING: Use field location for field categorization
   * WHY: Single source of truth for WHERE fields render based on metadata
   * PATTERN: Composable that determines field locations from metadata + context
   */
  const fieldLocation = useFieldLocation({
    fieldKeys: finalFieldKeys,
    fieldMetadata: composedFieldMetadata,
    isExpanded: isExpanded
  })

  // LEARNING: Derive inline/stacked configs from fieldLocation
  // WHY: useFormFields needs inlineFieldsConfig/stackedFieldsConfig, but we can derive from fieldLocation
  // PATTERN: Extract from fieldLocation.fieldsByLocation after fieldLocation is computed
  const inlineFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directInline)
  const stackedFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directStacked)

  return {
    finalFieldKeys,
    fieldLocation,
    inlineFieldsConfig,
    stackedFieldsConfig
  }
}
