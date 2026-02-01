/**
 * useInstanceSelectionState Composable
 * 
 * LEARNING: Generic v-model bridges for any block instance selection
 * WHY: Not service-specific - works with any block shape selection (user type, service, property, option)
 * PATTERN: Composable that provides computed properties with getter/setter for two-way binding
 * 
 * Features:
 * - V-model bridge for single-select (user type, availability option)
 * - V-model bridge for multi-select (services, property type blocks)
 * - Watch loaded wizard state to sync selections
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 * NOTE: Renamed from useServiceSelectionState to useInstanceSelectionState for generic usage
 */

import { computed, watch, nextTick, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'

/**
 * Generic wizard instance interface
 * LEARNING: Subset of wizard methods needed for selection state management
 */
export interface GenericWizardInstance {
  selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  availableUserTypeBlocks: Ref<BookingBlockInstance[]>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  availableServices: Ref<BookingBlockInstance[]>
  selectUserTypeBlock: (userTypeBlock: BookingBlockInstance | null, skipCascade?: boolean) => void
  toggleServiceTypeBlock: (service: BookingBlockInstance, skipCascade?: boolean) => void
}

export interface UseInstanceSelectionStateParams {
  availableInstances: ComputedRef<BookingBlockInstance[]>
  
  selectedInstances: ComputedRef<BookingBlockInstance[]> | Ref<BookingBlockInstance[]>
  
  toggleSelection?: (instance: BookingBlockInstance, skipCascade?: boolean) => void
  
  loadedWizardState?: Ref<WizardStateData | null> | null
}

export interface UseInstanceSelectionStateReturn {
  selectedId: ComputedRef<string | null>
  
  selectedIds: ComputedRef<string[]>
}

/**
 * useInstanceSelectionState composable
 * 
 * LEARNING: Generic v-model bridges for any block instance selection
 * WHY: Decoupled from service-specific naming for broader reuse
 * PATTERN: Composable that provides computed properties with getter/setter
 * 
 * @example
 * ```ts
 * // Single-select for user types
 * const { selectedId: selectedUserTypeBlockId } = useInstanceSelectionState({
 *   wizard,
 *   availableInstances: computed(() => wizard.availableUserTypeBlocks.value),
 *   selectedInstances: computed(() => wizard.selectedUserTypeBlock.value ? [wizard.selectedUserTypeBlock.value] : []),
 *   selectionMode: 'single',
 *   toggleSelection: (ut) => wizard.selectUserTypeBlock(ut)
 * })
 * 
 * // Multi-select for services
 * const { selectedIds: selectedServiceIds } = useInstanceSelectionState({
 *   wizard,
 *   availableInstances: computed(() => wizard.availableServices.value),
 *   selectedInstances: computed(() => wizard.selectedServiceTypeBlocks.value),
 *   selectionMode: 'multi',
 *   toggleSelection: (s) => wizard.toggleServiceTypeBlock(s)
 * })
 * ```
 */
export function useInstanceSelectionState(
  params: UseInstanceSelectionStateParams
): UseInstanceSelectionStateReturn {
  const { 
    availableInstances, 
    selectedInstances,
    toggleSelection,
    loadedWizardState 
  } = params

  /**
   * LEARNING: V-model bridge for single-select
   * WHY: Enables v-model binding with VRadio while syncing with wizard state
   * PATTERN: Computed with getter/setter for two-way binding
   */
  const selectedId = computed<string | null>({
    get: () => {
      const instances = Array.isArray(selectedInstances.value) 
        ? selectedInstances.value 
        : [selectedInstances.value].filter(Boolean)
      return instances[0]?.id || null
    },
    set: (id: string | null) => {
      if (id && toggleSelection) {
        const instance = findById(availableInstances.value, id)
        if (instance) {
          toggleSelection(instance)
        }
      }
    }
  })

  /**
   * LEARNING: V-model bridge for multi-select
   * WHY: Enables v-model binding with VCheckbox while syncing with wizard state
   * PATTERN: Computed with getter/setter for two-way binding with arrays
   */
  const selectedIds = computed<string[]>({
    get: () => {
      const instances = Array.isArray(selectedInstances.value) 
        ? selectedInstances.value 
        : [selectedInstances.value].filter(Boolean)
      return instances.map(i => i.id)
    },
    set: (ids: string[]) => {
      if (toggleSelection) {
        const { resolved: instances } = resolveByIds(availableInstances.value, ids)
        
        for (const instance of instances) {
          toggleSelection(instance, true) // Skip cascade during batch update
        }
      }
    }
  })

  /**
   * LEARNING: Watch loaded wizard state for initial population
   * WHY: Ensures selections are properly set when loading appointment data
   * PATTERN: Watch with immediate for initial sync
   */
  if (loadedWizardState) {
    watch(loadedWizardState, (newState) => {
      if (newState) {
        nextTick(() => {
        })
      }
    }, { immediate: true })
  }

  return {
    selectedId,
    selectedIds
  }
}

