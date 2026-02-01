
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanupInvalidActiveRelationships } from '../dependencyCleanup'
import apiClient, { getRelationshipByParentChildEndpoint } from '@/utils/api'
import type { QueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey, GlobalEntityId } from '@/types/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'

const mockAdminConfig = {
  getFormFieldConfig: vi.fn(() => ({
    value: {
      relationshipSelect: {
        dependencyImpact: {
          affectedEntityKey: 'blockInstance',
          affectedField: 'bookingCascades',
          linkingField: 'blockShapeRef',
        },
      },
    },
  })),
}

const mockAdmin = {
  getEntitiesByKey: vi.fn(() => []),
  getEntity: vi.fn(() => null),
}

vi.mock('@/composables/useAdminConfig', () => ({
  useAdminConfig: vi.fn(() => mockAdminConfig),
}))

vi.mock('@/composables/useAdmin', () => ({
  useAdmin: vi.fn(() => mockAdmin),
}))

vi.mock('@/utils/api', () => ({
  default: {
    delete: vi.fn(),
  },
  getRelationshipByParentChildEndpoint: vi.fn((key, parentId, childId) => 
    `/api/relationships/${key}/${parentId}/${childId}`
  ),
}))

describe('dependencyCleanup', () => {
  let mockQueryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryClient = {
      invalidateQueries: vi.fn(),
    } as any
    
    mockAdminConfig.getFormFieldConfig.mockReturnValue({
      value: {
        relationshipSelect: {
          dependencyImpact: {
            affectedEntityKey: 'blockInstance',
            affectedField: 'bookingCascades',
            linkingField: 'blockShapeRef',
          },
        },
      },
    })
    mockAdmin.getEntitiesByKey.mockReturnValue([])
    mockAdmin.getEntity.mockReturnValue(null)
  })

  describe('cleanupInvalidActiveRelationships', () => {
    it('should return early when no form field config', async () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: null,
      })
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        [],
        mockQueryClient
      )
      
      expect(apiClient.delete).not.toHaveBeenCalled()
    })

    it('should return early when no dependencyImpact config', async () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          relationshipSelect: {},
        },
      })
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        [],
        mockQueryClient
      )
      
      expect(apiClient.delete).not.toHaveBeenCalled()
    })

    it('should return early when no affected entities found', async () => {
      mockAdmin.getEntitiesByKey.mockReturnValue([])
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'],
        mockQueryClient
      )
      
      expect(apiClient.delete).not.toHaveBeenCalled()
    })

    it('should remove invalid active relationships', async () => {
      const affectedEntity = {
        id: 'block-1',
        name: 'Block 1',
        blockShapeRef: 'shape-1',
        bookingCascades: ['block-2', 'block-3'],
      }
      
      const childEntity1 = {
        id: 'block-2',
        blockShapeRef: 'shape-2', // Valid - in newValidChildIds
      }
      
      const childEntity2 = {
        id: 'block-3',
        blockShapeRef: 'shape-3', // Invalid - not in newValidChildIds
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      mockAdmin.getEntity
        .mockReturnValueOnce(childEntity1)
        .mockReturnValueOnce(childEntity2)
      
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'], // Only shape-2 is valid
        mockQueryClient
      )
      
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/api/relationships/bookingCascades/block-1/block-3'
      )
      
      expect(apiClient.delete).not.toHaveBeenCalledWith(
        '/api/relationships/bookingCascades/block-1/block-2'
      )
    })

    it('should handle validCascades relationship type', async () => {
      const affectedEntity = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        bookingCascades: ['block-2'],
      }
      
      const childEntity = {
        id: 'block-2',
        blockShapeRef: 'shape-2',
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      mockAdmin.getEntity.mockReturnValue(childEntity)
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'],
        mockQueryClient
      )
      
      expect(mockAdmin.getEntity).toHaveBeenCalledWith('blockInstance', 'block-2')
    })

    it('should handle validParts relationship type', async () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          relationshipSelect: {
            dependencyImpact: {
              affectedEntityKey: 'blockInstance',
              affectedField: 'partAssignments',
              linkingField: 'blockShapeRef',
            },
          },
        },
      })
      
      const affectedEntity = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        partAssignments: ['part-1'],
      }
      
      const childEntity = {
        id: 'part-1',
        partShapeRef: 'part-shape-1',
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      mockAdmin.getEntity.mockReturnValue(childEntity)
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validParts',
        ['part-shape-1'],
        mockQueryClient
      )
      
      expect(mockAdmin.getEntity).toHaveBeenCalledWith('partInstance', 'part-1')
    })

    it('should remove relationships when child entity does not exist', async () => {
      const affectedEntity = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        bookingCascades: ['non-existent'],
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      mockAdmin.getEntity.mockReturnValue(null) // Child doesn't exist
      
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'],
        mockQueryClient
      )
      
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/api/relationships/bookingCascades/block-1/non-existent'
      )
    })

    it('should invalidate queries after cleanup', async () => {
      const affectedEntity = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        bookingCascades: ['block-2'],
      }
      
      const childEntity = {
        id: 'block-2',
        blockShapeRef: 'shape-3', // Invalid
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      mockAdmin.getEntity.mockReturnValue(childEntity)
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'],
        mockQueryClient
      )
      
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['bookingCascades'],
      })
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['blockInstance'],
      })
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle errors gracefully', async () => {
      const affectedEntity = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        bookingCascades: ['block-2'],
      }
      
      const childEntity = {
        id: 'block-2',
        blockShapeRef: 'shape-3', // Invalid
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      mockAdmin.getEntity.mockReturnValue(childEntity)
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'))
      
      await expect(
        cleanupInvalidActiveRelationships(
          'blockShape',
          'shape-1',
          'validCascades',
          ['shape-2'],
          mockQueryClient
        )
      ).resolves.not.toThrow()
    })

    it('should handle empty active relationships array', async () => {
      const affectedEntity = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        bookingCascades: [],
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'],
        mockQueryClient
      )
      
      expect(apiClient.delete).not.toHaveBeenCalled()
    })

    it('should handle non-array active relationships', async () => {
      const affectedEntity = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        bookingCascades: 'not-an-array' as any,
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity])
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'],
        mockQueryClient
      )
      
      expect(apiClient.delete).not.toHaveBeenCalled()
    })

    it('should process multiple affected entities', async () => {
      const affectedEntity1 = {
        id: 'block-1',
        blockShapeRef: 'shape-1',
        bookingCascades: ['block-2'],
      }
      
      const affectedEntity2 = {
        id: 'block-3',
        blockShapeRef: 'shape-1',
        bookingCascades: ['block-4'],
      }
      
      const childEntity1 = {
        id: 'block-2',
        blockShapeRef: 'shape-3', // Invalid
      }
      
      const childEntity2 = {
        id: 'block-4',
        blockShapeRef: 'shape-3', // Invalid
      }
      
      mockAdmin.getEntitiesByKey.mockReturnValue([affectedEntity1, affectedEntity2])
      mockAdmin.getEntity
        .mockReturnValueOnce(childEntity1)
        .mockReturnValueOnce(childEntity2)
      
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      await cleanupInvalidActiveRelationships(
        'blockShape',
        'shape-1',
        'validCascades',
        ['shape-2'],
        mockQueryClient
      )
      
      expect(apiClient.delete).toHaveBeenCalledTimes(2)
    })
  })
})






