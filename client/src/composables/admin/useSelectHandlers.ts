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
 * - Annotation change handling (via useAnnotationSelect)
 * - Focus/blur handling
 * - Value normalization and validation
 */

import { ref, nextTick, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '../useFieldContext'
import type { UseAnnotationSelectReturn } from './useAnnotationSelect'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

/**
 * Select Handlers Composable Options
 */
export interface UseSelectHandlersOptions {
  /**
   * Field context
   */
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  /**
   * Raw field value (for value comparison)
   */
  rawFieldValue: ReadonlyVueRef<unknown>
  
  /**
   * Field value (normalized for display)
   */
  fieldValue: ComputedRef<string | string[] | null>
  
  /**
   * Whether select allows multiple selections
   */
  isMultiple: ComputedRef<boolean>
  
  /**
   * Whether this is a DescriptionSelect field
   */
  isDescriptionSelect: ComputedRef<boolean>
  
  /**
   * Grouped options (for group change handling)
   */
  groupedByKey: ReadonlyVueRef<Array<{ groupKey: string; groupLabel: string; entities: unknown[] }>>
  
  /**
   * Annotation select composable return (for annotation handling)
   */
  annotationSelect?: UseAnnotationSelectReturn
}

/**
 * Select Handlers Composable Return Type
 */
export interface UseSelectHandlersReturn {
  /**
   * Flag to prevent recursive updates when form value changes programmatically
   */
  isUpdatingProgrammatically: Ref<boolean>
  
  /**
   * Handle change for a specific group when using multiple selects
   */
  handleGroupChange: (groupKey: string, groupValue: string | string[] | null) => Promise<void>
  
  /**
   * Handle standard change event
   */
  handleChange: (value: string | string[] | null) => Promise<void>
  
  /**
   * Handle focus event
   */
  handleFocus: () => void
  
  /**
   * Handle blur event
   */
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
    isDescriptionSelect,
    groupedByKey,
    annotationSelect
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
    
    // Get all groups to determine which entities belong to which group
    const groups = groupedByKey.value
    const group = groups.find(g => g.groupKey === groupKey)
    if (!group) return
    
    const groupEntityIds = new Set(group.entities.map((e: unknown) => String((e as { id: unknown }).id)))
    
    // Remove values that belong to this group
    const otherGroupValues = currentArray.filter(v => !groupEntityIds.has(v))
    
    // Add new values from this group
    const newGroupValues = Array.isArray(groupValue)
      ? groupValue.map(v => String(v)).filter(v => v !== '')
      : groupValue ? [String(groupValue)] : []
    
    // Combine and deduplicate
    const combinedValues = [...otherGroupValues, ...newGroupValues]
    const uniqueValues = Array.from(new Set(combinedValues))
    
    // Set the combined value
    const finalValue = isMultiple.value ? uniqueValues : (uniqueValues[0] ?? undefined)
    fieldContext.setValue(finalValue)
  }

  /**
   * LEARNING: Handle standard change event
   * WHY: Handles value changes for both single and multiple selects, with special handling for annotations
   * PATTERN: Normalize value, handle annotations separately, then update form
   */
  const handleChange = async (value: string | string[] | null): Promise<void> => {
    // LEARNING: Ignore update events during programmatic updates
    // WHY: Prevents recursive loops when form updates trigger select updates
    // PATTERN: Check flag before processing update
    if (isUpdatingProgrammatically.value) {
      return
    }
    
    /**
     * LEARNING: Annotations are part of the annotation system, not relationships, so we manage via annotation router
     * WHY: Annotations use AnnotationAssignment relationships, not direct entity relationships
     * PATTERN: Compare old and new values, create/delete relationships accordingly
     */
    if (isDescriptionSelect.value && annotationSelect?.blockInstanceId.value) {
      const currentAnnotationIds = new Set(
        annotationSelect.blockInstanceAnnotations.value.map(rel => rel.annotationId)
      )
      
      let newAnnotationIds: string[]
      if (value === null || value === undefined) {
        newAnnotationIds = []
      } else if (Array.isArray(value)) {
        newAnnotationIds = value.map(v => String(v)).filter(v => v !== '')
      } else {
        newAnnotationIds = [String(value)]
      }
      const newAnnotationIdsSet = new Set(newAnnotationIds)
      
      // Find annotations to add (in new but not in current)
      const toAdd = newAnnotationIds.filter(id => !currentAnnotationIds.has(id))
      
      // Find annotations to remove (in current but not in new)
      const toRemove = Array.from(currentAnnotationIds).filter(id => !newAnnotationIdsSet.has(id))
      
      // Create relationships for added annotations
      for (const annotationId of toAdd) {
        try {
          await annotationSelect.createAnnotationRelationship.mutateAsync({
            annotationId,
            orderIndex: 0,
            isDefault: false,
            userTypeBlockBlockInstanceId: null
          })
        } catch (error) {
          // Error creating annotation relationship
        }
      }
      
      // Delete relationships for removed annotations
      for (const annotationId of toRemove) {
        try {
          await annotationSelect.deleteAnnotationRelationship.mutateAsync(annotationId)
        } catch (error) {
          // Error deleting annotation relationship
        }
      }
      
      // Update form value with new annotation IDs
      // LEARNING: Set flag before programmatic update to prevent recursive @update events
      isUpdatingProgrammatically.value = true
      try {
        fieldContext.setValue(isMultiple.value ? newAnnotationIds : (newAnnotationIds[0] ?? undefined))
        await nextTick()
      } finally {
        isUpdatingProgrammatically.value = false
      }
      return
    }
    
    // Standard handling for other select types
    let normalizedValue: string | string[] | undefined = value ?? undefined
    
    if (isMultiple.value) {
      // For multiple selects, always ensure value is an array
      if (value === null || value === undefined) {
        normalizedValue = []
      } else if (Array.isArray(value)) {
        // Already an array - ensure all values are strings
        normalizedValue = value.map(v => String(v)).filter(v => v !== '')
      } else {
        // Single value received - convert to array
        // Merge with existing values to preserve other selections
        const currentValue = fieldValue.value
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const newValueStr = String(value)
        
        // Check if value is already in array (toggle behavior)
        if (currentArray.includes(newValueStr)) {
          // Remove if already selected (toggle off)
          normalizedValue = currentArray.filter(v => v !== newValueStr)
        } else {
          // Add if not selected (toggle on)
          normalizedValue = [...currentArray, newValueStr]
        }
      }
    } else {
      // For single selects, ensure value is string or null
      if (value === null || value === undefined || value === '') {
        normalizedValue = undefined
      } else if (Array.isArray(value)) {
        // If array received for single select, take first value
        normalizedValue = value.length > 0 ? String(value[0]) : undefined
      } else {
        normalizedValue = String(value)
      }
    }
    
    // LEARNING: Check if value actually changed before calling setValue
    // WHY: Prevents recursive loops when form updates trigger select updates which trigger form updates
    // PATTERN: Compare normalized value with current field value before updating
    const currentFieldValue = fieldValue.value
    const currentArray = Array.isArray(currentFieldValue) ? currentFieldValue : (currentFieldValue ? [String(currentFieldValue)] : [])
    const normalizedArray = Array.isArray(normalizedValue) ? normalizedValue : (normalizedValue ? [String(normalizedValue)] : [])
    const currentSorted = [...currentArray].sort().join(',')
    const normalizedSorted = [...normalizedArray].sort().join(',')
    
    // Only update if value actually changed
    if (currentSorted !== normalizedSorted) {
      // LEARNING: Set flag before programmatic update to prevent recursive @update events
      // WHY: setValue updates form, which updates fieldValue computed, which updates :model-value,
      //      which can trigger @update:model-value - flag prevents processing that event
      // PATTERN: Set flag, update, then clear flag in nextTick to allow future user updates
      isUpdatingProgrammatically.value = true
      try {
        fieldContext.setValue(normalizedValue)
        // Clear flag in nextTick after form update propagates
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
    
    const isValid = await fieldContext.validate()
    
    if (isValid) {
      try {
        await fieldContext.save()
      } catch (error) {
        // Auto-save failed
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

