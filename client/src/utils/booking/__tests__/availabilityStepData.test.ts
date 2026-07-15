import { describe, expect, it } from 'vitest'
import { buildSelectedTimeSlots } from '@/utils/booking/availabilityStepData'
import type { AppointmentSlot } from '@/types/appointment'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { EventFinal } from '@/types/appointment'
import type { EventShape } from '@/types/events'

function range(startTime: string, endTime: string, duration: number): SlotTimeBounds {
  return { startTime, endTime, duration } as SlotTimeBounds
}

function eventFinal(
  id: string,
  name: string,
  placementKind: 'primary' | 'secondary',
  anchorEdge: 'start' | 'end' | null
): EventFinal {
  return {
    eventShape: {
      id,
      name,
      entityKey: 'eventShape',
      active: true,
      placementKind,
      anchorEdge,
    } as unknown as EventShape,
    rawDuration: 30,
    roundedDuration: 30,
  }
}

describe('availability step selected time slots', () => {
  it('persists event-shape metadata for segment-specific calendar invites', () => {
    const slot = {
      totalTimeRange: range('2026-01-01T10:00:00.000Z', '2026-01-01T12:00:00.000Z', 120),
      eventTimeRanges: {
        Primary: range('2026-01-01T10:00:00.000Z', '2026-01-01T12:00:00.000Z', 120),
        Presentation: range('2026-01-01T11:30:00.000Z', '2026-01-01T12:00:00.000Z', 30),
      },
      shape: {
        slotShape: {
          eventFinals: [
            eventFinal('shape-primary', 'Primary', 'primary', null),
            eventFinal('shape-presentation', 'Presentation', 'secondary', 'end'),
          ],
        },
      },
    } as unknown as AppointmentSlot

    const selected = buildSelectedTimeSlots({
      selectedDateStart: '2026-01-01',
      selectedSlot: slot,
    })

    expect(selected).toEqual([
      expect.objectContaining({
        eventShapeId: 'shape-primary',
        eventShapeName: 'Primary',
        placementKind: 'primary',
        anchorEdge: null,
      }),
      expect.objectContaining({
        eventShapeId: 'shape-presentation',
        eventShapeName: 'Presentation',
        placementKind: 'secondary',
        anchorEdge: 'end',
        startTime: '2026-01-01T11:30:00.000Z',
      }),
    ])
  })
})
