/**
 * SELECTIONCARDGROUPCONFIG TESTS
 * 
 * Unit tests for selectionCardGroupConfig utility.
 * Tests group config functions for selection cards.
 * 
 * What it covers:
 * - shouldUseSelectionGroupWrapper: Determine if group wrapper needed
 * - getSelectionGroupComponentName: Get group component name
 * - buildSelectionCardGridColumnProps: Build grid column props
 * 
 * How it works:
 * - Tests each function with various config inputs
 * 
 * Dependencies:
 * - vitest for testing
 */

import { describe, it, expect } from 'vitest'
import {
  shouldUseSelectionGroupWrapper,
  getSelectionGroupComponentName,
  buildSelectionCardGridColumnProps,
} from '../selectionCardGroupConfig'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

describe('selectionCardGroupConfig', () => {
  describe('shouldUseSelectionGroupWrapper', () => {
    it('should return false for selectionGroup none', () => {
      const config = { selectionGroup: 'none' } as SelectionCardConfig
      
      expect(shouldUseSelectionGroupWrapper(config)).toBe(false)
    })

    it('should return true for selectionGroup v-radio-group', () => {
      const config = { selectionGroup: 'v-radio-group' } as SelectionCardConfig
      
      expect(shouldUseSelectionGroupWrapper(config)).toBe(true)
    })

    it('should return true for any non-none selectionGroup', () => {
      const config = { selectionGroup: 'v-checkbox-group' } as SelectionCardConfig
      
      expect(shouldUseSelectionGroupWrapper(config)).toBe(true)
    })
  })

  describe('getSelectionGroupComponentName', () => {
    it('should return selectionGroup value', () => {
      const config = { selectionGroup: 'v-radio-group' } as SelectionCardConfig
      
      expect(getSelectionGroupComponentName(config)).toBe('v-radio-group')
    })

    it('should return VRadioGroup when selectionGroup is falsy', () => {
      const config = { selectionGroup: '' } as SelectionCardConfig
      
      expect(getSelectionGroupComponentName(config)).toBe('VRadioGroup')
    })

    it('should return VRadioGroup when selectionGroup is undefined', () => {
      const config = {} as SelectionCardConfig
      
      expect(getSelectionGroupComponentName(config)).toBe('VRadioGroup')
    })
  })

  describe('buildSelectionCardGridColumnProps', () => {
    it('should return empty object when no gridColumns', () => {
      const config = {} as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result).toEqual({})
    })

    it('should include cols when specified', () => {
      const config = { gridColumns: { cols: '6' } } as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result.cols).toBe('6')
    })

    it('should include sm when specified', () => {
      const config = { gridColumns: { sm: '4' } } as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result.sm).toBe('4')
    })

    it('should include md when specified', () => {
      const config = { gridColumns: { md: '3' } } as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result.md).toBe('3')
    })

    it('should include lg when specified', () => {
      const config = { gridColumns: { lg: '2' } } as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result.lg).toBe('2')
    })

    it('should include xl when specified', () => {
      const config = { gridColumns: { xl: '1' } } as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result.xl).toBe('1')
    })

    it('should include all specified columns', () => {
      const config = {
        gridColumns: { cols: '12', sm: '6', md: '4', lg: '3', xl: '2' },
      } as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result).toEqual({
        cols: '12',
        sm: '6',
        md: '4',
        lg: '3',
        xl: '2',
      })
    })

    it('should not include undefined columns', () => {
      const config = { gridColumns: { cols: '12', md: undefined } } as unknown as SelectionCardConfig
      
      const result = buildSelectionCardGridColumnProps(config)
      
      expect(result).toEqual({ cols: '12' })
      expect('md' in result).toBe(false)
    })
  })
})
