/**
 * ANNOTATION UTILS TESTS
 * 
 * Unit tests for annotationUtils.
 * Tests annotation validation, filtering, and formatting utilities.
 * Phase 6: Medium Priority Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  hasDuplicateUserTypeBlock,
  getAvailableUserTypeBlocksForAnnotation,
  formatAnnotationForDisplay,
  getAnnotationsForUserTypeBlock,
  validateAnnotationMetadata,
  getUserTypeBlockOptionsFromGlobalData,
} from '../annotationUtils'
import type { AnnotationWithMetadata, AnnotationMetadata } from '@/types/annotations'
import type { UserTypeBlock } from '@/types/userTypeBlocks'
import { createAtomicBlockGlobalData } from './factories/globalDataFactory'

describe('annotationUtils', () => {
  describe('hasDuplicateUserTypeBlock', () => {
    it('should return false for null userTypeBlock (generic annotations)', () => {
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: null,
        orderIndex: 0,
        isDefault: false,
      }
      
      const allAnnotations: AnnotationWithMetadata[] = [
        annotation,
        { ...annotation, id: 'ann-2', userTypeBlock: null },
      ]
      
      expect(hasDuplicateUserTypeBlock(annotation, allAnnotations)).toBe(false)
    })

    it('should return false when userTypeBlock is unique', () => {
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: 'user-type-1',
        orderIndex: 0,
        isDefault: false,
      }
      
      const allAnnotations: AnnotationWithMetadata[] = [
        annotation,
        { ...annotation, id: 'ann-2', userTypeBlock: 'user-type-2' },
      ]
      
      expect(hasDuplicateUserTypeBlock(annotation, allAnnotations)).toBe(false)
    })

    it('should return true when userTypeBlock is already used by another annotation', () => {
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: 'user-type-1',
        orderIndex: 0,
        isDefault: false,
      }
      
      const allAnnotations: AnnotationWithMetadata[] = [
        annotation,
        { ...annotation, id: 'ann-2', userTypeBlock: 'user-type-1' },
      ]
      
      expect(hasDuplicateUserTypeBlock(annotation, allAnnotations)).toBe(true)
    })

    it('should exclude current annotation from duplicate check', () => {
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: 'user-type-1',
        orderIndex: 0,
        isDefault: false,
      }
      
      const allAnnotations: AnnotationWithMetadata[] = [annotation]
      
      expect(hasDuplicateUserTypeBlock(annotation, allAnnotations)).toBe(false)
    })

    it('should handle empty annotations array', () => {
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: 'user-type-1',
        orderIndex: 0,
        isDefault: false,
      }
      
      expect(hasDuplicateUserTypeBlock(annotation, [])).toBe(false)
    })
  })

  describe('getAvailableUserTypeBlocksForAnnotation', () => {
    it('should mark used user types as disabled', () => {
      const currentAnnotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: null,
        orderIndex: 0,
        isDefault: false,
      }
      
      const allAnnotations: AnnotationWithMetadata[] = [
        currentAnnotation,
        { ...currentAnnotation, id: 'ann-2', userTypeBlock: 'user-type-1' },
      ]
      
      const userTypeBlockOptions: Array<{ title: string; value: UserTypeBlock }> = [
        { title: 'Generic', value: null },
        { title: 'User Type 1', value: 'user-type-1' },
        { title: 'User Type 2', value: 'user-type-2' },
      ]
      
      const available = getAvailableUserTypeBlocksForAnnotation(
        currentAnnotation,
        allAnnotations,
        userTypeBlockOptions
      )
      
      expect(available.find(o => o.value === 'user-type-1')?.disabled).toBe(true)
      expect(available.find(o => o.value === 'user-type-2')?.disabled).toBe(false)
      expect(available.find(o => o.value === null)?.disabled).toBe(false)
    })

    it('should not disable current annotation userTypeBlock', () => {
      const currentAnnotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: 'user-type-1',
        orderIndex: 0,
        isDefault: false,
      }
      
      const allAnnotations: AnnotationWithMetadata[] = [
        currentAnnotation,
        { ...currentAnnotation, id: 'ann-2', userTypeBlock: 'user-type-1' },
      ]
      
      const userTypeBlockOptions: Array<{ title: string; value: UserTypeBlock }> = [
        { title: 'User Type 1', value: 'user-type-1' },
      ]
      
      const available = getAvailableUserTypeBlocksForAnnotation(
        currentAnnotation,
        allAnnotations,
        userTypeBlockOptions
      )
      
      expect(available.find(o => o.value === 'user-type-1')?.disabled).toBe(false)
    })

    it('should preserve option properties', () => {
      const currentAnnotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: null,
        orderIndex: 0,
        isDefault: false,
      }
      
      const userTypeBlockOptions: Array<{ title: string; value: UserTypeBlock }> = [
        { title: 'Generic', value: null },
        { title: 'User Type 1', value: 'user-type-1' },
      ]
      
      const available = getAvailableUserTypeBlocksForAnnotation(
        currentAnnotation,
        [],
        userTypeBlockOptions
      )
      
      expect(available[0].title).toBe('Generic')
      expect(available[0].value).toBe(null)
      expect(available[1].title).toBe('User Type 1')
      expect(available[1].value).toBe('user-type-1')
    })

    it('should handle null userTypeBlock in used types', () => {
      const currentAnnotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation',
        type: 'type-1',
        userTypeBlock: null,
        orderIndex: 0,
        isDefault: false,
      }
      
      const allAnnotations: AnnotationWithMetadata[] = [
        currentAnnotation,
        { ...currentAnnotation, id: 'ann-2', userTypeBlock: null },
      ]
      
      const userTypeBlockOptions: Array<{ title: string; value: UserTypeBlock }> = [
        { title: 'Generic', value: null },
      ]
      
      const available = getAvailableUserTypeBlocksForAnnotation(
        currentAnnotation,
        allAnnotations,
        userTypeBlockOptions
      )
      
      // null userTypeBlock should not be disabled (can have multiple)
      expect(available.find(o => o.value === null)?.disabled).toBe(false)
    })
  })

  describe('formatAnnotationForDisplay', () => {
    it('should return annotation text', () => {
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: 'Test annotation text',
        type: 'type-1',
        userTypeBlock: null,
        orderIndex: 0,
        isDefault: false,
      }
      
      expect(formatAnnotationForDisplay(annotation)).toBe('Test annotation text')
    })

    it('should handle empty text', () => {
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: '',
        type: 'type-1',
        userTypeBlock: null,
        orderIndex: 0,
        isDefault: false,
      }
      
      expect(formatAnnotationForDisplay(annotation)).toBe('')
    })

    it('should handle long text', () => {
      const longText = 'A'.repeat(1000)
      const annotation: AnnotationWithMetadata = {
        id: 'ann-1',
        text: longText,
        type: 'type-1',
        userTypeBlock: null,
        orderIndex: 0,
        isDefault: false,
      }
      
      expect(formatAnnotationForDisplay(annotation)).toBe(longText)
    })
  })

  describe('getAnnotationsForUserTypeBlock', () => {
    it('should return generic annotations when userTypeBlock is null', () => {
      const annotations: AnnotationWithMetadata[] = [
        {
          id: 'ann-1',
          text: 'Generic annotation',
          type: 'type-1',
          userTypeBlock: null,
          orderIndex: 0,
          isDefault: false,
        },
        {
          id: 'ann-2',
          text: 'User-specific annotation',
          type: 'type-1',
          userTypeBlock: 'user-type-1',
          orderIndex: 0,
          isDefault: false,
        },
      ]
      
      const filtered = getAnnotationsForUserTypeBlock(annotations, null)
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('ann-1')
      expect(filtered[0].userTypeBlock).toBe(null)
    })

    it('should return annotations matching userTypeBlock', () => {
      const annotations: AnnotationWithMetadata[] = [
        {
          id: 'ann-1',
          text: 'Generic annotation',
          type: 'type-1',
          userTypeBlock: null,
          orderIndex: 0,
          isDefault: false,
        },
        {
          id: 'ann-2',
          text: 'User-specific annotation',
          type: 'type-1',
          userTypeBlock: 'user-type-1',
          orderIndex: 0,
          isDefault: false,
        },
        {
          id: 'ann-3',
          text: 'Another user-specific annotation',
          type: 'type-1',
          userTypeBlock: 'user-type-1',
          orderIndex: 0,
          isDefault: false,
        },
      ]
      
      const filtered = getAnnotationsForUserTypeBlock(annotations, 'user-type-1')
      
      expect(filtered).toHaveLength(2)
      expect(filtered.every(a => a.userTypeBlock === 'user-type-1')).toBe(true)
    })

    it('should return empty array when no matching annotations', () => {
      const annotations: AnnotationWithMetadata[] = [
        {
          id: 'ann-1',
          text: 'Generic annotation',
          type: 'type-1',
          userTypeBlock: null,
          orderIndex: 0,
          isDefault: false,
        },
      ]
      
      const filtered = getAnnotationsForUserTypeBlock(annotations, 'user-type-1')
      
      expect(filtered).toEqual([])
    })

    it('should handle empty annotations array', () => {
      const filtered = getAnnotationsForUserTypeBlock([], 'user-type-1')
      
      expect(filtered).toEqual([])
    })
  })

  describe('validateAnnotationMetadata', () => {
    it('should return true for valid metadata', () => {
      const metadata: AnnotationMetadata = {
        orderIndex: 0,
        isDefault: false,
        userTypeBlock: null,
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(true)
    })

    it('should return true for valid metadata with userTypeBlock', () => {
      const metadata: AnnotationMetadata = {
        orderIndex: 5,
        isDefault: true,
        userTypeBlock: 'user-type-1',
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(true)
    })

    it('should return false for negative orderIndex', () => {
      const metadata: AnnotationMetadata = {
        orderIndex: -1,
        isDefault: false,
        userTypeBlock: null,
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(false)
    })

    it('should return false for non-number orderIndex', () => {
      const metadata = {
        orderIndex: '0' as any,
        isDefault: false,
        userTypeBlock: null,
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(false)
    })

    it('should return false for non-boolean isDefault', () => {
      const metadata = {
        orderIndex: 0,
        isDefault: 'false' as any,
        userTypeBlock: null,
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(false)
    })

    it('should return false for invalid userTypeBlock type', () => {
      const metadata = {
        orderIndex: 0,
        isDefault: false,
        userTypeBlock: 123 as any,
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(false)
    })

    it('should accept null userTypeBlock', () => {
      const metadata: AnnotationMetadata = {
        orderIndex: 0,
        isDefault: false,
        userTypeBlock: null,
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(true)
    })

    it('should accept string userTypeBlock', () => {
      const metadata: AnnotationMetadata = {
        orderIndex: 0,
        isDefault: false,
        userTypeBlock: 'user-type-1',
      }
      
      expect(validateAnnotationMetadata(metadata)).toBe(true)
    })
  })

  describe('getUserTypeBlockOptionsFromGlobalData', () => {
    it('should return user type options from GlobalData', () => {
      const globalData = createAtomicBlockGlobalData()
      
      const options = getUserTypeBlockOptionsFromGlobalData(globalData)
      
      expect(options).toBeInstanceOf(Array)
      expect(options.length).toBeGreaterThan(0)
      expect(options[0]).toHaveProperty('title')
      expect(options[0]).toHaveProperty('value')
    })

    it('should include generic option (null value)', () => {
      const globalData = createAtomicBlockGlobalData()
      
      const options = getUserTypeBlockOptionsFromGlobalData(globalData)
      
      const genericOption = options.find(o => o.value === null)
      expect(genericOption).toBeDefined()
      expect(genericOption?.title).toBe('Generic')
    })

    it('should handle empty GlobalData', () => {
      const globalData = {
        entities: {
          blockInstance: [],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          activeConstituents: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validConstituents: [],
          dependentInstanceOptions: [],
        },
      }
      
      const options = getUserTypeBlockOptionsFromGlobalData(globalData)
      
      // Should still have generic option
      expect(options).toBeInstanceOf(Array)
      expect(options.length).toBeGreaterThanOrEqual(1)
    })
  })
})


