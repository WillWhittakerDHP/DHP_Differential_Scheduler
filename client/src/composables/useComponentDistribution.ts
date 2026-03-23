/**
 * WHY: Component Distribution Composable

WHY: Encapsulates distribution calcul...
 */
import { computed, isRef, ref, watch } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { UseComponentDistributionOptions, UseComponentDistributionReturn } from '@/types/componentDistribution'
import { useComponentEntity } from './useComponentEntity'
import { useGlobal } from './useGlobal'
import {
  computeDistributionPreview,
  formatDistributionDecimal,
  mergeManualValuesForStrategySwitch,
  readDistributionComponentLabel,
  readDistributionNumericField,
} from '@/utils/component/componentDistributionHelpers'

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
    modalOpen,
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

  const getCurrentValue = (componentId: GlobalEntityId): number =>
    readDistributionNumericField(
      getGlobalData(),
      entityKey,
      componentId,
      String(propertyKey.value)
    )

  const getComponentName = (componentId: GlobalEntityId): string =>
    readDistributionComponentLabel(getGlobalData(), entityKey, componentId)

  const formatValue = (value: number): string => formatDistributionDecimal(value)

  const updateManualPreview = (): void => {}

  watch(distributionStrategy, (newStrategy) => {
    if (newStrategy !== 'manual') {
      return
    }
    const globalData = getGlobalData()
    const composerIdValue = composerId.value
    const componentIds = componentEntity.data.getComponents(composerIdValue).map((ac) => ac.childId)
    const merged = mergeManualValuesForStrategySwitch(
      globalData,
      entityKey,
      componentIds,
      manualValues.value,
      String(propertyKey.value)
    )
    manualValues.value = { ...manualValues.value, ...merged }
  })

  if (modalOpen) {
    watch(modalOpen, (isOpen) => {
      if (!isOpen) {
        return
      }
      if (isRef(distributionStrategy)) {
        distributionStrategy.value = 'proportional'
      }
      manualValues.value = {}
    })
  }

  const preview = computed(() => {
    const globalData = getGlobalData()
    const composerIdValue = composerId.value
    const componentIds = componentEntity.data.getComponents(composerIdValue).map((ac) => ac.childId)
    return computeDistributionPreview(
      distributionStrategy.value,
      globalData,
      entityKey,
      componentIds,
      manualValues.value,
      String(propertyKey.value),
      newValue.value,
      componentEntity.data.calculateDistributionPreview,
      composerIdValue
    )
  })

  return {
    preview,
    getCurrentValue,
    getComponentName,
    formatValue,
    updateManualPreview,
  }
}
