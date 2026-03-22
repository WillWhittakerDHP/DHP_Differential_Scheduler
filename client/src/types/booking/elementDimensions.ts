import type { Ref } from 'vue'

export interface UseElementDimensionsOptions {
  elementRef: Ref<HTMLElement | null>
}

export interface UseElementDimensionsReturn {
  contentWidth: Ref<number>
}
