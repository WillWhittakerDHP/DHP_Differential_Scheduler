import { describe, expect, it, vi } from 'vitest'
import {
  attendeeIdsFromDraftValue,
  syncEventInstanceAttendeeAssignments,
} from '@/utils/admin/eventInstanceAttendeeAssignments'

describe('event instance attendee assignments', () => {
  it('normalizes draft attendee ids', () => {
    expect(attendeeIdsFromDraftValue([' buyer ', '', null, 'buyer', 'agent'])).toEqual([
      'buyer',
      'agent',
    ])
    expect(attendeeIdsFromDraftValue(null)).toEqual([])
  })

  it('creates and removes only changed attendee relationships', async () => {
    const createAttendeeAssignment = vi.fn().mockResolvedValue({ id: 'rel-created' })
    const removeAttendeeAssignment = vi.fn().mockResolvedValue(undefined)

    await syncEventInstanceAttendeeAssignments({
      eventInstanceId: 'event-instance-1',
      oldAttendeeIds: ['buyer', 'agent'],
      newAttendeeIds: ['agent', 'inspector'],
      createAttendeeAssignment,
      removeAttendeeAssignment,
    })

    expect(createAttendeeAssignment).toHaveBeenCalledWith({
      parentId: 'event-instance-1',
      childId: 'inspector',
    })
    expect(removeAttendeeAssignment).toHaveBeenCalledWith('event-instance-1', 'buyer')
    expect(createAttendeeAssignment).toHaveBeenCalledTimes(1)
    expect(removeAttendeeAssignment).toHaveBeenCalledTimes(1)
  })
})
