/**
 */
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

const SQFT_RANGE = [0, 1000, 2000, 3000, 4000, 5000]
const LINE_COLOR = 'rgb(var(--v-theme-primary))'
const PAD = { left: 32, right: 12, top: 8, bottom: 20 }
const PLOT_WIDTH = 280 - PAD.left - PAD.right
const PLOT_HEIGHT = 90 - PAD.top - PAD.bottom

export interface UseFeePreviewOptions {
  totalBaseFee: Ref<number>
  totalRateOverBaseFee: Ref<number>
  showPreview: Ref<boolean>
}

export interface UseFeePreviewReturn {
  sqftInput: import('vue').Ref<number>
  computedCost: import('vue').ComputedRef<number>
  svgLine: import('vue').ComputedRef<{ points: string; color: string }>
}

export function useFeePreview(options: UseFeePreviewOptions): UseFeePreviewReturn {
  const { totalBaseFee, totalRateOverBaseFee, showPreview } = options
  const sqftInput = ref(2000)

  watch(sqftInput, (val) => {
    const n = typeof val === 'number' ? val : Number(val)
    if (!Number.isNaN(n) && n < 0) {
      sqftInput.value = 0
    }
  })

  const computedCost = computed(() => {
    const base = totalBaseFee.value
    const rate = totalRateOverBaseFee.value
    const sqft = Math.max(0, Number(sqftInput.value) || 0)
    return base + rate * sqft
  })

  const svgLine = computed(() => {
    if (!showPreview.value) return { points: '', color: LINE_COLOR }
    const base = totalBaseFee.value
    const rate = totalRateOverBaseFee.value
    const values = SQFT_RANGE.map((sqft) => base + rate * sqft)
    const yMax = Math.max(1, ...values)
    const yScale = (v: number) => PAD.top + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT
    const xScale = (i: number) => PAD.left + (i / Math.max(1, SQFT_RANGE.length - 1)) * PLOT_WIDTH
    const points = values.map((val, i) => `${xScale(i)},${yScale(val)}`).join(' ')
    return { points, color: LINE_COLOR }
  })

  return { sqftInput, computedCost, svgLine }
}
