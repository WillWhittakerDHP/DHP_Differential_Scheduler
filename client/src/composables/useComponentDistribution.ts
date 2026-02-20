/**
 * Component Distribution Composable
 * 
 * LEARNING: Provides component distribution logic extracted from ComponentDistributionModal component
 * WHY: Encapsulates distribution calculations, value formatting, and component name retrieval
 * PATTERN: Composable that manages component distribution operations
 * 
 * This composable addresses recursion issues by moving all logic out of components
 * and into properly memoized computed properties.
 */

import { computed, isRef, ref, watch, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionPreview, DistributionStrategy } from '@/types/component'
import { useComponentEntity } from './useComponentEntity'
import { useGlobal } from './useGlobal'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

export interface UseComponentDistributionOptions {
  entityKey: GlobalEntityKey
  composerId: Ref<GlobalEntityId> | GlobalEntityId
  propertyKey: Ref<string> | string
  newValue: Ref<number> | number
  distributionStrategy: Ref<string> | string
  manualValues?: Ref<Record<GlobalEntityId, number>> | Record<GlobalEntityId, number>
  modalOpen?: Ref<boolean>
}

export interface UseComponentDistributionReturn {
  /** P2 type-similarity: uses shared DistributionPreview shape. */
  preview: Ref<DistributionPreview[]>
  getCurrentValue: (componentId: GlobalEntityId) => number
  getComponentName: (componentId: GlobalEntityId) => string
  formatValue: (value: number) => string
  updateManualPreview: () => void
}

/**
 * Component Distribution Composable
 * 
 * LEARNING: Manages component distribution calculations and formatting
 * WHY: Prevents recursion by moving all logic to computed properties
 * PATTERN: Composable with computed properties for distribution preview and methods for operations
 */
export function useComponentDistribution(options: UseComponentDistributionOptions): UseComponentDistributionReturn {
  const {
    entityKey,
    composerId: composerIdOption,
    propertyKey: propertyKeyOption,
    newValue: newValueOption,
    distributionStrategy: distributionStrategyOption,
    manualValues: manualValuesOption,
    modalOpen
  } = options
  
  const composerId = isRef(composerIdOption) ? composerIdOption : computed(() => composerIdOption)
  const propertyKey = isRef(propertyKeyOption) ? propertyKeyOption : computed(() => propertyKeyOption)
  const newValue = isRef(newValueOption) ? newValueOption : computed(() => newValueOption)
  const distributionStrategy = isRef(distributionStrategyOption) 
    ? distributionStrategyOption 
    : ref(distributionStrategyOption)
  const manualValues = manualValuesOption
    ? isRef(manualValuesOption)
      ? manualValuesOption
      : ref(manualValuesOption)
    : ref<Record<GlobalEntityId, number>>({})
  
  const componentEntity = useComponentEntity(entityKey)
  const { getGlobalData } = useGlobal()
  
  /**
   * LEARNING: Get current value for a component
   * WHY: Retrieves current property value from global data
   * PATTERN: Look up component in global data, extract property value
   */
  const getCurrentValue = (componentId: GlobalEntityId): number => {
    const globalData = getGlobalData()
    if (!globalData) return 0
    
    const component = globalData.entities[entityKey]?.find(e => e.id === componentId)
    if (!component) return 0
    
    const value = getEntityFieldValue(component, String(propertyKey.value))
    return typeof value === 'number' ? value : 0
  }
  
  /**
   * LEARNING: Get component name for display
   * WHY: Retrieves component name from global data
   * PATTERN: Look up component in global data, return name or fallback to ID
   */
  const getComponentName = (componentId: GlobalEntityId): string => {
    const globalData = getGlobalData()
    if (!globalData) return componentId
    
    const component = globalData.entities[entityKey]?.find(e => e.id === componentId)
    return component?.name ?? componentId
  }
  
  /**
   * LEARNING: Format value for display
   * WHY: Formats numeric values to 2 decimal places
   * PATTERN: Convert number to fixed decimal string
   */
  const formatValue = (value: number): string => {
    if (typeof value !== 'number') return String(value)
    return value.toFixed(2)
  }
  
  /**
   * LEARNING: Update manual preview
   * WHY: No-op function - preview updates automatically via computed property
   * PATTERN: Empty function for consistency with component API
   */
  const updateManualPreview = (): void => {
  }
  
  /**
   * LEARNING: Watch distribution strategy and initialize manual values when switching to manual
   * WHY: When strategy changes to manual, need to initialize manual values with current values
   * PATTERN: Watch strategy ref, initialize manual values when strategy becomes 'manual'
   */
  watch(distributionStrategy, (newStrategy) => {
    if (newStrategy === 'manual') {
      const globalData = getGlobalData()
      if (!globalData) return
      
      const composerIdValue = composerId.value
      const componentIds = componentEntity.getComponents(composerIdValue).map(ac => ac.childId)
      // WHY: Functional approach avoids mutations, aligns with workspace rules
      // PATTERN: Reduce componentIds to object with current values, then merge with existing manualValues
      const newManualValues = componentIds.reduce<Record<GlobalEntityId, number>>((acc, componentId) => {
        if (!(componentId in manualValues.value)) {
          acc[componentId] = getCurrentValue(componentId)
        } else {
          acc[componentId] = manualValues.value[componentId]
        }
        return acc
      }, {})
      manualValues.value = { ...manualValues.value, ...newManualValues }
    }
  })
  
  /**
   * LEARNING: Watch modal open state and reset when modal opens
   * WHY: When modal opens, reset strategy and manual values to defaults
   * PATTERN: Watch modalOpen ref, reset state when it becomes true
   */
  if (modalOpen) {
    watch(modalOpen, (isOpen) => {
      if (isOpen) {
        if (isRef(distributionStrategy)) {
          distributionStrategy.value = 'proportional'
        }
        manualValues.value = {}
      }
    })
  }
  
  /**
   * LEARNING: Calculate distribution preview
   * WHY: Shows preview of how changes will be distributed to components
   * PATTERN: Computed property that calculates preview based on distribution strategy
   */
  const preview = computed(() => {
    if (distributionStrategy.value === 'manual') {
      const globalData = getGlobalData()
      if (!globalData) return []
      
      const componentIds = componentEntity.getComponents(composerId.value).map(ac => ac.childId)
      return componentIds.map(componentId => {
        const currentValue = getCurrentValue(componentId)
        const manualValue = manualValues.value[componentId] ?? currentValue
        return {
          componentId,
          currentValue,
          newValue: manualValue,
          change: manualValue - currentValue,
        }
      })
    }
    
    return componentEntity.calculateDistributionPreview(
      composerId.value,
      propertyKey.value,
      newValue.value,
      distributionStrategy.value as DistributionStrategy
    )
  })
  
  return {
    preview,
    getCurrentValue,
    getComponentName,
    formatValue,
    updateManualPreview
  }
}

