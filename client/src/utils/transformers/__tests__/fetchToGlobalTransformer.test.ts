
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GlobalTransformer } from '../fetchToGlobalTransformer'
import apiClient from '../../api'
import { ENTITY_KEYS } from '@/constants/entities'

vi.mock('../../api', () => ({
  default: { get: vi.fn() },
  getEntitiesBatchEndpoint: vi.fn(() => '/entities/batch'),
  getRelationshipsBatchEndpoint: vi.fn(() => '/relationships/batch'),
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
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('entities/batch') || url === '/entities/batch') {
          return Promise.resolve({
            data: {
              blockInstance: [{
                id: 'block-1',
                name: 'Test Block',
                entityKey: 'blockInstance',
                blockShapeRef: 'shape-1',
                orderIndex: 1,
                disabled: false,
              }],
              blockShape: [],
              partInstance: [],
              partShape: [],
              eventShape: [],
              eventInstance: [],
              annotationShape: [],
              annotationInstance: [],
            },
          })
        }
        if (url.includes('relationships/batch') || url === '/relationships/batch') {
          return Promise.resolve({ data: {} })
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
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('entities/batch') || url === '/entities/batch') {
          return Promise.resolve({ data: {} })
        }
        if (url.includes('relationships/batch') || url === '/relationships/batch') {
          return Promise.resolve({ data: {} })
        }
        return Promise.resolve({ data: [] })
      })

      const staged = await transformer.stageForHydration()
      const result = transformer.hydrate(staged)

      expect(result.entities).toBeDefined()
      expect(Object.keys(result.entities)).toHaveLength(ENTITY_KEYS.length)
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('API Error'))

      const result = await transformer.stageForHydration()

      expect(result).toBeDefined()
      expect(result.fetchedEntities).toBeDefined()
      expect(Object.keys(result.fetchedEntities)).toHaveLength(ENTITY_KEYS.length)
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
            kind: 'partAssignments',
            parentId: 'block-1',
            parentKind: 'blockInstance',
            childId: 'part-1',
            childKind: 'partInstance',
            disabled: false,
          },
          {
            id: 'rel-2',
            kind: 'partAssignments',
            parentId: 'block-1',
            parentKind: 'blockInstance',
            childId: 'part-2',
            childKind: 'partInstance',
            disabled: false,
          },
        ] as any,
        fetchedAnnotations: {},
        fetchedEvents: {},
      }
      
      const result = transformer.hydrate(staged)
      
      expect(result.relationships.partAssignments).toHaveLength(1)
      expect(result.relationships.partAssignments[0].parent.id).toBe('block-1')
      expect(result.relationships.partAssignments[0].children).toHaveLength(2)
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
            kind: 'partAssignments',
            parentId: 'nonexistent-block',
            parentKind: 'blockInstance',
            childId: 'nonexistent-part',
            childKind: 'partInstance',
            disabled: false,
          },
        ] as any,
        fetchedAnnotations: {},
        fetchedEvents: {},
      }
      
      const result = transformer.hydrate(staged)
      
      expect(result.relationships.partAssignments).toHaveLength(0)
    })
  })
  
  describe('data integrity', () => {
    it('should preserve entity properties during transformation', async () => {
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('entities/batch') || url === '/entities/batch') {
          return Promise.resolve({
            data: {
              blockInstance: [],
              blockShape: [],
              partInstance: [{
                id: 'part-1',
                name: 'Test Part',
                entityKey: 'partInstance',
                partShapeRef: 'shape-1',
                baseTime: 60,
                baseFee: 100,
                onSite: true,
                clientPresent: true,
                moveable: false,
                rateOverBaseTime: 1.5,
                rateOverBaseFee: 1.5,
                orderIndex: 1,
                disabled: false,
              }],
              partShape: [],
              eventShape: [],
              eventInstance: [],
              annotationShape: [],
              annotationInstance: [],
            },
          })
        }
        if (url.includes('relationships/batch') || url === '/relationships/batch') {
          return Promise.resolve({ data: {} })
        }
        return Promise.resolve({ data: [] })
      })

      const staged = await transformer.stageForHydration()
      const result = transformer.hydrate(staged)

      const partInstance = result.entities.partInstance?.[0]
      expect(partInstance).toBeDefined()
      if (partInstance) {
        expect(partInstance.id).toBe('part-1')
        expect(partInstance.name).toBe('Test Part')
        expect((partInstance as Record<string, unknown>).baseTime).toBeDefined()
        expect((partInstance as Record<string, unknown>).baseFee).toBeDefined()
      }
    })

    it('should sort entities by orderIndex', async () => {
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('entities/batch') || url === '/entities/batch') {
          return Promise.resolve({
            data: {
              blockInstance: [
                { id: 'block-3', name: 'Block 3', entityKey: 'blockInstance', orderIndex: 3, disabled: false },
                { id: 'block-1', name: 'Block 1', entityKey: 'blockInstance', orderIndex: 1, disabled: false },
                { id: 'block-2', name: 'Block 2', entityKey: 'blockInstance', orderIndex: 2, disabled: false },
              ],
              blockShape: [],
              partInstance: [],
              partShape: [],
              eventShape: [],
              eventInstance: [],
              annotationShape: [],
              annotationInstance: [],
            },
          })
        }
        if (url.includes('relationships/batch') || url === '/relationships/batch') {
          return Promise.resolve({ data: {} })
        }
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

