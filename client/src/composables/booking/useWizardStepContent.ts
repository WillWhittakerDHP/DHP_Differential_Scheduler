/**
 * useWizardStepContent Composable
 * 
 * LEARNING: Extracts step content component mapping logic from BookingWizard component
 * WHY: Moves component mapping logic to composable
 * PATTERN: Composable that provides step content component mapping
 */

import type { Component } from 'vue'
import { getBookingWizardStepContent } from '@/utils/booking/wizardStepContent'

export interface UseWizardStepContentReturn {
  getStepContent: (step: number) => Component | null
}

/**
 * useWizardStepContent composable
 * 
 * LEARNING: Provides step content component mapping
 * WHY: Extracts component mapping logic from component to composable
 * PATTERN: Composable that returns mapping function
 */
export function useWizardStepContent(): UseWizardStepContentReturn {
  /**
   * LEARNING: Dynamic component rendering based on active step
   * WHY: Shows appropriate step component based on current step
   * PATTERN: Switch statement returning component for each step
   */
  const getStepContent = (step: number): Component | null => {
    return getBookingWizardStepContent(step)
  }

  return {
    getStepContent
  }
}

