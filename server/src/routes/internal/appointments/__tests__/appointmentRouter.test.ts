
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { AppointmentRouter as appointmentRouter } from '../appointmentRouter'
import { Appointment, PropertyVersion, Address, PropertyDetails, User } from '../../../../config/app'

type AppointmentType = { id: string; startTime: Date; endTime?: Date }

jest.mock('../../../../config/app', () => ({
  Appointment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  PropertyVersion: {},
  Address: {},
  PropertyDetails: {},
  User: {},
}))

jest.mock('../../../../routes/helpers/dataController', () => ({
  fetchAll: jest.fn(),
  fetchById: jest.fn(),
  createRecord: jest.fn(),
  updateRecord: jest.fn(),
  patchRecord: jest.fn(),
  deleteRecord: jest.fn(),
}))

describe('Appointment Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/appointments', appointmentRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/appointments', () => {
    it('should fetch all appointments with relationships', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      const mockAppointments = [
        { id: 'appt-1', startTime: new Date(), endTime: new Date() },
      ]
      fetchAll.mockResolvedValue(mockAppointments)

      const response = await request(app)
        .get('/api/appointments')
        .expect(200)

      expect(response.body).toEqual(mockAppointments)
      expect(fetchAll).toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      fetchAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/appointments')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/appointments/:id', () => {
    it('should fetch appointment by ID with relationships', async () => {
      const mockAppointment: AppointmentType = {
        id: 'appt-1',
        startTime: new Date(),
        endTime: new Date(),
      }
      const mockFindByPk = Appointment.findByPk as jest.MockedFunction<(id: string) => Promise<AppointmentType | null>>
      mockFindByPk.mockResolvedValue(mockAppointment)

      const response = await request(app)
        .get('/api/appointments/appt-1')
        .expect(200)

      expect(response.body).toEqual(mockAppointment)
      expect(Appointment.findByPk).toHaveBeenCalled()
    })

    it('should return 404 when appointment not found', async () => {
      const mockFindByPk = Appointment.findByPk as jest.MockedFunction<(id: string) => Promise<AppointmentType | null>>
      mockFindByPk.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/appointments/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle fetch errors', async () => {
      const mockFindByPk = Appointment.findByPk as jest.MockedFunction<(id: string) => Promise<never>>
      mockFindByPk.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/appointments/appt-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/appointments', () => {
    it('should create new appointment', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const newAppointment: AppointmentType = { id: 'appt-1', startTime: new Date() }
      createRecord.mockResolvedValue(newAppointment)
      const mockFindByPk = Appointment.findByPk as jest.MockedFunction<(id: string) => Promise<AppointmentType | null>>
      mockFindByPk.mockResolvedValue(newAppointment)

      const response = await request(app)
        .post('/api/appointments')
        .send({ startTime: new Date(), endTime: new Date() })
        .expect(201)

      expect(response.body).toEqual(newAppointment)
      expect(createRecord).toHaveBeenCalled()
    })

    it('should handle creation errors', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      createRecord.mockRejectedValue(new Error('Validation error'))

      const response = await request(app)
        .post('/api/appointments')
        .send({ startTime: new Date() })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      const updatedAppointment: AppointmentType = { id: 'appt-1', startTime: new Date() }
      updateRecord.mockResolvedValue(1)
      const mockFindByPk = Appointment.findByPk as jest.MockedFunction<(id: string) => Promise<AppointmentType | null>>
      mockFindByPk.mockResolvedValue(updatedAppointment)

      const response = await request(app)
        .put('/api/appointments/appt-1')
        .send({ startTime: new Date() })
        .expect(200)

      expect(response.body).toEqual(updatedAppointment)
    })

    it('should return 404 when appointment not found', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      updateRecord.mockResolvedValue(0)

      const response = await request(app)
        .put('/api/appointments/non-existent')
        .send({ startTime: new Date() })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/appointments/:id', () => {
    it('should patch appointment', async () => {
      const { patchRecord } = require('../../../../routes/helpers/dataController')
      const patchedAppointment: AppointmentType = { id: 'appt-1', startTime: new Date() }
      patchRecord.mockResolvedValue(patchedAppointment)
      const mockFindByPk = Appointment.findByPk as jest.MockedFunction<(id: string) => Promise<AppointmentType | null>>
      mockFindByPk.mockResolvedValue(patchedAppointment)

      const response = await request(app)
        .patch('/api/appointments/appt-1')
        .send({ startTime: new Date() })
        .expect(200)

      expect(response.body).toEqual(patchedAppointment)
    })
  })

  describe('DELETE /api/appointments/:id', () => {
    it('should delete appointment', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockResolvedValue(undefined)

      await request(app)
        .delete('/api/appointments/appt-1')
        .expect(204)

      expect(deleteRecord).toHaveBeenCalled()
    })

    it('should handle delete errors', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockRejectedValue(new Error('Delete failed'))

      const response = await request(app)
        .delete('/api/appointments/appt-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })
})

