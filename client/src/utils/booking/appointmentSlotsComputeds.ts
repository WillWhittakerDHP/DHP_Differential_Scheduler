/**
 * Pure slot display / graph-bar resolution for useAppointmentSlots.
 * WHY: Keeps composable shallow for function-complexity audit (nested returns not in useXxx).
 */

import { applyShapeToTime, derivePerspective } from '@/utils/booking/appointmentSlotBuilder'
import { resolveDifferentialMajorMinorFromEventShapes } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { ComputedSlot, SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { AppointmentShape, AppointmentSlot, PerspectiveKey } from '@/types/appointment'

function serverSlotDurationFallback(serverSlot: ComputedSlot): number | undefined {
  const d = serverSlot.duration
  return typeof d === 'number' && Number.isFinite(d) && d > 0 ? d : undefined
}

export function buildAppointmentSlotsWithServerMeta(
  shape: AppointmentShape,
  serverSlots: ComputedSlot[]
): AppointmentSlot[] {
  return serverSlots.map((serverSlot, index) => {
    const slot = applyShapeToTime(
      shape,
      serverSlot.startTime,
      index,
      serverSlotDurationFallback(serverSlot),
      true,
    )
    return {
      ...slot,
      isAvailable: serverSlot.isAvailable,
      flexibleViolations: serverSlot.violations,
      hasFlexibleViolations: serverSlot.violations.length > 0,
      driveToCandidate: serverSlot.driveToCandidate,
      driveFromCandidate: serverSlot.driveFromCandidate,
    }
  })
}

export function findSelectedAppointmentSlot(
  slots: AppointmentSlot[],
  selectedIndex: number | null
): AppointmentSlot | null {
  if (selectedIndex === null) {
    return null
  }
  return slots.find((s) => s.buttonIndex === selectedIndex) ?? null
}

export function displayTimeForButtonIndex(
  slots: AppointmentSlot[],
  buttonIndex: number,
  perspective: PerspectiveKey
): SlotTimeBounds | null {
  const slot = slots.find((s) => s.buttonIndex === buttonIndex)
  if (!slot) {
    return null
  }
  return derivePerspective(slot, perspective)
}

interface GraphBarsResult {
  major: SlotTimeBounds | null
  minor: SlotTimeBounds | null
}

export function resolveAppointmentGraphBars(
  slot: AppointmentSlot | null,
  shape: AppointmentShape | null | undefined,
  isDifferentialService: boolean,
  logGraphBarsError: (message: string) => void
): GraphBarsResult {
  if (!slot) {
    return { major: null, minor: null }
  }
  if (!shape?.slotShape.eventFinals?.length) {
    return { major: null, minor: null }
  }

  const eventShapeEntities = shape.slotShape.eventFinals.map((ef) => ef.eventShape) as EventShapeEntity[]
  const resolved = resolveDifferentialMajorMinorFromEventShapes(
    eventShapeEntities,
    shape.differentialEventRoleOverrides ?? null,
  )

  if (!isDifferentialService || !resolved.hasMajorMinorPair) {
    return {
      major: slot.totalTimeRange ?? null,
      minor: null,
    }
  }

  const majorShape = resolved.major
  const minorShape = resolved.minor
  if (majorShape === null || minorShape === null) {
    logGraphBarsError('graphBars: hasMajorMinorPair true but major or minor is null')
    return { major: slot.totalTimeRange ?? null, minor: null }
  }

  return {
    major: slot.eventTimeRanges?.[majorShape.name] ?? null,
    minor: slot.eventTimeRanges?.[minorShape.name] ?? null,
  }
}
