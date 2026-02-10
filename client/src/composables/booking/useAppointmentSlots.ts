/**
 * useAppointmentSlots Composable
 *
 * LEARNING: Builds AppointmentSlot from server-computed slots + client shape (eventTimeRanges, graph bars)
 * WHY: Server provides isAvailable and violations; client applies AppointmentShape for display only
 * PATTERN: Map server ComputedSlot[] -> applyShapeToTime -> carry over isAvailable and flexibleViolations
 *
 * Phase 5: Server-Side Slot Computation — no client overlap/capacity re-check
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type {
  AppointmentShape,
  AppointmentSlot,
  AppointmentSlots,
  TimeRange,
  PerspectiveKey,
} from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { applyShapeToTime, derivePerspective } from '@/utils/booking/appointmentSlotBuilder'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { useGlobal } from '@/composables/useGlobal'
import { createLogger } from '@/utils/logger'
import { useAppointmentShape } from '@/composables/booking/useAppointmentShape'
import {
  getMajorEventShape,
  getMinorEventShape,
} from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { ComputedSlot } from '@shared/types/availabilityTypes'

const logger = createLogger('useAppointmentSlots')

export interface UseAppointmentSlotsParams {
  blockInstances: ComputedRef<BookingBlockInstance[]>
  /** Server-computed slots for the selected day (replaces availableStartTimes + busyTimes + client constraint checks) */
  serverSlotsForDay: ComputedRef<ComputedSlot[]>
  selectedButtonIndex: Ref<number | null>
  perspective: ComputedRef<PerspectiveKey>
  isDifferentialService: ComputedRef<boolean>
}

export interface UseAppointmentSlotsReturn {
  appointmentShape: ComputedRef<AppointmentShape | null>
  appointmentSlots: ComputedRef<AppointmentSlots>
  selectedSlot: ComputedRef<AppointmentSlot | null>
  getDisplayTime: (buttonIndex: number) => TimeRange | null
  graphBars: ComputedRef<{
    major: TimeRange | null
    minor: TimeRange | null
  }>
}

/**
 * useAppointmentSlots
 *
 * LEARNING: Applies AppointmentShape to each server slot and carries over server availability/violations
 * WHY: Server does range/overlap/capacity; client only builds eventTimeRanges and graph bars for display
 */
export function useAppointmentSlots(params: UseAppointmentSlotsParams): UseAppointmentSlotsReturn {
  const {
    blockInstances,
    serverSlotsForDay,
    selectedButtonIndex,
    perspective,
    isDifferentialService,
  } = params

  const { settings } = useAvailabilitySettings()
  const { getGlobalData } = useGlobal()
  const { appointmentShape } = useAppointmentShape({ blockInstances })

  const appointmentSlots = computed(() => {
    const shape = appointmentShape.value
    if (!shape) return []

    const serverSlots = serverSlotsForDay.value
    if (serverSlots.length === 0) return []

    const globalData = getGlobalData()

    try {
      return serverSlots.map((serverSlot, index) => {
        const slot = applyShapeToTime(
          shape,
          serverSlot.startTime,
          index,
          undefined,
          true,
          globalData ?? undefined,
          settings.value ?? null
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
    return derivePerspective(
      slot,
      perspective.value,
      getGlobalData() ?? undefined,
      settings.value ?? null
    )
  }

  const graphBars = computed(() => {
    const slot = selectedSlot.value
    if (!slot) return { major: null, minor: null }

    const globalData = getGlobalData()
    const availabilitySettingsValue = settings.value
    if (!globalData || !availabilitySettingsValue?.differentialPerspectives) {
      return { major: null, minor: null }
    }

    const majorAttendeeIds = availabilitySettingsValue.differentialPerspectives.majorAttendees ?? []
    const minorAttendeeIds = availabilitySettingsValue.differentialPerspectives.minorAttendees ?? []
    const shape = appointmentShape.value
    if (!shape?.slotShape.eventFinals) return { major: null, minor: null }

    const eventShapeEntities = shape.slotShape.eventFinals.map(
      (ef) => ef.eventShape
    ) as EventShapeEntity[]
    const majorEventShape =
      majorAttendeeIds.length > 0
        ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
        : null
    const eventShapesExcludingMajor = majorEventShape
      ? eventShapeEntities.filter((es) => es.id !== majorEventShape.id)
      : eventShapeEntities
    const minorEventShape =
      minorAttendeeIds.length > 0 && isDifferentialService.value
        ? getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
        : null

    if (!majorEventShape) return { major: null, minor: null }

    const majorEventName = majorEventShape.name
    const minorEventName = minorEventShape?.name ?? null

    return {
      major: slot.eventTimeRanges?.[majorEventName] ?? null,
      minor:
        isDifferentialService.value && minorEventName
          ? (slot.eventTimeRanges?.[minorEventName] ?? null)
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
