import { computed } from 'vue'
import { applyShapeToTime, derivePerspective } from '@/utils/booking/appointmentSlotBuilder'
import { createLogger } from '@/utils/logger'
import { useAppointmentShape } from '@/composables/booking/useAppointmentShape'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { TimeRange } from '@/types/appointment'
import type { UseAppointmentSlotsParams, UseAppointmentSlotsReturn } from '@/types/booking/appointmentSlots'

const logger = createLogger('useAppointmentSlots')

export type { UseAppointmentSlotsParams, UseAppointmentSlotsReturn } from '@/types/booking/appointmentSlots'

export function useAppointmentSlots(params: UseAppointmentSlotsParams): UseAppointmentSlotsReturn {
  const {
    blockInstances,
    serverSlotsForDay,
    selectedButtonIndex,
    perspective,
    isDifferentialService,
  } = params

  const { appointmentShape } = useAppointmentShape({ blockInstances })

  const appointmentSlots = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return []

    const serverSlots = serverSlotsForDay.value
    if (serverSlots.length === 0) return []

    try {
      return serverSlots.map((serverSlot, index) => {
        const slot = applyShapeToTime(
          shape,
          serverSlot.startTime,
          index,
          undefined,
          true,
        )
        return {
          ...slot,
          isAvailable: serverSlot.isAvailable,
          flexibleViolations: serverSlot.violations,
          hasFlexibleViolations: serverSlot.violations.length > 0,
        }
      })
    } catch (error) {
      logger.error('Error applying shape to server slots:', error)
      return []
    }
  })

  const selectedSlot = computed(() => {
    const index = selectedButtonIndex.value
    if (index === null) return null
    return appointmentSlots.value.find((s) => s.buttonIndex === index) ?? null
  })

  const getDisplayTime = (buttonIndex: number): TimeRange | null => {
    const slot = appointmentSlots.value.find((s) => s.buttonIndex === buttonIndex)
    if (!slot) return null
    return derivePerspective(slot, perspective.value)
  }

  const graphBars = computed(() => {
    const slot = selectedSlot.value
    if (!slot) return { major: null, minor: null }

    const shape = appointmentShape.value
    if (!shape?.slotShape.eventFinals?.length) return { major: null, minor: null }

    const eventShapeEntities = shape.slotShape.eventFinals.map(
      (ef) => ef.eventShape
    ) as EventShapeEntity[]

    const majorEventShape = getEventShapeByRole(eventShapeEntities, 'major')
    if (!majorEventShape) {
      logger.error('graphBars: no event shape with differentialRole=major')
      return { major: null, minor: null }
    }

    const minorEventShape = isDifferentialService.value
      ? getEventShapeByRole(eventShapeEntities, 'minor')
      : null

    return {
      major: slot.eventTimeRanges?.[majorEventShape.name] ?? null,
      minor:
        isDifferentialService.value && minorEventShape
          ? (slot.eventTimeRanges?.[minorEventShape.name] ?? null)
          : null,
    }
  })

  return {
    appointmentShape,
    appointmentSlots,
    selectedSlot,
    getDisplayTime,
    graphBars,
  }
}
