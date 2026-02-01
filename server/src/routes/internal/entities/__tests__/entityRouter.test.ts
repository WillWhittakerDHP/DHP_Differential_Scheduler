
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { EntityRouter as entityRouter } from '../entityRouter'
import { getTestDb } from '../../../../test/setup/testDb'
import { BlockInstance, BlockShape, PartInstance, PartShape } from '../../../../config/app'

jest.mock('../../../../routes/helpers/dataController', () => ({
  fetchAll: jest.fn(),
  fetchById: jest.fn(),
  createRecord: jest.fn(),
  updateRecord: jest.fn(),
  patchRecord: jest.fn(),
  deleteRecord: jest.fn(),
  bulkPatch: jest.fn(),
}))

jest.mock('../../../../config/entityRegistry', () => ({
  getEntityConfig: jest.fn((entityType: string) => {
    const configs: Record<string, any> = {
      blockInstance: { model: BlockInstance },
      blockShape: { model: BlockShape },
      partInstance: { model: PartInstance },
      partShape: { model: PartShape },
    }
    return configs[entityType]
  }),
  isValidEntityType: jest.fn((entityType: string) => {
    return ['blockInstance', 'blockShape', 'partInstance', 'partShape'].includes(entityType)
  }),
}))

describe('Entity Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/entities', entityRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/entities/config', () => {
    it('should return entity configuration', async () => {
      const response = await request(app)
        .get('/api/entities/config')
        .expect(200)

      expect(response.body).toHaveProperty('entityKeys')
      expect(response.body.entityKeys).toEqual([
        'blockInstance',
        'blockShape',
        'partInstance',
        'partShape',
      ])
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('lastModified')
    })
  })

  describe('GET /api/entities/:entityType', () => {
    it('should fetch all entities of a type', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      const mockEntities = [
        { id: 'block-1', name: 'Block 1', orderIndex: 0 },
        { id: 'block-2', name: 'Block 2', orderIndex: 1 },
      ]
      fetchAll.mockResolvedValue(mockEntities)

      const response = await request(app)
        .get('/api/entities/blockInstance')
        .expect(200)

      expect(response.body).toEqual(mockEntities)
      expect(fetchAll).toHaveBeenCalled()
    })

    it('should return 404 for invalid entity type', async () => {
      const response = await request(app)
        .get('/api/entities/invalidType')
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Unknown entity kind')
    })

    it('should handle fetch errors', async () => {
      const { fetchAll } = require('../../../../routes/helpers/dataController')
      fetchAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/entities/blockInstance')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/entities/:entityType/:id', () => {
    it('should fetch entity by ID', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      const mockEntity = { id: 'block-1', name: 'Block 1', orderIndex: 0 }
      fetchById.mockResolvedValue(mockEntity)

      const response = await request(app)
        .get('/api/entities/blockInstance/block-1')
        .expect(200)

      expect(response.body).toEqual(mockEntity)
      expect(fetchById).toHaveBeenCalled()
    })

    it('should return 404 when entity not found', async () => {
      const { fetchById } = require('../../../../routes/helpers/dataController')
      fetchById.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/entities/blockInstance/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 404 for invalid entity type', async () => {
      const response = await request(app)
        .get('/api/entities/invalidType/block-1')
        .expect(404)
    })
  })

  describe('POST /api/entities/:entityType', () => {
    it('should create new entity', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      const newEntity = { id: 'block-1', name: 'New Block', orderIndex: 0 }
      createRecord.mockResolvedValue(newEntity)

      const response = await request(app)
        .post('/api/entities/blockInstance')
        .send({ name: 'New Block', orderIndex: 0 })
        .expect(201)

      expect(response.body).toEqual(newEntity)
      expect(createRecord).toHaveBeenCalled()
    })

    it('should return 404 for invalid entity type', async () => {
      const response = await request(app)
        .post('/api/entities/invalidType')
        .send({ name: 'Test' })
        .expect(404)
    })

    it('should handle creation errors', async () => {
      const { createRecord } = require('../../../../routes/helpers/dataController')
      createRecord.mockRejectedValue(new Error('Validation error'))

      const response = await request(app)
        .post('/api/entities/blockInstance')
        .send({ name: 'Test' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/entities/:entityType/:id', () => {
    it('should update entity', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      const updatedEntity = { id: 'block-1', name: 'Updated Block', orderIndex: 0 }
      updateRecord.mockResolvedValue(updatedEntity)

      const response = await request(app)
        .put('/api/entities/blockInstance/block-1')
        .send({ name: 'Updated Block' })
        .expect(200)

      expect(response.body).toEqual(updatedEntity)
      expect(updateRecord).toHaveBeenCalled()
    })

    it('should return 404 for invalid entity type', async () => {
      const response = await request(app)
        .put('/api/entities/invalidType/block-1')
        .send({ name: 'Test' })
        .expect(404)
    })

    it('should handle update errors', async () => {
      const { updateRecord } = require('../../../../routes/helpers/dataController')
      updateRecord.mockRejectedValue(new Error('Update failed'))

      const response = await request(app)
        .put('/api/entities/blockInstance/block-1')
        .send({ name: 'Test' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/entities/:entityType/:id', () => {
    it('should patch entity', async () => {
      const { patchRecord } = require('../../../../routes/helpers/dataController')
      const patchedEntity = { id: 'block-1', name: 'Patched Block', orderIndex: 0 }
      patchRecord.mockResolvedValue(patchedEntity)

      const response = await request(app)
        .patch('/api/entities/blockInstance/block-1')
        .send({ name: 'Patched Block' })
        .expect(200)

      expect(response.body).toEqual(patchedEntity)
      expect(patchRecord).toHaveBeenCalled()
    })

    it('should return 404 for invalid entity type', async () => {
      const response = await request(app)
        .patch('/api/entities/invalidType/block-1')
        .send({ name: 'Test' })
        .expect(404)
    })
  })

  describe('DELETE /api/entities/:entityType/:id', () => {
    it('should delete entity', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockResolvedValue(undefined)

      await request(app)
        .delete('/api/entities/blockInstance/block-1')
        .expect(204)

      expect(deleteRecord).toHaveBeenCalled()
    })

    it('should return 404 for invalid entity type', async () => {
      const response = await request(app)
        .delete('/api/entities/invalidType/block-1')
        .expect(404)
    })

    it('should handle delete errors', async () => {
      const { deleteRecord } = require('../../../../routes/helpers/dataController')
      deleteRecord.mockRejectedValue(new Error('Delete failed'))

      const response = await request(app)
        .delete('/api/entities/blockInstance/block-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })
})

