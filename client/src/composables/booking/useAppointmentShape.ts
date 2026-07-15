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
import { createLogger } from '@/utils/logger'
import type { UseAppointmentShapeParams, UseAppointmentShapeReturn } from '@/types/booking/appointmentShape'
import { mergeAttendeesIntoEventShapes } from '@/utils/booking/appointmentShapeEventAttendees'

const logger = createLogger('useAppointmentShape')

function emptyRelationshipsWhenMissing(
  rels: GlobalRelationship[] | undefined | null,
  relationshipName: string
): GlobalRelationship[] {
  if (rels === undefined || rels === null) {
    logger.debug(`useAppointmentShape: ${relationshipName} missing, using []`)
    return []
  }
  return rels
}

async function resolveTimeRoundingFromAvailability(
  availabilitySettings: ReturnType<typeof useAvailabilitySettings>['settings']['value']
): Promise<ResolvedNumericPolicy['timeAndRounding'] | null> {
  if (availabilitySettings === null || availabilitySettings === undefined) {
    return null
  }
  const [org, cal] = await Promise.all([getOrganizationDefaults(), getCalendarSettings()])
  return resolveBookingNumericPolicyFromLoadedData(org, availabilitySettings, cal).timeAndRounding
}

function buildShapeFromGlobalData(params: {
  instances: UseAppointmentShapeParams['blockInstances']['value']
  settings: ReturnType<typeof useAvailabilitySettings>['settings']['value']
  eventInstances: EventInstance[]
  eventShapes: EventShape[]
  globalRelationships: Record<string, GlobalRelationship[]> | undefined
  resolvedTimeRounding: ResolvedNumericPolicy['timeAndRounding'] | null
}): AppointmentShape {
  const eventAssignmentsRelationships = emptyRelationshipsWhenMissing(
    params.globalRelationships?.eventAssignments,
    'eventAssignments'
  )
  const attendeeAssignmentsRelationships = emptyRelationshipsWhenMissing(
    params.globalRelationships?.attendeeAssignments,
    'attendeeAssignments'
  )
  const eventShapesWithAttendees = mergeAttendeesIntoEventShapes(
    params.eventShapes,
    params.eventInstances,
    attendeeAssignmentsRelationships
  )

  return buildAppointmentShape(
    params.instances,
    params.settings,
    params.eventInstances,
    eventShapesWithAttendees,
    eventAssignmentsRelationships,
    params.resolvedTimeRounding,
  )
}

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
      try {
        resolvedTimeRounding.value = await resolveTimeRoundingFromAvailability(avail)
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
      const eventShapes = getGlobalEntities('eventShape') as EventShape[]
      return buildShapeFromGlobalData({
        instances,
        settings: settings.value,
        eventShapes,
        eventInstances,
        globalRelationships: globalData?.relationships as Record<string, GlobalRelationship[]> | undefined,
        resolvedTimeRounding: resolvedTimeRounding.value,
      })
    } catch (error) {
      logger.error('Error building appointment shape:', error)
      return null
    }
  })

  return {
    appointmentShape,
  }
}
