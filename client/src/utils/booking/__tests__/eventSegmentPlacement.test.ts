import { describe, expect, it } from 'vitest'
import { createPlacedEventTimeRanges } from '@/utils/booking/eventSegmentPlacement'
import type { EventFinal, SlotShape } from '@/types/appointment'
import type { EventShape } from '@/types/events'

const START = '2026-01-01T10:00:00.000Z'

function eventFinal(
  name: string,
  placementKind: 'primary' | 'secondary' | 'marginal' | 'floating' | 'none',
  anchorEdge: 'start' | 'end' | null,
  roundedDuration: number
): EventFinal {
  return {
    eventShape: {
      id: name,
      entityKey: 'eventShape',
      name,
      active: true,
      placementKind,
      anchorEdge,
    } as unknown as EventShape,
    rawDuration: roundedDuration,
    roundedDuration,
  }
}

function slotShape(eventFinals: EventFinal[]): SlotShape {
  return {
    rawDuration: eventFinals.reduce((sum, event) => sum + event.rawDuration, 0),
    roundedDuration: Math.max(...eventFinals.map((event) => event.roundedDuration)),
    rawDifferentialOffset: 0,
    roundedDifferentialOffset: 0,
    eventFinals,
  }
}

function range(name: string, result: ReturnType<typeof createPlacedEventTimeRanges>) {
  return result.eventTimeRanges[name]
}

describe('event segment placement resolver', () => {
  it('places secondary segments inside the primary window by anchor edge', () => {
    const result = createPlacedEventTimeRanges(
      slotShape([
        eventFinal('Primary', 'primary', null, 120),
        eventFinal('FrontSecondary', 'secondary', 'start', 30),
        eventFinal('BackSecondary', 'secondary', 'end', 30),
      ]),
      START
    )

    expect(range('Primary', result)).toMatchObject({
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T12:00:00.000Z',
    })
    expect(range('FrontSecondary', result)).toMatchObject({
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T10:30:00.000Z',
    })
    expect(range('BackSecondary', result)).toMatchObject({
      startTime: '2026-01-01T11:30:00.000Z',
      endTime: '2026-01-01T12:00:00.000Z',
    })
    expect(result.totalTimeRange).toMatchObject({
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T12:00:00.000Z',
    })
  })

  it('places marginal segments adjacent to primary and expands the main busy window', () => {
    const result = createPlacedEventTimeRanges(
      slotShape([
        eventFinal('Primary', 'primary', null, 120),
        eventFinal('FrontMarginal', 'marginal', 'start', 45),
        eventFinal('BackMarginal', 'marginal', 'end', 45),
      ]),
      START
    )

    expect(range('FrontMarginal', result)).toMatchObject({
      startTime: '2026-01-01T09:15:00.000Z',
      endTime: '2026-01-01T10:00:00.000Z',
    })
    expect(range('BackMarginal', result)).toMatchObject({
      startTime: '2026-01-01T12:00:00.000Z',
      endTime: '2026-01-01T12:45:00.000Z',
    })
    expect(result.totalTimeRange).toMatchObject({
      startTime: '2026-01-01T09:15:00.000Z',
      endTime: '2026-01-01T12:45:00.000Z',
      duration: 210,
    })
  })

  it('places floating segments near primary without expanding the main busy window', () => {
    const result = createPlacedEventTimeRanges(
      slotShape([
        eventFinal('Primary', 'primary', null, 120),
        eventFinal('FrontFloating', 'floating', 'start', 20),
        eventFinal('BackFloating', 'floating', 'end', 20),
      ]),
      START
    )

    expect(range('FrontFloating', result)).toMatchObject({
      startTime: '2026-01-01T09:40:00.000Z',
      endTime: '2026-01-01T10:00:00.000Z',
    })
    expect(range('BackFloating', result)).toMatchObject({
      startTime: '2026-01-01T12:00:00.000Z',
      endTime: '2026-01-01T12:20:00.000Z',
    })
    expect(result.totalTimeRange).toMatchObject({
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T12:00:00.000Z',
      duration: 120,
    })
  })

  it('leaves none-placement segments unscheduled (no presentation)', () => {
    const result = createPlacedEventTimeRanges(
      slotShape([
        eventFinal('Primary', 'primary', null, 120),
        eventFinal('NoPresentation', 'none', null, 45),
      ]),
      START
    )

    expect(range('NoPresentation', result)).toBeNull()
    expect(result.totalTimeRange).toMatchObject({
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T12:00:00.000Z',
      duration: 120,
    })
  })
})
