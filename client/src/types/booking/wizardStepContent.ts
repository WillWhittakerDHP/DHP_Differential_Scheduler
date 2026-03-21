import type { Component } from 'vue'

export interface UseWizardStepContentReturn {
  getStepContent: (step: number) => Component | null
}
