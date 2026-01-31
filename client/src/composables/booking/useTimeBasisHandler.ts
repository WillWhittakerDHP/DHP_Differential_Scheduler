/**
 * LEARNING: Shared time basis click handler
 * WHY: Time basis toggle logic is duplicated across TimeBasisButtonGrid and TimeBasisSelector
 * PATTERN: Extract shared handler logic into composable
 * 
 * Used by:
 * - TimeBasisButtonGrid.vue
 * - TimeBasisSelector.vue
 */

export interface TimeBasisHandlerProps {
  isDifferentialService: boolean
  startTimeType: 'major' | 'minor' | 'nonDifferential'
}

export interface TimeBasisHandlerEmits {
  (e: 'time-basis-change', type: 'major' | 'minor'): void
}

/**
 * LEARNING: Handler for Time Basis button clicks
 * WHY: Toggles between Selected/Active states per user story requirements
 * PATTERN: Toggle function that prevents null state - non-differential always uses 'nonDifferential'
 * USER_STORY: For differential services, toggle between major/minor. For non-differential, always 'nonDifferential'
 */
export function useTimeBasisHandler(
  props: TimeBasisHandlerProps,
  emit: TimeBasisHandlerEmits
) {
  const handleTimeBasisClick = (type: 'major' | 'minor'): void => {
    // For non-differential services, always use 'nonDifferential' (cannot change)
    if (!props.isDifferentialService) {
      return
    }
    
    // For differential services, toggle between major/minor
    // Toggle: clicking selected button deselects it (switches to other), clicking active button selects it
    if (props.startTimeType === type) {
      // Clicking selected button switches to the other option
      const newType = type === 'major' ? 'minor' : 'major'
      emit('time-basis-change', newType)
    } else {
      // Clicking active button selects it
      emit('time-basis-change', type)
    }
  }

  return {
    handleTimeBasisClick
  }
}
