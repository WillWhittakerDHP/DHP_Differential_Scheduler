import { describe, expect, it, vi } from 'vitest'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import {
  buildServiceBlockEventSelectionState,
  syncBlockEventAssignments,
} from '@/utils/admin/serviceBlockEventSelection'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

function blockShape(id: string, validEventCascades: string[] = []): GlobalEntity<'blockShape'> {
  return {
    id,
    entityKey: 'blockShape',
    name: 'Service',
    orderIndex: 0,
    semanticType: BLOCK_SHAPE_TYPES.SERVICE,
    validEventCascades,
  } as GlobalEntity<'blockShape'>
}

function block(id: string, defaultEventInstanceId: string | null = null): GlobalEntity<'blockInstance'> {
  return {
    id,
    entityKey: 'blockInstance',
    name: 'Buyer Inspection',
    orderIndex: 0,
    blockShapeRef: 'shape-service',
    icon: '',
    isMultiFamily: false,
    requiresAgent: false,
    wizardPlacement: 'topLine',
    active: true,
    defaultEventInstanceId,
  } as GlobalEntity<'blockInstance'>
}

function event(id: string, name: string, eventShapeRef: string): GlobalEntity<'eventInstance'> {
  return { id, entityKey: 'eventInstance', name, orderIndex: 0, active: true, eventShapeRef } as GlobalEntity<'eventInstance'>
}

function rel(parent: GlobalEntity<'blockInstance'>, children: GlobalEntity<'eventInstance'>[]): GlobalRelationship {
  return { relationshipKind: 'eventAssignments', parent, children } as GlobalRelationship
}

describe('serviceBlockEventSelection', () => {
  it('builds default and option event selections for a block instance', () => {
    const service = block('service-1', 'event-primary')
    const primary = event('event-primary', 'Primary', 'event-shape-primary')
    const optional = event('event-optional', 'Optional', 'event-shape-optional')
    const state = buildServiceBlockEventSelectionState({
      blockInstanceId: 'service-1',
      blockInstances: [service],
      blockShapes: [blockShape('shape-service', ['event-shape-primary', 'event-shape-optional'])],
      eventInstances: [primary, optional],
      eventAssignments: [rel(service, [primary, optional])],
    })

    expect(state.defaultEventId).toBe('event-primary')
    expect(state.optionEventIds).toEqual(['event-optional'])
    expect(state.eventOptions.map((option) => option.id)).toEqual(['event-optional', 'event-primary'])
  })

  it('syncs default plus options through block-scoped event assignments', async () => {
    const createEventAssignment = vi.fn().mockResolvedValue({ id: 'created' })
    const removeEventAssignment = vi.fn().mockResolvedValue(undefined)

    await syncBlockEventAssignments({
      blockInstanceId: 'service-1',
      defaultEventId: 'event-primary',
      optionEventIds: ['event-extra'],
      oldAssignedEventIds: ['event-old', 'event-extra'],
      createEventAssignment,
      removeEventAssignment,
    })

    expect(createEventAssignment).toHaveBeenCalledWith({
      parentId: 'service-1',
      childId: 'event-primary',
    })
    expect(removeEventAssignment).toHaveBeenCalledWith('service-1', 'event-old')
  })
})
