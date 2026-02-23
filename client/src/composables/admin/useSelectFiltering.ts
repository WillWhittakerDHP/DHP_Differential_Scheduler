/**
 * WHY: Select Filtering Composable

WHY: Components should be thin UI wrappers ...
 */
import { computed, type ComputedRef } from 'vue'
import { useForm } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import { useAdmin } from './useAdmin'
import { useComponentEntity } from '../useComponentEntity'
import type { FieldContextType } from '@/composables/fieldContext/types'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

export interface UseSelectFilteringOptions {
  allEntities: ComputedRef<GlobalEntity<GlobalEntityKey>[]>
  
  selectConfig: ComputedRef<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  
  currentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
  
  optionEntityKey: ComputedRef<GlobalEntityKey>
  
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  rawFieldValue: ReadonlyVueRef<unknown>
  
  /**
Whether this is an AnnotationAssignmentSelect field
LEARNING: Annota...
   */
  isAnnotationAssignmentSelect: ComputedRef<boolean>
  
  isAttendeeSelect: ComputedRef<boolean>
}

export interface UseSelectFilteringReturn {
  filteredEntities: ComputedRef<GlobalEntity<GlobalEntityKey>[]>
  
  isActiveChildSelect: ComputedRef<boolean>
  
  isDirectMatchingSelect: ComputedRef<boolean>
  
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>
  
  parentTypeRef: ComputedRef<string | null>
  
  parentTypeEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
  
  isAttendeeSelect: ComputedRef<boolean>
}

/**
 * WHY: Select Filtering Composable

WHY: Moves business logic out of components...
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
    isAnnotationAssignmentSelect
  } = options

  const adminComp = useAdmin()
  const fieldKey = computed(() => String(fieldContext.fieldKey))

  /**
LEARNING: Detect active child select pattern from config
WHY: Config...
   */
  const isActiveChildSelect = computed<boolean>(() => {
    const config = selectConfig.value
    if (!config) {
      return false
    }
    
    // LEARNING: Active child select pattern: parent type entity lookup
    // PATTERN: Check config properties to detect pattern, not field name
    const hasCandidateParentKey = 'candidateParentKey' in config && !!config.candidateParentKey
    const hasCandidateParentPath = 'candidateParentPath' in config && !!config.candidateParentPath
    const hasCandidateChildPath = 'candidateChildPath' in config && config.candidateChildPath && config.candidateChildPath.length > 0
    
    // WHY: This pattern means we look up a parent type entity (e.g., blockShape) and filter by its valid children array
    // PATTERN: Config-driven detection instead of hardcoded field name check
    if (hasCandidateParentKey && hasCandidateParentPath && !hasCandidateChildPath) {
      const candidateParentKey = config.candidateParentKey as GlobalEntityKey
      const selectedParentKey = config.selectedParentKey as GlobalEntityKey
      return candidateParentKey !== selectedParentKey
    }
    
    return false
  })

  /**
   * LEARNING: Detect direct matching pattern from config
   */
  const isDirectMatchingSelect = computed<boolean>(() => {
    const config = selectConfig.value
    if (!config) {
      return false
    }
    
    // LEARNING: Direct matching pattern: both candidateParentPath and candidateChildPath have values
    // PATTERN: Config-driven detection based on path configuration
    const hasCandidateParentPath = 'candidateParentPath' in config && config.candidateParentPath && config.candidateParentPath.length > 0
    const hasCandidateChildPath = 'candidateChildPath' in config && config.candidateChildPath && config.candidateChildPath.length > 0
    
    return Boolean(hasCandidateParentPath && hasCandidateChildPath)
  })

  const parentTypeEntityKey = computed<GlobalEntityKey | null>(() => {
    if (!isActiveChildSelect.value) return null
    
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
   */
  const parentTypeRef = computed<string | null>(() => {
    if (!isActiveChildSelect.value) return null
    
    // WHY: Config-driven approach matches relationship configs after phase 9 renaming
    // PATTERN: Read from selectConfig.candidateParentPath
    const config = selectConfig.value
    let typeRefKey: string
    
    if (config && 'candidateParentPath' in config && config.candidateParentPath && config.candidateParentPath.length > 0) {
      typeRefKey = String(config.candidateParentPath[0])
    } else {
      // Fallback to hardcoded logic (backward compatibility)
      typeRefKey = fieldContext.entityKey === 'blockInstance' ? 'blockShapeRef' : 'partShapeRef'
    }
    
    if (currentEntity.value) {
      const refValue = getEntityFieldValue(currentEntity.value, typeRefKey)
      if (refValue) {
        return String(refValue)
      }
    }
    
    const entityIdString = String(fieldContext.entityId)
    const isTempEntity = entityIdString.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
    
    if (isTempEntity || !currentEntity.value) {
      try {
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
        // PATTERN: Silently return null if form is not available
      }
    }
    
    return null
  })

  /**
   */
  const parentTypeEntity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) return null
    const entity = adminComp.getEntity(parentTypeEntityKey.value, toGlobalEntityId(parentTypeRef.value))
    return entity || null
  })

  /**
   */
  const isAttendeeSelect = computed(() => {
    const config = selectConfig.value
    if (!config || !('selectType' in config)) {
      return false
    }
    return String(config.selectType) === 'attendeeSelect'
  })

  /**
WHY: Composables can only be called during setup, not inside compute...
   */
  const composedEntityComposable = (String(fieldContext.fieldKey) === 'instanceComponents' && fieldContext.entityKey === 'blockInstance')
    ? useComponentEntity('blockInstance')
    : null

  /**
   * - instanceComponents: Filter by component availability
   * - bookingCascades/partAssignments: Filter by parent's type's valid children
   * - Direct matching: Filter by matching path values
   * - Annotations: No filtering needed
   * - filterOptions: Apply custom filter function
   */
  const filteredEntities = computed(() => {
    if (!selectConfig.value) {
      return allEntities.value
    }
    
    if (composedEntityComposable && fieldContext.entityId) {
      // PATTERN: Read raw field value directly to avoid circular dependency (fieldValue depends on options)
      const currentFormValue = rawFieldValue.value
      const selectedComponentIdsFromForm = new Set(
        Array.isArray(currentFormValue)
          ? currentFormValue.map(v => String(v))
          : currentFormValue
            ? [String(currentFormValue)]
            : []
      )
      
      const availableComponents = composedEntityComposable.getAvailableComponents(fieldContext.entityId)
      
      // PATTERN: Filter available components to exclude those in form value
      const availableComponentsFiltered = availableComponents.filter(
        component => !selectedComponentIdsFromForm.has(component.id)
      )
      
      const currentComponents = composedEntityComposable.getComponents(fieldContext.entityId)
      const currentComponentIdsFromQuery = new Set(currentComponents.map(ea => ea.childId))
      
      // PATTERN: Combine query cache components with form-selected components, deduplicate
      const allSelectedComponentIds = new Set([
        ...currentComponentIdsFromQuery,
        ...selectedComponentIdsFromForm
      ])
      
      const selectedComponentEntities = allSelectedComponentIds.size > 0
        ? allEntities.value.filter((candidate) => allSelectedComponentIds.has(candidate.id))
        : []
      
      const allComponents = [...availableComponentsFiltered, ...selectedComponentEntities]
      const uniqueComponents = allComponents.reduce((map, component) => {
        if (!map.has(component.id)) {
          map.set(component.id, component)
        }
        return map
      }, new Map<string, typeof allComponents[0]>())
      
      return Array.from(uniqueComponents.values())
    }
    
    if (isActiveChildSelect.value) {
      const entityIdString = String(fieldContext.entityId)
      const isTempEntity = entityIdString.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
      
      // Skip warning for new entities; only warn when an existing entity is missing parent type.
      if (!currentEntity.value && !isTempEntity) {
        return []
      }
      
      // PATTERN: Check parentTypeRef (which checks form) and parentTypeEntity
      if (!parentTypeRef.value) {
        return []
      }
      
      if (!parentTypeEntity.value) {
        return []
      }
      
      const validChildrenKey = fieldKey.value === 'bookingCascades' ? 'validCascades' : 'validParts'
      
      // PATTERN: Check if property exists, use empty array as fallback
      const validChildrenRefs = getEntityFieldValue(parentTypeEntity.value, validChildrenKey)
      
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
      
      const validChildrenSet = new Set(validChildrenRefs)
      
      const candidateTypeRefKey = optionEntityKey.value === 'blockInstance' ? 'blockShapeRef' : 'partShapeRef'
      
      const filtered = allEntities.value.filter((candidate) => {
        const candidateTypeRef = getEntityFieldValue(candidate, candidateTypeRefKey)
        const matches = candidateTypeRef && validChildrenSet.has(String(candidateTypeRef))
        return matches
      })
      
      return filtered
    }
    
    // LEARNING: Direct matching pattern (e.g., dependentInstances)
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
      
      // PATTERN: Use first path element as property key
      const parentPathKey = candidateParentPath[0]
      const childPathKey = candidateChildPath[0]
      
      let currentEntityValue: string | null = null
      
      if (currentEntity.value) {
        const refValue = getEntityFieldValue(currentEntity.value, String(parentPathKey))
        if (refValue) {
          currentEntityValue = String(refValue)
        }
      }
      
      // PATTERN: Check form values similar to parentTypeRef logic
      if (!currentEntityValue) {
        const entityIdString = String(fieldContext.entityId)
        const isTempEntity = entityIdString.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
        
        if (isTempEntity || !currentEntity.value) {
          try {
            const form = useForm()
            if (form && form.values && typeof form.values === 'object') {
              const formValues = form.values as Record<string, unknown>
              const formValue = formValues[String(parentPathKey)]
              if (formValue) {
                currentEntityValue = String(formValue)
              }
            }
          } catch {
          }
        }
      }
      
      // PATTERN: Return empty array when value is not available
      if (!currentEntityValue) {
        return []
      }
      
      // PATTERN: Filter allEntities by comparing path values
      const filtered = allEntities.value.filter((candidate) => {
        // WHY: Can't select the same entity as a component of itself
        // PATTERN: Check entity ID to exclude self
        if (candidate.id === fieldContext.entityId) {
          return false
        }
        
        const candidateValue = getEntityFieldValue(candidate, String(childPathKey))
        
        return candidateValue && String(candidateValue) === currentEntityValue
      })
      
      return filtered
    }
    
    // PATTERN: Return all annotation instances when AnnotationAssignmentSelect is detected
    if (isAnnotationAssignmentSelect.value) {
      return allEntities.value
    }
    
    const config = selectConfig.value
    
    // PATTERN: Filter BlockInstances by checking their BlockShape's isStateControl property
    if (isAttendeeSelect.value && optionEntityKey.value === 'blockInstance') {
      const allBlockShapes = adminComp.getEntities('blockShape')
      
      // PATTERN: Filter block shapes, then filter block instances by their blockShapeRef
      const stateControlBlockShapeIds = new Set(
        allBlockShapes
          .filter((bs: GlobalEntity<'blockShape'>) => {
            const blockShapeTyped = bs as GlobalEntity<'blockShape'> & { isStateControl?: boolean }
            return blockShapeTyped.isStateControl === true
          })
          .map((bs: GlobalEntity<'blockShape'>) => bs.id)
      )
      
      // LEARNING: Filter BlockInstances to only include those whose blockShapeRef matches a state control BlockShape
      // WHY: Only show UserTypeBlock instances (BlockInstances belonging to state control BlockShapes)
      // PATTERN: Check each BlockInstance's blockShapeRef against the Set of state control BlockShape IDs
      const filtered = allEntities.value.filter((candidate) => {
        const blockInstanceTyped = candidate as GlobalEntity<'blockInstance'>
        const blockShapeRef = getEntityFieldValue(blockInstanceTyped, 'blockShapeRef')
        if (!blockShapeRef) return false
        return stateControlBlockShapeIds.has(toGlobalEntityId(String(blockShapeRef)))
      })
      
      return filtered
    }
    
    if (config && 'filterOptions' in config && typeof config.filterOptions === 'function' && currentEntity.value) {
      return allEntities.value.filter((candidate) => 
        (config.filterOptions as (candidate: unknown, currentEntity: unknown) => boolean)(candidate, currentEntity.value)
      )
    }
    
    const result = allEntities.value
    return result
  })

  return {
    filteredEntities,
    isActiveChildSelect,
    isDirectMatchingSelect,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
    isAttendeeSelect
  }
}



