/**
 * Field Component Composable
 * 
 * LEARNING: Vue composable wrapper around fieldComponentDispatcher
 * WHY: Provides reactive component type determination, parallel to useFieldLocation
 * PATTERN: Composable that wraps pure dispatcher function for Vue reactivity
 * 
 * This composable handles:
 * - Reactive metadata fetching/access
 * - Component type determination via dispatcher
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useEntityMetadata } from './useEntityMetadata'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { getFieldComponent, type FieldComponent } from '@/utils/forms/fieldComponentDispatcher'

export interface UseFieldComponentOptions {
  /**
   * LEARNING: Entity key for field
   * WHY: Needed to retrieve field metadata
   * PATTERN: GlobalEntityKey type
   */
  entityKey: Ref<GlobalEntityKey | undefined> | ComputedRef<GlobalEntityKey | undefined> | GlobalEntityKey | undefined
  
  /**
   * LEARNING: Field key
   * WHY: Needed to retrieve field metadata
   * PATTERN: GlobalFieldKey type
   */
  fieldKey: Ref<GlobalFieldKey<GlobalEntityKey> | undefined> | ComputedRef<GlobalFieldKey<GlobalEntityKey> | undefined> | GlobalFieldKey<GlobalEntityKey> | undefined

  /**
   * LEARNING: Entity instance (optional - for metadata fetch)
   * WHY: useEntityMetadata needs entity to determine entityId
   * PATTERN: Can be Ref, ComputedRef, or direct value
   */
  entity?: Ref<GlobalEntity<GlobalEntityKey> | null> | ComputedRef<GlobalEntity<GlobalEntityKey> | null> | GlobalEntity<GlobalEntityKey> | null

  /**
   * LEARNING: Pre-fetched field metadata (optional)
   * WHY: Avoids duplicate metadata fetches when parent component already has metadata
   * PATTERN: Pass metadata from parent to avoid re-fetching in FieldRenderer
   */
  fieldMetadata?: ComputedRef<Record<string, FieldMetadataEntry>> | Ref<Record<string, FieldMetadataEntry>>
}

export interface UseFieldComponentReturn {
  /**
   * LEARNING: Component type determined by dispatcher
   * WHY: Single source of truth for component type - use this instead of boolean flags
   * PATTERN: Discriminated union type from fieldComponentDispatcher
   */
  componentType: ComputedRef<FieldComponent>
  
  /**
   * LEARNING: Field metadata entry for this field
   * WHY: Contains renderAs, dataType, inputConfig needed for component determination and diagnostics
   * PATTERN: Exposed to avoid duplicate computation in components
   */
  fieldMetadataEntry: ComputedRef<FieldMetadataEntry | undefined>
  
  /**
   * @deprecated Use componentType instead
   */
  isIcon: ComputedRef<boolean>
  
  /**
   * @deprecated Use componentType instead
   */
  isPrimitive: ComputedRef<boolean>
  
  /**
   * @deprecated Use componentType instead
   */
  isPartsCollection: ComputedRef<boolean>
  
  /**
   * @deprecated Use componentType instead
   */
  isRelationshipCollection: ComputedRef<boolean>
}

/**
 * Field Component Composable
 * 
 * LEARNING: Provides reactive component type determination using dispatcher
 * WHY: Wraps pure dispatcher function for Vue reactivity, parallel to useFieldLocation
 * PATTERN: Composable that uses getFieldComponent() dispatcher internally
 */
export function useFieldComponent(
  options: UseFieldComponentOptions
): UseFieldComponentReturn {
  const { entityKey, fieldKey, entity: providedEntity, fieldMetadata: providedFieldMetadata } = options
  
  /**
   * LEARNING: Normalize entityKey and fieldKey to refs
   * WHY: Options can accept Ref or direct values, normalize to computed for consistent usage
   * PATTERN: Check if provided value is Ref, otherwise wrap in computed
   */
  const entityKeyRef = computed(() => {
    return entityKey instanceof Object && 'value' in entityKey ? entityKey.value : entityKey
  })
  
  const fieldKeyRef = computed(() => {
    return fieldKey instanceof Object && 'value' in fieldKey ? fieldKey.value : fieldKey
  })

  /**
   * LEARNING: Normalize entity to computed ref
   * WHY: useEntityMetadata accepts Ref, ComputedRef, or direct value
   * PATTERN: Wrap in computed if needed
   */
  const entity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
    if (!providedEntity) {
      return null
    }
    if ('value' in providedEntity && typeof providedEntity.value === 'object') {
      return providedEntity.value as GlobalEntity<GlobalEntityKey> | null
    }
    return providedEntity as GlobalEntity<GlobalEntityKey> | null
  })

  /**
   * LEARNING: Use provided metadata if available, otherwise fetch it
   * WHY: Avoids duplicate metadata fetches when parent component already has metadata
   * PATTERN: Prefer provided metadata, fall back to fetching if not provided
   * FIX: Pass reactive entityKeyRef instead of dereferenced value to ensure reactivity
   */
  const fetchedFieldMetadata = useEntityMetadata(
    entityKeyRef.value ?? 'blockInstance', // Default to blockInstance if undefined
    entity
  )

  // PATTERN: Create a computed that reactively accesses the correct source
  const fieldMetadata = computed(() => {
    if (providedFieldMetadata) {
      return providedFieldMetadata.value
    }
    return fetchedFieldMetadata.fieldMetadata.value
  })

  /**
   * LEARNING: Get field metadata entry for this field
   * WHY: Contains renderAs, dataType, inputConfig needed for component determination
   * PATTERN: Read from metadata Record by fieldKey
   */
  const fieldMetadataEntry = computed<FieldMetadataEntry | undefined>(() => {
    if (!fieldKeyRef.value || !fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldKeyRef.value)]
  })

  /**
   * LEARNING: Determine component type using dispatcher
   * WHY: Single source of truth - use dispatcher for all component type decisions
   * PATTERN: Call pure dispatcher function with entityKey, fieldKey and metadata
   */
  const componentType = computed(() => {
    if (!fieldKeyRef.value) {
      const result = { type: 'unknown' as const, reason: 'notConfigured' as const }
      console.warn('[useFieldComponent] Unknown component type - missing fieldKey', {
        location: 'useFieldComponent.ts',
        entityKey: entityKeyRef.value,
        fieldKey: fieldKeyRef.value,
        fieldMetadataEntry: fieldMetadataEntry.value,
        reason: result.reason
      })
      return result
    }
    if (!entityKeyRef.value) {
      const result = { type: 'unknown' as const, reason: 'notConfigured' as const }
      console.warn('[useFieldComponent] Unknown component type - missing entityKey', {
        location: 'useFieldComponent.ts',
        entityKey: entityKeyRef.value,
        fieldKey: fieldKeyRef.value,
        fieldMetadataEntry: fieldMetadataEntry.value,
        reason: result.reason
      })
      return result
    }
    const result = getFieldComponent(entityKeyRef.value, fieldKeyRef.value, fieldMetadataEntry.value)
    if (result.type === 'unknown') {
      console.warn('[useFieldComponent] Unknown component type determined', {
        location: 'useFieldComponent.ts',
        entityKey: entityKeyRef.value,
        fieldKey: fieldKeyRef.value,
        fieldMetadataEntry: fieldMetadataEntry.value,
        componentType: result.type,
        reason: result.reason
      })
    }
    return result
  })
  
  /**
   * LEARNING: Whether field is icon type
   * WHY: Icon fields need special IconInput component
   * PATTERN: Determined from dispatcher: component.type === 'icon'
   */
  const isIcon = computed(() => {
    return componentType.value.type === 'icon'
  })
  
  /**
   * LEARNING: Whether field is primitive type
   * WHY: Primitive fields use PrimitiveInputs component
   * PATTERN: Determined from dispatcher: component.type === 'primitive'
   */
  const isPrimitive = computed(() => {
    return componentType.value.type === 'primitive'
  })
  
  /**
   * LEARNING: Whether field is relationshipCollection type
   * WHY: RelationshipCollection fields use RelationshipCollection component
   * PATTERN: Determined from dispatcher: component.type === 'relationshipCollection'
   */
  const isPartsCollection = computed(() => {
    return componentType.value.type === 'relationshipCollection'
  })
  
  /**
   * LEARNING: Whether field is relationshipCollection type (alias for clarity)
   * WHY: Alias for isPartsCollection for clarity
   * PATTERN: Use computed directly - TypeScript accepts ComputedRef<boolean> as Ref<boolean> for interface compatibility
   */
  const isRelationshipCollection = computed<boolean>(() => {
    return isPartsCollection.value
  })
  
  return {
    componentType,
    fieldMetadataEntry,
    // Deprecated: Keep for backward compatibility
    isIcon,
    isPrimitive,
    isPartsCollection,
    isRelationshipCollection
  }
}
