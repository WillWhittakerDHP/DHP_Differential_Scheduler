/**
 * WHY: usePropertyTypeBlockConfig Composable

WHY: Moves complex config constru...
 */
import { computed } from 'vue'
import { APP_STAGE } from '@shared/constants/appStageConstants'
import type { SelectionCardConfig, SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'
import type { ComponentItem } from '@/types/booking/propertyDetailsLogic'
import type { UsePropertyTypeBlockConfigParams, UsePropertyTypeBlockConfigReturn } from '@/types/booking/propertyTypeBlockConfig'
import { calculateGridColumnsForItemCount } from '@/utils/booking/selectionCardGroupConfig'


export function usePropertyTypeBlockConfig(
  params: UsePropertyTypeBlockConfigParams
): UsePropertyTypeBlockConfigReturn {
  const {
    selectedPropertyTypeBlocks,
    propertyTypeBlocksStatePlugin,
    availablePropertyTypeBlocks
  } = params

  /**
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
        minHeight: 'auto'
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
        statePlugins: [propertyTypeBlocksStatePlugin as StatePlugin]
      }
    }
    
    return {
      ...baseConfig,
      stateSource: APP_STAGE.LOCAL
    }
  })

  return {
    rowSelectionConfig
  }
}

