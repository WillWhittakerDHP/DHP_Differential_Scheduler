/**
 * WHY: Component Distribution Composable

WHY: Encapsulates distribution calcul...
 */
import { computed, isRef, ref, watch } from 'vue'
import type { GlobalEntityId } from '@/types/entities'
import type { DistributionStrategy } from '@/types/component'
import type { UseComponentDistributionOptions, UseComponentDistributionReturn } from '@/types/componentDistribution'
import { useComponentEntity } from './useComponentEntity'
import { useGlobal } from './useGlobal'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

/**
 * PATTERN: Component Distribution Composable

PATTERN: Composable with computed pro...
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
   */
  const getComponentName = (componentId: GlobalEntityId): string => {
    const globalData = getGlobalData()
    if (!globalData) return componentId
    
    const component = globalData.entities[entityKey]?.find(e => e.id === componentId)
    return component?.name ?? componentId
  }
  
  /**
   * PATTERN: Convert number to fixed decimal string
   */
  const formatValue = (value: number): string => {
    if (typeof value !== 'number') return String(value)
    return value.toFixed(2)
  }
  
  /**
   */
  const updateManualPreview = (): void => {
  }
  
  watch(distributionStrategy, (newStrategy) => {
    if (newStrategy === 'manual') {
      const globalData = getGlobalData()
      if (!globalData) return
      
      const composerIdValue = composerId.value
      const componentIds = componentEntity.data.getComponents(composerIdValue).map(ac => ac.childId)
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
   * PATTERN: Computed property that calculates preview based on distribution strategy
   */
  const preview = computed(() => {
    if (distributionStrategy.value === 'manual') {
      const globalData = getGlobalData()
      if (!globalData) return []
      
      const componentIds = componentEntity.data.getComponents(composerId.value).map(ac => ac.childId)
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
    
    return componentEntity.data.calculateDistributionPreview(
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
