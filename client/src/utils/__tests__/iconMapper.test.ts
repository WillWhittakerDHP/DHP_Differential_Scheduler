
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getIcon, mapIcon } from '../iconMapper'

describe('iconMapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('getIcon', () => {
    it('should map Ant Design icons to Tabler format', () => {
      expect(getIcon('DollarOutlined')).toBe('tabler-currency-dollar')
      expect(getIcon('ContactsOutlined')).toBe('tabler-users')
      expect(getIcon('HomeOutlined')).toBe('tabler-home')
      expect(getIcon('EyeOutlined')).toBe('tabler-eye')
    })

    it('should return Tabler icons as-is', () => {
      expect(getIcon('tabler-currency-dollar')).toBe('tabler-currency-dollar')
      expect(getIcon('tabler-users')).toBe('tabler-users')
      expect(getIcon('tabler-home')).toBe('tabler-home')
    })

    it('should return default icon for null', () => {
      expect(getIcon(null)).toBe('tabler-circle')
    })

    it('should return default icon for undefined', () => {
      expect(getIcon(undefined)).toBe('tabler-circle')
    })

    it('should return default icon for empty string', () => {
      expect(getIcon('')).toBe('tabler-circle')
    })

    it('should return default icon for whitespace-only string', () => {
      expect(getIcon('   ')).toBe('tabler-circle')
    })

    it('should return default icon for unknown format', () => {
      expect(getIcon('UnknownIcon')).toBe('tabler-circle')
    })

    it('should trim whitespace from input', () => {
      expect(getIcon('  DollarOutlined  ')).toBe('tabler-currency-dollar')
      expect(getIcon('  tabler-users  ')).toBe('tabler-users')
    })

    it('should handle additional mapped icons', () => {
      expect(getIcon('ShoppingCartOutlined')).toBe('tabler-shopping-cart')
      expect(getIcon('UserOutlined')).toBe('tabler-user')
      expect(getIcon('SettingOutlined')).toBe('tabler-settings')
      expect(getIcon('EditOutlined')).toBe('tabler-edit')
      expect(getIcon('DeleteOutlined')).toBe('tabler-trash')
      expect(getIcon('PlusOutlined')).toBe('tabler-plus')
      expect(getIcon('MinusOutlined')).toBe('tabler-minus')
      expect(getIcon('CheckOutlined')).toBe('tabler-check')
      expect(getIcon('CloseOutlined')).toBe('tabler-x')
      expect(getIcon('InfoCircleOutlined')).toBe('tabler-info-circle')
      expect(getIcon('WarningOutlined')).toBe('tabler-alert-triangle')
      expect(getIcon('QuestionCircleOutlined')).toBe('tabler-help-circle')
    })
  })

  describe('mapIcon', () => {
    it('should be an alias for getIcon', () => {
      expect(mapIcon('DollarOutlined')).toBe('tabler-currency-dollar')
      expect(mapIcon('tabler-users')).toBe('tabler-users')
      expect(mapIcon(null)).toBe('tabler-circle')
      expect(mapIcon('UnknownIcon')).toBe('tabler-circle')
    })

    it('should have same behavior as getIcon', () => {
      const testCases = [
        'DollarOutlined',
        'tabler-users',
        null,
        undefined,
        '',
        'UnknownIcon',
      ]
      
      testCases.forEach(testCase => {
        expect(mapIcon(testCase)).toBe(getIcon(testCase))
      })
    })
  })
})

