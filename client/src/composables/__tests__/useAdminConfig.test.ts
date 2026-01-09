/**
 * USE ADMIN CONFIG TESTS
 * 
 * Unit tests for useAdminConfig composable.
 * Tests config access, caching, and reactive computed refs.
 * Phase 7: Config Composables
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdminConfig, _clearCache } from '../useAdminConfig'
import { getAdminConfig, rebuildAdminConfig } from '@/configs/adminConfig'

// Mock admin config
const mockAdminConfig = {
  formFieldConfig: {
    blockInstance: {
      name: {
        primitiveInput: {
          primitiveMode: 'Input',
          primitiveType: 'String',
        },
      },
    },
  },
  displayFieldConfig: {
    blockInstance: {
      name: {
        primitiveDisplay: {
          label: 'Name',
          placeholder: 'Enter name',
        },
      },
    },
  },
  instanceConfig: {
    blockInstance: {},
  },
}

vi.mock('@/configs/adminConfig', () => ({
  getAdminConfig: vi.fn(() => mockAdminConfig),
  rebuildAdminConfig: vi.fn(),
}))

describe('useAdminConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // LEARNING: Clear module-level caches before each test for proper isolation
    // WHY: Cached computed refs persist across tests and can cause stale state
    _clearCache()
  })

  describe('getFormFieldConfig', () => {
    it('should return form field config for entity and property', () => {
      const adminConfig = useAdminConfig()
      
      const config = adminConfig.getFormFieldConfig('blockInstance', 'name')
      
      expect(config.value).toBeDefined()
      expect(config.value?.primitiveInput).toBeDefined()
    })

    it('should return undefined for non-existent field', () => {
      const adminConfig = useAdminConfig()
      
      const config = adminConfig.getFormFieldConfig('blockInstance', 'nonExistent')
      
      expect(config.value).toBeUndefined()
    })

    it('should cache computed refs', () => {
      const adminConfig = useAdminConfig()
      
      const config1 = adminConfig.getFormFieldConfig('blockInstance', 'name')
      const config2 = adminConfig.getFormFieldConfig('blockInstance', 'name')
      
      expect(config1).toBe(config2)
    })

    it('should return reactive computed ref', () => {
      const adminConfig = useAdminConfig()
      
      const config = adminConfig.getFormFieldConfig('blockInstance', 'name')
      
      expect(config.value).toBeDefined()
      
      // Config should be reactive (computed)
      expect(typeof config.value).toBe('object')
    })
  })

  describe('getDisplayFieldConfig', () => {
    it('should return display field config for entity and property', () => {
      const adminConfig = useAdminConfig()
      
      const config = adminConfig.getDisplayFieldConfig('blockInstance', 'name')
      
      expect(config.value).toBeDefined()
    })

    it('should cache computed refs', () => {
      const adminConfig = useAdminConfig()
      
      const config1 = adminConfig.getDisplayFieldConfig('blockInstance', 'name')
      const config2 = adminConfig.getDisplayFieldConfig('blockInstance', 'name')
      
      expect(config1).toBe(config2)
    })
  })

  describe('getEntityFormFieldConfig', () => {
    it('should return all form field configs for entity', () => {
      const adminConfig = useAdminConfig()
      
      const configs = adminConfig.getEntityFormFieldConfig('blockInstance')
      
      expect(configs.value).toBeDefined()
      expect(typeof configs.value).toBe('object')
    })

    it('should cache computed refs', () => {
      const adminConfig = useAdminConfig()
      
      const configs1 = adminConfig.getEntityFormFieldConfig('blockInstance')
      const configs2 = adminConfig.getEntityFormFieldConfig('blockInstance')
      
      expect(configs1).toBe(configs2)
    })
  })

  describe('getEntityDisplayFieldConfig', () => {
    it('should return all display field configs for entity', () => {
      const adminConfig = useAdminConfig()
      
      const configs = adminConfig.getEntityDisplayFieldConfig('blockInstance')
      
      expect(configs.value).toBeDefined()
      expect(typeof configs.value).toBe('object')
    })

    it('should cache computed refs', () => {
      const adminConfig = useAdminConfig()
      
      const configs1 = adminConfig.getEntityDisplayFieldConfig('blockInstance')
      const configs2 = adminConfig.getEntityDisplayFieldConfig('blockInstance')
      
      expect(configs1).toBe(configs2)
    })
  })

  describe('getInstanceConfig', () => {
    it('should return instance config for entity', () => {
      const adminConfig = useAdminConfig()
      
      const config = adminConfig.getInstanceConfig('blockInstance')
      
      expect(config.value).toBeDefined()
      expect(typeof config.value).toBe('object')
    })

    it('should cache computed refs', () => {
      const adminConfig = useAdminConfig()
      
      const config1 = adminConfig.getInstanceConfig('blockInstance')
      const config2 = adminConfig.getInstanceConfig('blockInstance')
      
      expect(config1).toBe(config2)
    })
  })

  describe('rebuildConfig', () => {
    it('should call rebuildAdminConfig', () => {
      const adminConfig = useAdminConfig()
      
      adminConfig.rebuildConfig()
      
      expect(rebuildAdminConfig).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle errors gracefully', () => {
      vi.mocked(getAdminConfig).mockImplementationOnce(() => {
        throw new Error('Config error')
      })
      
      const adminConfig = useAdminConfig()
      
      // Should not throw
      const config = adminConfig.getFormFieldConfig('blockInstance', 'name')
      
      expect(config.value).toBeUndefined()
    })
  })
})






