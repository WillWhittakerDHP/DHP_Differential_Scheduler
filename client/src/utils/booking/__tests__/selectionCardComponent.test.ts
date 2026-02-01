
import { describe, it, expect } from 'vitest'
import {
  getSelectionComponentName,
  getSelectionControlOrder,
  buildSelectionComponentProps,
} from '../selectionCardComponent'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

describe('selectionCardComponent', () => {
  describe('getSelectionComponentName', () => {
    it('should return VRadio for radio component', () => {
      const config = { selectionComponent: 'VRadio' } as SelectionCardConfig
      
      expect(getSelectionComponentName(config)).toBe('VRadio')
    })

    it('should return VCheckbox for checkbox component', () => {
      const config = { selectionComponent: 'VCheckbox' } as SelectionCardConfig
      
      expect(getSelectionComponentName(config)).toBe('VCheckbox')
    })

    it('should return VRadio when selectionComponent is undefined', () => {
      const config = {} as SelectionCardConfig
      
      expect(getSelectionComponentName(config)).toBe('VRadio')
    })
  })

  describe('getSelectionControlOrder', () => {
    it('should return -2 for top position', () => {
      expect(getSelectionControlOrder('top')).toBe(-2)
    })

    it('should return -1 for left position', () => {
      expect(getSelectionControlOrder('left')).toBe(-1)
    })

    it('should return 1 for bottom position', () => {
      expect(getSelectionControlOrder('bottom')).toBe(1)
    })

    it('should return 1 for right position', () => {
      expect(getSelectionControlOrder('right')).toBe(1)
    })

    it('should return 1 for hidden position', () => {
      expect(getSelectionControlOrder('hidden')).toBe(1)
    })

    it('should return 1 for undefined position', () => {
      expect(getSelectionControlOrder(undefined)).toBe(1)
    })
  })

  describe('buildSelectionComponentProps', () => {
    it('should include class from controlClasses', () => {
      const result = buildSelectionComponentProps({
        itemId: 'item-1',
        selectionComponent: 'VRadio',
        controlPosition: 'bottom',
        controlClasses: { 'mt-4': true },
        isSelected: false,
      })
      
      expect(result.class).toEqual({ 'mt-4': true })
    })

    it('should include style with order', () => {
      const result = buildSelectionComponentProps({
        itemId: 'item-1',
        selectionComponent: 'VRadio',
        controlPosition: 'top',
        controlClasses: {},
        isSelected: false,
      })
      
      expect(result.style).toEqual({ order: -2 })
    })

    it('should include value and modelValue for VRadio', () => {
      const result = buildSelectionComponentProps({
        itemId: 'item-1',
        selectionComponent: 'VRadio',
        controlPosition: 'bottom',
        controlClasses: {},
        isSelected: true,
      })
      
      expect(result.value).toBe('item-1')
      expect(result.modelValue).toBe(true)
    })

    it('should include only modelValue for VCheckbox', () => {
      const result = buildSelectionComponentProps({
        itemId: 'item-1',
        selectionComponent: 'VCheckbox',
        controlPosition: 'bottom',
        controlClasses: {},
        isSelected: true,
      })
      
      expect(result.modelValue).toBe(true)
      expect(result.value).toBeUndefined()
    })

    it('should not include value or modelValue for other components', () => {
      const result = buildSelectionComponentProps({
        itemId: 'item-1',
        selectionComponent: 'VSwitch' as SelectionCardConfig['selectionComponent'],
        controlPosition: 'bottom',
        controlClasses: {},
        isSelected: true,
      })
      
      expect(result.value).toBeUndefined()
      expect(result.modelValue).toBeUndefined()
    })
  })
})
