/**
 * PATTERN: Fee Calibration Chart Composable — reactive wiring only; pure transforms in utils/admin/calibrationChartTransforms.
 */
import { computed, ref } from 'vue'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useTheme } from 'vuetify'
import {
  SERVICE_COLORS,
  getServiceFeeTotals,
  buildSvgChart,
  type SvgChartShape,
} from '@/utils/admin/calibrationChartTransforms'
import { getLineChartConfig } from '@/@core/libs/chartjs/chartjsConfig'
import type { ChartData, ChartOptions } from 'chart.js'
import type { UseCalibrationChartReturn } from '@/types/admin/calibrationChart'

export type { UseCalibrationChartReturn, SvgChartShape } from '@/types/admin/calibrationChart'

const DEFAULT_SQFT_MIN = 0
const DEFAULT_SQFT_MAX = 5000
const DEFAULT_SQFT_STEP = 250

export function useCalibrationChart(): UseCalibrationChartReturn {
  const { entities: blockInstances } = useEntityCrud('blockInstance')
  const { entities: blockShapes } = useEntityCrud('blockShape')
  const { relationships: partAssignments } = useRelationshipCrud('partAssignments')
  const { entities: partInstances } = useEntityCrud('partInstance')
  const theme = useTheme()

  const sqftMin = ref(DEFAULT_SQFT_MIN)
  const sqftMax = ref(DEFAULT_SQFT_MAX)
  const sqftStep = ref(DEFAULT_SQFT_STEP)

  const serviceFeeTotals = computed(() =>
    getServiceFeeTotals(
      blockInstances.value,
      blockShapes.value,
      partAssignments.value,
      partInstances.value
    )
  )

  const sqftRange = computed(() => {
    const min = Math.max(0, sqftMin.value)
    const max = Math.max(min, sqftMax.value)
    const step = Math.max(50, sqftStep.value)
    const labels: number[] = []
    for (let sqft = min; sqft <= max; sqft += step) {
      labels.push(sqft)
    }
    if (labels.length > 0 && labels[labels.length - 1] !== max) {
      labels.push(max)
    }
    return labels
  })

  const chartData = computed<ChartData<'line'>>(() => {
    const labels = sqftRange.value.map(String)
    const datasets = serviceFeeTotals.value.map((service, index) => ({
      label: service.name,
      data: sqftRange.value.map(
        (sqft) => service.totalBaseFee + service.totalRateOverBaseFee * sqft
      ),
      borderColor: SERVICE_COLORS[index % SERVICE_COLORS.length],
      backgroundColor: 'transparent',
      tension: 0,
      fill: false,
    }))
    return { labels, datasets }
  })

  const chartOptions = computed((): ChartOptions<'line'> => {
    const themeColors = theme.current.value
    const baseConfig = getLineChartConfig(themeColors)
    const rawDatasets = chartData.value.datasets
    const datasets =
      rawDatasets !== undefined &&
      rawDatasets !== null &&
      Array.isArray(rawDatasets)
        ? rawDatasets
        : []
    const allValues = datasets.flatMap((d) =>
      Array.isArray(d.data) ? (d.data as number[]) : []
    )
    const maxFee = allValues.length > 0 ? Math.max(...allValues) : 400
    const yMax = Math.ceil(Math.max(maxFee * 1.1, 100) / 100) * 100
    return {
      ...baseConfig,
      scales: {
        ...baseConfig.scales,
        x: {
          ...baseConfig.scales?.x,
          title: { display: true, text: 'Square footage' },
        },
        y: {
          ...baseConfig.scales?.y,
          min: 0,
          max: yMax,
          title: { display: true, text: 'Total fee ($)' },
        },
      },
    } as ChartOptions<'line'>
  })

  const serviceCount = computed(() => serviceFeeTotals.value.length)
  const hasData = computed(() => serviceCount.value > 0)

  const svgChart = computed((): SvgChartShape => buildSvgChart(chartData.value))

  return {
    chartData,
    chartOptions,
    sqftMin,
    sqftMax,
    sqftStep,
    serviceCount,
    hasData,
    svgChart,
  }
}
