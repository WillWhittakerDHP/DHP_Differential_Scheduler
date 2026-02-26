/**
 * WHY: Select Filtering Composable

WHY: Components should be thin UI wrappers ...
 */
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { useAdmin } from './useAdmin'
import { useComponentEntity } from '../useComponentEntity'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import {
  filterByActiveChildSelect,
  filterByAttendeeSelectBlockInstances,
  filterByDirectMatching,
  mergeComponentOptions,
} from '@/utils/admin/selectFilterStrategies'
import { createLogger } from '@/utils/logger'
import type { UseSelectFilteringOptions, UseSelectFilteringReturn } from '@/types/admin/selectFiltering'

const logger = createLogger('useSelectFiltering')


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
  const fieldKey = computed(() => String(fieldContext.state.fieldKey))

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
    if (fieldContext.state.entityKey === 'blockInstance') return 'blockShape' as GlobalEntityKey
    if (fieldContext.state.entityKey === 'partInstance') return 'partShape' as GlobalEntityKey
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
      typeRefKey = fieldContext.state.entityKey === 'blockInstance' ? 'blockShapeRef' : 'partShapeRef'
    }
    
    if (currentEntity.value) {
      const refValue = getEntityFieldValue(currentEntity.value, typeRefKey)
      if (refValue) {
        return String(refValue)
      }
    }
    
    const entityIdString = String(fieldContext.state.entityId)
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
      } catch (err) {
        logger.warn('Could not read form value for parent type ref', { typeRefKey, err })
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
  const composedEntityComposable = (String(fieldContext.state.fieldKey) === 'instanceComponents' && fieldContext.state.entityKey === 'blockInstance')
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
    
    if (composedEntityComposable && fieldContext.state.entityId) {
      // PATTERN: Read raw field value directly to avoid circular dependency (fieldValue depends on options)
      const currentFormValue = rawFieldValue.value
      const selectedComponentIdsFromForm = new Set(
        Array.isArray(currentFormValue)
          ? currentFormValue.map(v => String(v))
          : currentFormValue
            ? [String(currentFormValue)]
            : []
      )
      
      const availableComponents = composedEntityComposable.data.getAvailableComponents(fieldContext.state.entityId)
      
      // PATTERN: Filter available components to exclude those in form value
      const availableComponentsFiltered = availableComponents.filter(
        component => !selectedComponentIdsFromForm.has(component.id)
      )
      
      const currentComponents = composedEntityComposable.data.getComponents(fieldContext.state.entityId)
      const currentComponentIdsFromQuery = new Set(currentComponents.map(ea => ea.childId))
      
      // PATTERN: Combine query cache components with form-selected components, deduplicate
      const allSelectedComponentIds = new Set([
        ...currentComponentIdsFromQuery,
        ...selectedComponentIdsFromForm
      ])
      
      const selectedComponentEntities = allSelectedComponentIds.size > 0
        ? allEntities.value.filter((candidate) => allSelectedComponentIds.has(candidate.id))
        : []

      return mergeComponentOptions(availableComponentsFiltered, selectedComponentEntities)
    }
    
    if (isActiveChildSelect.value) {
      const entityIdString = String(fieldContext.state.entityId)
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
      return filterByActiveChildSelect(
        allEntities.value,
        parentTypeEntity.value,
        validChildrenKey,
        optionEntityKey.value
      )
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
        const entityIdString = String(fieldContext.state.entityId)
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
          } catch (err) {
            logger.warn('Could not read form value for direct matching path', { parentPathKey, err })
          }
        }
      }

      if (!currentEntityValue) return []
      return filterByDirectMatching(
        allEntities.value,
        currentEntityValue,
        String(childPathKey),
        String(fieldContext.state.entityId)
      )
    }
    
    // PATTERN: Return all annotation instances when AnnotationAssignmentSelect is detected
    if (isAnnotationAssignmentSelect.value) {
      return allEntities.value
    }
    
    const config = selectConfig.value
    
    if (isAttendeeSelect.value && optionEntityKey.value === 'blockInstance') {
      const allBlockShapes = adminComp.getEntities('blockShape')
      const stateControlBlockShapeIds = new Set(
        allBlockShapes
          .filter((bs: GlobalEntity<'blockShape'>) => {
            const blockShapeTyped = bs as GlobalEntity<'blockShape'> & { isStateControl?: boolean }
            return blockShapeTyped.isStateControl === true
          })
          .map((bs: GlobalEntity<'blockShape'>) => bs.id)
      )
      return filterByAttendeeSelectBlockInstances(allEntities.value, stateControlBlockShapeIds)
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



