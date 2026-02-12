/**
 * usePropertyTypeBlockConfig Composable
 * 
 * LEARNING: Extracts property type block selection config construction logic from PropertyDetailsStep component
 * WHY: Moves complex config construction logic to composable
 * PATTERN: Composable that provides computed config for SelectionCardGroup
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import type { ComponentItem } from './usePropertyDetailsLogic'
import { calculateGridColumnsForItemCount } from '@/utils/booking/selectionCardGroupConfig'

export interface UsePropertyTypeBlockConfigParams {
  selectedPropertyTypeBlocks: Ref<unknown[]>
  propertyTypeBlocksStatePlugin: unknown | null
  availablePropertyTypeBlocks?: Ref<unknown[]>
}

export interface SelectionCardConfig {
  selectionType: 'checkbox' | 'radio'
  selectionComponent: 'VCheckbox' | 'VRadio'
  selectionGroup: 'none' | 'v-radio-group'
  stateSource: 'wizard' | 'local'
  layout: 'row' | 'stack'
  controlPosition: 'top' | 'bottom' | 'left' | 'right'
  gridColumns: { cols?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
  appearance: {
    showIcon: boolean
    showDescription: boolean
    showBorder: boolean
    cardPadding: string
    minHeight: string
  }
  expansion: {
    enabled: boolean
    componentData: (item: SelectionCardItem) => {
      composite: boolean
      visibleComponents: Array<{ id: string; name: string; description?: string; icon?: string }>
    } | null
  }
  statePlugins?: unknown[]
}

export interface UsePropertyTypeBlockConfigReturn {
  rowSelectionConfig: ComputedRef<SelectionCardConfig>
}

/**
 * usePropertyTypeBlockConfig composable
 * 
 * LEARNING: Provides computed config for property type block selection cards
 * WHY: Extracts config construction logic from component to composable
 * PATTERN: Computed that returns config object with reactive dependencies
 */
export function usePropertyTypeBlockConfig(
  params: UsePropertyTypeBlockConfigParams
): UsePropertyTypeBlockConfigReturn {
  const {
    selectedPropertyTypeBlocks,
    propertyTypeBlocksStatePlugin,
    availablePropertyTypeBlocks
  } = params

  /**
   * LEARNING: Computed property for row selection config
   * WHY: Ensures config re-evaluates when wizard state changes (e.g., when loading appointments)
   * PATTERN: Shared config object matching user types configuration with enhanced config properties and wizard state plugin
   */
  const rowSelectionConfig = computed(() => {
    void selectedPropertyTypeBlocks.value
    
    const blocks = availablePropertyTypeBlocks?.value
    const itemCount = blocks !== undefined && blocks !== null && Array.isArray(blocks) ? blocks.length : 0
    const dynamicGridColumns = calculateGridColumnsForItemCount(itemCount)
    
    const baseConfig: SelectionCardConfig = {
      selectionType: 'radio' as const, // Property type is single-select (radio behavior)
      selectionComponent: 'VRadio' as const, // Render radio control to match other single-select steps
      selectionGroup: 'none' as const, // No wrapper - SelectionCard handles selection explicitly
      stateSource: 'wizard' as const,
      layout: 'row' as const,
      controlPosition: 'bottom' as const,
      gridColumns: dynamicGridColumns,
      appearance: {
        showIcon: true,
        showDescription: true,
        showBorder: true,
        cardPadding: 'pa-6',
        minHeight: '200px'
      },
      expansion: {
        enabled: true,
        componentData: (item: SelectionCardItem) => {
          if (item.composite && item.instanceComponents) {
            return {
              composite: true,
              visibleComponents: item.instanceComponents.filter((comp: ComponentItem) => comp.active === true).map((comp: ComponentItem) => ({
                id: comp.id,
                name: comp.name,
                description: comp.description,
                icon: comp.icon
              }))
            }
          }
          return null
        }
      }
    }
    
    if (propertyTypeBlocksStatePlugin) {
      return {
        ...baseConfig,
        statePlugins: [propertyTypeBlocksStatePlugin]
      }
    }
    
    return {
      ...baseConfig,
      stateSource: 'local' as const
    }
  })

  return {
    rowSelectionConfig
  }
}

