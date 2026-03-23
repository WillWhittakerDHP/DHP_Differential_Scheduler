import { computed } from 'vue'
import { createLogger } from '@/utils/logger'
import { useAppointmentShape } from '@/composables/booking/useAppointmentShape'
import type { UseAppointmentSlotsParams, UseAppointmentSlotsReturn } from '@/types/booking/appointmentSlots'
import {
  buildAppointmentSlotsWithServerMeta,
  displayTimeForButtonIndex,
  findSelectedAppointmentSlot,
  resolveAppointmentGraphBars,
} from '@/utils/booking/appointmentSlotsComputeds'

const logger = createLogger('useAppointmentSlots')

export function useAppointmentSlots(params: UseAppointmentSlotsParams): UseAppointmentSlotsReturn {
  const {
    blockInstances,
    serverSlotsForDay,
    selectedButtonIndex,
    perspective,
    isDifferentialService,
    appointmentShapeOverride,
    appointmentShapeFromBlocks,
  } = params

  const baseShape = useAppointmentShape({ blockInstances })
  const appointmentShape = computed(() => {
    if (appointmentShapeFromBlocks !== undefined) {
      return appointmentShapeFromBlocks.value
    }
    return appointmentShapeOverride?.value ?? baseShape.appointmentShape.value
  })

  const appointmentSlots = computed(() => {
    const shape = appointmentShape.value
    if (!shape) {
      return []
    }
    const serverSlots = serverSlotsForDay.value
    if (serverSlots.length === 0) {
      return []
    }
    try {
      return buildAppointmentSlotsWithServerMeta(shape, serverSlots)
    } catch (error) {
      logger.error('Error applying shape to server slots:', error)
      return []
    }
  })

  const selectedSlot = computed(() =>
    findSelectedAppointmentSlot(appointmentSlots.value, selectedButtonIndex.value)
  )

  const getDisplayTime = (buttonIndex: number) =>
    displayTimeForButtonIndex(appointmentSlots.value, buttonIndex, perspective.value)

  const graphBars = computed(() =>
    resolveAppointmentGraphBars(
      selectedSlot.value,
      appointmentShape.value,
      isDifferentialService.value,
      (message) => {
        logger.error(message)
      }
    )
  )

  return {
    appointmentShape,
    appointmentSlots,
    selectedSlot,
    getDisplayTime,
    graphBars,
  }
}
