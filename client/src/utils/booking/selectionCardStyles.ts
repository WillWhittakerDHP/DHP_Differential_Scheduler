import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export function buildSelectionCardClasses(config: SelectionCardConfig, isSelected: boolean): string {
  // PATTERN: Build classes array immutably using spread operator
  const baseClasses = ['selection-card', 'rounded', 'cursor-pointer']
  
  const conditionalClasses = [
    config.appearance?.showBorder && 'selection-card-bordered',
    config.appearance?.cardPadding,
    isSelected && 'active',
    config.layout === 'stack' && config.controlPosition === 'left' && 'selection-card-left-radio'
  ].filter((cls): cls is string => typeof cls === 'string' && cls !== '')

  return [...baseClasses, ...conditionalClasses].join(' ')
}

export function buildSelectionControlClasses(controlPosition: SelectionCardConfig['controlPosition']): Record<string, boolean> {
  const position = controlPosition
  const classes: Record<string, boolean> = {
    'mb-4': position === 'top',
    'mt-4': position === 'bottom',
    'mr-4': position === 'left',
  }

  if (position === 'hidden') {
    classes['d-none'] = true
  }

  return classes
}

export function buildSelectionContentContainerClasses(config: SelectionCardConfig): string {
  // PATTERN: Build classes array immutably using spread operator
  const baseClasses = ['d-flex', 'flex-column', 'gap-2', 'content-container']
  
  const layoutClasses = config.layout === 'stack'
    ? config.controlPosition === 'left'
      ? ['align-start', 'text-start']
      : ['align-center', 'text-center']
    : ['align-center', 'text-center']

  return [...baseClasses, ...layoutClasses].join(' ')
}


