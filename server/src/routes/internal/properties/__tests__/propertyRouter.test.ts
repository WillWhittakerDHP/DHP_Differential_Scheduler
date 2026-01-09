/**
 * PROPERTY ROUTER INTEGRATION TESTS
 * 
 * Integration tests for property router endpoints.
 * Tests GET, POST, PUT, PATCH, DELETE endpoints with address/property details.
 * Phase 7: Remaining API Routes
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { PropertyRouter as propertyRouter } from '../propertyRouter'
import { PropertyVersion, Address, PropertyDetails } from '../../../../config/app'

// Type definitions for test data
type PropertyVersionType = {
  id: string
  addressId: string
  address: { address: string; city?: string } | null
  propertyDetails: Array<{ mlsNumber: string }> | { mlsNumber: string } | null
}
type AddressType = { id: string; address: string }
type PropertyDetailsType = { id: string; mlsNumber: string }

// Mock models
jest.mock('../../../../config/app', () => ({
  PropertyVersion: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Address: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  PropertyDetails: {
    create: jest.fn(),
    destroy: jest.fn(),
  },
}))

describe('Property Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/properties', propertyRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/properties', () => {
    it('should fetch all properties with relationships', async () => {
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        addressId: 'addr-1',
        address: { address: '123 Main St', city: 'Springfield' },
        propertyDetails: [{ mlsNumber: '12345' }],
      }
      const mockFindAll = PropertyVersion.findAll as jest.MockedFunction<() => Promise<PropertyVersionType[]>>
      mockFindAll.mockResolvedValue([mockPropertyVersion])

      const response = await request(app)
        .get('/api/properties')
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body[0]).toHaveProperty('address')
      expect(response.body[0]).toHaveProperty('mlsNumber')
    })

    it('should handle empty property list', async () => {
      const mockFindAll = PropertyVersion.findAll as jest.MockedFunction<() => Promise<PropertyVersionType[]>>
      mockFindAll.mockResolvedValue([])

      const response = await request(app)
        .get('/api/properties')
        .expect(200)

      expect(response.body).toEqual([])
    })

    it('should handle property with empty propertyDetails array', async () => {
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        addressId: 'addr-1',
        address: { address: '123 Main St', city: 'Springfield' },
        propertyDetails: [],
      }
      const mockFindAll = PropertyVersion.findAll as jest.MockedFunction<() => Promise<PropertyVersionType[]>>
      mockFindAll.mockResolvedValue([mockPropertyVersion])

      const response = await request(app)
        .get('/api/properties')
        .expect(200)

      expect(response.body[0]).toHaveProperty('address')
      expect(response.body[0].mlsNumber).toBeUndefined()
    })

    it('should handle property with null address', async () => {
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        addressId: 'addr-1',
        address: null,
        propertyDetails: [{ mlsNumber: '12345' }],
      }
      const mockFindAll = PropertyVersion.findAll as jest.MockedFunction<() => Promise<PropertyVersionType[]>>
      mockFindAll.mockResolvedValue([mockPropertyVersion])

      const response = await request(app)
        .get('/api/properties')
        .expect(200)

      expect(response.body[0].address).toBeUndefined()
      expect(response.body[0].mlsNumber).toBe('12345')
    })

    it('should handle property with single propertyDetails object (not array)', async () => {
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        addressId: 'addr-1',
        address: { address: '123 Main St' },
        propertyDetails: { mlsNumber: '12345' },
      }
      const mockFindAll = PropertyVersion.findAll as jest.MockedFunction<() => Promise<PropertyVersionType[]>>
      mockFindAll.mockResolvedValue([mockPropertyVersion])

      const response = await request(app)
        .get('/api/properties')
        .expect(200)

      expect(response.body[0].mlsNumber).toBe('12345')
    })

    it('should handle fetch errors', async () => {
      const mockFindAll = PropertyVersion.findAll as jest.MockedFunction<() => Promise<never>>
      mockFindAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/properties')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/properties/:id', () => {
    it('should fetch property by ID', async () => {
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        addressId: 'addr-1',
        address: { address: '123 Main St' },
        propertyDetails: [{ mlsNumber: '12345' }],
      }
      const mockFindByPk = PropertyVersion.findByPk as jest.MockedFunction<(id: string) => Promise<PropertyVersionType | null>>
      mockFindByPk.mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .get('/api/properties/prop-1')
        .expect(200)

      expect(response.body).toHaveProperty('address')
    })

    it('should handle property with missing propertyDetails', async () => {
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        addressId: 'addr-1',
        address: { address: '123 Main St' },
        propertyDetails: null,
      }
      const mockFindByPk = PropertyVersion.findByPk as jest.MockedFunction<(id: string) => Promise<PropertyVersionType | null>>
      mockFindByPk.mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .get('/api/properties/prop-1')
        .expect(200)

      expect(response.body).toHaveProperty('address')
      expect(response.body.mlsNumber).toBeUndefined()
    })

    it('should return 404 when property not found', async () => {
      const mockFindByPk = PropertyVersion.findByPk as jest.MockedFunction<(id: string) => Promise<PropertyVersionType | null>>
      mockFindByPk.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/properties/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle database errors', async () => {
      (PropertyVersion.findByPk as jest.MockedFunction<() => Promise<never>>).mockRejectedValue(new Error('Database connection failed'))

      const response = await request(app)
        .get('/api/properties/prop-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/properties', () => {
    it('should create new property with address', async () => {
      const mockAddress: AddressType = { id: 'addr-1', address: '123 Main St' }
      const mockPropertyVersion: PropertyVersionType = { 
        id: 'prop-1', 
        addressId: 'addr-1',
        address: null,
        propertyDetails: null
      }
      const mockPropertyDetails: PropertyDetailsType = { id: 'details-1', mlsNumber: '12345' }

      const mockAddressFindOne = Address.findOne as jest.MockedFunction<() => Promise<AddressType | null>>
      mockAddressFindOne.mockResolvedValue(null)
      const mockTransaction = jest.fn((callback: (t: unknown) => Promise<unknown>) => callback({}))
      ;(PropertyVersion.sequelize as any) = { transaction: mockTransaction }
      const mockAddressCreate = Address.create as jest.MockedFunction<() => Promise<AddressType>>
      const mockPropertyVersionCreate = PropertyVersion.create as jest.MockedFunction<() => Promise<PropertyVersionType>>
      const mockPropertyDetailsCreate = PropertyDetails.create as jest.MockedFunction<() => Promise<PropertyDetailsType>>
      const mockPropertyVersionFindByPk = PropertyVersion.findByPk as jest.MockedFunction<(id: string) => Promise<PropertyVersionType | null>>
      mockAddressCreate.mockResolvedValue(mockAddress)
      mockPropertyVersionCreate.mockResolvedValue(mockPropertyVersion)
      mockPropertyDetailsCreate.mockResolvedValue(mockPropertyDetails)
      mockPropertyVersionFindByPk.mockResolvedValue({
        ...mockPropertyVersion,
        address: mockAddress,
        propertyDetails: [mockPropertyDetails],
      })

      const response = await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(201)

      expect(response.body).toHaveProperty('address')
    })

    it('should create property with unit field', async () => {
      type AddressType = { id: string; address: string; unit: string | null }
      type PropertyVersionType = { id: string; addressId: string; address?: AddressType; propertyDetails?: Array<{ id: string }> }
      const mockAddress: AddressType = { id: 'addr-1', address: '123 Main St', unit: 'Apt 2B' }
      const mockPropertyVersion: PropertyVersionType = { id: 'prop-1', addressId: 'addr-1' }

      ;(Address.findOne as jest.MockedFunction<() => Promise<AddressType | null>>).mockResolvedValue(null)
      ;(PropertyVersion.sequelize as any) = {
        transaction: jest.fn((callback: (t: unknown) => Promise<unknown>) => callback({})),
      }
      ;(Address.create as jest.MockedFunction<() => Promise<AddressType>>).mockResolvedValue(mockAddress)
      ;(PropertyVersion.create as jest.MockedFunction<() => Promise<PropertyVersionType>>).mockResolvedValue(mockPropertyVersion)
      ;(PropertyDetails.create as jest.MockedFunction<() => Promise<{ id: string }>>).mockResolvedValue({ id: 'details-1' })
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue({
        ...mockPropertyVersion,
        address: mockAddress,
        propertyDetails: [{ id: 'details-1' }],
      })

      const response = await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          unit: 'Apt 2B',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(201)

      expect(response.body).toHaveProperty('unit')
      expect(response.body.unit).toBe('Apt 2B')
    })

    it('should handle unit as null', async () => {
      type AddressType = { id: string; address: string; unit: null }
      type PropertyVersionType = { id: string; addressId: string; address?: AddressType; propertyDetails?: Array<{ id: string }> }
      const mockAddress: AddressType = { id: 'addr-1', address: '123 Main St', unit: null }
      const mockPropertyVersion: PropertyVersionType = { id: 'prop-1', addressId: 'addr-1' }

      ;(Address.findOne as jest.MockedFunction<() => Promise<AddressType | null>>).mockResolvedValue(null)
      ;(PropertyVersion.sequelize as any) = {
        transaction: jest.fn((callback: (t: unknown) => Promise<unknown>) => callback({})),
      }
      ;(Address.create as jest.MockedFunction<() => Promise<AddressType>>).mockResolvedValue(mockAddress)
      ;(PropertyVersion.create as jest.MockedFunction<() => Promise<PropertyVersionType>>).mockResolvedValue(mockPropertyVersion)
      ;(PropertyDetails.create as jest.MockedFunction<() => Promise<{ id: string }>>).mockResolvedValue({ id: 'details-1' })
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue({
        ...mockPropertyVersion,
        address: mockAddress,
        propertyDetails: [{ id: 'details-1' }],
      })

      const response = await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          unit: null,
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(201)

      expect(response.body.unit).toBeNull()
    })

    it('should return 400 when address is missing', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Missing required fields')
    })

    it('should return 400 when city is missing', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Missing required fields')
    })

    it('should return 400 when state is missing', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          city: 'Springfield',
          zipCode: '62701',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 when zipCode is missing', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should use default source when not provided', async () => {
      type AddressType = { id: string; address: string }
      type PropertyVersionType = { id: string; addressId: string; address?: AddressType; propertyDetails?: Array<{ id: string; source: string }> }
      const mockAddress: AddressType = { id: 'addr-1', address: '123 Main St' }
      const mockPropertyVersion: PropertyVersionType = { id: 'prop-1', addressId: 'addr-1' }

      ;(Address.findOne as jest.MockedFunction<() => Promise<AddressType | null>>).mockResolvedValue(null)
      ;(PropertyVersion.sequelize as any) = {
        transaction: jest.fn((callback: (t: unknown) => Promise<unknown>) => callback({})),
      }
      ;(Address.create as jest.MockedFunction<() => Promise<AddressType>>).mockResolvedValue(mockAddress)
      ;(PropertyVersion.create as jest.MockedFunction<() => Promise<PropertyVersionType>>).mockResolvedValue(mockPropertyVersion)
      ;(PropertyDetails.create as jest.MockedFunction<() => Promise<{ id: string; source: string }>>).mockResolvedValue({ id: 'details-1', source: 'client' })
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue({
        ...mockPropertyVersion,
        address: mockAddress,
        propertyDetails: [{ id: 'details-1', source: 'client' }],
      })

      await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(201)

      expect(PropertyDetails.create).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'client' }),
        expect.any(Object)
      )
    })

    it('should handle transaction rollback on PropertyVersion creation failure', async () => {
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      }
      ;(Address.findOne as jest.MockedFunction<() => Promise<{ id: string } | null>>).mockResolvedValue(null)
      ;(PropertyVersion.sequelize as any) = {
        transaction: jest.fn((callback: (t: unknown) => Promise<unknown>) => {
          try {
            return callback(mockTransaction)
          } catch (error) {
            mockTransaction.rollback()
            throw error
          }
        }),
      }
      ;(Address.create as jest.MockedFunction<() => Promise<{ id: string }>>).mockResolvedValue({ id: 'addr-1' })
      ;(PropertyVersion.create as jest.MockedFunction<() => Promise<never>>).mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })

    it('should reuse existing address if found', async () => {
      type AddressType = { id: string; address: string }
      const mockAddress: AddressType = { id: 'addr-1', address: '123 Main St' }
      ;(Address.findOne as jest.MockedFunction<() => Promise<AddressType | null>>).mockResolvedValue(mockAddress)
      ;(PropertyVersion.sequelize as any) = {
        transaction: jest.fn((callback: (t: unknown) => Promise<unknown>) => callback({})),
      }
      ;(PropertyVersion.create as jest.MockedFunction<() => Promise<{ id: string; addressId: string }>>).mockResolvedValue({ id: 'prop-1', addressId: 'addr-1' })
      ;(PropertyDetails.create as jest.MockedFunction<() => Promise<{ id: string }>>).mockResolvedValue({ id: 'details-1' })
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<{ id: string; address: AddressType; propertyDetails: Array<{ id: string }> } | null>>).mockResolvedValue({
        id: 'prop-1',
        address: mockAddress,
        propertyDetails: [{ id: 'details-1' }],
      })

      await request(app)
        .post('/api/properties')
        .send({
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        })
        .expect(201)

      expect(Address.create).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/properties/:id', () => {
    it('should update property', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: Array<{ mlsNumber: string; update: jest.Mock }>
        reload: jest.MockedFunction<() => Promise<PropertyVersionType>>
      }
      const mockUpdate = jest.fn()
      const mockReload = jest.fn<() => Promise<PropertyVersionType>>()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: [{ mlsNumber: '12345', update: mockUpdate }],
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)
      mockReload.mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .put('/api/properties/prop-1')
        .send({ mlsNumber: '67890' })
        .expect(200)

      expect(response.body).toBeDefined()
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('should handle property without propertyDetails', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: null
        reload: jest.MockedFunction<() => Promise<PropertyVersionType>>
      }
      const mockReload = jest.fn<() => Promise<PropertyVersionType>>()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: null,
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)
      mockReload.mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .put('/api/properties/prop-1')
        .send({ mlsNumber: '67890' })
        .expect(200)

      expect(response.body).toBeDefined()
    })

    it('should handle property with empty propertyDetails array', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: []
        reload: jest.MockedFunction<() => Promise<PropertyVersionType>>
      }
      const mockReload = jest.fn<() => Promise<PropertyVersionType>>()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: [],
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)
      mockReload.mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .put('/api/properties/prop-1')
        .send({ mlsNumber: '67890' })
        .expect(200)

      expect(response.body).toBeDefined()
    })

    it('should update only provided fields', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: Array<{ mlsNumber: string; bedrooms: number; update: jest.Mock }>
        reload: jest.MockedFunction<() => Promise<PropertyVersionType>>
      }
      const mockUpdate = jest.fn()
      const mockReload = jest.fn<() => Promise<PropertyVersionType>>()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: [{ mlsNumber: '12345', bedrooms: 3, update: mockUpdate }],
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)
      mockReload.mockResolvedValue(mockPropertyVersion)

      await request(app)
        .put('/api/properties/prop-1')
        .send({ bedrooms: 4 })
        .expect(200)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          bedrooms: 4,
          mlsNumber: '12345', // Should preserve existing value
        })
      )
    })

    it('should return 404 when property not found', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: Array<{ mlsNumber: string }>
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(null)

      const response = await request(app)
        .put('/api/properties/non-existent')
        .send({ address: '123 Main St' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle update errors', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: Array<{ update: jest.MockedFunction<() => Promise<unknown>> }>
        reload: jest.Mock
      }
      const mockUpdate = jest.fn<() => Promise<unknown>>().mockRejectedValue(new Error('Update failed'))
      const mockReload = jest.fn()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: [{ update: mockUpdate }],
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .put('/api/properties/prop-1')
        .send({ mlsNumber: '67890' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/properties/:id', () => {
    it('should patch property', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: Array<{ mlsNumber: string; update: jest.Mock }>
        reload: jest.MockedFunction<() => Promise<PropertyVersionType>>
      }
      const mockUpdate = jest.fn()
      const mockReload = jest.fn<() => Promise<PropertyVersionType>>()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: [{ mlsNumber: '12345', update: mockUpdate }],
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)
      mockReload.mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .patch('/api/properties/prop-1')
        .send({ bedrooms: 4 })
        .expect(200)

      expect(response.body).toBeDefined()
      expect(mockUpdate).toHaveBeenCalledWith({ bedrooms: 4 })
    })

    it('should handle property without propertyDetails', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: null
        reload: jest.MockedFunction<() => Promise<PropertyVersionType>>
      }
      const mockReload = jest.fn<() => Promise<PropertyVersionType>>()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: null,
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)
      mockReload.mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .patch('/api/properties/prop-1')
        .send({ bedrooms: 4 })
        .expect(200)

      expect(response.body).toBeDefined()
    })

    it('should return 404 when property not found', async () => {
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)

      const response = await request(app)
        .patch('/api/properties/non-existent')
        .send({ bedrooms: 4 })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle patch errors', async () => {
      type PropertyVersionType = {
        id: string
        address: { address: string }
        propertyDetails: Array<{ update: jest.MockedFunction<() => Promise<unknown>> }>
        reload: jest.Mock
      }
      const mockUpdate = jest.fn<() => Promise<unknown>>().mockRejectedValue(new Error('Patch failed'))
      const mockReload = jest.fn()
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        address: { address: '123 Main St' },
        propertyDetails: [{ update: mockUpdate }],
        reload: mockReload,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .patch('/api/properties/prop-1')
        .send({ bedrooms: 4 })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/properties/:id', () => {
    it('should delete property', async () => {
      type PropertyVersionType = {
        id: string
        destroy: jest.MockedFunction<() => Promise<void>>
      }
      const mockDestroy = jest.fn<() => Promise<void>>().mockResolvedValue(undefined as void)
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        destroy: mockDestroy,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)

      await request(app)
        .delete('/api/properties/prop-1')
        .expect(204)

      expect(mockDestroy).toHaveBeenCalled()
    })

    it('should return 404 when property not found', async () => {
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<null>>).mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/properties/non-existent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle delete errors', async () => {
      type PropertyVersionType = {
        id: string
        destroy: jest.MockedFunction<() => Promise<void>>
      }
      const mockDestroy = jest.fn<() => Promise<void>>().mockRejectedValue(new Error('Delete failed'))
      const mockPropertyVersion: PropertyVersionType = {
        id: 'prop-1',
        destroy: mockDestroy,
      }
      ;(PropertyVersion.findByPk as jest.MockedFunction<() => Promise<PropertyVersionType | null>>).mockResolvedValue(mockPropertyVersion)

      const response = await request(app)
        .delete('/api/properties/prop-1')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })
})

