import { APP_STAGE } from '@shared/constants/appStageConstants'
import type { SelectionCardConfig, SelectionCardItem, ComponentItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'

type WizardStatePlugin = StatePlugin

type SelectionConfigBuildOptions = {
  statePlugin: WizardStatePlugin | null
  stateKeyNameForDebug?: string
}

function buildExpansionComponentData() {
  return (item: SelectionCardItem) => {
    if (item.composite && item.instanceComponents) {
      return {
        composite: true,
        visibleComponents: item.instanceComponents
          .filter((comp: ComponentItem) => comp.active === true)
          .map((comp: ComponentItem) => ({
            id: comp.id,
            name: comp.name,
            icon: comp.icon,
          })),
      }
    }
    return null
  }
}

export function buildUserTypeBlockRowSelectionConfig(options: SelectionConfigBuildOptions): SelectionCardConfig {
  const baseConfig: SelectionCardConfig = {
    selectionType: 'radio',
    selectionComponent: 'VRadio',
    selectionGroup: 'none',
    stateSource: 'wizard',
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
    expansion: {
      enabled: true,
      componentData: buildExpansionComponentData(),
    },
  }

  if (options.statePlugin) {
    return {
      ...baseConfig,
      statePlugins: [options.statePlugin],
    }
  }

  return {
    ...baseConfig,
    stateSource: APP_STAGE.LOCAL,
  }
}

export function buildServicesStackSelectionConfig(options: SelectionConfigBuildOptions): SelectionCardConfig {
  const baseConfig: SelectionCardConfig = {
    selectionType: 'radio',
    selectionComponent: 'VRadio',
    selectionGroup: 'none',
    stateSource: 'wizard',
    layout: 'stack',
    controlPosition: 'left',
    appearance: {
      showIcon: true,
      showDescription: true,
      showBorder: true,
      cardPadding: 'pa-3',
      minHeight: 'auto',
    },
    expansion: {
      enabled: true,
      componentData: buildExpansionComponentData(),
    },
  }

  if (options.statePlugin) {
    return {
      ...baseConfig,
      statePlugins: [options.statePlugin],
    }
  }

  return {
    ...baseConfig,
    stateSource: APP_STAGE.LOCAL,
  }
}


