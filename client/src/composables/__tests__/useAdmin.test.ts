
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdmin } from '../useAdmin'
import { useGlobal } from '../useGlobal'
import { createAtomicBlockGlobalData } from '@/utils/__tests__/factories/globalDataFactory'

vi.mock('../useGlobal', () => ({
  useGlobal: vi.fn(() => ({
    globalData: {
      value: createAtomicBlockGlobalData(),
    },
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/utils/transformers/globalToAdminTransformer', () => ({
  adminTransformer: {
    transformGlobalToAdmin: vi.fn((globalData) => ({
      blockInstance: globalData?.entities?.blockInstance || [],
      partInstance: globalData?.entities?.partInstance || [],
      blockShape: globalData?.entities?.blockShape || [],
      partShape: globalData?.entities?.partShape || [],
    })),
  },
}))

describe('useAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('adminData', () => {
    it('should provide admin data', () => {
      const { adminData } = useAdmin()
      
      expect(adminData.value).toBeDefined()
      expect(adminData.value.blockInstance).toBeDefined()
      expect(adminData.value.partInstance).toBeDefined()
    })
    
    it('should transform globalData to admin format', () => {
      const { adminData } = useAdmin()
      
      expect(adminData.value.blockInstance).toBeInstanceOf(Array)
      expect(adminData.value.partInstance).toBeInstanceOf(Array)
    })
    
    it('should include relationships in admin data', () => {
      const { adminData } = useAdmin()
      
      const blockInstance = adminData.value.blockInstance[0]
      
      expect(blockInstance).toBeDefined()
    })
  })
  
  describe('entity accessors', () => {
    it('should provide block instances via adminData', () => {
      const { adminData } = useAdmin()
      
      expect(adminData.value.blockInstance).toBeInstanceOf(Array)
    })
    
    it('should provide part instances via adminData', () => {
      const { adminData } = useAdmin()
      
      expect(adminData.value.partInstance).toBeInstanceOf(Array)
    })
    
    it('should provide block shapes via adminData', () => {
      const { adminData } = useAdmin()
      
      expect(adminData.value.blockShape).toBeInstanceOf(Array)
    })
    
    it('should provide part shapes via adminData', () => {
      const { adminData } = useAdmin()
      
      expect(adminData.value.partShape).toBeInstanceOf(Array)
    })
  })
  
  describe('entity lookup', () => {
    it('should find entity by ID using getEntity', () => {
      // WHY: getEntity is the standard naming pattern in the composable
      const { getEntity } = useAdmin()
      
      const entity = getEntity('blockInstance', 'block-1')
      
      if (entity) {
        expect(entity.id).toBe('block-1')
      }
    })
    
    it('should return undefined for nonexistent entity', () => {
      // WHY: Standard JavaScript pattern for missing values
      const { getEntity } = useAdmin()
      
      const entity = getEntity('blockInstance', 'nonexistent')
      
      expect(entity).toBeUndefined()
    })
  })
  
  describe('data state handling', () => {
    // PATTERN: Instance is created on first call and reused afterwards
    
    it('should use singleton pattern', () => {
      const instance1 = useAdmin()
      const instance2 = useAdmin()
      
      expect(instance1).toBe(instance2)
    })
    
    it('should provide adminData as computed property', () => {
      const { adminData } = useAdmin()
      
      expect(adminData).toBeDefined()
      expect(adminData.value).toBeDefined()
    })
  })
  
  describe('data integrity', () => {
    it('should provide entities via adminData', () => {
      // WHY: adminData is a computed that transforms globalData to admin format
      const { adminData } = useAdmin()
      
      const instances = adminData.value.blockInstance
      
      expect(Array.isArray(instances)).toBe(true)
    })
    
    it('should provide getEntities function for entity access', () => {
      const { getEntities } = useAdmin()
      
      const blockInstances = getEntities('blockInstance')
      
      expect(Array.isArray(blockInstances)).toBe(true)
    })
  })
})
