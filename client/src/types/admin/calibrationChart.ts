import type { ComputedRef, Ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

export interface SvgChartShape {
  polylines: Array<{ points: string; color: string }>
  legend: Array<{ label: string; color: string }>
  xScale: (i: number) => number
  yScale: (v: number) => number
  yMax: number
}

export interface UseCalibrationChartReturn {
  chartData: ComputedRef<ChartData<'line'>>
  chartOptions: ComputedRef<ChartOptions<'line'>>
  sqftMin: Ref<number>
  sqftMax: Ref<number>
  sqftStep: Ref<number>
  serviceCount: ComputedRef<number>
  hasData: ComputedRef<boolean>
  svgChart: ComputedRef<SvgChartShape>
}
