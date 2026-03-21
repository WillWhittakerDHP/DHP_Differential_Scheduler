import type { Ref } from 'vue'
import type { DevPanelButtonsContext } from '@/types/booking/devPanelButtonsContext'
import type { WizardDevOptionsBase } from '@/types/wizardDevOptions'

/** Extends shared base; matches DevPanelButtonsContext shape; wizard required when building (TYPE_SIMILARITY 1.14). handleResetMocks is provided by the composable, not by the caller. */
export interface UseWizardDevModeOptions
  extends Omit<WizardDevOptionsBase, 'fetchAll'>,
    Omit<DevPanelButtonsContext, 'wizard' | 'handleResetMocks'> {
  isDevMode: boolean
  wizard: NonNullable<DevPanelButtonsContext['wizard']>
}

export interface UseWizardDevModeReturn {
  resetMocksSignal: Ref<number>
  handleResetMocks: () => void
}
