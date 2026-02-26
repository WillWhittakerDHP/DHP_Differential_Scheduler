import { APP_STAGE } from '@shared/constants/appStageConstants'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export const DEFAULT_SELECTION_CARD_CONFIG: SelectionCardConfig = {
  selectionType: 'radio',
  selectionComponent: 'VRadio',
  selectionGroup: 'VRadioGroup',
  stateSource: APP_STAGE.LOCAL,
  statePlugins: [],
  layout: 'row',
  controlPosition: 'bottom',
  gridColumns: { cols: '12', sm: '6', md: '4' },
  appearance: {
    showIcon: true,
    showDescription: true,
    showBorder: true,
    cardPadding: 'pa-6',
    minHeight: 'auto',
  },
}

/**
 * Merge a user config with safe defaults.
 *
 * LEARNING: This is pure, so it belongs in utils (composables can wrap it with computed()).
 */
export function mergeSelectionCardConfigWithDefaults(config: SelectionCardConfig | undefined): SelectionCardConfig {
  if (!config || config === null || typeof config !== 'object' || Array.isArray(config)) {
    return DEFAULT_SELECTION_CARD_CONFIG
  }

  const userConfig = config
  return {
    selectionType: userConfig.selectionType || DEFAULT_SELECTION_CARD_CONFIG.selectionType,
    selectionComponent: userConfig.selectionComponent || DEFAULT_SELECTION_CARD_CONFIG.selectionComponent,
    selectionGroup: userConfig.selectionGroup || DEFAULT_SELECTION_CARD_CONFIG.selectionGroup,
    stateSource: userConfig.stateSource || DEFAULT_SELECTION_CARD_CONFIG.stateSource,
    statePlugins: userConfig.statePlugins !== undefined && userConfig.statePlugins !== null ? userConfig.statePlugins : [],
    layout: userConfig.layout ?? DEFAULT_SELECTION_CARD_CONFIG.layout,
    controlPosition: userConfig.controlPosition ?? DEFAULT_SELECTION_CARD_CONFIG.controlPosition,
    gridColumns: userConfig.gridColumns ?? DEFAULT_SELECTION_CARD_CONFIG.gridColumns,
    appearance: userConfig.appearance || DEFAULT_SELECTION_CARD_CONFIG.appearance,
    expansion: userConfig.expansion,
  }
}


