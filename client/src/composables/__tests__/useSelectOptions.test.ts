
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useSelectOptions } from '../useSelectOptions'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'

const mockGetEntityMap = vi.fn(() => new Map())
const mockUseAdmin = vi.fn(() => ({
  getEntityMap: mockGetEntityMap,
}))

vi.mock('../useAdmin', () => ({
  useAdmin: () => mockUseAdmin(),
}))

describe('useSelectOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEntityMap.mockReturnValue(new Map())
  })

  describe('flat options transformation', () => {
    it('should transform entities to flat options format', () => {
      const entities: GlobalEntity<GlobalEntityKey>[] = [
        { id: 'entity-1', name: 'Entity 1' } as GlobalEntity<GlobalEntityKey>,
        { id: 'entity-2', name: 'Entity 2' } as GlobalEntity<GlobalEntityKey>,
      ]

      const result = useSelectOptions({
        filteredEntities: ref(entities),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(false),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.options.value).toEqual([
        { title: 'Entity 1', value: 'entity-1' },
        { title: 'Entity 2', value: 'entity-2' },
      ])
    })

    it('should use custom optionLabelKey', () => {
      const entities: GlobalEntity<GlobalEntityKey>[] = [
        { id: 'entity-1', text: 'Annotation 1' } as any,
        { id: 'entity-2', text: 'Annotation 2' } as any,
      ]

      const result = useSelectOptions({
        filteredEntities: ref(entities),
        selectConfig: ref(undefined),
        optionLabelKey: ref('text'),
        isMultiple: ref(false),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.options.value).toEqual([
        { title: 'Annotation 1', value: 'entity-1' },
        { title: 'Annotation 2', value: 'entity-2' },
      ])
    })

    it('should fallback to entity id when label key is missing', () => {
      const entities: GlobalEntity<GlobalEntityKey>[] = [
        { id: 'entity-1' } as GlobalEntity<GlobalEntityKey>,
        { id: 'entity-2' } as GlobalEntity<GlobalEntityKey>,
      ]

      const result = useSelectOptions({
        filteredEntities: ref(entities),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(false),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.options.value).toEqual([
        { title: 'entity-1', value: 'entity-1' },
        { title: 'entity-2', value: 'entity-2' },
      ])
    })
  })

  describe('grouped options', () => {
    it('should group entities by groupByKey', () => {
      const entities: GlobalEntity<GlobalEntityKey>[] = [
        { id: 'block-1', name: 'Block 1', blockShapeRef: 'shape-1' } as any,
        { id: 'block-2', name: 'Block 2', blockShapeRef: 'shape-1' } as any,
        { id: 'block-3', name: 'Block 3', blockShapeRef: 'shape-2' } as any,
      ]

      const groupParentMap = new Map([
        ['shape-1', { id: 'shape-1', name: 'Shape 1' }],
        ['shape-2', { id: 'shape-2', name: 'Shape 2' }],
      ])
      mockGetEntityMap.mockReturnValue(groupParentMap)

      const config: RelationshipFieldType<'blockInstance'> = {
        groupByKey: 'blockShapeRef',
        candidateChildKey: 'blockInstance',
        selectMode: 'single' as any,
      } as any

      const result = useSelectOptions({
        filteredEntities: ref(entities),
        selectConfig: ref(config),
        optionLabelKey: ref('name'),
        isMultiple: ref(false),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.groupedByKey.value).toHaveLength(2)
      expect(result.groupedByKey.value[0].groupKey).toBe('shape-1')
      expect(result.groupedByKey.value[0].groupLabel).toBe('Shape 1')
      expect(result.groupedByKey.value[0].entities).toHaveLength(2)
      expect(result.groupedByKey.value[1].groupKey).toBe('shape-2')
      expect(result.groupedByKey.value[1].groupLabel).toBe('Shape 2')
      expect(result.groupedByKey.value[1].entities).toHaveLength(1)
    })

    it('should return empty array when no groupByKey configured', () => {
      const entities: GlobalEntity<GlobalEntityKey>[] = [
        { id: 'entity-1', name: 'Entity 1' } as GlobalEntity<GlobalEntityKey>,
      ]

      const result = useSelectOptions({
        filteredEntities: ref(entities),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(false),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.groupedByKey.value).toEqual([])
    })

    it('should flatten grouped options for multiple selection', () => {
      const entities: GlobalEntity<GlobalEntityKey>[] = [
        { id: 'block-1', name: 'Block 1', blockShapeRef: 'shape-1' } as any,
        { id: 'block-2', name: 'Block 2', blockShapeRef: 'shape-1' } as any,
      ]

      const groupParentMap = new Map([
        ['shape-1', { id: 'shape-1', name: 'Shape 1' }],
      ])
      mockGetEntityMap.mockReturnValue(groupParentMap)

      const config: RelationshipFieldType<'blockInstance'> = {
        groupByKey: 'blockShapeRef',
        candidateChildKey: 'blockInstance',
        selectMode: 'multiple' as any,
      } as any

      const result = useSelectOptions({
        filteredEntities: ref(entities),
        selectConfig: ref(config),
        optionLabelKey: ref('name'),
        isMultiple: ref(true),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.options.value).toEqual([
        { title: 'Block 1', value: 'block-1' },
        { title: 'Block 2', value: 'block-2' },
      ])
    })
  })

  describe('normalizedValue', () => {
    it('should normalize array value for multiple select', () => {
      const result = useSelectOptions({
        filteredEntities: ref([]),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(true),
        rawFieldValue: ref(['value-1', 'value-2']),
        fieldKey: ref('testField'),
      })

      expect(result.normalizedValue.value).toEqual(['value-1', 'value-2'])
    })

    it('should convert single value to array for multiple select', () => {
      const result = useSelectOptions({
        filteredEntities: ref([]),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(true),
        rawFieldValue: ref('value-1'),
        fieldKey: ref('testField'),
      })

      expect(result.normalizedValue.value).toEqual(['value-1'])
    })

    it('should return empty array for null/undefined in multiple select', () => {
      const result = useSelectOptions({
        filteredEntities: ref([]),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(true),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.normalizedValue.value).toEqual([])
    })

    it('should normalize string value for single select', () => {
      const result = useSelectOptions({
        filteredEntities: ref([]),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(false),
        rawFieldValue: ref('value-1'),
        fieldKey: ref('testField'),
      })

      expect(result.normalizedValue.value).toBe('value-1')
    })

    it('should convert number to string for single select', () => {
      const result = useSelectOptions({
        filteredEntities: ref([]),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(false),
        rawFieldValue: ref(123),
        fieldKey: ref('testField'),
      })

      expect(result.normalizedValue.value).toBe('123')
    })

    it('should return null for null/undefined in single select', () => {
      const result = useSelectOptions({
        filteredEntities: ref([]),
        selectConfig: ref(undefined),
        optionLabelKey: ref('name'),
        isMultiple: ref(false),
        rawFieldValue: ref(null),
        fieldKey: ref('testField'),
      })

      expect(result.normalizedValue.value).toBeNull()
    })
  })
})

