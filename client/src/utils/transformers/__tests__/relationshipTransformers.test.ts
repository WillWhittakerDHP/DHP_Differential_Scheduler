/**
 * RELATIONSHIP TRANSFORMERS TESTS
 * 
 * Unit tests for relationship transformation utilities.
 * Tests relationship finding, filtering, and component operations.
 */

import { describe, it, expect } from 'vitest'
import { 
  transformApiRelationships,
  findRelationshipsByParent,
  extractChildIds,
  filterRelationshipsByKind,
  groupRelationshipsByParent
} from '../relationshipTransformers'
import { createBlockInstance, createPartInstance } from '../../__tests__/factories/entityFactory'
import type { FetchedRelationship } from '@/types/relationships'

describe('relationshipTransformers', () => {
  describe('transformApiRelationships', () => {
    it('should transform API relationships to GlobalRelationship format', () => {
      const entities = {
        blockInstance: [createBlockInstance('block-1', 'Block 1')],
        partInstance: [
          createPartInstance('part-1', 'Part 1'),
          createPartInstance('part-2', 'Part 2'),
        ],
        blockShape: [],
        partShape: [],
      }
      
      const fetchedRelationships: FetchedRelationship[] = [
        {
          id: 'rel-1',
          kind: 'activeParts', // FetchedRelationship uses 'kind' not 'relationship_kind'
          parent_id: 'block-1',
          parent_kind: 'blockInstance', // FetchedRelationship uses 'parent_kind' not 'parent_entity_key'
          child_id: 'part-1',
          child_kind: 'partInstance', // FetchedRelationship uses 'child_kind' not 'child_entity_key'
          disabled: false,
        },
        {
          id: 'rel-2',
          kind: 'activeParts',
          parent_id: 'block-1',
          parent_kind: 'blockInstance',
          child_id: 'part-2',
          child_kind: 'partInstance',
          disabled: false,
        },
      ]
      
      const result = transformApiRelationships(fetchedRelationships, 'activeParts', entities)
      
      expect(result).toHaveLength(1)
      expect(result[0].parent.id).toBe('block-1')
      expect(result[0].children).toHaveLength(2)
    })
    
    it('should filter out disabled relationships', () => {
      const entities = {
        blockInstance: [createBlockInstance('block-1', 'Block 1')],
        partInstance: [createPartInstance('part-1', 'Part 1')],
        blockShape: [],
        partShape: [],
      }
      
      const fetchedRelationships: FetchedRelationship[] = [
        {
          id: 'rel-1',
          kind: 'activeParts',
          parent_id: 'block-1',
          parent_kind: 'blockInstance',
          child_id: 'part-1',
          child_kind: 'partInstance',
          disabled: true, // Disabled
        },
      ]
      
      const result = transformApiRelationships(fetchedRelationships, 'activeParts', entities)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle missing parent entity', () => {
      const entities = {
        blockInstance: [],
        partInstance: [createPartInstance('part-1', 'Part 1')],
        blockShape: [],
        partShape: [],
      }
      
      const fetchedRelationships: FetchedRelationship[] = [
        {
          id: 'rel-1',
          kind: 'activeParts',
          parent_id: 'nonexistent-block',
          parent_kind: 'blockInstance',
          child_id: 'part-1',
          child_kind: 'partInstance',
          disabled: false,
        },
      ]
      
      const result = transformApiRelationships(fetchedRelationships, 'activeParts', entities)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle missing child entities', () => {
      const entities = {
        blockInstance: [createBlockInstance('block-1', 'Block 1')],
        partInstance: [],
        blockShape: [],
        partShape: [],
      }
      
      const fetchedRelationships: FetchedRelationship[] = [
        {
          id: 'rel-1',
          kind: 'activeParts',
          parent_id: 'block-1',
          parent_kind: 'blockInstance',
          child_id: 'nonexistent-part',
          child_kind: 'partInstance',
          disabled: false,
        },
      ]
      
      const result = transformApiRelationships(fetchedRelationships, 'activeParts', entities)
      
      expect(result).toHaveLength(0)
    })
  })
  
  describe('findRelationshipsByParent', () => {
    it('should find relationships by parent ID', () => {
      const relationships = [
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-1', 'Block 1'),
          children: [createPartInstance('part-1', 'Part 1')],
        },
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-2', 'Block 2'),
          children: [createPartInstance('part-2', 'Part 2')],
        },
      ]
      
      const result = findRelationshipsByParent('block-1', relationships)
      
      expect(result).toHaveLength(1)
      expect(result[0].parent.id).toBe('block-1')
    })
    
    it('should return empty array when no matches', () => {
      const relationships = [
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-1', 'Block 1'),
          children: [createPartInstance('part-1', 'Part 1')],
        },
      ]
      
      const result = findRelationshipsByParent('nonexistent', relationships)
      
      expect(result).toHaveLength(0)
    })
  })
  
  describe('extractChildIds', () => {
    it('should extract all child IDs from relationships', () => {
      const relationships = [
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-1', 'Block 1'),
          children: [
            createPartInstance('part-1', 'Part 1'),
            createPartInstance('part-2', 'Part 2'),
          ],
        },
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-2', 'Block 2'),
          children: [createPartInstance('part-3', 'Part 3')],
        },
      ]
      
      const result = extractChildIds(relationships)
      
      expect(result).toHaveLength(3)
      expect(result).toContain('part-1')
      expect(result).toContain('part-2')
      expect(result).toContain('part-3')
    })
    
    it('should return empty array for empty relationships', () => {
      const result = extractChildIds([])
      
      expect(result).toHaveLength(0)
    })
  })
  
  describe('filterRelationshipsByKind', () => {
    it('should filter relationships by kind', () => {
      const relationships = [
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-1', 'Block 1'),
          children: [createPartInstance('part-1', 'Part 1')],
        },
        {
          relationshipKind: 'instanceComponents' as const,
          parent: createBlockInstance('block-1', 'Block 1'),
          children: [createBlockInstance('block-2', 'Block 2')],
        },
      ]
      
      const result = filterRelationshipsByKind(relationships, 'activeParts')
      
      expect(result).toHaveLength(1)
      expect(result[0].relationshipKind).toBe('activeParts')
    })
  })
  
  describe('groupRelationshipsByParent', () => {
    it('should group relationships by parent ID', () => {
      const relationships = [
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-1', 'Block 1'),
          children: [createPartInstance('part-1', 'Part 1')],
        },
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-1', 'Block 1'),
          children: [createPartInstance('part-2', 'Part 2')],
        },
        {
          relationshipKind: 'activeParts' as const,
          parent: createBlockInstance('block-2', 'Block 2'),
          children: [createPartInstance('part-3', 'Part 3')],
        },
      ]
      
      const result = groupRelationshipsByParent(relationships)
      
      expect(result.get('block-1')).toHaveLength(2)
      expect(result.get('block-2')).toHaveLength(1)
    })
  })
})

