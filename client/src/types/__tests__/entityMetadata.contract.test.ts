/**
 * Contract tests for types/entityMetadata.ts.
 * Covers: EntityMetadataType, FieldMetadataEntry, FieldMetadata.
 * Validates: no accidental breaking changes to entity metadata types.
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import type {
  EntityMetadataType,
  FieldMetadataEntry,
  FieldMetadata,
} from '@/types/entityMetadata'

const EXPECTED_ENTITY_METADATA_TYPES: EntityMetadataType[] = [
  'blockShape',
  'partShape',
  'blockInstance',
  'partInstance',
  'eventShape',
  'eventInstance',
  'annotationShape',
  'annotationInstance',
]

describe('entityMetadata contract', () => {
  describe('EntityMetadataType', () => {
    it('includes expected entity type literals', () => {
      const t: EntityMetadataType = 'blockInstance'
      expect(EXPECTED_ENTITY_METADATA_TYPES).toContain(t)
    })

    it('all expected values are valid EntityMetadataType', () => {
      EXPECTED_ENTITY_METADATA_TYPES.forEach((value) => {
        const t: EntityMetadataType = value
        expect(t).toBe(value)
      })
    })
  })

  describe('FieldMetadataEntry minimal shape', () => {
    it('dummy object satisfies required fields', () => {
      const minimal: FieldMetadataEntry = {
        dataType: 'string',
        label: 'Test',
        isRequired: false,
        visibility: 'titleRow',
        layout: 'inline',
        displayOrder: 0,
        renderAs: 'text',
        panel: 'none',
        bulkEdit: false,
      }
      expect(minimal.dataType).toBe('string')
      expect(minimal.label).toBe('Test')
      expect(minimal.isRequired).toBe(false)
      expect(minimal.visibility).toBe('titleRow')
      expect(minimal.layout).toBe('inline')
      expect(minimal.displayOrder).toBe(0)
      expect(minimal.renderAs).toBe('text')
      expect(minimal.panel).toBe('none')
      expect(minimal.bulkEdit).toBe(false)
    })
  })

  describe('FieldMetadata', () => {
    it('is Record of string to FieldMetadataEntry', () => {
      const entry: FieldMetadataEntry = {
        dataType: 'number',
        label: 'Order',
        isRequired: true,
        visibility: 'expandedDirect',
        layout: 'stacked',
        displayOrder: 1,
        renderAs: 'number',
        panel: 'none',
        bulkEdit: false,
      }
      const metadata: FieldMetadata = { orderIndex: entry }
      expect(metadata.orderIndex).toBe(entry)
      expect(Object.keys(metadata)).toContain('orderIndex')
    })
  })
})
