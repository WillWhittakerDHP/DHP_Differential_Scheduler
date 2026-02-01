
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { UserRouter as userRouter } from '../userRouter'
import { User } from '../../../../config/app'

jest.mock('../../../../routes/helpers/dataController', () => ({
  fetchAll: jest.fn(),
  fetchById: jest.fn(),
  createRecord: jest.fn(),
  updateRecord: jest.fn(),
  patchRecord: jest.fn(),
  deleteRecord: jest.fn(),
}))

describe('User Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/users', userRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('should fetch all users', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      const mockUsers = [
        { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      ]
      fetchAll.mockResolvedValue(mockUsers)

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body).toEqual(mockUsers)
      expect(fetchAll).toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      fetchAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/users')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/users/:id', () => {
    it('should fetch user by ID', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' }
      fetchById.mockResolvedValue(mockUser)

      const response = await request(app)
        .get('/api/users/user-1')
        .expect(200)

      expect(response.body).toEqual(mockUser)
      expect(fetchById).toHaveBeenCalled()
    })

    it('should return 404 when user not found', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      fetchById.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/users/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const newUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' }
      createRecord.mockResolvedValue(newUser)

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' })
        .expect(201)

      expect(response.body).toEqual(newUser)
      expect(createRecord).toHaveBeenCalled()
    })

    it('should handle creation errors', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      createRecord.mockRejectedValue(new Error('Validation error'))

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const { updateRecord, fetchById } = require('../../../../routes/helpers/dataController')
      const updatedUser = { id: 'user-1', email: 'updated@example.com', name: 'Updated User' }
      updateRecord.mockResolvedValue(1)
      fetchById.mockResolvedValue(updatedUser)

      const response = await request(app)
        .put('/api/users/user-1')
        .send({ name: 'Updated User' })
        .expect(200)

      expect(response.body).toEqual(updatedUser)
    })

    it('should return 404 when user not found', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      updateRecord.mockResolvedValue(0)

      const response = await request(app)
        .put('/api/users/non-existent')
        .send({ name: 'Updated User' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/users/:id', () => {
    it('should patch user', async () => {
      const { patchRecord, fetchById } = require('../../../../routes/helpers/dataController')
      const patchedUser = { id: 'user-1', email: 'patched@example.com' }
      patchRecord.mockResolvedValue(patchedUser)
      fetchById.mockResolvedValue(patchedUser)

      const response = await request(app)
        .patch('/api/users/user-1')
        .send({ email: 'patched@example.com' })
        .expect(200)

      expect(response.body).toEqual(patchedUser)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockResolvedValue(undefined)

      await request(app)
        .delete('/api/users/user-1')
        .expect(204)

      expect(deleteRecord).toHaveBeenCalled()
    })

    it('should handle delete errors', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockRejectedValue(new Error('Delete failed'))

      const response = await request(app)
        .delete('/api/users/user-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })
})

