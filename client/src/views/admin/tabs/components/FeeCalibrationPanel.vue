<!--
  LEARNING: Fee Calibration Panel for Admin Instances Tab
  WHY: Visualizes total fee vs square footage per service so pricing can be calibrated
  PATTERN: Composable for data; VCard + SVG line chart + range controls; empty state when no services
  WHY SVG chart: vue-chartjs caused emitsOptions null errors; native SVG is reliable and dependency-free
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useCalibrationChart } from '@/composables/admin/useCalibrationChart'

const {
  chartData,
  sqftMin,
  sqftMax,
  sqftStep,
  serviceCount,
  hasData,
} = useCalibrationChart()

const CHART_WIDTH = 700
const CHART_HEIGHT = 320
const PAD = { left: 48, right: 24, top: 24, bottom: 40 }
const PLOT_WIDTH = CHART_WIDTH - PAD.left - PAD.right
const PLOT_HEIGHT = CHART_HEIGHT - PAD.top - PAD.bottom

/** SVG path data and scale for drawing lines; legend labels with colors */
const svgChart = computed(() => {
  const data = chartData.value
  const labels = data.labels ?? []
  const datasets = (data.datasets ?? []) as Array<{ label: string; data: number[]; borderColor: string }>
  if (labels.length === 0 || datasets.length === 0) {
    return { polylines: [], legend: [], xScale: (_: number) => PAD.left, yScale: (_: number) => PAD.top, yMax: 0 }
  }
  const allValues = datasets.flatMap(d => d.data).filter((v): v is number => typeof v === 'number')
  const yMax = Math.max(1, ...allValues)
  const yScale = (v: number) => PAD.top + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT
  const xScale = (i: number) => PAD.left + (i / Math.max(1, labels.length - 1)) * PLOT_WIDTH
  const polylines = datasets.map(d => {
    const points = d.data
      .map((val, i) => `${xScale(i)},${yScale(val)}`)
      .join(' ')
    return { points, color: d.borderColor ?? 'currentColor' }
  })
  const legend = datasets.map(d => ({ label: d.label, color: d.borderColor ?? 'currentColor' }))
  return { polylines, legend, xScale, yScale, yMax }
})
</script>

<template>
  <div class="fee-calibration-panel">
    <VCard variant="outlined">
      <VCardTitle class="d-flex align-center gap-2">
        <VIcon icon="tabler-chart-line" size="small" />
        Fee Calibration
      </VCardTitle>
      <VCardText>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Total fee vs square footage for each service. Use this to verify and calibrate pricing curves.
        </p>

        <template v-if="hasData">
          <div class="mb-4">
            <div class="d-flex align-center flex-wrap gap-4">
              <div class="d-flex align-center gap-2" style="min-width: 140px">
                <span class="text-caption">Min sqft</span>
                <VSlider
                  v-model="sqftMin"
                  :min="0"
                  :max="sqftMax"
                  :step="100"
                  hide-details
                  density="compact"
                  class="flex-grow-1"
                  style="max-width: 120px"
                />
                <span class="text-caption">{{ sqftMin }}</span>
              </div>
              <div class="d-flex align-center gap-2" style="min-width: 140px">
                <span class="text-caption">Max sqft</span>
                <VSlider
                  v-model="sqftMax"
                  :min="sqftMin"
                  :max="10000"
                  :step="100"
                  hide-details
                  density="compact"
                  class="flex-grow-1"
                  style="max-width: 120px"
                />
                <span class="text-caption">{{ sqftMax }}</span>
              </div>
              <div class="d-flex align-center gap-2" style="min-width: 140px">
                <span class="text-caption">Step</span>
                <VSlider
                  v-model="sqftStep"
                  :min="50"
                  :max="500"
                  :step="50"
                  hide-details
                  density="compact"
                  class="flex-grow-1"
                  style="max-width: 120px"
                />
                <span class="text-caption">{{ sqftStep }}</span>
              </div>
              <VChip size="small" variant="tonal" color="primary">
                {{ serviceCount }} service{{ serviceCount !== 1 ? 's' : '' }}
              </VChip>
            </div>
          </div>

          <div class="chart-container">
            <svg
              :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
              class="fee-calibration-svg"
              aria-label="Fee vs square footage by service"
            >
              <defs>
                <line
                  id="y-axis"
                  :x1="PAD.left"
                  :y1="PAD.top"
                  :x2="PAD.left"
                  :y2="CHART_HEIGHT - PAD.bottom"
                  stroke="currentColor"
                  stroke-opacity="0.4"
                  stroke-width="1"
                />
                <line
                  id="x-axis"
                  :x1="PAD.left"
                  :y1="CHART_HEIGHT - PAD.bottom"
                  :x2="CHART_WIDTH - PAD.right"
                  :y2="CHART_HEIGHT - PAD.bottom"
                  stroke="currentColor"
                  stroke-opacity="0.4"
                  stroke-width="1"
                />
              </defs>
              <use href="#y-axis" />
              <use href="#x-axis" />
              <g v-for="(line, idx) in svgChart.polylines" :key="idx">
                <polyline
                  :points="line.points"
                  :stroke="line.color"
                  fill="none"
                  stroke-width="2"
                  vector-effect="non-scaling-stroke"
                />
              </g>
              <text
                :x="CHART_WIDTH / 2"
                :y="CHART_HEIGHT - 6"
                text-anchor="middle"
                class="chart-axis-label"
              >
                Square footage
              </text>
              <text
                :x="PAD.left / 2"
                :y="CHART_HEIGHT / 2"
                text-anchor="middle"
                :transform="`rotate(-90, ${PAD.left / 2}, ${CHART_HEIGHT / 2})`"
                class="chart-axis-label"
              >
                Total fee ($)
              </text>
            </svg>
            <div class="chart-legend d-flex flex-wrap gap-3 mt-2">
              <div
                v-for="(item, idx) in svgChart.legend"
                :key="idx"
                class="d-flex align-center gap-1"
              >
                <span
                  class="legend-swatch"
                  :style="{ backgroundColor: item.color }"
                />
                <span class="text-caption">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </template>

        <VAlert
          v-else
          type="info"
          variant="tonal"
          class="mt-2"
        >
          No service-type block instances found. Add services under the Service tab to see fee curves here.
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.fee-calibration-panel {
  padding: 0.5rem 0;
}

.chart-container {
  min-height: 320px;
  position: relative;
}

.fee-calibration-svg {
  width: 100%;
  max-width: 700px;
  height: auto;
  display: block;
}

.chart-axis-label {
  font-size: 12px;
  fill: currentColor;
  opacity: 0.7;
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
