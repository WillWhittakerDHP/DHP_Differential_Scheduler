import { APP_STAGE } from '@shared/constants/appStageConstants'

/**
WHY: Ens...
 */
export interface ComponentItem {
  id: string
  name: string
  icon?: string
  active: boolean
}

export interface SelectionCardItem {
  id: string
  name: string
  icon?: string
  composite?: boolean
  instanceComponents?: ComponentItem[]
  [key: string]: unknown // Allow additional properties but type-safe
}

export interface GridColumns {
  cols?: string | number
  sm?: string | number
  md?: string | number
  lg?: string | number
  xl?: string | number
}

/**
 * WHY: State plugin interface
 */
export interface StatePlugin {
  name: string
  /**
Get the current value for an item
WHY: Allows plugin to determine se...
   */
  getValue: (item: SelectionCardItem) => boolean | string | null
  
  /**
Set the value for an item
WHY: Allows plugin to update state in its ...
   */
  setValue: (item: SelectionCardItem, value: boolean | string | null) => void
  
  /**
Reactive source to watch for changes
WHY: Enables SelectionCard to r...
   */
  watchSource: () => { value: unknown } | null
}

/**
WHY: Configuration-first approach...
 */
export interface SelectionCardConfig {
  selectionType: 'radio' | 'checkbox' | 'none'
  selectionComponent: 'VRadio' | 'VCheckbox' | 'custom'
  selectionGroup: 'VRadioGroup' | 'VCheckboxGroup' | 'none'
  
  /**
State source type
   */
  stateSource?: 'wizard' | (typeof APP_STAGE)['LOCAL'] | 'custom'
  
  /**
State plugins for reactive updates
   */
  statePlugins?: StatePlugin[]
  
  layout: 'row' | 'stack'
  
  controlPosition: 'top' | 'bottom' | 'left' | 'hidden'
  
  gridColumns?: GridColumns
  
  appearance: {
    showIcon: boolean
    showDescription?: boolean
    showBorder: boolean
    cardPadding: string
    minHeight: string
  }
  
  expansion?: {
    enabled: boolean
    componentData?: (item: SelectionCardItem) => {
      composite: boolean
      visibleComponents: SelectionCardItem[]
    } | null
    nestedConfig?: Partial<SelectionCardConfig>
  }
}
