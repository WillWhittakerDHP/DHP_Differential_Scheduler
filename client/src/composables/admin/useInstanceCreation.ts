/**
 * Composable for instance creation logic
 * WHY: Extracts creation logic from InstancesTab
 * PATTERN: Composable that manages creation state, handlers, and DOM manipulation
 */

import { ref, nextTick, type Ref } from 'vue'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { GlobalEntity } from '@/types/entities'

export interface UseInstanceCreationOptions {
  expandedInstances: Ref<string[]>
}

export interface UseInstanceCreationReturn {
  isCreatingBlockInstance: Ref<Map<string, boolean>>
  newBlockInstanceInitialValues: Ref<Map<string, GlobalEntity<'blockInstance'>>>
  createBlockInstance: (blockShapeRef: string) => Promise<void>
  handleBlockInstanceCreated: (blockShapeRef: string, entity: GlobalEntity<'blockInstance'>) => void
  handleBlockInstanceCancelled: (blockShapeRef: string) => void
}

/**
 * Composable for managing instance creation
 * WHY: Centralizes instance creation state, handlers, and DOM manipulation
 * PATTERN: Returns reactive state and creation functions
 */
export function useInstanceCreation(
  options: UseInstanceCreationOptions
): UseInstanceCreationReturn {
  const { expandedInstances } = options

  /**
   * LEARNING: Inline creation state management
   * WHY: Instead of dialog, show inline EntityCard for creating new BlockInstances
   * PATTERN: Map of boolean flags per BlockShape group, plus initial values for new entity
   */
  const isCreatingBlockInstance = ref<Map<string, boolean>>(new Map())
  const newBlockInstanceInitialValues = ref<Map<string, GlobalEntity<'blockInstance'>>>(new Map())

  /**
   * LEARNING: Function to start inline creation for a specific BlockShape
   * WHY: Shows inline EntityCard at top of list instead of opening dialog
   * PATTERN: Set isCreating flag and generate initial values with blockShapeRef pre-filled
   */
  const createBlockInstance = async (blockShapeRef: string): Promise<void> => {
    // Generate default values with blockShapeRef pre-filled
    const defaults = getDefaultEntityValues('blockInstance')
    const initialValues = {
      ...defaults,
      blockShapeRef,
      // Generate a temp ID for form management
      id: `new-${Date.now()}` as string,
    } as GlobalEntity<'blockInstance'>
    
    // LEARNING: Vue 3 ref() with Map doesn't track mutations (set/delete)
    // WHY: Must replace the entire Map to trigger reactivity
    const newInitialValuesMap = new Map(newBlockInstanceInitialValues.value)
    newInitialValuesMap.set(blockShapeRef, initialValues)
    newBlockInstanceInitialValues.value = newInitialValuesMap
    
    const newCreatingMap = new Map(isCreatingBlockInstance.value)
    newCreatingMap.set(blockShapeRef, true)
    isCreatingBlockInstance.value = newCreatingMap
    
    // Expand the new card immediately
    expandedInstances.value = [`new-${blockShapeRef}`, ...expandedInstances.value]
    
    // LEARNING: Focus the name input field after card is created
    // WHY: Better UX - user can start typing immediately without clicking
    // PATTERN: Use nextTick and retry mechanism to wait for DOM update and VExpansionPanel animation
    await nextTick()
    
    // Retry mechanism to find and focus the input (VExpansionPanel animation takes time)
    const focusNameInput = async (): Promise<void> => {
      // Try multiple times with increasing delays to account for VExpansionPanel animation
      const delays = [100, 200, 300, 400, 500]
      
      for (const delay of delays) {
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Find the new instance card panel
        const newCardPanel = document.querySelector('.new-instance-card')
        if (!newCardPanel) continue
        
        // Look for the name input field within the panel
        // Try multiple selectors to find the input
        const selectors = [
          '#field-name',
          '[id*="field-name"]',
          'input[type="text"]',
          'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
        ]
        
        for (const selector of selectors) {
          const element = newCardPanel.querySelector(selector)
          if (!element) continue
          
          // For Vuetify AppTextField, find the actual input element inside
          let inputElement: HTMLElement | null = null
          
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            inputElement = element as HTMLElement
          } else {
            inputElement = element.querySelector('input') || 
                          element.querySelector('textarea')
          }
          
          if (inputElement) {
            // LEARNING: Check if document already has focus before attempting autofocus
            // WHY: Prevents "Autofocus processing was blocked" browser warning
            // PATTERN: Only focus if no element currently has focus, or if it's safe to change focus
            const activeElement = document.activeElement
            const isSafeToFocus = !activeElement || 
              activeElement === document.body || 
              activeElement.tagName === 'BODY' ||
              (activeElement instanceof HTMLElement && activeElement.tabIndex === -1)
            
            if (isSafeToFocus) {
              try {
                inputElement.focus()
                if (inputElement instanceof HTMLInputElement && inputElement.select) {
                  inputElement.select()
                }
              } catch (error) {
                // Focus failed (e.g., element not visible yet) - ignore
              }
            }
            return
          }
        }
      }
    }
    
    await focusNameInput()
  }

  /**
   * LEARNING: Event handler for inline creation save
   * WHY: Handles successful creation - clear creation state, Vue Query will refetch
   * PATTERN: Clear isCreating flag and initial values for this BlockShape
   */
  const handleBlockInstanceCreated = (blockShapeRef: string, _entity: GlobalEntity<'blockInstance'>): void => {
    // LEARNING: Vue 3 ref() with Map doesn't track mutations (set/delete)
    // WHY: Must replace the entire Map to trigger reactivity
    // PATTERN: Create new Map from existing Map with updated values
    const newCreatingMap = new Map(isCreatingBlockInstance.value)
    newCreatingMap.set(blockShapeRef, false)
    isCreatingBlockInstance.value = newCreatingMap
    
    const newInitialValuesMap = new Map(newBlockInstanceInitialValues.value)
    newInitialValuesMap.delete(blockShapeRef)
    newBlockInstanceInitialValues.value = newInitialValuesMap
    
    // Remove temp expansion state
    expandedInstances.value = expandedInstances.value.filter(id => id !== `new-${blockShapeRef}`)
  }

  /**
   * LEARNING: Event handler for inline creation cancel
   * WHY: User cancelled creation - clear creation state
   * PATTERN: Clear isCreating flag and initial values for this BlockShape
   */
  const handleBlockInstanceCancelled = (blockShapeRef: string): void => {
    // LEARNING: Vue 3 ref() with Map doesn't track mutations (set/delete)
    // WHY: Must replace the entire Map to trigger reactivity
    const newCreatingMap = new Map(isCreatingBlockInstance.value)
    newCreatingMap.set(blockShapeRef, false)
    isCreatingBlockInstance.value = newCreatingMap
    
    const newInitialValuesMap = new Map(newBlockInstanceInitialValues.value)
    newInitialValuesMap.delete(blockShapeRef)
    newBlockInstanceInitialValues.value = newInitialValuesMap
    
    // Remove temp expansion state
    expandedInstances.value = expandedInstances.value.filter(id => id !== `new-${blockShapeRef}`)
  }

  return {
    isCreatingBlockInstance,
    newBlockInstanceInitialValues,
    createBlockInstance,
    handleBlockInstanceCreated,
    handleBlockInstanceCancelled
  }
}
