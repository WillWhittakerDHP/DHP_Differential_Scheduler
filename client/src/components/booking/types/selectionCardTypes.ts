/**
 * WHY: SelectionCard Type Definitions

LEARNING: Centralized type definitions for SelectionCard component system
WHY: Ensures type consistency across SelectionCard, SelectionCardGroup, and state plugins
PATTERN: Shared types for configuration-first architecture
 */
export interface ComponentItem {
  id: string
  name: string
  icon?: string
  active: boolean
}

/**
 * Selection card item interface
 * LEARNING: Represents a selectable item in SelectionCard
 * WHY: Type-safe definition for items passed to component
 */
export interface SelectionCardItem {
  id: string
  name: string
  icon?: string
  composite?: boolean
  instanceComponents?: ComponentItem[]
  [key: string]: unknown // Allow additional properties but type-safe
}

/**
 * Grid columns configuration interface
 * LEARNING: Responsive grid column configuration
 * WHY: Type-safe grid column props for Vuetify VCol component
 */
export interface GridColumns {
  cols?: string | number
  sm?: string | number
  md?: string | number
  lg?: string | number
  xl?: string | number
}

/**
 * State plugin interface
 * LEARNING: Pluggable state management for SelectionCard
 * WHY: Allows SelectionCard to work with different state sources (wizard, local, custom)
 * PATTERN: Plugin pattern for extensible state management
 */
export interface StatePlugin {
  name: string
  /**
   * Get the current value for an item
   * LEARNING: Returns whether item is selected (for radio) or selection state (for checkbox)
   * WHY: Allows plugin to determine selection state from any source
   */
  getValue: (item: SelectionCardItem) => boolean | string | null
  
  /**
   * Set the value for an item
   * LEARNING: Updates selection state via plugin's state source
   * WHY: Allows plugin to update state in its source (wizard, local ref, etc.)
   */
  setValue: (item: SelectionCardItem, value: boolean | string | null) => void
  
  /**
   * Reactive source to watch for changes
   * LEARNING: Returns a reactive value that SelectionCard can watch
   * WHY: Enables SelectionCard to react to external state changes
   */
  watchSource: () => { value: unknown } | null
}

/**
 * Selection card configuration interface
 * LEARNING: Complete configuration for SelectionCard behavior and appearance
 * WHY: Configuration-first approach allows flexible card behavior without component changes
 * PATTERN: Comprehensive config object with defaults for backward compatibility
 */
export interface SelectionCardConfig {
  /**
   * Selection type (radio, checkbox, or none)
   * LEARNING: Determines selection behavior
   * WHY: Allows single-select (radio), multi-select (checkbox), or no selection
   */
  selectionType: 'radio' | 'checkbox' | 'none'
  
  /**
   * Component to use for selection control
   * LEARNING: VRadio, VCheckbox, or custom component
   * WHY: Allows different UI components for selection
   */
  selectionComponent: 'VRadio' | 'VCheckbox' | 'custom'
  
  /**
   * Group wrapper component (or none)
   * LEARNING: VRadioGroup, VCheckboxGroup, or no wrapper
   * WHY: Radio buttons need grouping, checkboxes can work standalone
   */
  selectionGroup: 'VRadioGroup' | 'VCheckboxGroup' | 'none'
  
  /**
   * State source type
   * LEARNING: Where selection state is stored (wizard, local, custom)
   * WHY: Determines which state plugin to use
   */
  stateSource?: 'wizard' | 'local' | 'custom'
  
  /**
   * State plugins for reactive updates
   * LEARNING: Array of plugins that manage state
   * WHY: Allows multiple state sources or custom state management
   */
  statePlugins?: StatePlugin[]
  
  /**
   * Layout type (row or stack)
   * LEARNING: Horizontal grid layout or vertical stack
   * WHY: Different layouts for different use cases
   */
  layout: 'row' | 'stack'
  
  /**
   * Control position (top, bottom, left, hidden)
   * LEARNING: Where to position selection control
   * WHY: Different visual arrangements
   */
  controlPosition: 'top' | 'bottom' | 'left' | 'hidden'
  
  /**
   * Grid columns configuration
   * LEARNING: Responsive grid column props
   * WHY: Controls card layout in row mode
   */
  gridColumns?: GridColumns
  
  /**
   * Appearance configuration
   * LEARNING: Visual styling options
   * WHY: Controls card appearance
   */
  appearance: {
    showIcon: boolean
    showDescription?: boolean
    showBorder: boolean
    cardPadding: string
    minHeight: string
  }
  
  /**
   * Expansion configuration for nested cards
   * LEARNING: Options for expandable cards with nested components
   * WHY: Supports composite cards with sub-selections
   */
  expansion?: {
    enabled: boolean
    componentData?: (item: SelectionCardItem) => {
      composite: boolean
      visibleComponents: SelectionCardItem[]
    } | null
    nestedConfig?: Partial<SelectionCardConfig>
  }
}

