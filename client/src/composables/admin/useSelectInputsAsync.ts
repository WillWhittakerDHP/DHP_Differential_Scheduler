/**
 * WHY: Select Inputs Async Logic Composable

 */
import { computed } from 'vue'
import { useAttendeeQuickSelect } from '@/composables/admin/useAttendeeQuickSelect'
import type { UseSelectInputsAsyncOptions, UseSelectInputsAsyncReturn } from '@/types/admin/selectInputsAsync'

export function useSelectInputsAsync(
  options: UseSelectInputsAsyncOptions
): UseSelectInputsAsyncReturn {
  const { options: optionsRef, handleChange } = options

  // PATTERN: Initialize composable for quick-select operations
  const quickSelect = useAttendeeQuickSelect()

  /**
   * PATTERN: Extract value from options array
   */
  const validOptionIds = computed(() => {
    return optionsRef.value
      .map(opt => {
        if ('children' in opt && opt.children) {
          return opt.children.map((child: SelectOption) => String(child.value))
        }
        return String(opt.value)
      })
      .flat()
      .filter((id): id is string => id !== '' && id !== '__NULL__')
  })

  const handleQuickSelectMajor = async (): Promise<void> => {
    const majorIds = quickSelect.selectMajor(validOptionIds.value)
    if (majorIds.length > 0) {
      await handleChange(majorIds)
    }
  }

  const handleQuickSelectMinor = async (): Promise<void> => {
    const minorIds = quickSelect.selectMinor(validOptionIds.value)
    if (minorIds.length > 0) {
      await handleChange(minorIds)
    }
  }

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
