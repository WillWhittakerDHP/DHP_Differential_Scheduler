
import { describe, it, expect, vi } from 'vitest'
import {
  getInstanceComponentsForService,
  mapServicesWithComponents,
} from '../instanceComponentsList'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { GlobalEntity } from '@/types/entities'

vi.mock('@/utils/instanceComponentUtils', () => ({
  isServiceComposable: vi.fn(({ serviceId }: { serviceId: string }) => {
    return serviceId === 'composable-service'
  }),
  extractInstanceComponents: vi.fn(() => [
    { id: 'comp-1', name: 'Component 1', active: true },
  ]),
}))

function createService(id: string, name = `Service ${id}`): BookingBlockInstance {
  return {
    id,
    name,
    description: 'Test service',
  } as BookingBlockInstance
}

describe('instanceComponentsList', () => {
  describe('getInstanceComponentsForService', () => {
    it('should return empty array for non-composable service', () => {
      const mockGetGlobalEntityById = vi.fn(() => null)
      const mockGetActiveComponentsRelationships = vi.fn(() => [])
      
      const result = getInstanceComponentsForService({
        service: createService('non-composable'),
        selectedUserTypeBlockId: null,
        getGlobalEntityById: mockGetGlobalEntityById as unknown as (entityKey: 'blockInstance' | 'blockShape', id: string) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null,
        getActiveComponentsRelationships: mockGetActiveComponentsRelationships,
      })
      
      expect(result).toEqual([])
    })

    it('should return empty array when no relationships', () => {
      const mockGetGlobalEntityById = vi.fn(() => null)
      const mockGetActiveComponentsRelationships = vi.fn(() => [])
      
      const result = getInstanceComponentsForService({
        service: createService('composable-service'),
        selectedUserTypeBlockId: null,
        getGlobalEntityById: mockGetGlobalEntityById as unknown as (entityKey: 'blockInstance' | 'blockShape', id: string) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null,
        getActiveComponentsRelationships: mockGetActiveComponentsRelationships,
      })
      
      expect(result).toEqual([])
    })

    it('should return components for composable service with relationships', () => {
      const mockGetGlobalEntityById = vi.fn(() => ({
        id: 'entity-1',
        entityKey: 'blockInstance',
      }))
      const mockGetActiveComponentsRelationships = vi.fn(() => [
        { childId: 'comp-1' },
      ])
      
      const result = getInstanceComponentsForService({
        service: createService('composable-service'),
        selectedUserTypeBlockId: null,
        getGlobalEntityById: mockGetGlobalEntityById as unknown as (entityKey: 'blockInstance' | 'blockShape', id: string) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null,
        getActiveComponentsRelationships: mockGetActiveComponentsRelationships,
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('comp-1')
    })
  })

  describe('mapServicesWithComponents', () => {
    it('should return services unchanged when no components', () => {
      const services = [createService('service-1')]
      const getInstanceComponents = vi.fn(() => [])
      
      const result = mapServicesWithComponents({
        services,
        getInstanceComponents,
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('service-1')
      expect(result[0].composite).toBeUndefined()
    })

    it('should mark service as composite when has components', () => {
      const services = [createService('service-1')]
      const getInstanceComponents = vi.fn(() => [
        { id: 'comp-1', name: 'Component 1', active: true },
      ])
      
      const result = mapServicesWithComponents({
        services,
        getInstanceComponents,
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].composite).toBe(true)
      expect(result[0].instanceComponents).toHaveLength(1)
    })

    it('should handle multiple services', () => {
      const services = [
        createService('service-1'),
        createService('service-2'),
      ]
      const getInstanceComponents = vi.fn((service) => {
        if (service.id === 'service-1') {
          return [{ id: 'comp-1', name: 'Component 1', active: true }]
        }
        return []
      })
      
      const result = mapServicesWithComponents({
        services,
        getInstanceComponents,
      })
      
      expect(result).toHaveLength(2)
      expect(result[0].composite).toBe(true)
      expect(result[1].composite).toBeUndefined()
    })
  })
})
