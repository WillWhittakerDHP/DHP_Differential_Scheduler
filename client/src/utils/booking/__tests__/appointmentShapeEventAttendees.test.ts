import { describe, expect, it } from 'vitest'
import { mergeAttendeesIntoEventShapes } from '@/utils/booking/appointmentShapeEventAttendees'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'

function eventShape(id: string): EventShape {
  return {
    id,
    entityKey: 'eventShape',
    name: id,
    active: true,
    placementKind: 'primary',
    anchorEdge: null,
  } as unknown as EventShape
}

function eventInstance(id: string, eventShapeRef: string): EventInstance {
  return {
    id,
    entityKey: 'eventInstance',
    name: id,
    active: true,
    eventShapeRef,
  } as unknown as EventInstance
}

function attendeeRelationship(parentId: string, childIds: string[]): GlobalRelationship {
  return {
    relationshipKind: 'attendeeAssignments',
    parent: { entityKey: 'eventInstance', id: parentId } as GlobalRelationship['parent'],
    children: childIds.map(
      (id) => ({ entityKey: 'blockInstance', id }) as GlobalRelationship['children'][number]
    ),
  }
}

describe('appointment shape event attendees', () => {
  it('aggregates segment attendees from event instances onto booking event shapes', () => {
    const shapes = [eventShape('shape-primary'), eventShape('shape-floating')]
    const instances = [
      eventInstance('instance-client', 'shape-primary'),
      eventInstance('instance-internal', 'shape-floating'),
    ]
    const relationships = [
      attendeeRelationship('instance-client', ['user-client']),
      attendeeRelationship('instance-internal', ['user-agent', 'user-inspector']),
    ]

    const merged = mergeAttendeesIntoEventShapes(shapes, instances, relationships)

    expect(merged.find((shape) => shape.id === 'shape-primary')?.attendees).toEqual([
      'user-client',
    ])
    expect(merged.find((shape) => shape.id === 'shape-floating')?.attendees).toEqual([
      'user-agent',
      'user-inspector',
    ])
  })
})
