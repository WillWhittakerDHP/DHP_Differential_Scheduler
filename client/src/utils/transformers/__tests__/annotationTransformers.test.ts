
import { describe, it, expect } from 'vitest'
import {
  transformApiAnnotationShape,
  transformApiAnnotation,
  filterAnnotationsByUserTypeBlock,
  sortAnnotationsByOrderIndex,
  getDefaultAnnotation,
} from '../annotationTransformers'

describe('annotationTransformers', () => {
  describe('transformApiAnnotationShape', () => {
    it('should transform API annotation shape to frontend format', () => {
      const rawAnnotationShape = {
        id: 'annot-shape-1',
        name: 'Client Type',
        description: 'Client type annotation',
        disabled: false,
      }
      
      const result = transformApiAnnotationShape(rawAnnotationShape)
      
      expect(result).toBeDefined()
      expect(result?.id).toBe('annot-shape-1')
      expect(result?.name).toBe('Client Type')
    })
    
    it('should handle null input', () => {
      const result = transformApiAnnotationShape(null)
      
      expect(result).toBeNull()
    })
    
    it('should filter disabled annotation shapes', () => {
      const rawAnnotationShape = {
        id: 'annot-shape-1',
        name: 'Client Type',
        disabled: true,
      }
      
      const result = transformApiAnnotationShape(rawAnnotationShape)
      
      expect(result).toBeNull()
    })
  })
  
  describe('transformApiAnnotation', () => {
    it('should transform API annotation to base AnnotationInstance type', () => {
      const rawAnnotation = {
        id: 'annot-1',
        name: 'Buyer',
        text: 'Buyer',
        annotation_type_id: 'type-1',
        block_instance_id: 'block-1',
        user_type_block_block_instance_id: 'user-type-1',
        disabled: false,
      }
      
      const result = transformApiAnnotation(rawAnnotation)
      
      expect(result.id).toBe('annot-1')
      expect(result.name).toBe('Buyer')
      expect(result.text).toBe('Buyer')
      expect(result.type).toBe('type-1')
    })
    
    it('should handle missing optional fields', () => {
      const rawAnnotation = {
        id: 'annot-1',
        name: 'Buyer',
      }
      
      const result = transformApiAnnotation(rawAnnotation)
      
      expect(result.id).toBe('annot-1')
      expect(result.name).toBe('Buyer')
    })
  })
  
  describe('filterAnnotationsByUserTypeBlock', () => {
    it('should filter annotations by user type ID', () => {
      const annotations = [
        {
          id: 'annot-1',
          name: 'Buyer',
          userTypeBlockBlockInstanceId: 'user-type-1',
        },
        {
          id: 'annot-2',
          name: 'Agent',
          userTypeBlockBlockInstanceId: 'user-type-2',
        },
        {
          id: 'annot-3',
          name: 'Buyer Alt',
          userTypeBlockBlockInstanceId: 'user-type-1',
        },
      ] as any[]
      
      const result = filterAnnotationsByUserTypeBlock(annotations, 'user-type-1')
      
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('annot-1')
      expect(result[1].id).toBe('annot-3')
    })
    
    it('should return empty array when no matches', () => {
      const annotations = [
        {
          id: 'annot-1',
          name: 'Buyer',
          userTypeBlockBlockInstanceId: 'user-type-1',
        },
      ] as any[]
      
      const result = filterAnnotationsByUserTypeBlock(annotations, 'user-type-999')
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle null user type ID', () => {
      const annotations = [
        {
          id: 'annot-1',
          name: 'Buyer',
          userTypeBlockBlockInstanceId: 'user-type-1',
        },
      ] as any[]
      
      const result = filterAnnotationsByUserTypeBlock(annotations, null as any)
      
      expect(result).toHaveLength(0)
    })
  })
  
  describe('sortAnnotationsByOrderIndex', () => {
    it('should sort annotations by orderIndex ascending', () => {
      const annotations = [
        { id: 'annot-3', name: 'Third', orderIndex: 3 },
        { id: 'annot-1', name: 'First', orderIndex: 1 },
        { id: 'annot-2', name: 'Second', orderIndex: 2 },
      ] as any[]
      
      const result = sortAnnotationsByOrderIndex(annotations)
      
      expect(result[0].id).toBe('annot-1')
      expect(result[1].id).toBe('annot-2')
      expect(result[2].id).toBe('annot-3')
    })
    
    it('should handle missing orderIndex', () => {
      const annotations = [
        { id: 'annot-1', name: 'First' },
        { id: 'annot-2', name: 'Second', orderIndex: 1 },
      ] as any[]
      
      const result = sortAnnotationsByOrderIndex(annotations)
      
      expect(result).toHaveLength(2)
    })
    
    it('should handle empty array', () => {
      const result = sortAnnotationsByOrderIndex([])
      
      expect(result).toHaveLength(0)
    })
  })
  
  describe('getDefaultAnnotation', () => {
    it('should return annotation marked as default', () => {
      const annotations = [
        { id: 'annot-1', name: 'Buyer', isDefault: false },
        { id: 'annot-2', name: 'Agent', isDefault: true },
        { id: 'annot-3', name: 'Owner', isDefault: false },
      ] as any[]
      
      const result = getDefaultAnnotation(annotations)
      
      expect(result?.id).toBe('annot-2')
    })
    
    it('should return first annotation if none marked default', () => {
      const annotations = [
        { id: 'annot-1', name: 'Buyer', isDefault: false },
        { id: 'annot-2', name: 'Agent', isDefault: false },
      ] as any[]
      
      const result = getDefaultAnnotation(annotations)
      
      expect(result?.id).toBe('annot-1')
    })
    
    it('should return null for empty array', () => {
      const result = getDefaultAnnotation([])
      
      expect(result).toBeNull()
    })
  })
  
})

