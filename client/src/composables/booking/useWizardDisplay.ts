/**
 * WHY: useWizardDisplay Composable

WHY: Moves step subtitle generation and loa...
 */
import { computed, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { WizardStepConfig } from '@/configs/wizardSteps'

export type { WizardStepConfig }

export interface UseWizardDisplayParams {
  steps: WizardStepConfig[]
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  loadedWizardState: Ref<WizardStateData | null> | null
}

export interface UseWizardDisplayReturn {
  stepSubtitles: ComputedRef<string[]>
  loadedServiceName: ComputedRef<string | null>
  loadedPropertyAddress: ComputedRef<string | null>
}

/**
 * WHY: useWizardDisplay composable

WHY: Extracts display logic from component ...
 */
export function useWizardDisplay(params: UseWizardDisplayParams): UseWizardDisplayReturn {
  const {
    steps,
    selectedServiceTypeBlocks,
    loadedWizardState
  } = params

  /**
   * Session 1.3.9.5: Updated to show first service name or count for multiple selections
   */
  const stepSubtitles = computed(() => {
    const baseSubtitles = steps.map(step => step.subtitle)
    
    if (selectedServiceTypeBlocks.value.length > 0) {
      const firstService = selectedServiceTypeBlocks.value[0]
      if (selectedServiceTypeBlocks.value.length === 1) {
        baseSubtitles[0] = `Identifying your needs - ${firstService.name}`
      } else {
        baseSubtitles[0] = `Identifying your needs - ${firstService.name} + ${selectedServiceTypeBlocks.value.length - 1} more`
      }
    }
    
    return baseSubtitles
  })

  /**
   * Session 1.3.9.5: Updated to use array - show first service name or count
   */
  const loadedServiceName = computed(() => {
    const loadedServices = loadedWizardState?.value?.services
    if (loadedServices && loadedServices.length > 0) {
      const first = loadedServices[0]
      if (loadedServices.length === 1) return first.name
      return `${first.name} + ${loadedServices.length - 1} more`
    }
    if (selectedServiceTypeBlocks.value.length > 0) {
      const firstService = selectedServiceTypeBlocks.value[0]
      if (selectedServiceTypeBlocks.value.length === 1) {
        return firstService.name
      }
      return `${firstService.name} + ${selectedServiceTypeBlocks.value.length - 1} more`
    }
    return null
  })

  /**
   */
  const loadedPropertyAddress = computed(() => {
    if (!loadedWizardState?.value?.propertyDetails) return null
    
    const { address, unit, city, state, zipCode } = loadedWizardState.value.propertyDetails
    const parts = [address]
    if (unit) parts.push(`Unit ${unit}`)
    if (city) parts.push(city)
    if (state) parts.push(state)
    if (zipCode) parts.push(zipCode)
    
    return parts.filter(Boolean).join(', ') || null
  })

  return {
    stepSubtitles,
    loadedServiceName,
    loadedPropertyAddress
  }
}

