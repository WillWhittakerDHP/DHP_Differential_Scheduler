import { describe, expect, it } from 'vitest'
import { extractInstanceComponents } from '@/utils/instanceComponentUtils'
import type { GlobalEntity } from '@/types/entities'

describe('extractInstanceComponents', () => {
  it('includes atomic children under a composite parent', () => {
    const entities: Record<string, GlobalEntity<'blockInstance' | 'blockShape'>> = {
      parent: {
        id: 'sfh',
        name: 'Single Family Home',
        entityKey: 'blockInstance',
        blockShapeRef: 'shape-time',
        composite: true,
      } as GlobalEntity<'blockInstance'>,
      roof: {
        id: 'roof',
        name: 'Roof',
        entityKey: 'blockInstance',
        blockShapeRef: 'shape-time',
        composite: false,
        icon: 'mdi-home-roof',
      } as GlobalEntity<'blockInstance'>,
      shape: {
        id: 'shape-time',
        name: 'Property Details',
        entityKey: 'blockShape',
        semanticType: 'time',
      } as GlobalEntity<'blockShape'>,
    }

    const components = extractInstanceComponents({
      serviceId: 'sfh',
      instanceComponentsRelationships: [{ childId: 'roof' }],
      getGlobalEntityById: (key, id) => {
        if (key === 'blockInstance' && id === 'roof') return entities.roof
        if (key === 'blockShape' && id === 'shape-time') return entities.shape
        return null
      },
    })

    expect(components).toHaveLength(1)
    expect(components[0]?.name).toBe('Roof')
  })
})
