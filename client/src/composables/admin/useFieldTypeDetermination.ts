/**
 * Field Type Determination Composable
 * 
 * LEARNING: Extracts field type determination logic from InputRenderer component
 * WHY: Components should be thin UI wrappers - type determination logic belongs in composables
 * PATTERN: Composable that determines field type from admin config
 * 
 * This composable handles:
 * - Field config retrieval
 * - Type checking (icon, primitive, nested, annotations, select)
 * - Error handling for config retrieval
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useEntityMetadata } from './useEntityMetadata'
import { useAdmin } from '@/composables/useAdmin'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { RelationshipSelectModeEnum } from '@/types/entity/formDataEnums'

/**
 * Field Type Determination Composable Options
 */
export interface UseFieldTypeDeterminationOptions {
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
   * PATTERN: Pass metadata from parent to avoid re-fetching in InputRenderer
   */
  fieldMetadata?: ComputedRef<Record<string, FieldMetadataEntry>> | Ref<Record<string, FieldMetadataEntry>>
}

/**
 * Field Type Determination Composable Return Type
 */
export interface UseFieldTypeDeterminationReturn {
  /**
   * LEARNING: Whether field is icon type
   * WHY: Icon fields need special IconInput component
   * PATTERN: Determined from metadata: renderAs is 'iconSelect' (metadata-driven, not hardcoded)
   */
  isIcon: Ref<boolean>
  
  /**
   * LEARNING: Whether field is primitive type
   * WHY: Primitive fields use PrimitiveInputs component
   * PATTERN: Computed property that checks config structure
   */
  isPrimitive: Ref<boolean>
  
  /**
   * LEARNING: Whether field is nested collection type
   * WHY: Nested fields use PartsCollection component
   * PATTERN: Computed property that checks selectMode in config
   */
  isNested: Ref<boolean>
  
  /**
   * LEARNING: Whether field is annotations type
   * WHY: Annotations fields use AnnotationsField component
   * PATTERN: Computed property that checks if fieldKey is 'annotations'
   */
  isAnnotations: Ref<boolean>
  
  /**
   * LEARNING: Whether field is select type
   * WHY: Select fields use SelectInputs component
   * PATTERN: Computed property that checks config structure, excluding nested and annotations
   */
  isSelect: Ref<boolean>
}

/**
 * Field Type Determination Composable
 * 
 * LEARNING: Provides field type determination logic extracted from components
 * WHY: Moves type checking logic out of components into reusable composable
 * PATTERN: Composable with computed properties for type checking
 */
export function useFieldTypeDetermination(
  options: UseFieldTypeDeterminationOptions
): UseFieldTypeDeterminationReturn {
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
    entityKeyRef.value as GlobalEntityKey | undefined,
    entity
  )

  // LEARNING: Use provided metadata if available, otherwise use fetched metadata
  // WHY: Both are ComputedRefs, so we need to create a new computed that tracks the right one
  // PATTERN: Create a computed that reactively accesses the correct source
  const fieldMetadata = computed(() => {
    if (providedFieldMetadata) {
      return providedFieldMetadata.value
    }
    return fetchedFieldMetadata.fieldMetadata.value
  })

  /**
   * LEARNING: Get field metadata entry for this field
   * WHY: Contains renderAs, dataType, inputConfig needed for type determination
   * PATTERN: Read from metadata Record by fieldKey
   */
  const fieldMetadataEntry = computed<FieldMetadataEntry | undefined>(() => {
    if (!fieldKeyRef.value || !fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldKeyRef.value)]
  })
  
  /**
   * LEARNING: Whether field is icon type
   * WHY: Icon fields need special IconInput component
   * PATTERN: Determined from metadata: renderAs is 'iconSelect' (metadata-driven, not hardcoded)
   */
  const isIcon = computed(() => {
    const meta = fieldMetadataEntry.value
    if (!meta) {
      return false
    }
    return meta.renderAs === 'iconSelect'
  })
  
  /**
   * LEARNING: Whether field is primitive type
   * WHY: Primitive fields use PrimitiveInputs component
   * PATTERN: Determined from metadata: renderAs is text/number/statusButton (not select-like)
   * NOTE: Icon fields are also primitive but use IconInput instead
   * NOTE: StatusButton fields ARE primitive - they render as status button chips via BooleanInput
   */
  const isPrimitive = computed(() => {
    // Don't treat icon fields as primitive - they use IconInput
    if (isIcon.value) {
      return false
    }
    const meta = fieldMetadataEntry.value
    if (!meta) {
      return false
    }
    // Primitive if renderAs is text/number/statusButton
    // StatusButton fields render as BooleanInput (which shows StatusButton chip)
    const primitiveRenderAs: Array<FieldMetadataEntry['renderAs']> = ['text', 'number', 'statusButton']
    return primitiveRenderAs.includes(meta.renderAs)
  })
  
  /**
   * LEARNING: Whether field is nested collection type
   * WHY: Nested fields use PartsCollection component
   * PATTERN: Determined from metadata: renderAs is select/multiselect/reference AND inputConfig.selectMode is 'nested'
   */
  const isNested = computed(() => {
    const meta = fieldMetadataEntry.value
    if (!meta) {
      return false
    }
    const selectRenderAs: Array<FieldMetadataEntry['renderAs']> = ['select', 'multiselect', 'reference']
    if (!selectRenderAs.includes(meta.renderAs)) {
      return false
    }
    // Check inputConfig for nested mode
    const inputConfig = meta.inputConfig as { selectMode?: string } | null | undefined
    return inputConfig?.selectMode === 'nested' || inputConfig?.selectMode === RelationshipSelectModeEnum.Nested
  })
  
  /**
   * LEARNING: Whether field is annotations type
   * WHY: Annotations fields use AnnotationsField component
   * PATTERN: Computed property that checks if fieldKey is 'annotations'
   */
  const isAnnotations = computed(() => {
    return String(fieldKeyRef.value) === 'annotations'
  })
  
  /**
   * LEARNING: Whether field is select type
   * WHY: Select fields use SelectInputs component
   * PATTERN: Determined from metadata: renderAs is select/multiselect/reference AND NOT nested
   */
  const isSelect = computed(() => {
    // Exclude annotations field - it uses AnnotationsField component
    if (isAnnotations.value) {
      return false
    }
    const meta = fieldMetadataEntry.value
    if (!meta) {
      return false
    }
    const selectRenderAs: Array<FieldMetadataEntry['renderAs']> = ['select', 'multiselect', 'reference']
    const isSelectRenderAs = selectRenderAs.includes(meta.renderAs)
    // Exclude nested fields - they should use PartsCollection
    if (isSelectRenderAs && isNested.value) {
      return false
    }
    return isSelectRenderAs
  })
  
  return {
    isIcon,
    isPrimitive,
    isNested,
    isAnnotations,
    isSelect
  }
}

