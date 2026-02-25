/**
 * WHY: Pure data transforms for fee calibration chart (service totals, SVG geometry); keeps useCalibrationChart thin.
 */
import type { ChartData } from 'chart.js'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { calculatePartsTotals } from '@/utils/booking/partsTotals'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { SvgChartShape } from '@/types/admin/calibrationChart'

export type { SvgChartShape } from '@/types/admin/calibrationChart'

/** Distinct colors for up to ~12 services; Chart.js-friendly */
export const SERVICE_COLORS = [
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

export function getServiceFeeTotals(
  blockInstances: GlobalEntity<'blockInstance'>[],
  blockShapes: GlobalEntity<'blockShape'>[],
  partAssignments: Array<{ parentId: string; childId: string; disabled?: boolean }>,
  partInstances: GlobalEntity<'partInstance'>[]
): Array<{ name: string; totalBaseFee: number; totalRateOverBaseFee: number }> {
  const shapeById = new Map(blockShapes.map((s) => [s.id, s]))
  const serviceBlocks = blockInstances.filter((block) => {
    const shape = shapeById.get(toGlobalEntityId(block.blockShapeRef))
    return shape?.type === BLOCK_SHAPE_TYPES.SERVICE
  })

  return serviceBlocks.map((block) => {
    const relationships = partAssignments.filter(
      (rel) => rel.parentId === block.id && !rel.disabled
    )
    const childIds = [...new Set(relationships.map((rel) => String(rel.childId)))]
    const { resolved } = resolveByIds(partInstances, childIds)
    const nonZeroed = resolved.filter((p) => !p.zeroOutPart)
    const totals = calculatePartsTotals(nonZeroed)
    return {
      name: block.name ?? block.id,
      totalBaseFee: totals.totalBaseFee,
      totalRateOverBaseFee: totals.totalRateOverBaseFee,
    }
  })
}

const CHART_WIDTH = 700
const CHART_HEIGHT = 320
const PAD = { left: 48, right: 24, top: 24, bottom: 40 }
const PLOT_WIDTH = CHART_WIDTH - PAD.left - PAD.right
const PLOT_HEIGHT = CHART_HEIGHT - PAD.top - PAD.bottom

export function buildSvgChart(data: ChartData<'line'>): SvgChartShape {
  const labels = asEmptyArray(data.labels)
  const datasets = asEmptyArray(data.datasets) as Array<{
    label: string
    data: number[]
    borderColor: string
  }>
  if (labels.length === 0 || datasets.length === 0) {
    return {
      polylines: [],
      legend: [],
      xScale: () => PAD.left,
      yScale: () => PAD.top,
      yMax: 0,
    }
  }
  const allValues = datasets
    .flatMap((d) => d.data)
    .filter((v): v is number => typeof v === 'number')
  const yMax = Math.max(1, ...allValues)
  const yScale = (v: number) => PAD.top + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT
  const xScale = (i: number) =>
    PAD.left + (i / Math.max(1, labels.length - 1)) * PLOT_WIDTH
  const polylines = datasets.map((d) => {
    const points = d.data
      .map((val, i) => `${xScale(i)},${yScale(val)}`)
      .join(' ')
    return { points, color: d.borderColor ?? 'currentColor' }
  })
  const legend = datasets.map((d) => ({
    label: d.label,
    color: d.borderColor ?? 'currentColor',
  }))
  return { polylines, legend, xScale, yScale, yMax }
}
