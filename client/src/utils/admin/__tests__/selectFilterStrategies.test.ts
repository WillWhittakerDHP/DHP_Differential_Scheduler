import { describe, expect, it } from 'vitest'
import { filterByAccumulationLinkSelectBlockInstances } from '@/utils/admin/selectFilterStrategies'
import type { GlobalEntity } from '@/types/entities'

function block(overrides: Partial<GlobalEntity<'blockInstance'>> & { id: string; blockShapeRef: string }) {
  return {
    id: overrides.id,
    entityKey: 'blockInstance',
    name: overrides.id,
    orderIndex: 0,
    active: true,
    blockShapeRef: overrides.blockShapeRef,
    icon: '',
    isMultiFamily: false,
    requiresAgent: false,
    ...overrides,
  } as GlobalEntity<'blockInstance'>
}

describe('filterByAccumulationLinkSelectBlockInstances', () => {
  it('shows active time block instances only and excludes the current service', () => {
    const result = filterByAccumulationLinkSelectBlockInstances(
      [
        block({ id: 'service', blockShapeRef: 'shape-service' }),
        block({ id: 'hvac-time', blockShapeRef: 'shape-time' }),
        block({ id: 'inactive-time', blockShapeRef: 'shape-time', active: false }),
        block({ id: 'event-option', blockShapeRef: 'shape-event' }),
      ],
      new Set(['shape-time']),
      'service'
    )

    expect(result.map((b) => b.id)).toEqual(['hvac-time'])
  })
})
