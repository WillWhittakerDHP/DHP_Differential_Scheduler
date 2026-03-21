import type { Ref } from 'vue'

export interface UseResponsiveGridOptions {
  gridRef: Ref<HTMLElement | null>
  minColumns?: number
  maxColumns?: number
  buttonMinWidth?: number
  gap?: number
  padding?: number
}

export interface UseResponsiveGridReturn {
  containerWidth: Ref<number>
  buttonGridColumns: Ref<number>
  isSingleColumn: Ref<boolean>
}
