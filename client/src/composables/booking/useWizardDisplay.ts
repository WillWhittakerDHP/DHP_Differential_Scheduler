/**
 * useWizardDisplay Composable
 * 
 * LEARNING: Extracts display-related computed properties from BookingWizard component
 * WHY: Moves step subtitle generation and loaded data display logic to composable
 * PATTERN: Composable that provides computed properties for wizard display
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

export interface StepDefinition {
  icon: string
  title: string
  subtitle: string
}

export interface UseWizardDisplayParams {
  steps: StepDefinition[]
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  loadedWizardState: Ref<WizardStateData | null> | null
}

export interface UseWizardDisplayReturn {
  stepSubtitles: ComputedRef<string[]>
  loadedServiceName: ComputedRef<string | null>
  loadedPropertyAddress: ComputedRef<string | null>
}

/**
 * useWizardDisplay composable
 * 
 * LEARNING: Provides computed properties for wizard display
 * WHY: Extracts display logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useWizardDisplay(params: UseWizardDisplayParams): UseWizardDisplayReturn {
  const {
    steps,
    selectedServiceTypeBlocks,
    loadedWizardState
  } = params

  /**
   * LEARNING: Computed property for step subtitles with dynamic service name
   * WHY: Shows selected service name(s) in stepper subtitle when services are selected
   * PATTERN: Computed array that updates step subtitles reactively
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
   * LEARNING: Computed property for loaded service name
   * WHY: Displays service type in mock data loading bar
   * PATTERN: Extract from loadedWizardState or wizard.selectedServices
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
   * LEARNING: Computed property for loaded property address
   * WHY: Displays property address in mock data loading bar
   * PATTERN: Extract from loadedWizardState propertyDetails
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

