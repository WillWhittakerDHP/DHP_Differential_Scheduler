/**
 * FETCH TO GLOBAL TRANSFORMER TESTS
 * 
 * Unit tests for GlobalTransformer class.
 * Tests API response transformation to GlobalData format.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GlobalTransformer } from '../fetchToGlobalTransformer'
import type { GlobalData } from '../fetchToGlobalTransformer'
import apiClient from '@/utils/api'

// Mock API client
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
  },
  getEntityEndpoint: vi.fn((entityKey: string) => `/api/entities/${entityKey}`),
  getRelationshipEndpoint: vi.fn((relKey: string) => `/api/relationships/${relKey}`),
  getAnnotationEndpoint: vi.fn(() => '/api/annotations'),
  getAnnotationAssignmentsEndpoint: vi.fn(() => '/api/annotation-assignments'),
  getAppointmentEndpoint: vi.fn(() => '/api/appointments'),
  getPropertyEndpoint: vi.fn(() => '/api/properties'),
  getUserEndpoint: vi.fn(() => '/api/users'),
}))

describe('GlobalTransformer', () => {
  let transformer: GlobalTransformer
  
  beforeEach(() => {
    transformer = new GlobalTransformer()
    vi.clearAllMocks()
  })
  
  describe('stageForHydration and hydrate', () => {
    it('should transform API response to GlobalData format', async () => {
      // Mock API responses for all entity types and relationships
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('/entities/')) {
          return Promise.resolve({
            data: url.includes('blockInstance') ? [{
              id: 'block-1',
              name: 'Test Block',
              entity_key: 'blockInstance',
              block_shape_ref: 'shape-1',
              order_index: 1,
              disabled: false,
            }] : []
          })
        }
        if (url.includes('/relationships/')) {
          return Promise.resolve({ data: [] })
        }
        if (url.includes('/annotations')) {
          return Promise.resolve({ data: [] })
        }
        return Promise.resolve({ data: [] })
      })
      
      const staged = await transformer.stageForHydration()
      const result = transformer.hydrate(staged)
      
      expect(result).toBeDefined()
      expect(result.entities).toBeDefined()
      expect(result.relationships).toBeDefined()
    })
    
    it('should handle empty API responses', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
      
      const staged = await transformer.stageForHydration()
      const result = transformer.hydrate(staged)
      
      expect(result.entities).toBeDefined()
      expect(Object.keys(result.entities)).toHaveLength(4) // 4 entity types
    })
    
    it('should handle API errors gracefully', async () => {
      // Mock to reject on first call (entity fetch)
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('API Error'))
      
      // LEARNING: stageForHydration catches errors and returns empty data structure
      // WHY: Graceful error handling prevents app crashes
      // PATTERN: Return empty data structure instead of throwing
      const result = await transformer.stageForHydration()
      
      expect(result).toBeDefined()
      expect(result.fetchedEntities).toBeDefined()
      expect(result.fetchedRelationships).toBeDefined()
      // Should have empty arrays for all entity types
      expect(Object.keys(result.fetchedEntities)).toHaveLength(4)
    })
  })
  
  describe('hydrate', () => {
    it('should hydrate relationships with entity data', () => {
      const staged = {
        fetchedEntities: {
          blockInstance: [
            { id: 'block-1', entityKey: 'blockInstance', name: 'Block 1', disabled: false, orderIndex: 1 } as any,
          ],
          partInstance: [
            { id: 'part-1', entityKey: 'partInstance', name: 'Part 1', disabled: false, orderIndex: 1 } as any,
            { id: 'part-2', entityKey: 'partInstance', name: 'Part 2', disabled: false, orderIndex: 2 } as any,
          ],
          blockShape: [],
          partShape: [],
        },
        fetchedRelationships: [
          {
            id: 'rel-1',
            kind: 'activeParts',
            parent_id: 'block-1',
            parent_kind: 'blockInstance',
            child_id: 'part-1',
            child_kind: 'partInstance',
            disabled: false,
          },
          {
            id: 'rel-2',
            kind: 'activeParts',
            parent_id: 'block-1',
            parent_kind: 'blockInstance',
            child_id: 'part-2',
            child_kind: 'partInstance',
            disabled: false,
          },
        ] as any,
        fetchedAnnotations: [],
        fetchedAnnotationAssignments: [],
      }
      
      const result = transformer.hydrate(staged)
      
      expect(result.relationships.activeParts).toHaveLength(1)
      expect(result.relationships.activeParts[0].parent.id).toBe('block-1')
      expect(result.relationships.activeParts[0].children).toHaveLength(2)
    })
    
    it('should handle missing entity references', () => {
      const staged = {
        fetchedEntities: {
          blockInstance: [],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        fetchedRelationships: [
          {
            id: 'rel-1',
            kind: 'activeParts',
            parent_id: 'nonexistent-block',
            parent_kind: 'blockInstance',
            child_id: 'nonexistent-part',
            child_kind: 'partInstance',
            disabled: false,
          },
        ] as any,
        fetchedAnnotations: [],
        fetchedAnnotationAssignments: [],
      }
      
      const result = transformer.hydrate(staged)
      
      // Should skip relationships with missing entities
      expect(result.relationships.activeParts).toHaveLength(0)
    })
  })
  
  describe('data integrity', () => {
    it('should preserve entity properties during transformation', async () => {
      const callCount = 0
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('/entities/partInstance')) {
          return Promise.resolve({
            data: [{
              id: 'part-1',
              name: 'Test Part',
              entity_key: 'partInstance',
              part_shape_ref: 'shape-1',
              base_time: 60,
              base_fee: 100,
              on_site: true,
              client_present: true,
              moveable: false,
              rate_over_base_time: 1.5,
              rate_over_base_fee: 1.5,
              order_index: 1,
              disabled: false,
            }]
          })
        }
        // Return empty arrays for all other endpoints
        return Promise.resolve({ data: [] })
      })
      
      const staged = await transformer.stageForHydration()
      const result = transformer.hydrate(staged)
      
      const partInstance = result.entities.partInstance?.[0]
      expect(partInstance).toBeDefined()
      if (partInstance) {
        expect(partInstance.id).toBe('part-1')
        expect(partInstance.name).toBe('Test Part')
        // Properties should be transformed from snake_case to camelCase
        expect((partInstance as any).baseTime).toBeDefined()
        expect((partInstance as any).baseFee).toBeDefined()
      }
    })
    
    it('should sort entities by orderIndex', async () => {
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('/entities/blockInstance')) {
          return Promise.resolve({
            data: [
              { id: 'block-3', name: 'Block 3', entity_key: 'blockInstance', order_index: 3, disabled: false },
              { id: 'block-1', name: 'Block 1', entity_key: 'blockInstance', order_index: 1, disabled: false },
              { id: 'block-2', name: 'Block 2', entity_key: 'blockInstance', order_index: 2, disabled: false },
            ]
          })
        }
        // Return empty arrays for all other endpoints
        return Promise.resolve({ data: [] })
      })
      
      const staged = await transformer.stageForHydration()
      const result = transformer.hydrate(staged)
      
      const blockInstances = result.entities.blockInstance
      expect(blockInstances[0].id).toBe('block-1')
      expect(blockInstances[1].id).toBe('block-2')
      expect(blockInstances[2].id).toBe('block-3')
    })
  })
})

