/**
 * Fee Calibration Chart Composable
 * LEARNING: Builds Chart.js line chart data from service block instances and their part pricing
 * WHY: Enables visual calibration of fees vs square footage across services on the admin Instances tab
 * PATTERN: Same relationship resolution as usePartsTotals; shared calculatePartsTotals for fee math
 */

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useEntityCrud } from '@/composables/useEntity'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useTheme } from 'vuetify'
import { calculatePartsTotals } from '@/utils/booking/partsTotals'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { getLineChartConfig } from '@/@core/libs/chartjs/chartjsConfig'
import type { ChartData, ChartOptions } from 'chart.js'

const DEFAULT_SQFT_MIN = 0
const DEFAULT_SQFT_MAX = 5000
const DEFAULT_SQFT_STEP = 250

/** Distinct colors for up to ~12 services; Chart.js-friendly */
const SERVICE_COLORS = [
  'rgb(102, 126, 234)',
  'rgb(237, 100, 166)',
  'rgb(255, 154, 158)',
  'rgb(250, 208, 196)',
  'rgb(161, 196, 141)',
  'rgb(116, 169, 207)',
  'rgb(254, 194, 133)',
  'rgb(195, 155, 211)',
  'rgb(162, 210, 223)',
  'rgb(255, 175, 123)',
  'rgb(144, 205, 151)',
  'rgb(187, 222, 251)',
]

export interface UseCalibrationChartReturn {
  chartData: ComputedRef<ChartData<'line'>>
  chartOptions: ComputedRef<ChartOptions<'line'>>
  sqftMin: Ref<number>
  sqftMax: Ref<number>
  sqftStep: Ref<number>
  serviceCount: ComputedRef<number>
  hasData: ComputedRef<boolean>
}

/**
 * Get service-type block instances with resolved part totals for fee calculation
 */
function getServiceFeeTotals(
  blockInstances: GlobalEntity<'blockInstance'>[],
  blockShapes: GlobalEntity<'blockShape'>[],
  partAssignments: Array<{ parentId: string; childId: string; disabled?: boolean }>,
  partInstances: GlobalEntity<'partInstance'>[]
): Array<{ name: string; totalBaseFee: number; totalRateOverBaseFee: number }> {
  const shapeById = new Map(blockShapes.map(s => [s.id, s]))
  const serviceBlocks = blockInstances.filter(block => {
    const shape = shapeById.get(toGlobalEntityId(block.blockShapeRef))
    return shape?.type === BLOCK_SHAPE_TYPES.SERVICE
  })

  return serviceBlocks.map(block => {
    const relationships = partAssignments.filter(
      rel => rel.parentId === block.id && !rel.disabled
    )
    const childIds = [...new Set(relationships.map(rel => String(rel.childId)))]
    const { resolved } = resolveByIds(partInstances, childIds)
    const nonZeroed = resolved.filter(p => !p.zeroOutPart)
    const totals = calculatePartsTotals(nonZeroed)
    return {
      name: block.name ?? block.id,
      totalBaseFee: totals.totalBaseFee,
      totalRateOverBaseFee: totals.totalRateOverBaseFee,
    }
  })
}

/**
 * useCalibrationChart
 * LEARNING: Produces Chart.js line data and options for fee vs sqft per service
 * WHY: Single composable for the calibration panel; reactive to admin entity/relationship data
 */
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
        sqft => service.totalBaseFee + service.totalRateOverBaseFee * sqft
      ),
      borderColor: SERVICE_COLORS[index % SERVICE_COLORS.length],
      backgroundColor: 'transparent',
      tension: 0,
      fill: false,
    }))
    return { labels, datasets }
  })

  const chartOptions = computed((): ChartOptions<'line'> => {
    const themeColors = theme.current.value.colors as Parameters<typeof getLineChartConfig>[0]
    const baseConfig = getLineChartConfig(themeColors)
    const rawDatasets = chartData.value.datasets
    const datasets = rawDatasets !== undefined && rawDatasets !== null && Array.isArray(rawDatasets) ? rawDatasets : []
    const allValues = datasets.flatMap(d =>
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

  return {
    chartData,
    chartOptions,
    sqftMin,
    sqftMax,
    sqftStep,
    serviceCount,
    hasData,
  }
}
