/**
 * Select Inputs Async Logic Composable
 * 
 * LEARNING: Extracts async logic from SelectInputs.vue into reusable composable
 * WHY: Reduces component complexity, improves testability, enables reuse
 * PATTERN: Composable that provides async handlers for select input operations
 */

import { computed, type ComputedRef } from 'vue'
import type { SelectOption } from '@/composables/useSelectOptions'
import { useAttendeeQuickSelect } from '@/composables/admin/useAttendeeQuickSelect'

export interface UseSelectInputsAsyncOptions {
  options: ComputedRef<SelectOption[]>
  handleChange: (value: string | string[] | null) => Promise<void>
}

export interface UseSelectInputsAsyncReturn {
  validOptionIds: ComputedRef<string[]>
  handleQuickSelectMajor: () => Promise<void>
  handleQuickSelectMinor: () => Promise<void>
  handleQuickSelectAll: () => Promise<void>
  quickSelect: ReturnType<typeof useAttendeeQuickSelect>
}

/**
 * LEARNING: Extract async logic from SelectInputs.vue
 * WHY: Reduces component complexity by moving async handlers to composable
 * PATTERN: Composable provides async handlers for quick-select operations
 */
export function useSelectInputsAsync(
  options: UseSelectInputsAsyncOptions
): UseSelectInputsAsyncReturn {
  const { options: optionsRef, handleChange } = options

  // LEARNING: Use attendee quick-select composable for AttendeeSelect fields
  // WHY: Provides quick-select functionality for major/minor attendees from business settings
  // PATTERN: Initialize composable for quick-select operations
  const quickSelect = useAttendeeQuickSelect()

  /**
   * LEARNING: Get valid option IDs for quick-select filtering
   * WHY: Quick-select should only select attendees that are actually available in the select field
   * PATTERN: Extract value from options array
   */
  const validOptionIds = computed(() => {
    return optionsRef.value
      .map(opt => {
        // Handle nested options (grouped selects)
        // LEARNING: Type guard to check if opt is SelectOption with children property
        // WHY: options.value can be union type, need to check for SelectOption before accessing children
        if ('children' in opt && opt.children) {
          return opt.children.map((child: SelectOption) => String(child.value))
        }
        return String(opt.value)
      })
      .flat()
      .filter((id): id is string => id !== '' && id !== '__NULL__')
  })

  /**
   * LEARNING: Handle quick-select for major attendees
   * WHY: Replaces current selection with major attendees from business settings
   * PATTERN: Get IDs from quick-select composable, then call handleChange
   */
  const handleQuickSelectMajor = async (): Promise<void> => {
    const majorIds = quickSelect.selectMajor(validOptionIds.value)
    if (majorIds.length > 0) {
      await handleChange(majorIds)
    }
  }

  /**
   * LEARNING: Handle quick-select for minor attendees
   * WHY: Replaces current selection with minor attendees from business settings
   * PATTERN: Get IDs from quick-select composable, then call handleChange
   */
  const handleQuickSelectMinor = async (): Promise<void> => {
    const minorIds = quickSelect.selectMinor(validOptionIds.value)
    if (minorIds.length > 0) {
      await handleChange(minorIds)
    }
  }

  /**
   * LEARNING: Handle quick-select for all attendees (major + minor)
   * WHY: Replaces current selection with all configured attendees from business settings
   * PATTERN: Get IDs from quick-select composable, then call handleChange
   */
  const handleQuickSelectAll = async (): Promise<void> => {
    const allIds = quickSelect.selectAll(validOptionIds.value)
    if (allIds.length > 0) {
      await handleChange(allIds)
    }
  }

  return {
    validOptionIds,
    handleQuickSelectMajor,
    handleQuickSelectMinor,
    handleQuickSelectAll,
    quickSelect
  }
}
