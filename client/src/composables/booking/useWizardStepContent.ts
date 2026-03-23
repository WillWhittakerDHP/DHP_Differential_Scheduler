/**
 * WHY: useWizardStepContent Composable - step-to-component mapping for booking wizard.
 * Async wrappers are created once at module scope so Vue receives a stable reference
 * on every render — calling defineAsyncComponent per-render would create a new
 * component type each time, causing unmount/remount loops.
 */
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import type { UseWizardStepContentReturn } from '@/types/booking/wizardStepContent'

const STEP_COMPONENTS: readonly (Component | null)[] = [
  defineAsyncComponent(() => import('@/components/booking/steps/ServiceSelectionStep.vue')),
  defineAsyncComponent(() => import('@/components/booking/steps/PropertyDetailsStep.vue')),
  defineAsyncComponent(() => import('@/components/booking/steps/AvailabilityStep.vue')),
  defineAsyncComponent(() => import('@/components/booking/steps/ContactsStep.vue')),
  defineAsyncComponent(() => import('@/components/booking/steps/ConfirmationStep.vue')),
]

export function useWizardStepContent(): UseWizardStepContentReturn {
  const getStepContent = (step: number): Component | null => {
    return STEP_COMPONENTS[step] ?? null
  }

  return { getStepContent }
}

