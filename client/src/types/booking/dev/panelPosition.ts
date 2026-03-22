import type { Ref } from 'vue'

export interface UsePanelPositionOptions {
  wrapperRef: Ref<HTMLElement | null>
  panelRef: Ref<HTMLElement | null>
  isExpanded: Ref<boolean>
  expectedPanelWidth?: number
}

export interface UsePanelPositionReturn {
  panelTransform: Ref<string>
  isTransitioning: Ref<boolean>
  calculatePanelPosition: () => string
  updatePanelPosition: () => void
  handleToggle: (willExpand: boolean) => Promise<void>
}
