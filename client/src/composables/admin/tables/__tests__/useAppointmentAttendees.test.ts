/**
 * Unit tests for useAppointmentAttendees helpers
 *
 * Covers: attendeesFromClientAndAgent, getClientIdFromAttendees, getAgentIdFromAttendees,
 * getClientAttendee, getAgentAttendee. Validates attendee building without mutation and
 * client/agent extraction from AppointmentResponse. Dependencies: @/types/appointment.
 */

import { describe, it, expect } from 'vitest'
import {
  attendeesFromClientAndAgent,
  getClientIdFromAttendees,
  getAgentIdFromAttendees,
  getClientAttendee,
  getAgentAttendee,
} from '@/utils/admin/appointmentAttendees'
import type { AppointmentResponse, AttendeeResponse } from '@/types/appointment'

function makeAttendee(overrides: Partial<AttendeeResponse> & { userId: string }): AttendeeResponse {
  return {
    id: 'att-1',
    appointmentId: 'appt-1',
    userId: overrides.userId,
    userTypeBlockInstanceId: null,
    shouldReceiveInvitation: true,
    invitationStatus: 'pending',
    googleEventId: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('useAppointmentAttendees', () => {
  describe('attendeesFromClientAndAgent', () => {
    it('returns empty array when both ids are null/undefined', () => {
      expect(attendeesFromClientAndAgent(null, null)).toEqual([])
      expect(attendeesFromClientAndAgent(undefined, undefined)).toEqual([])
      expect(attendeesFromClientAndAgent(null, undefined)).toEqual([])
    })

    it('returns one attendee when only clientId is provided', () => {
      const result = attendeesFromClientAndAgent('client-1', null)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ userId: 'client-1', role: 'client', shouldReceiveInvitation: true })
    })

    it('returns one attendee when only agentId is provided', () => {
      const result = attendeesFromClientAndAgent(null, 'agent-1')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ userId: 'agent-1', role: 'agent', shouldReceiveInvitation: true })
    })

    it('returns two attendees when both client and agent are provided', () => {
      const result = attendeesFromClientAndAgent('client-1', 'agent-1')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ userId: 'client-1', role: 'client', shouldReceiveInvitation: true })
      expect(result[1]).toEqual({ userId: 'agent-1', role: 'agent', shouldReceiveInvitation: true })
    })
  })

  describe('getClientIdFromAttendees / getClientAttendee', () => {
    const clientAttendee = makeAttendee({
      userId: 'user-client',
      user: { id: 'user-client', firstName: 'Client', lastName: 'User', email: 'c@test.com', userRole: 'client' },
      userTypeBlockInstance: { id: 'bi-1', name: 'Client' },
    })
    const appointmentWithClient: AppointmentResponse = {
      id: 'appt-1',
      isQuoteMode: false,
      status: 'started',
      createdAt: '',
      updatedAt: '',
      attendees: [clientAttendee],
    }

    it('returns client userId when attendee has userTypeBlockInstance name Client', () => {
      expect(getClientIdFromAttendees(appointmentWithClient)).toBe('user-client')
    })

    it('returns client attendee object', () => {
      expect(getClientAttendee(appointmentWithClient)).toBe(clientAttendee)
    })

    it('returns undefined when no attendees or no client', () => {
      expect(getClientIdFromAttendees({ ...appointmentWithClient, attendees: [] })).toBeUndefined()
      expect(getClientAttendee({ ...appointmentWithClient, attendees: [] })).toBeUndefined()
      expect(getClientIdFromAttendees({ ...appointmentWithClient, attendees: undefined })).toBeUndefined()
    })
  })

  describe('getAgentIdFromAttendees / getAgentAttendee', () => {
    const agentAttendee = makeAttendee({
      userId: 'user-agent',
      user: { id: 'user-agent', firstName: 'Agent', lastName: 'User', email: 'a@test.com', userRole: 'agent' },
      userTypeBlockInstance: { id: 'bi-2', name: 'Agent' },
    })
    const appointmentWithAgent: AppointmentResponse = {
      id: 'appt-2',
      isQuoteMode: false,
      status: 'started',
      createdAt: '',
      updatedAt: '',
      attendees: [agentAttendee],
    }

    it('returns agent userId when attendee has userTypeBlockInstance name Agent', () => {
      expect(getAgentIdFromAttendees(appointmentWithAgent)).toBe('user-agent')
    })

    it('returns agent attendee object', () => {
      expect(getAgentAttendee(appointmentWithAgent)).toBe(agentAttendee)
    })

    it('returns undefined when no attendees or no agent', () => {
      expect(getAgentIdFromAttendees({ ...appointmentWithAgent, attendees: [] })).toBeUndefined()
      expect(getAgentAttendee({ ...appointmentWithAgent, attendees: [] })).toBeUndefined()
    })
  })
})
