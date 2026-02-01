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

export function useTimeBasisHandler(
  props: TimeBasisHandlerProps,
  emit: TimeBasisHandlerEmits
) {
  const handleTimeBasisClick = (type: 'major' | 'minor'): void => {
    // For non-differential services, always use 'nonDifferential' (cannot change)
    if (!props.isDifferentialService) {
      return
    }
    
    if (props.startTimeType === type) {
      const newType = type === 'major' ? 'minor' : 'major'
      emit('time-basis-change', newType)
    } else {
      emit('time-basis-change', type)
    }
  }

  return {
    handleTimeBasisClick
  }
}
