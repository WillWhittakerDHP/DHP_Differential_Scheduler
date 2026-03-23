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
  buildSqftRangeLabels,
  buildCalibrationLineChartOptions,
  type SvgChartShape,
} from '@/utils/admin/calibrationChartTransforms'
import { getLineChartConfig } from '@/@core/libs/chartjs/chartjsConfig'
import type { ChartData, ChartOptions } from 'chart.js'
import type { UseCalibrationChartReturn } from '@/types/admin/calibrationChart'

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

  const sqftRange = computed(() =>
    buildSqftRangeLabels(sqftMin.value, sqftMax.value, sqftStep.value)
  )

  const chartData = computed<ChartData<'line'>>(() => {
    const labels = sqftRange.value.map(String)
    const datasets = serviceFeeTotals.value.map((service, index) => ({
      label: service.name,
      data: sqftRange.value.map((sqft) => service.totalBaseFee + service.totalRateOverBaseFee * sqft),
      borderColor: SERVICE_COLORS[index % SERVICE_COLORS.length],
      backgroundColor: 'transparent',
      tension: 0,
      fill: false,
    }))
    return { labels, datasets }
  })

  const chartOptions = computed((): ChartOptions<'line'> => {
    const baseConfig = getLineChartConfig(theme.current.value) as ChartOptions<'line'>
    return buildCalibrationLineChartOptions(baseConfig, chartData.value)
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
