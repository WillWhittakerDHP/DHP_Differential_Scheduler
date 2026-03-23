import type { WizardStepConfig } from '@/configs/wizardSteps'

export interface ServiceBlockLike {
  name: string
}

export function buildWizardStepSubtitles(
  steps: WizardStepConfig[],
  selectedServiceTypeBlocks: ServiceBlockLike[]
): string[] {
  const baseSubtitles = steps.map((step) => step.subtitle)
  if (selectedServiceTypeBlocks.length === 0) {
    return baseSubtitles
  }
  const firstService = selectedServiceTypeBlocks[0]
  if (selectedServiceTypeBlocks.length === 1) {
    baseSubtitles[0] = `Identifying your needs - ${firstService.name}`
  } else {
    baseSubtitles[0] = `Identifying your needs - ${firstService.name} + ${selectedServiceTypeBlocks.length - 1} more`
  }
  return baseSubtitles
}

export function formatServiceSelectionLabel(services: ServiceBlockLike[]): string | null {
  if (services.length === 0) return null
  const first = services[0]
  if (services.length === 1) return first.name
  return `${first.name} + ${services.length - 1} more`
}

export function resolveWizardLoadedServiceName(
  loadedServices: ServiceBlockLike[] | undefined,
  selectedServiceTypeBlocks: ServiceBlockLike[]
): string | null {
  if (loadedServices && loadedServices.length > 0) {
    return formatServiceSelectionLabel(loadedServices)
  }
  return formatServiceSelectionLabel(selectedServiceTypeBlocks)
}

export function formatPropertyDetailsAddress(propertyDetails: {
  address?: string | null
  unit?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}): string | null {
  const { address, unit, city, state, zipCode } = propertyDetails
  const parts: string[] = []
  if (address) parts.push(address)
  if (unit) parts.push(`Unit ${unit}`)
  if (city) parts.push(city)
  if (state) parts.push(state)
  if (zipCode) parts.push(zipCode)
  const joined = parts.filter(Boolean).join(', ')
  return joined || null
}
