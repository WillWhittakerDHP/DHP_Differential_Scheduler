import { describe, expect, it } from 'vitest'
import {
  eventTimingBehaviorFromPlacement,
  eventTimingBehaviorFromValue,
} from '@/utils/admin/eventPlacementLabels'

describe('eventPlacementLabels', () => {
  it('maps stored placement fields to admin timing language', () => {
    expect(eventTimingBehaviorFromPlacement('primary', null).title).toBe('Main appointment window')
    expect(eventTimingBehaviorFromPlacement('secondary', 'end').title).toBe(
      'Inside end of main window'
    )
    expect(eventTimingBehaviorFromPlacement('marginal', 'start').title).toBe(
      'Work before main window'
    )
    expect(eventTimingBehaviorFromPlacement('floating', 'end').title).toBe(
      'Flexible/off-site after main window'
    )
  })

  it('maps a combined admin choice back to stored placement fields', () => {
    expect(eventTimingBehaviorFromValue('marginal:end')).toMatchObject({
      placementKind: 'marginal',
      anchorEdge: 'end',
    })
  })
})
