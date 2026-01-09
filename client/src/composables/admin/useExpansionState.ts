/**
 * Expansion State Composable
 * 
 * LEARNING: Extracts expansion state logic from ShapesTab component
 * WHY: Components should be thin UI wrappers - expansion state belongs in composables
 * PATTERN: Composable that provides expansion state and helper functions
 * 
 * This composable handles:
 * - Expanded entities state (array of entity IDs)
 * - Helper function to check if panel is expanded
 */

import { ref, type Ref } from 'vue'

/**
 * Expansion State Composable Return Type
 */
export interface UseExpansionStateReturn {
  /**
   * Expanded entities state (array of entity IDs)
   */
  expandedEntities: Ref<string[]>
  
  /**
   * Check if a panel is expanded
   */
  isPanelExpanded: (entityId: string) => boolean
}

/**
 * Expansion State Composable
 * 
 * LEARNING: Provides expansion state logic extracted from ShapesTab component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with expansion state ref and helper function
 */
export function useExpansionState(): UseExpansionStateReturn {
  /**
   * LEARNING: Reactive expanded entities state
   * WHY: Tracks which entity cards are expanded
   * PATTERN: Array of entity IDs that are currently expanded
   */
  const expandedEntities = ref<string[]>([])

  /**
   * LEARNING: Helper function to check if a panel is expanded
   * WHY: Determines whether to show editable field or static text in title
   * PATTERN: Check if entity ID is in expandedEntities array
   */
  const isPanelExpanded = (entityId: string): boolean => {
    return expandedEntities.value.includes(entityId)
  }

  return {
    expandedEntities,
    isPanelExpanded
  }
}

