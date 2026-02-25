/**
 * WHY: Dev Panels Computed Logic Composable

LEARNING: Extracts computed logic ...
 */
import { computed } from 'vue'
import type { BookingBlockInstance } from '@/types/transformers/bookingData'
import type { SlotShape } from '@/types/appointment'
import type { PartFinal } from '@/types/booking/partFinal'
import { useBooking } from '@/composables/useBooking'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { DEFAULT_MINOR_EVENT_NAME } from '@/configs/availabilitySettings'
import type {
  ServiceSummary,
  TimeSlotResults,
  UseDevPanelsComputedOptions,
  UseDevPanelsComputedReturn,
} from '@/types/booking/devPanelsComputed'

export type {
  DevPanelsComputedData,
  ServiceSummary,
  TimeSlotResults,
  UseDevPanelsComputedOptions,
  UseDevPanelsComputedReturn,
} from '@/types/booking/devPanelsComputed'

export function useDevPanelsComputed(
  options: UseDevPanelsComputedOptions
): UseDevPanelsComputedReturn {
  const { appointmentData } = options
  const { settings: availabilitySettings } = useAvailabilitySettings()

  // PATTERN: Map block instances to summary objects
  const servicesSummary = computed<ServiceSummary[]>(() => {
    const instances = appointmentData.value.selectedBlockInstances
    if (!instances || !Array.isArray(instances)) return []
    return instances.map((block: BookingBlockInstance) => ({
      name: block.name,
      differential: block.differential,
      bookingMode: block.bookingMode,
      baseSqFt: block.baseSqFt ?? 0,
      partCount: block.partInstances?.length !== undefined && block.partInstances?.length !== null ? block.partInstances.length : 0
    }))
  })

  // PATTERN: Direct access to appointmentShape.finalizedParts
  const finalizedParts = computed<PartFinal[]>(() => {
    const shape = appointmentData.value.appointmentShape
    if (!shape || !shape.finalizedParts) {
      return []
    }
    return shape.finalizedParts
  })

  // PATTERN: Direct access to appointmentShape.slotShape properties
  const slotShapeTotals = computed<SlotShape>(() => {
    const shape = appointmentData.value.appointmentShape
    
    if (!shape || !shape.slotShape) {
      return {
        rawDuration: 0,
        roundedDuration: 0,
        eventFinals: [],
        rawDifferentialOffset: 0,
        roundedDifferentialOffset: 0
      }
    }
    
    return shape.slotShape
  })

  // LEARNING: Format time slot results
  // PATTERN: Extract times from selected slot
  const timeSlotResults = computed<TimeSlotResults>(() => {
    const slots = appointmentData.value.appointmentSlots
    const selectedTime = appointmentData.value.selectedTime
    
    if (slots.length === 0 || !selectedTime) {
      return {
        majorArrival: null,
        minorArrival: null,
        appointmentEnd: null
      }
    }
    
    const slot = slots[0]

    const majorArrival = slot.totalTimeRange?.startTime || null

    const minorEventName =
      availabilitySettings.value?.differentialPerspectives?.minorLabel ?? DEFAULT_MINOR_EVENT_NAME
    const minorEventTimeRange = slot.eventTimeRanges?.[minorEventName]
    const minorArrival = minorEventTimeRange?.startTime || slot.totalTimeRange?.startTime || null
    
    const appointmentEnd = slot.totalTimeRange?.endTime || null
    
    return {
      majorArrival,
      minorArrival,
      appointmentEnd
    }
  })

  // PATTERN: Use useBooking composable to get booking data
  const { bookingData } = useBooking()

  // PATTERN: Filter bookingData.blockInstances by service block shape ID and active status
  const allActiveServiceTypes = computed((): BookingBlockInstance[] => {
    const data = bookingData.value
    if (!data || !data.blockInstances || !Array.isArray(data.blockInstances)) return []
    
    const serviceBlockShapeId = getBlockShapeIdByType(data, BLOCK_SHAPE_TYPES.SERVICE)
    if (!serviceBlockShapeId) return []
    
    return data.blockInstances
      .filter(instance => 
        instance.blockShapeRef === serviceBlockShapeId && 
        instance.active === true
      )
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })

  // LEARNING: Map service instances to dropdown options format
  // WHY: VSelect component needs options in { title: string, value: string } format
  // PATTERN: Map instances to select options
  const serviceTypeOptions = computed(() => {
    return allActiveServiceTypes.value.map(service => ({
      title: service.name,
      value: service.id
    }))
  })

  return {
    servicesSummary,
    finalizedParts,
    slotShapeTotals,
    timeSlotResults,
    allActiveServiceTypes,
    serviceTypeOptions
  }
}
