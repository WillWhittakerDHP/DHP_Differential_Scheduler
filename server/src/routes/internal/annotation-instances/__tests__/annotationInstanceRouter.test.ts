/**
 * ANNOTATION INSTANCE ROUTER INTEGRATION TESTS
 * 
 * Integration tests for annotation instance router endpoints.
 * Tests GET, POST, PUT, PATCH, DELETE endpoints with relationships.
 * Phase 7: Remaining API Routes
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { AnnotationInstanceRouter as annotationInstanceRouter } from '../annotationInstanceRouter'
import { AnnotationInstance, AnnotationShape, ActiveAnnotation, BlockInstance } from '../../../../config/app'

// Type definitions for test data
type AnnotationInstanceType = { id: string; text: string; annotationShape?: { name: string } }
type ActiveAnnotationType = {
  id: string
  orderIndex: number
  annotation: { id: string; text: string }
  userTypeBlockInstance: { id: string; name: string }
}

// Mock models
jest.mock('../../../../config/app', () => ({
  AnnotationInstance: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  AnnotationShape: {},
  ActiveAnnotation: {
    findAll: jest.fn(),
  },
  BlockInstance: {},
}))

// Mock data controller
jest.mock('../../../../routes/helpers/dataController', () => ({
  fetchAll: jest.fn(),
  fetchById: jest.fn(),
  createRecord: jest.fn(),
  updateRecord: jest.fn(),
  patchRecord: jest.fn(),
  deleteRecord: jest.fn(),
}))

describe('Annotation Instance Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/annotation-instances', annotationInstanceRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/annotation-instances', () => {
    it('should fetch all annotation instances with shapes', async () => {
      const mockInstances: AnnotationInstanceType[] = [
        { id: 'ann-1', text: 'Test annotation', annotationShape: { name: 'description' } },
      ]
      const mockFindAll = AnnotationInstance.findAll as jest.MockedFunction<() => Promise<AnnotationInstanceType[]>>
      mockFindAll.mockResolvedValue(mockInstances)

      const response = await request(app)
        .get('/api/annotation-instances')
        .expect(200)

      expect(response.body).toEqual(mockInstances)
      expect(AnnotationInstance.findAll).toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      const mockFindAll = AnnotationInstance.findAll as jest.MockedFunction<() => Promise<never>>
      mockFindAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/annotation-instances')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/annotation-instances/active-annotations', () => {
    it('should fetch all active annotations with relationships', async () => {
      const mockRelationships: ActiveAnnotationType[] = [
        {
          id: 'rel-1',
          orderIndex: 0,
          annotation: { id: 'ann-1', text: 'Test' },
          userTypeBlockInstance: { id: 'user-1', name: 'Inspector' },
        },
      ]
      const mockFindAll = ActiveAnnotation.findAll as jest.MockedFunction<() => Promise<ActiveAnnotationType[]>>
      mockFindAll.mockResolvedValue(mockRelationships)

      const response = await request(app)
        .get('/api/annotation-instances/active-annotations')
        .expect(200)

      expect(response.body).toEqual(mockRelationships)
      expect(ActiveAnnotation.findAll).toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      const mockFindAll = ActiveAnnotation.findAll as jest.MockedFunction<() => Promise<never>>
      mockFindAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/annotation-instances/active-annotations')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/annotation-instances/:id', () => {
    it('should fetch annotation instance by ID', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      const mockInstance = { id: 'ann-1', text: 'Test annotation' }
      fetchById.mockResolvedValue(mockInstance)

      const response = await request(app)
        .get('/api/annotation-instances/ann-1')
        .expect(200)

      expect(response.body).toEqual(mockInstance)
    })

    it('should return 404 when annotation instance not found', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      fetchById.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/annotation-instances/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/annotation-instances', () => {
    it('should create new annotation instance', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const newInstance = { id: 'ann-1', text: 'New annotation' }
      createRecord.mockResolvedValue(newInstance)

      const response = await request(app)
        .post('/api/annotation-instances')
        .send({ text: 'New annotation', type: 'type-1' })
        .expect(201)

      expect(response.body).toEqual(newInstance)
      expect(createRecord).toHaveBeenCalled()
    })

    it('should handle creation errors', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      createRecord.mockRejectedValue(new Error('Validation error'))

      const response = await request(app)
        .post('/api/annotation-instances')
        .send({ text: 'New annotation' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/annotation-instances/:id', () => {
    it('should update annotation instance', async () => {
      const { updateRecord, fetchById } = require('../../../../routes/helpers/dataController')
      const updatedInstance = { id: 'ann-1', text: 'Updated annotation' }
      updateRecord.mockResolvedValue(1)
      fetchById.mockResolvedValue(updatedInstance)

      const response = await request(app)
        .put('/api/annotation-instances/ann-1')
        .send({ text: 'Updated annotation' })
        .expect(200)

      expect(response.body).toEqual(updatedInstance)
    })

    it('should return 404 when annotation instance not found', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      updateRecord.mockResolvedValue(0)

      const response = await request(app)
        .put('/api/annotation-instances/non-existent')
        .send({ text: 'Updated annotation' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/annotation-instances/:id', () => {
    it('should patch annotation instance', async () => {
      const { patchRecord, fetchById } = require('../../../../routes/helpers/dataController')
      const patchedInstance = { id: 'ann-1', text: 'Patched annotation' }
      patchRecord.mockResolvedValue(patchedInstance)
      fetchById.mockResolvedValue(patchedInstance)

      const response = await request(app)
        .patch('/api/annotation-instances/ann-1')
        .send({ text: 'Patched annotation' })
        .expect(200)

      expect(response.body).toEqual(patchedInstance)
    })
  })

  describe('DELETE /api/annotation-instances/:id', () => {
    it('should delete annotation instance', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockResolvedValue(undefined)

      await request(app)
        .delete('/api/annotation-instances/ann-1')
        .expect(204)

      expect(deleteRecord).toHaveBeenCalled()
    })

    it('should handle delete errors', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockRejectedValue(new Error('Delete failed'))

      const response = await request(app)
        .delete('/api/annotation-instances/ann-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })
})

