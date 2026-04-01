<script setup lang="ts">

import { ref, computed, provide, unref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { useDevPanelData } from '@/composables/booking/useAvailabilityDevPanel'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { EventShape } from '@/types/events'
import { useGlobal } from '@/composables/useGlobal'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useDevPanelsComputed } from '@/composables/booking/useDevPanelsComputed'
import { useDevPanelButtonsInject } from '@/composables/booking/useDevPanelButtonsInject'
import { useEventShapeById } from '@/composables/booking/useEventShapeById'
import { useDevPanelsAppointmentData } from '@/composables/booking/useDevPanelsAppointmentData'
import { devPanelsFormatters } from '@/utils/booking/devPanelsFormatters'
import { instancesPanelContextKey } from '@/keys/bookingInjectionKeys'
import type { DevPanelVisibleProps } from '@/components/admin/dev/devPanelTypes'
import SlotShapePanel from '@/components/booking/dev/SlotShapePanel.vue'
import InstancesPanel from '@/components/booking/dev/InstancesPanel.vue'
import ConstraintsPanel from '@/components/booking/dev/ConstraintsPanel.vue'

type Props = DevPanelVisibleProps

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDevMode = isDevModeEnabled()
const activeTab = ref<'slotShape' | 'instances' | 'constraints'>('slotShape')
const activeInstancesSubTab = ref<'parts' | 'blocks'>('parts')
const panelRef = ref<HTMLElement | null>(null)

const devPanelData = useDevPanelData()
const appointmentData = useDevPanelsAppointmentData(devPanelData)

const { settings: availabilitySettings } = useAvailabilitySettings()

const availabilitySettingsValue = computed(() => availabilitySettings?.value ?? null)

const minimizerSchedulingWindowForPanel = computed(() =>
  unref(devPanelData.value.minimizerSchedulingWindow) ?? null
)

const {
  servicesSummary,
  finalizedParts,
  slotShapeTotals,
  timeSlotResults,
  allActiveServiceTypes,
  serviceTypeOptions,
} = useDevPanelsComputed({ appointmentData })

const { formatTime, formatDuration } = devPanelsFormatters()

// PATTERN: VueUse onClickOutside lives in composable; ref must be element
onClickOutside(panelRef, () => {
  if (props.visible) emit('close')
}, { ignore: ['.dev-panel-toggle'] })


const { devPanelButtons } = useDevPanelButtonsInject()

const wizard = computed(() => {
  return devPanelButtons.value?.wizard ?? null
})

const selectedServiceTypeId = computed(() => {
  const wizardInstance = wizard.value
  if (!wizardInstance) return null
  const selected = wizardInstance.selectedServiceTypeBlocks?.value
  if (!selected || !Array.isArray(selected) || selected.length === 0) return null
  return selected[0].id
})

const handleServiceTypeChange = (serviceId: string | null): void => {
  const wizardInstance = wizard.value
  if (!wizardInstance || !serviceId) return
  
  const serviceInstance = allActiveServiceTypes.value.find(s => s.id === serviceId)
  if (serviceInstance) {
    wizardInstance.toggleServiceTypeBlock(serviceInstance)
  }
}

const { getGlobalEntities } = useGlobal()

const eventShapes = computed<EventShape[]>(() => getGlobalEntities('eventShape') as EventShape[])
const eventShapeById = useEventShapeById(eventShapes)

const isSelectedServiceDifferential = computed(() => {
  const data = devPanelData.value
  const isEffectivelyDifferentialRef = data.isEffectivelyDifferential
  if (!isEffectivelyDifferentialRef) {
    return false
  }
  if (typeof isEffectivelyDifferentialRef === 'object' && 'value' in isEffectivelyDifferentialRef) {
    return (isEffectivelyDifferentialRef as { value: boolean }).value
  }
  return false
})

const hasEventForPart = (partShapeName: string, eventShape: EventShape): boolean => {
  const shape = appointmentData.value.appointmentShape
  if (!shape || !shape.eventAssignmentsByPartShape) return false

  const rawEvents = shape.eventAssignmentsByPartShape[partShapeName]
  const events = rawEvents !== undefined && rawEvents !== null ? rawEvents : []
  if (events.length === 0) return false

  const matchingEvent = events.find((ei) => {
    const es = eventShapeById.value.get(toGlobalEntityId(ei.eventShapeRef))
    return es?.id === eventShape.id
  })

  if (!matchingEvent) return false

  return true
}

const appointmentShapeForPanel = computed(() => appointmentData.value?.appointmentShape ?? null)
const hasSelectedTimeForPanel = computed(() => !!appointmentData.value?.selectedTime)

provide(instancesPanelContextKey, {
  activeInstancesSubTab,
  setActiveInstancesSubTab: (value: 'parts' | 'blocks') => { activeInstancesSubTab.value = value },
  appointmentShape: appointmentShapeForPanel,
  finalizedParts,
  eventShapes,
  hasEventForPart,
  formatDuration,
  formatTime,
  selectedServiceTypeId,
  serviceTypeOptions,
  handleServiceTypeChange,
  hasWizard: !!wizard.value,
  isSelectedServiceDifferential,
  servicesSummary,
  timeSlotResults,
  hasSelectedTime: hasSelectedTimeForPanel,
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isDevMode && visible" ref="panelRef" class="dev-panels-wrapper">
    <VCard
      class="dev-panels-container"
      variant="outlined"
      color="info"
    >
      <VTabs v-model="activeTab" density="compact" color="info" class="flexible-tabs">
        <VTab value="slotShape">
          <VIcon size="small" class="mr-2">tabler-chart-bar</VIcon>
          Durations
        </VTab>
        <VTab value="instances">
          <VIcon size="small" class="mr-2">tabler-package</VIcon>
          Instances
        </VTab>
        <VTab value="constraints">
          <VIcon size="small" class="mr-2">tabler-lock</VIcon>
          Constraints
        </VTab>
      </VTabs>
      
      <VCardText class="pa-0">
        <VWindow v-model="activeTab">
          <VWindowItem value="slotShape">
            <SlotShapePanel
              :appointment-shape="appointmentData.appointmentShape"
              :slot-shape-totals="slotShapeTotals"
              :format-duration="formatDuration"
            />
          </VWindowItem>
          <VWindowItem value="instances">
            <InstancesPanel />
          </VWindowItem>
          <VWindowItem value="constraints">
            <ConstraintsPanel
              :availability-settings-value="availabilitySettingsValue"
              :minimizer-scheduling-window="minimizerSchedulingWindowForPanel"
            />
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
    </div>
  </Teleport>
</template>

<style scoped lang="scss" src="./DevPanelsContainer.scss"></style>
