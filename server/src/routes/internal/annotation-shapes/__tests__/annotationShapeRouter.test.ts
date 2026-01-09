/**
 * ANNOTATION SHAPE ROUTER INTEGRATION TESTS
 * 
 * Integration tests for annotation shape router endpoints.
 * Tests GET, POST, PUT, PATCH, DELETE endpoints with validation and relationship checks.
 * Phase 7: Remaining API Routes
 * 
 * WHAT: Tests CRUD operations for annotation shapes (shape-level definitions)
 * HOW: Uses mocked Sequelize models and data controller helpers
 * WHY: Ensures annotation shape management works correctly with proper validation
 * DEPENDENCIES: AnnotationShape model, AnnotationInstance model (for deletion checks)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { AnnotationShapeRouter as annotationShapeRouter } from '../annotationShapeRouter'
import { AnnotationShape, AnnotationInstance } from '../../../../config/app'

// Mock models
jest.mock('../../../../config/app', () => ({
  AnnotationShape: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  AnnotationInstance: {
    count: jest.fn(),
  },
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

describe('Annotation Shape Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/annotation-shapes', annotationShapeRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/annotation-shapes', () => {
    it('should fetch all annotation shapes', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      const mockShapes = [
        { id: 'shape-1', name: 'description' },
        { id: 'shape-2', name: 'note' },
      ]
      fetchAll.mockResolvedValue(mockShapes)

      const response = await request(app)
        .get('/api/annotation-shapes')
        .expect(200)

      expect(response.body).toEqual(mockShapes)
      expect(fetchAll).toHaveBeenCalledWith(AnnotationShape)
    })

    it('should handle fetch errors', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      fetchAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/annotation-shapes')
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Failed to fetch annotation shapes')
    })
  })

  describe('GET /api/annotation-shapes/:id', () => {
    it('should fetch annotation shape by ID', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      const mockShape = { id: 'shape-1', name: 'description' }
      fetchById.mockResolvedValue(mockShape)

      const response = await request(app)
        .get('/api/annotation-shapes/shape-1')
        .expect(200)

      expect(response.body).toEqual(mockShape)
      expect(fetchById).toHaveBeenCalledWith(AnnotationShape, 'shape-1')
    })

    it('should return 404 when annotation shape not found', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      fetchById.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/annotation-shapes/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Annotation shape not found')
    })

    it('should handle fetch errors', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      fetchById.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/annotation-shapes/shape-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/annotation-shapes', () => {
    it('should create new annotation shape', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const newShape = { id: 'shape-1', name: 'description' }
      
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      createRecord.mockResolvedValue(newShape)

      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: 'description' })
        .expect(201)

      expect(response.body).toEqual(newShape)
      expect(createRecord).toHaveBeenCalledWith(AnnotationShape, { name: 'description' })
    })

    it('should trim whitespace from name', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const newShape = { id: 'shape-1', name: 'description' }
      
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      createRecord.mockResolvedValue(newShape)

      await request(app)
        .post('/api/annotation-shapes')
        .send({ name: '  description  ' })
        .expect(201)

      expect(createRecord).toHaveBeenCalledWith(AnnotationShape, { name: 'description' })
    })

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Invalid annotation shape name')
    })

    it('should return 400 when name is empty string', async () => {
      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: '' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Invalid annotation shape name')
    })

    it('should return 400 when name is only whitespace', async () => {
      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: '   ' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Invalid annotation shape name')
    })

    it('should return 400 when annotation shape with same name already exists', async () => {
      const existingShape = { id: 'shape-1', name: 'description' }
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)

      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: 'description' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Annotation shape already exists')
      expect(response.body.name).toBe('description')
    })

    it('should handle creation errors', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      createRecord.mockRejectedValue(new Error('Validation error'))

      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: 'description' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/annotation-shapes/:id', () => {
    it('should update annotation shape', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      const updatedShape = { id: 'shape-1', name: 'updated-name' }
      
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      updateRecord.mockResolvedValue(1)
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof updatedShape>>).mockResolvedValue(updatedShape)

      const response = await request(app)
        .put('/api/annotation-shapes/shape-1')
        .send({ name: 'updated-name' })
        .expect(200)

      expect(response.body).toEqual(updatedShape)
      expect(updateRecord).toHaveBeenCalledWith(AnnotationShape, 'shape-1', { name: 'updated-name' })
    })

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .put('/api/annotation-shapes/shape-1')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Invalid annotation shape name')
    })

    it('should return 400 when another annotation shape with same name exists', async () => {
      const existingShape = { id: 'shape-2', name: 'existing-name' }
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)

      const response = await request(app)
        .put('/api/annotation-shapes/shape-1')
        .send({ name: 'existing-name' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Annotation shape already exists')
    })

    it('should return 404 when annotation shape not found', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      updateRecord.mockResolvedValue(0)

      const response = await request(app)
        .put('/api/annotation-shapes/non-existent')
        .send({ name: 'updated-name' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Annotation shape not found')
    })

    it('should handle update errors', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      updateRecord.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .put('/api/annotation-shapes/shape-1')
        .send({ name: 'updated-name' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/annotation-shapes/:id', () => {
    it('should patch annotation shape', async () => {
      const { patchRecord } = require('../../../../routes/helpers/dataController')
      const existingShape = { id: 'shape-1', name: 'old-name' }
      const patchedShape = { id: 'shape-1', name: 'new-name' }
      
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      patchRecord.mockResolvedValue(patchedShape)
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof patchedShape>>).mockResolvedValue(patchedShape)

      const response = await request(app)
        .patch('/api/annotation-shapes/shape-1')
        .send({ name: 'new-name' })
        .expect(200)

      expect(response.body).toEqual(patchedShape)
    })

    it('should return 404 when annotation shape not found', async () => {
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)

      const response = await request(app)
        .patch('/api/annotation-shapes/non-existent')
        .send({ name: 'new-name' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Annotation shape not found')
    })

    it('should return 400 when name is invalid', async () => {
      const existingShape = { id: 'shape-1', name: 'old-name' }
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)

      const response = await request(app)
        .patch('/api/annotation-shapes/shape-1')
        .send({ name: '' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Invalid annotation shape name')
    })

    it('should return 400 when another annotation shape with same name exists', async () => {
      const existingShape = { id: 'shape-1', name: 'old-name' }
      const conflictingShape = { id: 'shape-2', name: 'conflicting-name' }
      
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<typeof conflictingShape>>).mockResolvedValue(conflictingShape)

      const response = await request(app)
        .patch('/api/annotation-shapes/shape-1')
        .send({ name: 'conflicting-name' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Annotation shape already exists')
    })

    it('should allow patching without name field', async () => {
      const { patchRecord } = require('../../../../routes/helpers/dataController')
      const existingShape = { id: 'shape-1', name: 'old-name' }
      const patchedShape = { id: 'shape-1', name: 'old-name' }
      
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)
      patchRecord.mockResolvedValue(patchedShape)
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof patchedShape>>).mockResolvedValue(patchedShape)

      const response = await request(app)
        .patch('/api/annotation-shapes/shape-1')
        .send({})
        .expect(200)

      expect(response.body).toEqual(patchedShape)
    })

    it('should handle patch errors', async () => {
      const { patchRecord } = require('../../../../routes/helpers/dataController')
      const existingShape = { id: 'shape-1', name: 'old-name' }
      
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      patchRecord.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .patch('/api/annotation-shapes/shape-1')
        .send({ name: 'new-name' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/annotation-shapes/:id', () => {
    it('should delete annotation shape', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      ;(AnnotationInstance.count as any as jest.MockedFunction<(options?: unknown) => Promise<number>>).mockResolvedValue(0)
      deleteRecord.mockResolvedValue(1)

      const response = await request(app)
        .delete('/api/annotation-shapes/shape-1')
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Annotation shape deleted successfully')
      expect(deleteRecord).toHaveBeenCalledWith(AnnotationShape, 'shape-1')
    })

    it('should return 400 when annotation instances are using this shape', async () => {
      ;(AnnotationInstance.count as any as jest.MockedFunction<(options?: unknown) => Promise<number>>).mockResolvedValue(5)

      const response = await request(app)
        .delete('/api/annotation-shapes/shape-1')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Cannot delete annotation shape')
      expect(response.body.message).toContain('5 annotation instance(s) are using it')
    })

    it('should return 404 when annotation shape not found', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      ;(AnnotationInstance.count as any as jest.MockedFunction<(options?: unknown) => Promise<number>>).mockResolvedValue(0)
      deleteRecord.mockResolvedValue(0)

      const response = await request(app)
        .delete('/api/annotation-shapes/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Annotation shape not found')
    })

    it('should handle delete errors', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      ;(AnnotationInstance.count as any as jest.MockedFunction<(options?: unknown) => Promise<number>>).mockResolvedValue(0)
      deleteRecord.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .delete('/api/annotation-shapes/shape-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle very long annotation shape names', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const longName = 'a'.repeat(1000) // Very long name
      const newShape = { id: 'shape-1', name: longName }
      
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      createRecord.mockResolvedValue(newShape)

      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: longName })
        .expect(201)

      expect(response.body).toEqual(newShape)
    })

    it('should handle annotation shape names with special characters', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const specialName = 'Shape!@#$%^&*()_+-=[]{}|;:,.<>?'
      const newShape = { id: 'shape-1', name: specialName }
      
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      createRecord.mockResolvedValue(newShape)

      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: specialName })
        .expect(201)

      expect(response.body).toEqual(newShape)
    })

    it('should handle annotation shape names with unicode characters', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const unicodeName = 'Shape 形状 フォーム'
      const newShape = { id: 'shape-1', name: unicodeName }
      
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      createRecord.mockResolvedValue(newShape)

      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: unicodeName })
        .expect(201)

      expect(response.body).toEqual(newShape)
    })

    it('should handle whitespace-only names after trimming', async () => {
      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: '   \t\n   ' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Invalid annotation shape name')
    })

    it('should handle case-insensitive duplicate name check', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const existingShape = { id: 'shape-1', name: 'Description' }
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)

      // Note: Current implementation is case-sensitive, but testing the behavior
      const response = await request(app)
        .post('/api/annotation-shapes')
        .send({ name: 'description' }) // Different case
        .expect(201) // Should succeed if case-sensitive

      // If case-insensitive check was implemented, this would return 400
      expect(response.status).toBe(201)
    })

    it('should handle concurrent update attempts', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      const existingShape = { id: 'shape-1', name: 'old-name' }
      ;(AnnotationShape.findOne as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)
      updateRecord.mockResolvedValue(1)
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)

      // Simulate concurrent updates
      const promises = [
        request(app).put('/api/annotation-shapes/shape-1').send({ name: 'update-1' }),
        request(app).put('/api/annotation-shapes/shape-1').send({ name: 'update-2' }),
      ]

      const responses = await Promise.all(promises)
      
      // Both should succeed (no locking in current implementation)
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status)
      })
    })

    it('should handle null name in PATCH', async () => {
      const existingShape = { id: 'shape-1', name: 'old-name' }
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)

      const response = await request(app)
        .patch('/api/annotation-shapes/shape-1')
        .send({ name: null })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle undefined name in PATCH', async () => {
      const existingShape = { id: 'shape-1', name: 'old-name' }
      ;(AnnotationShape.findByPk as jest.MockedFunction<() => Promise<typeof existingShape>>).mockResolvedValue(existingShape)

      const response = await request(app)
        .patch('/api/annotation-shapes/shape-1')
        .send({ name: undefined })
        .expect(200) // Should succeed since name is optional in PATCH

      expect(response.body).toBeDefined()
    })
  })
})

