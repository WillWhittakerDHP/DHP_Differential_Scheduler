/**
 * Select Handlers Composable
 * 
 * LEARNING: Extracts change handler logic from SelectInputs component
 * WHY: Components should be thin UI wrappers - event handling belongs in composables
 * PATTERN: Composable that provides change handlers for select inputs
 * 
 * This composable handles:
 * - Group change handling (for multiple selects with grouping)
 * - Standard change handling (single and multiple selects)
 * - Value normalization and form updates
 * - Focus/blur handling
 * - Value normalization and validation
 */

import { ref, nextTick, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '../useFieldContext'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useSelectHandlers')

export interface UseSelectHandlersOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  rawFieldValue: ReadonlyVueRef<unknown>
  
  fieldValue: ComputedRef<string | string[] | null>
  
  isMultiple: ComputedRef<boolean>
  
  groupedByKey: ReadonlyVueRef<Array<{ groupKey: string; groupLabel: string; entities: unknown[] }>>
  
  entityCardSaveContext?: EntityCardSaveContext | null
  
  disableAutoSave?: boolean
  
  /**
   * Whether this is an AnnotationAssignmentSelect field
   * LEARNING: Annotations are now core entities, use standard relationship select pattern
   */
  isAnnotationAssignmentSelect?: ComputedRef<boolean>
}

export interface UseSelectHandlersReturn {
  isUpdatingProgrammatically: Ref<boolean>
  
  handleGroupChange: (groupKey: string, groupValue: string | string[] | null) => Promise<void>
  
  handleChange: (value: string | string[] | null) => Promise<void>
  
  handleFocus: () => void
  
  handleBlur: () => Promise<void>
}

/**
 * Select Handlers Composable
 * 
 * LEARNING: Provides change handler logic extracted from SelectInputs component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with event handlers for select inputs
 */
export function useSelectHandlers(
  options: UseSelectHandlersOptions
): UseSelectHandlersReturn {
  const {
    fieldContext,
    rawFieldValue,
    fieldValue,
    isMultiple,
    groupedByKey,
    entityCardSaveContext = null,
    disableAutoSave = false
  } = options

  /**
   * LEARNING: Flag to prevent recursive updates when form value changes programmatically
   * WHY: When setValue updates form, fieldValue computed updates, which updates :model-value,
   *      which can trigger @update:model-value again, causing infinite loop
   * PATTERN: Set flag before programmatic update, clear after, ignore @update events during flag
   */
  const isUpdatingProgrammatically = ref(false)

  /**
   * LEARNING: Handle change for a specific group when using multiple selects
   * WHY: When using multiple selects, need to combine values from all groups
   * PATTERN: Remove old values for this group, add new values, combine with other groups
   */
  const handleGroupChange = async (groupKey: string, groupValue: string | string[] | null): Promise<void> => {
    const currentValue = rawFieldValue.value
    const currentArray = Array.isArray(currentValue) 
      ? currentValue.map(v => String(v))
      : currentValue ? [String(currentValue)] : []
    
    const groups = groupedByKey.value
    const group = groups.find(g => g.groupKey === groupKey)
    if (!group) return
    
    const groupEntityIds = new Set(group.entities.map((e: unknown) => String((e as { id: unknown }).id)))
    
    const otherGroupValues = currentArray.filter(v => !groupEntityIds.has(v))
    
    const newGroupValues = Array.isArray(groupValue)
      ? groupValue.map(v => String(v)).filter(v => v !== '')
      : groupValue ? [String(groupValue)] : []
    
    const combinedValues = [...otherGroupValues, ...newGroupValues]
    const uniqueValues = Array.from(new Set(combinedValues))
    
    const finalValue = isMultiple.value ? uniqueValues : (uniqueValues[0] ?? undefined)
    fieldContext.setValue(finalValue)
  }

  /**
   * LEARNING: Handle standard change event
   * WHY: Handles value changes for both single and multiple selects
   * PATTERN: Normalize value, then update form (EntityCard handles relationship CRUD on save)
   * 
   * LEARNING: Annotations now work like other relationship selects
   * WHY: annotationAssignments is attached to entities, form value is array of IDs
   * PATTERN: Just update form value - EntityCard handles relationship create/delete on save
   */
  const handleChange = async (value: string | string[] | null): Promise<void> => {
    // PATTERN: Check flag before processing update
    if (isUpdatingProgrammatically.value) {
      return
    }
    
    let normalizedValue: string | string[] | undefined = value ?? undefined
    
    if (isMultiple.value) {
      if (value === null || value === undefined) {
        normalizedValue = []
      } else if (Array.isArray(value)) {
        normalizedValue = value.map(v => String(v)).filter(v => v !== '')
      } else {
        const currentValue = fieldValue.value
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const newValueStr = String(value)
        
        if (currentArray.includes(newValueStr)) {
          normalizedValue = currentArray.filter(v => v !== newValueStr)
        } else {
          normalizedValue = [...currentArray, newValueStr]
        }
      }
    } else {
      if (value === null || value === undefined || value === '') {
        normalizedValue = undefined
      } else if (Array.isArray(value)) {
        normalizedValue = value.length > 0 ? String(value[0]) : undefined
      } else {
        const stringValue = String(value)
        // PATTERN: Use sentinel value '__NULL__' in options, convert back to null when saving
        if (stringValue === '__NULL__' && String(fieldContext.fieldKey) === 'ternaryDefault') {
          normalizedValue = undefined // Will be saved as null
        } else {
          normalizedValue = stringValue
        }
      }
    }
    
    // PATTERN: Compare normalized value with current field value before updating
    const currentFieldValue = fieldValue.value
    const currentArray = Array.isArray(currentFieldValue) ? currentFieldValue : (currentFieldValue ? [String(currentFieldValue)] : [])
    const normalizedArray = Array.isArray(normalizedValue) ? normalizedValue : (normalizedValue ? [String(normalizedValue)] : [])
    const currentSorted = [...currentArray].sort().join(',')
    const normalizedSorted = [...normalizedArray].sort().join(',')
    
    if (currentSorted !== normalizedSorted) {
      // PATTERN: Set flag, update, then clear flag in nextTick to allow future user updates
      isUpdatingProgrammatically.value = true
      try {
        fieldContext.setValue(normalizedValue)
        await nextTick()
      } finally {
        isUpdatingProgrammatically.value = false
      }
    }
  }

  /**
   * LEARNING: Handle focus event
   * WHY: Component needs to track focus state
   * PATTERN: Call fieldContext.setFocus
   */
  const handleFocus = (): void => {
    fieldContext.setFocus(true)
  }

  /**
   * LEARNING: Handle blur event
   * WHY: Component needs to validate and save on blur
   * PATTERN: Validate, then save if valid
   */
  const handleBlur = async (): Promise<void> => {
    fieldContext.setFocus(false)
    
    // PATTERN: Match useFieldInputHandlers behavior - new entities use handleSave, not field-level save
    if (entityCardSaveContext?.isNew) {
      return
    }
    
    // PATTERN: Skip auto-save if disableAutoSave flag is set
    if (disableAutoSave) {
      return
    }
    
    const isValid = await fieldContext.validate()
    
    if (isValid) {
      try {
        await fieldContext.save()
      } catch (error) {
        logger.warn('Failed to save field on blur', { error, fieldKey: fieldContext.fieldKey })
      }
    }
  }

  return {
    isUpdatingProgrammatically,
    handleGroupChange,
    handleChange,
    handleFocus,
    handleBlur
  }
}

