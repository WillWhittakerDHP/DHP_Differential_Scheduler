/**
 * WHY: useWizardDisplay Composable

WHY: Moves step subtitle generation and loa...
 */
import { computed } from 'vue'
import type { WizardStepConfig } from '@/configs/wizardSteps'
import type {
  UseWizardDisplayParams,
  UseWizardDisplayReturn,
} from '@/types/booking/wizardDisplay'
import {
  buildWizardStepSubtitles,
  formatPropertyDetailsAddress,
  resolveWizardLoadedServiceName,
} from '@/utils/booking/wizardDisplayFormatters'

export type { WizardStepConfig }

export function useWizardDisplay(params: UseWizardDisplayParams): UseWizardDisplayReturn {
  const { steps, selectedServiceTypeBlocks, loadedWizardState } = params

  const stepSubtitles = computed(() =>
    buildWizardStepSubtitles(steps, selectedServiceTypeBlocks.value)
  )

  const loadedServiceName = computed(() =>
    resolveWizardLoadedServiceName(
      loadedWizardState?.value?.services,
      selectedServiceTypeBlocks.value
    )
  )

  const loadedPropertyAddress = computed(() => {
    const details = loadedWizardState?.value?.propertyDetails
    if (!details) return null
    return formatPropertyDetailsAddress(details)
  })

  return {
    stepSubtitles,
    loadedServiceName,
    loadedPropertyAddress,
  }
}
