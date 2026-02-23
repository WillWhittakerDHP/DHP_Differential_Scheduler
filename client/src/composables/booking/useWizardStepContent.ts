/**
 * WHY: useWizardStepContent Composable

WHY: Moves component mapping logic to c...
 */
import type { Component } from 'vue'
import { getBookingWizardStepContent } from '@/utils/booking/wizardStepContent'

export interface UseWizardStepContentReturn {
  getStepContent: (step: number) => Component | null
}

/**
 * WHY: useWizardStepContent composable

WHY: Extracts component mapping logic f...
 */
export function useWizardStepContent(): UseWizardStepContentReturn {
  /**
   * PATTERN: Switch statement returning component for each step
   */
  const getStepContent = (step: number): Component | null => {
    return getBookingWizardStepContent(step)
  }

  return {
    getStepContent
  }
}

