/**
 * Select Filtering Composable
 * 
 * LEARNING: Extracts entity filtering logic from SelectInputs component
 * WHY: Components should be thin UI wrappers - filtering logic belongs in composables
 * PATTERN: Composable that provides filtered entities based on select config
 * 
 * This composable handles:
 * - Active child select filtering (bookingCascades, activeParts)
 * - Direct matching select filtering (dependentInstanceOptions)
 * - Active components filtering (composable services)
 * - Filter options function application
 * - Annotation filtering (no filtering needed)
 */

import { computed, type ComputedRef } from 'vue'
import { useForm } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import { useAdmin } from '../useAdmin'
import { useComponentEntity } from '../useComponentEntity'
import type { FieldContextType } from '../useFieldContext'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

/**
 * Select Filtering Composable Options
 */
export interface UseSelectFilteringOptions {
  /**
   * All entities to filter from
   */
  allEntities: ComputedRef<GlobalEntity<GlobalEntityKey>[]>
  
  /**
   * Select config (relationshipSelect or typeSelect)
   */
  selectConfig: ComputedRef<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  
  /**
   * Current entity (for filtering logic)
   */
  currentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
  
  /**
   * Option entity key (which entity type we're filtering)
   */
  optionEntityKey: ComputedRef<GlobalEntityKey>
  
  /**
   * Field context
   */
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  /**
   * Raw field value (for instanceComponents filtering)
   */
  rawFieldValue: ReadonlyVueRef<unknown>
  
  /**
   * Whether this is a DescriptionSelect field
   */
  isDescriptionSelect: ComputedRef<boolean>
}

/**
 * Select Filtering Composable Return Type
 */
export interface UseSelectFilteringReturn {
  /**
   * Filtered entities based on select config
   */
  filteredEntities: ComputedRef<GlobalEntity<GlobalEntityKey>[]>
  
  /**
   * Whether this is an active child select (bookingCascades pattern)
   */
  isActiveChildSelect: ComputedRef<boolean>
  
  /**
   * Whether this is a direct matching select (dependentInstanceOptions pattern)
   */
  isDirectMatchingSelect: ComputedRef<boolean>
  
  /**
   * Parent type entity key (for active child selects)
   */
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>
  
  /**
   * Parent type reference (blockShapeRef/partShapeRef)
   */
  parentTypeRef: ComputedRef<string | null>
  
  /**
   * Parent type entity (with relationships attached)
   */
  parentTypeEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
}

/**
 * Select Filtering Composable
 * 
 * LEARNING: Provides entity filtering logic extracted from SelectInputs component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for entity filtering
 */
export function useSelectFiltering(
  options: UseSelectFilteringOptions
): UseSelectFilteringReturn {
  const {
    allEntities,
    selectConfig,
    currentEntity,
    optionEntityKey,
    fieldContext,
    rawFieldValue,
    isDescriptionSelect
  } = options

  const adminComp = useAdmin()
  const fieldKey = computed(() => String(fieldContext.fieldKey))

  /**
   * LEARNING: Detect active child select pattern from config
   * WHY: Config-driven approach allows any field with this pattern to work, not just bookingCascades
   * PATTERN: Detect when candidateParentKey !== selectedParentKey AND candidateChildPath is empty
   */
  const isActiveChildSelect = computed<boolean>(() => {
    const config = selectConfig.value
    if (!config) {
      return false
    }
    
    // LEARNING: Active child select pattern: parent type entity lookup
    // WHY: When candidateParentKey is different from selectedParentKey, we're looking up a parent type entity
    //      When candidateChildPath is empty, we're not doing direct matching
    // PATTERN: Check config properties to detect pattern, not field name
    const hasCandidateParentKey = 'candidateParentKey' in config && !!config.candidateParentKey
    const hasCandidateParentPath = 'candidateParentPath' in config && !!config.candidateParentPath
    const hasCandidateChildPath = 'candidateChildPath' in config && config.candidateChildPath && config.candidateChildPath.length > 0
    
    // LEARNING: Active child select: candidateParentKey !== selectedParentKey AND candidateChildPath is empty
    // WHY: This pattern means we look up a parent type entity (e.g., blockShape) and filter by its valid children array
    // PATTERN: Config-driven detection instead of hardcoded field name check
    if (hasCandidateParentKey && hasCandidateParentPath && !hasCandidateChildPath) {
      const candidateParentKey = config.candidateParentKey as GlobalEntityKey
      const selectedParentKey = config.selectedParentKey as GlobalEntityKey
      // Only apply if candidateParentKey is different from selectedParentKey (indicates parent type lookup)
      return candidateParentKey !== selectedParentKey
    }
    
    return false
  })

  /**
   * LEARNING: Detect direct matching pattern from config
   * WHY: When candidateChildPath has a value, we're doing direct matching (e.g., dependentInstanceOptions)
   * PATTERN: Detect when both candidateParentPath and candidateChildPath have values
   */
  const isDirectMatchingSelect = computed<boolean>(() => {
    const config = selectConfig.value
    if (!config) {
      return false
    }
    
    // LEARNING: Direct matching pattern: both candidateParentPath and candidateChildPath have values
    // WHY: This means we get a value from current entity (candidateParentPath) and match it against candidate's value (candidateChildPath)
    // PATTERN: Config-driven detection based on path configuration
    const hasCandidateParentPath = 'candidateParentPath' in config && config.candidateParentPath && config.candidateParentPath.length > 0
    const hasCandidateChildPath = 'candidateChildPath' in config && config.candidateChildPath && config.candidateChildPath.length > 0
    
    return Boolean(hasCandidateParentPath && hasCandidateChildPath)
  })

  /**
   * LEARNING: Get parent type entity key for active child selects
   * WHY: For bookingCascades, need to get parent's type (blockShape) and its valid children
   */
  const parentTypeEntityKey = computed<GlobalEntityKey | null>(() => {
    if (!isActiveChildSelect.value) return null
    
    // LEARNING: Use candidateParentKey from config instead of hardcoding
    // WHY: Config-driven approach allows flexibility and matches relationship configs
    // PATTERN: Read from selectConfig.candidateParentKey
    const config = selectConfig.value
    if (config && 'candidateParentKey' in config && config.candidateParentKey) {
      return config.candidateParentKey as GlobalEntityKey
    }
    
    // Fallback to hardcoded logic if config doesn't have it (backward compatibility)
    if (fieldContext.entityKey === 'blockInstance') return 'blockShape' as GlobalEntityKey
    if (fieldContext.entityKey === 'partInstance') return 'partShape' as GlobalEntityKey
    return null
  })

  /**
   * LEARNING: Get parent type reference (blockShapeRef/partShapeRef)
   * WHY: Need to look up the parent type entity to get valid children
   * PATTERN: Get from currentEntity or form (for temp entities)
   */
  const parentTypeRef = computed<string | null>(() => {
    if (!isActiveChildSelect.value) return null
    
    // LEARNING: Use candidateParentPath from config instead of hardcoding
    // WHY: Config-driven approach matches relationship configs after phase 9 renaming
    // PATTERN: Read from selectConfig.candidateParentPath
    const config = selectConfig.value
    let typeRefKey: string
    
    if (config && 'candidateParentPath' in config && config.candidateParentPath && config.candidateParentPath.length > 0) {
      // Use first path element (e.g., ["blockShapeRef"] -> "blockShapeRef")
      typeRefKey = config.candidateParentPath[0]
    } else {
      // Fallback to hardcoded logic (backward compatibility)
      typeRefKey = fieldContext.entityKey === 'blockInstance' ? 'blockShapeRef' : 'partShapeRef'
    }
    
    // LEARNING: For existing entities, get from currentEntity
    // WHY: Store is source of truth for existing entities
    if (currentEntity.value) {
      const refValue = getEntityFieldValue(currentEntity.value, typeRefKey)
      if (refValue) {
        return String(refValue)
      }
    }
    
    // LEARNING: For new entities (temp IDs), try to get from form values
    // WHY: New entities don't exist in store yet, but form might have blockShapeRef
    // PATTERN: Check if entityId is temp ID, then try to access form values
    const entityIdString = String(fieldContext.entityId)
    const isTempEntity = entityIdString.startsWith('new-')
    
    if (isTempEntity || !currentEntity.value) {
      try {
        // LEARNING: Try to get form instance from vee-validate context
        // WHY: Form values contain blockShapeRef for new entities
        // PATTERN: Use useForm() without parameters to get current form context
        const form = useForm()
        if (form && form.values && typeof form.values === 'object') {
          const formValues = form.values as Record<string, unknown>
          const formBlockTypeRef = formValues[typeRefKey]
          if (formBlockTypeRef) {
            return String(formBlockTypeRef)
          }
        }
      } catch {
        // LEARNING: Form might not be available in context - that's okay
        // WHY: Not all fields have form context, so we gracefully handle this
        // PATTERN: Silently return null if form is not available
      }
    }
    
    return null
  })

  /**
   * LEARNING: Get parent type entity from admin store (with relationships attached)
   * WHY: Need AdminEntity with validCascades/validParts attached for filtering
   * PATTERN: Use admin store getEntity which returns AdminEntity with relationships
   */
  const parentTypeEntity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) return null
    const entity = adminComp.getEntity(parentTypeEntityKey.value, parentTypeRef.value)
    return entity || null
  })

  /**
   * LEARNING: Conditionally initialize useComponentEntity during setup (not inside computed)
   * WHY: Composables can only be called during setup, not inside computed properties
   * PATTERN: Call composable conditionally during setup, use its methods in computed
   */
  const composedEntityComposable = (String(fieldContext.fieldKey) === 'instanceComponents' && fieldContext.entityKey === 'blockInstance')
    ? useComponentEntity('blockInstance')
    : null

  /**
   * LEARNING: Filter entities based on select config
   * WHY: Different select types need different filtering:
   * - instanceComponents: Filter by component availability
   * - bookingCascades/activeParts: Filter by parent's type's valid children
   * - Direct matching: Filter by matching path values
   * - Annotations: No filtering needed
   * - filterOptions: Apply custom filter function
   * PATTERN: Use computed to reactively filter based on current entity and config
   */
  const filteredEntities = computed(() => {
    if (!selectConfig.value) {
      // No config - return all entities (fallback)
      return allEntities.value
    }
    
    // Special case: instanceComponents field - use component filtering logic
    if (composedEntityComposable && fieldContext.entityId) {
      // LEARNING: Get current form value to include optimistically selected components
      // WHY: Form value updates immediately when user selects/deselects, but query cache only updates after save
      //      We need to show selected components in options even if they're not yet in the query cache
      // PATTERN: Read raw field value directly to avoid circular dependency (fieldValue depends on options)
      const currentFormValue = rawFieldValue.value
      const selectedComponentIdsFromForm = new Set(
        Array.isArray(currentFormValue)
          ? currentFormValue.map(v => String(v))
          : currentFormValue
            ? [String(currentFormValue)]
            : []
      )
      
      // Get available components from query cache (excludes current components)
      const availableComponents = composedEntityComposable.getAvailableComponents(fieldContext.entityId)
      
      // LEARNING: Filter out components that are currently selected in the form
      // WHY: If user just selected a component, it should disappear from available options immediately
      //      even though it's not yet saved to the server
      // PATTERN: Filter available components to exclude those in form value
      const availableComponentsFiltered = availableComponents.filter(
        component => !selectedComponentIdsFromForm.has(component.id)
      )
      
      // Get current components from query cache (already saved components)
      const currentComponents = composedEntityComposable.getComponents(fieldContext.entityId)
      // LEARNING: ActiveComponent has childId property, not componentId
      // WHY: getComponents() returns ActiveComponent[] which uses childId to reference the component entity
      const currentComponentIdsFromQuery = new Set(currentComponents.map(ea => ea.childId))
      
      // LEARNING: Get entities for both query cache components and form-selected components
      // WHY: Options must include all selected components (from query cache AND form) so chips can display them
      // PATTERN: Combine query cache components with form-selected components, deduplicate
      const allSelectedComponentIds = new Set([
        ...currentComponentIdsFromQuery,
        ...selectedComponentIdsFromForm
      ])
      
      // Get entities for selected components (from both query cache and form)
      const selectedComponentEntities = allSelectedComponentIds.size > 0
        ? allEntities.value.filter((candidate) => allSelectedComponentIds.has(String(candidate.id)))
        : []
      
      // Combine available (filtered) and selected components, deduplicate by ID using functional approach
      const allComponents = [...availableComponentsFiltered, ...selectedComponentEntities]
      const uniqueComponents = allComponents.reduce((map, component) => {
        if (!map.has(component.id)) {
          map.set(component.id, component)
        }
        return map
      }, new Map<string, typeof allComponents[0]>())
      
      return Array.from(uniqueComponents.values())
    }
    
    // Special case: bookingCascades/activeParts
    // Filter by parent's type's valid children
    if (isActiveChildSelect.value) {
      // LEARNING: For new entities, parentTypeRef might come from form values
      // WHY: New entities don't exist in store yet, but form has blockShapeRef
      // PATTERN: Check parentTypeRef (which checks form values) instead of just currentEntity
      const entityIdString = String(fieldContext.entityId)
      const isTempEntity = entityIdString.startsWith('new-')
      
      // LEARNING: Only warn if it's not a temp entity (temp entities are expected to not exist)
      // WHY: Temp entities don't exist in store - that's normal behavior
      // PATTERN: Skip warning for temp entities, only warn for existing entities that should exist
      if (!currentEntity.value && !isTempEntity) {
        return []
      }
      
      // LEARNING: parentTypeRef can come from form values for temp entities
      // WHY: For new entities, blockShapeRef is in form, not store
      // PATTERN: Check parentTypeRef (which checks form) and parentTypeEntity
      if (!parentTypeRef.value) {
        return []
      }
      
      if (!parentTypeEntity.value) {
        return []
      }
      
      // Get valid children array from parent type entity
      // For bookingCascades: blockShape.validCascades
      // For activeParts: blockShape.validParts (or partShape.validParts)
      const validChildrenKey = fieldKey.value === 'bookingCascades' ? 'validCascades' : 'validParts'
      
      // LEARNING: Use type-safe property access with fallback
      // WHY: Property might be undefined if relationships aren't attached yet
      // PATTERN: Check if property exists, use empty array as fallback
      const validChildrenRefs = getEntityFieldValue(parentTypeEntity.value, validChildrenKey)
      
      // LEARNING: Check if relationship property exists and is valid
      // WHY: Property might be undefined (not attached) or empty array (no relationships configured)
      // PATTERN: Distinguish between missing property (bug) vs empty array (expected)
      if (validChildrenRefs === undefined) {
        return []
      }
      
      if (!Array.isArray(validChildrenRefs)) {
        return []
      }
      
      if (validChildrenRefs.length === 0) {
        return []
      }
      
      // Create Set for O(1) lookup
      const validChildrenSet = new Set(validChildrenRefs)
      
      // Filter candidates where their typeRef matches one in valid children
      // For blockInstance: check blockShapeRef
      // For partInstance: check partShapeRef
      const candidateTypeRefKey = optionEntityKey.value === 'blockInstance' ? 'blockShapeRef' : 'partShapeRef'
      
      const filtered = allEntities.value.filter((candidate) => {
        const candidateTypeRef = getEntityFieldValue(candidate, candidateTypeRefKey)
        const matches = candidateTypeRef && validChildrenSet.has(String(candidateTypeRef))
        return matches
      })
      
      return filtered
    }
    
    // LEARNING: Direct matching pattern (e.g., dependentInstanceOptions)
    // WHY: Filter candidates by matching their candidateChildPath value against current entity's candidateParentPath value
    // PATTERN: Get value from current entity, filter candidates by matching their path value
    if (isDirectMatchingSelect.value) {
      const config = selectConfig.value
      if (!config || !('candidateParentPath' in config) || !('candidateChildPath' in config)) {
        return allEntities.value
      }
      
      const candidateParentPath = config.candidateParentPath
      const candidateChildPath = config.candidateChildPath
      
      if (!candidateParentPath || candidateParentPath.length === 0 || !candidateChildPath || candidateChildPath.length === 0) {
        return allEntities.value
      }
      
      // LEARNING: Get the path key from candidateParentPath (e.g., ["blockShapeRef"] -> "blockShapeRef")
      // WHY: We need to access the property on the current entity
      // PATTERN: Use first path element as property key
      const parentPathKey = candidateParentPath[0]
      const childPathKey = candidateChildPath[0]
      
      // LEARNING: Get current entity's value from candidateParentPath
      // WHY: We need to match candidates against this value
      // PATTERN: Get from currentEntity or form (for temp entities), similar to parentTypeRef logic
      let currentEntityValue: string | null = null
      
      // Try to get from currentEntity first (existing entities)
      if (currentEntity.value) {
        const refValue = getEntityFieldValue(currentEntity.value, parentPathKey)
        if (refValue) {
          currentEntityValue = String(refValue)
        }
      }
      
      // LEARNING: For temp entities or if not found in store, try form values
      // WHY: New entities don't exist in store yet, but form has the value
      // PATTERN: Check form values similar to parentTypeRef logic
      if (!currentEntityValue) {
        const entityIdString = String(fieldContext.entityId)
        const isTempEntity = entityIdString.startsWith('new-')
        
        if (isTempEntity || !currentEntity.value) {
          try {
            const form = useForm()
            if (form && form.values && typeof form.values === 'object') {
              const formValues = form.values as Record<string, unknown>
              const formValue = formValues[parentPathKey]
              if (formValue) {
                currentEntityValue = String(formValue)
              }
            }
          } catch {
            // Form might not be available - that's okay
          }
        }
      }
      
      // LEARNING: If we don't have a value to match against, return empty array
      // WHY: Can't filter without knowing what to match
      // PATTERN: Return empty array when value is not available
      if (!currentEntityValue) {
        return []
      }
      
      // LEARNING: Filter candidates by matching their candidateChildPath value against current entity's value
      // WHY: Only show candidates that match the current entity's path value (e.g., same blockShapeRef)
      // PATTERN: Filter allEntities by comparing path values
      const filtered = allEntities.value.filter((candidate) => {
        // LEARNING: Exclude current entity itself from candidates
        // WHY: Can't select the same entity as a component of itself
        // PATTERN: Check entity ID to exclude self
        if (String(candidate.id) === String(fieldContext.entityId)) {
          return false
        }
        
        // Get candidate's value from candidateChildPath
        const candidateValue = getEntityFieldValue(candidate, childPathKey)
        
        // Match if candidate's value equals current entity's value
        return candidateValue && String(candidateValue) === currentEntityValue
      })
      
      return filtered
    }
    
    // LEARNING: Annotations don't need filtering - all annotations are available
    // WHY: Annotations are independent entities, not filtered by relationships
    // PATTERN: Return all annotations when DescriptionSelect is detected
    if (isDescriptionSelect.value) {
      return allEntities.value
    }
    
    // Apply filterOptions if provided
    const config = selectConfig.value
    if (config && 'filterOptions' in config && typeof config.filterOptions === 'function' && currentEntity.value) {
      return allEntities.value.filter((candidate) => 
        (config.filterOptions as (candidate: unknown, currentEntity: unknown) => boolean)(candidate, currentEntity.value)
      )
    }
    
    // Type selects: No filtering needed
    return allEntities.value
  })

  return {
    filteredEntities,
    isActiveChildSelect,
    isDirectMatchingSelect,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity
  }
}



