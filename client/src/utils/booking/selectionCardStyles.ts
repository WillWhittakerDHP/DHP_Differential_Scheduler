import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export function buildSelectionCardClasses(config: SelectionCardConfig, isSelected: boolean): string {
  const classes = ['selection-card', 'rounded', 'cursor-pointer']

  if (config.appearance?.showBorder) {
    classes.push('selection-card-bordered')
  }

  if (config.appearance?.cardPadding) {
    classes.push(config.appearance.cardPadding)
  }

  if (isSelected) {
    classes.push('active')
  }

  if (config.layout === 'stack' && config.controlPosition === 'left') {
    classes.push('selection-card-left-radio')
  }

  return classes.join(' ')
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
  const classes = ['d-flex', 'flex-column', 'gap-2', 'content-container']

  if (config.layout === 'stack') {
    if (config.controlPosition === 'left') {
      classes.push('align-start', 'text-start')
    } else {
      classes.push('align-center', 'text-center')
    }
  } else {
    classes.push('align-center', 'text-center')
  }

  return classes.join(' ')
}


