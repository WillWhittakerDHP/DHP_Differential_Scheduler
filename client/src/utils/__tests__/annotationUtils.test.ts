
import { describe, it, expect } from 'vitest'
import {
  hasDuplicateUserTypeBlock,
  formatAnnotationForDisplay,
  getAnnotationsForUserTypeBlock,
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
          partAssignments: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstances: [],
        },
      }
      
      const options = getUserTypeBlockOptionsFromGlobalData(globalData)
      
      expect(options).toBeInstanceOf(Array)
      expect(options.length).toBeGreaterThanOrEqual(1)
    })
  })
})


