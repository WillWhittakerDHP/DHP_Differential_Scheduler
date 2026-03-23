/**
 * WHY: useAppointmentShape Composable

 */
import { computed, ref, watch } from 'vue'
import type { AppointmentShape } from '@/types/appointment'
import { buildAppointmentShape } from '@/utils/booking/appointmentSlotBuilder'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { useGlobal } from '@/composables/useGlobal'
import { getOrganizationDefaults } from '@/configs/organizationDefaults/api'
import { getCalendarSettings } from '@/configs/calendarSettings'
import { resolveBookingNumericPolicyFromLoadedData } from '@/utils/booking/resolveBookingNumericPolicyClient'
import type { ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import type { UseAppointmentShapeParams, UseAppointmentShapeReturn } from '@/types/booking/appointmentShape'
import { mergeAttendeesIntoEventShapes } from '@/utils/booking/appointmentShapeEventAttendees'

const logger = createLogger('useAppointmentShape')

/**
 * WHY: useAppointmentShape composable

 */
export function useAppointmentShape(params: UseAppointmentShapeParams): UseAppointmentShapeReturn {
  const { blockInstances } = params

  const { settings } = useAvailabilitySettings()

  const resolvedTimeRounding = ref<ResolvedNumericPolicy['timeAndRounding'] | null>(null)

  watch(
    () => settings.value,
    async (avail) => {
      if (avail === null || avail === undefined) {
        resolvedTimeRounding.value = null
        return
      }
      try {
        const [org, cal] = await Promise.all([getOrganizationDefaults(), getCalendarSettings()])
        const policy = resolveBookingNumericPolicyFromLoadedData(org, avail, cal)
        resolvedTimeRounding.value = policy.timeAndRounding
      } catch (error) {
        logger.error('Failed to resolve booking numeric policy for duration rounding', error)
        resolvedTimeRounding.value = null
      }
    },
    { immediate: true },
  )

  const { getGlobalData, getGlobalEntities } = useGlobal()

  const appointmentShape = computed<AppointmentShape | null>(() => {
    const instances = blockInstances.value

    if (instances.length === 0) {
      return null
    }

    try {
      const globalData = getGlobalData()

      const eventInstances = getGlobalEntities('eventInstance') as EventInstance[]
      let eventShapes = getGlobalEntities('eventShape') as EventShape[]
      const rawEventAssignments = globalData?.relationships?.eventAssignments
      const rawAttendeeAssignments = globalData?.relationships?.attendeeAssignments
      if (rawEventAssignments === undefined || rawEventAssignments === null) {
        logger.debug('useAppointmentShape: eventAssignments missing, using []')
      }
      if (rawAttendeeAssignments === undefined || rawAttendeeAssignments === null) {
        logger.debug('useAppointmentShape: attendeeAssignments missing, using []')
      }
      const eventAssignmentsRelationships = (
        rawEventAssignments !== undefined && rawEventAssignments !== null ? rawEventAssignments : []
      ) as GlobalRelationship[]
      const attendeeAssignmentsRelationships = (
        rawAttendeeAssignments !== undefined && rawAttendeeAssignments !== null ? rawAttendeeAssignments : []
      ) as GlobalRelationship[]

      eventShapes = mergeAttendeesIntoEventShapes(eventShapes, attendeeAssignmentsRelationships)

      const partShapes = getGlobalEntities('partShape')
      const partShapeById = new Map(partShapes.map((ps) => [ps.id, ps as GlobalEntity<'partShape'>]))

      return buildAppointmentShape(
        instances,
        settings.value,
        eventInstances,
        eventShapes,
        eventAssignmentsRelationships,
        partShapeById,
        resolvedTimeRounding.value,
      )
    } catch (error) {
      logger.error('Error building appointment shape:', error)
      return null
    }
  })

  return {
    appointmentShape,
  }
}
