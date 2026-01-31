/**
 * Dev Panels Computed Logic Composable
 * 
 * LEARNING: Extracts computed logic from DevPanelsContainer.vue into reusable composable
 * WHY: Reduces component complexity, improves testability, enables reuse
 * PATTERN: Composable that provides computed properties for dev panel display
 */

import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { TernaryBoolean } from '@/types/ternary'
import type { AppointmentShape, SlotShape, AppointmentSlot } from '@/types/appointment'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { RFC3339DateTime } from '@/types/datetime'
import { useLocalTime } from '@/composables/useLocalTime'
import { useBooking } from '@/composables/useBooking'
import { getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'

export interface DevPanelsComputedData {
  selectedBlockInstances: BookingBlockInstance[]
  appointmentSlots: AppointmentSlot[]
  appointmentShape: AppointmentShape | null
  selectedDate: string | undefined
  selectedTime: string | undefined
}

export interface UseDevPanelsComputedOptions {
  appointmentData: ComputedRef<DevPanelsComputedData>
}

export interface UseDevPanelsComputedReturn {
  servicesSummary: ComputedRef<ServiceSummary[]>
  finalizedParts: ComputedRef<PartFinal[]>
  slotShapeTotals: ComputedRef<SlotShape>
  timeSlotResults: ComputedRef<TimeSlotResults>
  allActiveServiceTypes: ComputedRef<BookingBlockInstance[]>
  serviceTypeOptions: ComputedRef<Array<{ title: string; value: string }>>
}

interface ServiceSummary {
  name: string
  differential: TernaryBoolean
  bookingMode: string
  baseSqFt: number
  partCount: number
}

interface TimeSlotResults {
  majorArrival: string | null
  minorArrival: string | null
  appointmentEnd: string | null
}

/**
 * LEARNING: Extract computed logic from DevPanelsContainer.vue
 * WHY: Reduces component complexity from 13 computed properties to composable usage
 * PATTERN: Composable provides all computed properties needed for dev panel display
 */
export function useDevPanelsComputed(
  options: UseDevPanelsComputedOptions
): UseDevPanelsComputedReturn {
  const { appointmentData } = options

  // LEARNING: Calculate services summary
  // WHY: Shows overview of selected services
  // PATTERN: Map block instances to summary objects
  const servicesSummary = computed<ServiceSummary[]>(() => {
    const instances = appointmentData.value.selectedBlockInstances
    if (!instances || !Array.isArray(instances)) return []
    return instances.map((block: BookingBlockInstance) => ({
      name: block.name,
      differential: block.differential,
      bookingMode: block.bookingMode,
      baseSqFt: block.baseSqFt ?? 0,
      partCount: block.partInstances?.length || 0
    }))
  })

  // LEARNING: Get finalized parts directly from AppointmentShape
  // WHY: Shows finalized parts directly from source of truth without any filtering
  // PATTERN: Direct access to appointmentShape.finalizedParts
  const finalizedParts = computed<PartFinal[]>(() => {
    const shape = appointmentData.value.appointmentShape
    if (!shape || !shape.finalizedParts) {
      return []
    }
    return shape.finalizedParts
  })

  // LEARNING: Get SlotShape totals directly from AppointmentShape
  // WHY: Shows SlotShape properties directly without any filtering or categorization
  // PATTERN: Direct access to appointmentShape.slotShape properties
  const slotShapeTotals = computed<SlotShape>(() => {
    const shape = appointmentData.value.appointmentShape
    
    if (!shape || !shape.slotShape) {
      return {
        totalDuration: 0,
        eventFinals: [],
        differentialOffset: 0
      }
    }
    
    return shape.slotShape
  })

  // LEARNING: Format time slot results
  // WHY: Shows actual time values for selected appointment
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
    
    // Major arrival is the start of totalTimeRange
    const majorArrival = slot.totalTimeRange?.startTime || null
    
    // Minor arrival is the start of minor event time range (or totalTimeRange if no minor event)
    // NOTE: Uses eventTimeRanges lookup by event name (configured via availabilitySettings)
    const minorEventName = 'Minor' // TODO: Get from availabilitySettings
    const minorEventTimeRange = slot.eventTimeRanges?.[minorEventName]
    const minorArrival = minorEventTimeRange?.startTime || slot.totalTimeRange?.startTime || null
    
    // Appointment end is the end of totalTimeRange
    const appointmentEnd = slot.totalTimeRange?.endTime || null
    
    return {
      majorArrival,
      minorArrival,
      appointmentEnd
    }
  })

  // LEARNING: Get booking data for service type filtering
  // WHY: Need bookingData to get all active service block instances
  // PATTERN: Use useBooking composable to get booking data
  const { bookingData } = useBooking()

  // LEARNING: Get all active service block instances (not filtered by cascades)
  // WHY: Debug panel should allow selecting any active service type for testing
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
