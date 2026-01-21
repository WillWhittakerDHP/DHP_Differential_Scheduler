/**
 * RELATIONSHIP ROUTER INTEGRATION TESTS
 * 
 * Integration tests for relationship router endpoints.
 * Tests GET, POST, DELETE endpoints and error handling.
 * Phase 4C: Integration Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { RelationshipRouter as relationshipRouter } from '../relationshipRouter'
import {
  ValidCascade,
  ValidPart,
  DependentInstance,
  BookingCascade,
  ActivePart,
  InstanceComponent,
  BlockInstance,
} from '../../../../config/app'

// Mock models
jest.mock('../../../../config/app', () => ({
  ValidCascade: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  ValidPart: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  DependentInstance: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  BookingCascade: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  ActivePart: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  InstanceComponent: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  BlockInstance: {
    findByPk: jest.fn(),
  },
}))

// Type definitions for test data
type RelationshipType = { id: string; parent_id: string; child_id: string }

describe('Relationship Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/relationships', relationshipRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/relationships/:relationshipKind', () => {
    it('should fetch all relationships of a kind', async () => {
      const mockRelationships: RelationshipType[] = [
        { id: 'rel-1', parent_id: 'block-1', child_id: 'part-1' },
        { id: 'rel-2', parent_id: 'block-1', child_id: 'part-2' },
      ]
      const mockFindAll = ActivePart.findAll as jest.MockedFunction<() => Promise<RelationshipType[]>>
      mockFindAll.mockResolvedValue(mockRelationships)

      const response = await request(app)
        .get('/api/relationships/activeParts')
        .expect(200)

      expect(response.body).toEqual(mockRelationships)
      expect(ActivePart.findAll).toHaveBeenCalled()
    })

    it('should return 400 for invalid relationship kind', async () => {
      const response = await request(app)
        .get('/api/relationships/invalidKind')
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle fetch errors', async () => {
      const mockFindAll = ActivePart.findAll as jest.MockedFunction<() => Promise<never>>
      mockFindAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/relationships/activeParts')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/relationships/:relationshipKind/:parentId/:childId', () => {
    it('should fetch relationship by parent and child IDs', async () => {
      const mockRelationship: RelationshipType = { id: 'rel-1', parent_id: 'block-1', child_id: 'part-1' }
      const mockFindOne = ActivePart.findOne as jest.MockedFunction<() => Promise<RelationshipType | null>>
      mockFindOne.mockResolvedValue(mockRelationship)

      const response = await request(app)
        .get('/api/relationships/activeParts/block-1/part-1')
        .expect(200)

      expect(response.body).toEqual(mockRelationship)
      expect(ActivePart.findOne).toHaveBeenCalled()
    })

    it('should return 404 when relationship not found', async () => {
      const mockFindOne = ActivePart.findOne as jest.MockedFunction<() => Promise<RelationshipType | null>>
      mockFindOne.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/relationships/activeParts/block-1/part-1')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for invalid relationship kind', async () => {
      const response = await request(app)
        .get('/api/relationships/invalidKind/block-1/part-1')
        .expect(400)
    })
  })

  describe('POST /api/relationships/:relationshipKind', () => {
    it('should create new relationship', async () => {
      const newRelationship: RelationshipType = { id: 'rel-1', parent_id: 'block-1', child_id: 'part-1' }
      const mockCreate = ActivePart.create as jest.MockedFunction<() => Promise<RelationshipType>>
      const mockFindByPk = BlockInstance.findByPk as jest.MockedFunction<(id: string) => Promise<{ id: string } | null>>
      mockCreate.mockResolvedValue(newRelationship)
      mockFindByPk.mockResolvedValue({ id: 'block-1' })

      const response = await request(app)
        .post('/api/relationships/activeParts')
        .send({
          parent_kind: 'blockInstance',
          child_kind: 'partInstance',
          parent_id: 'block-1',
          child_id: 'part-1',
        })
        .expect(201)

      expect(response.body).toEqual(newRelationship)
      expect(ActivePart.create).toHaveBeenCalled()
    })

    it('should return 400 for invalid relationship kind', async () => {
      const response = await request(app)
        .post('/api/relationships/invalidKind')
        .send({
          parent_id: 'block-1',
          child_id: 'part-1',
        })
        .expect(400)
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/relationships/activeParts')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle creation errors', async () => {
      const mockCreate = ActivePart.create as jest.MockedFunction<() => Promise<never>>
      const mockFindByPk = BlockInstance.findByPk as jest.MockedFunction<(id: string) => Promise<{ id: string } | null>>
      mockCreate.mockRejectedValue(new Error('Creation failed'))
      mockFindByPk.mockResolvedValue({ id: 'block-1' })

      const response = await request(app)
        .post('/api/relationships/activeParts')
        .send({
          parent_kind: 'blockInstance',
          child_kind: 'partInstance',
          parent_id: 'block-1',
          child_id: 'part-1',
        })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/relationships/:relationshipKind/:parentId/:childId', () => {
    it('should delete relationship', async () => {
      const mockRelationship: RelationshipType = { id: 'rel-1', parent_id: 'block-1', child_id: 'part-1' }
      const mockFindOne = ActivePart.findOne as jest.MockedFunction<() => Promise<RelationshipType | null>>
      const mockDestroy = ActivePart.destroy as jest.MockedFunction<() => Promise<number>>
      mockFindOne.mockResolvedValue(mockRelationship)
      mockDestroy.mockResolvedValue(1)

      await request(app)
        .delete('/api/relationships/activeParts/block-1/part-1')
        .expect(204)

      expect(ActivePart.destroy).toHaveBeenCalled()
    })

    it('should return 404 when relationship not found', async () => {
      const mockFindOne = ActivePart.findOne as jest.MockedFunction<() => Promise<RelationshipType | null>>
      mockFindOne.mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/relationships/activeParts/block-1/part-1')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for invalid relationship kind', async () => {
      const response = await request(app)
        .delete('/api/relationships/invalidKind/block-1/part-1')
        .expect(400)
    })

    it('should handle delete errors', async () => {
      const mockRelationship: RelationshipType = { id: 'rel-1', parent_id: 'block-1', child_id: 'part-1' }
      const mockFindOne = ActivePart.findOne as jest.MockedFunction<() => Promise<RelationshipType | null>>
      const mockDestroy = ActivePart.destroy as jest.MockedFunction<() => Promise<number>>
      mockFindOne.mockResolvedValue(mockRelationship)
      mockDestroy.mockRejectedValue(new Error('Delete failed'))

      const response = await request(app)
        .delete('/api/relationships/activeParts/block-1/part-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('relationship kind validation', () => {
    it('should accept valid relationship kinds', async () => {
      const validKinds = [
        'validCascades',
        'validParts',
        'dependentInstances',
        'bookingCascades',
        'activeParts',
        'instanceComponents',
      ]

      for (const kind of validKinds) {
        const Model = require('../../../../config/app')[kind.charAt(0).toUpperCase() + kind.slice(1).replace(/([A-Z])/g, '$1')]
        if (Model) {
          const mockFindAll = Model.findAll as jest.MockedFunction<() => Promise<unknown[]>>
          mockFindAll.mockResolvedValue([])
        }
      }

      // Test that valid kinds don't return 400
      for (const kind of validKinds) {
        const response = await request(app)
          .get(`/api/relationships/${kind}`)
          .expect((res) => {
            if (res.status === 400) {
              throw new Error(`Valid kind ${kind} returned 400`)
            }
          })
      }
    })
  })
})

