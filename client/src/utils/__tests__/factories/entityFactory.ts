
import type { GlobalEntity, GlobalEntityKey } from '@/types/entities'
import type { GlobalEntityId } from '@/types/entities'

function createBaseEntity<GE extends GlobalEntityKey>(
  id: string,
  entityKey: GE,
  name: string,
  overrides: Partial<GlobalEntity<GE>> = {}
): GlobalEntity<GE> {
  return {
    id,
    entityKey,
    name,
    disabled: false,
    orderIndex: 0,
    ...overrides,
  } as GlobalEntity<GE>
}

export function createBlockInstance(
  id: GlobalEntityId,
  name: string,
  options: {
    composite?: boolean
    disabled?: boolean
    orderIndex?: number
    blockShapeRef?: string
    baseSqFt?: number
    description?: string
    icon?: string
    active?: boolean
    differential?: boolean
    name?: string // Allow name override for tests
  } = {}
): GlobalEntity<'blockInstance'> {
  return createBaseEntity(id, 'blockInstance', name, {
    ...(options.composite !== undefined && { composite: options.composite }),
    ...(options.disabled !== undefined && { disabled: options.disabled }),
    ...(options.orderIndex !== undefined && { orderIndex: options.orderIndex }),
    ...(options.blockShapeRef && { blockShapeRef: options.blockShapeRef }),
    ...(options.baseSqFt !== undefined && { baseSqFt: options.baseSqFt }),
    ...(options.description && { description: options.description }),
    ...(options.icon && { icon: options.icon }),
    ...(options.active !== undefined && { active: options.active }),
    ...(options.differential !== undefined && { differential: options.differential }),
    ...(options.name && { name: options.name }), // Allow name override
  } as Partial<GlobalEntity<'blockInstance'>>)
}

export function createPartInstance(
  id: GlobalEntityId,
  name: string,
  options: {
    disabled?: boolean
    orderIndex?: number
    partShapeRef?: string
    onSite?: boolean
    clientPresent?: boolean
    moveable?: boolean
    baseTime?: number
    rateOverBaseTime?: number
    baseFee?: number
    rateOverBaseFee?: number
  } = {}
): GlobalEntity<'partInstance'> {
  return createBaseEntity(id, 'partInstance', name, {
    ...(options.disabled !== undefined && { disabled: options.disabled }),
    ...(options.orderIndex !== undefined && { orderIndex: options.orderIndex }),
    ...(options.partShapeRef && { partShapeRef: options.partShapeRef }),
    ...(options.onSite !== undefined && { onSite: options.onSite }),
    ...(options.clientPresent !== undefined && { clientPresent: options.clientPresent }),
    ...(options.moveable !== undefined && { moveable: options.moveable }),
    ...(options.baseTime !== undefined && { baseTime: options.baseTime }),
    ...(options.rateOverBaseTime !== undefined && { rateOverBaseTime: options.rateOverBaseTime }),
    ...(options.baseFee !== undefined && { baseFee: options.baseFee }),
    ...(options.rateOverBaseFee !== undefined && { rateOverBaseFee: options.rateOverBaseFee }),
  } as Partial<GlobalEntity<'partInstance'>>)
}

export function createBlockShape(
  id: GlobalEntityId,
  name: string,
  options: {
    disabled?: boolean
    orderIndex?: number
    description?: string
    icon?: string
  } = {}
): GlobalEntity<'blockShape'> {
  return createBaseEntity(id, 'blockShape', name, {
    ...(options.disabled !== undefined && { disabled: options.disabled }),
    ...(options.orderIndex !== undefined && { orderIndex: options.orderIndex }),
    ...(options.description && { description: options.description }),
    ...(options.icon && { icon: options.icon }),
  } as Partial<GlobalEntity<'blockShape'>>)
}

export function createPartShape(
  id: GlobalEntityId,
  name: string,
  options: {
    disabled?: boolean
    orderIndex?: number
    description?: string
    icon?: string
  } = {}
): GlobalEntity<'partShape'> {
  return createBaseEntity(id, 'partShape', name, {
    ...(options.disabled !== undefined && { disabled: options.disabled }),
    ...(options.orderIndex !== undefined && { orderIndex: options.orderIndex }),
    ...(options.description && { description: options.description }),
    ...(options.icon && { icon: options.icon }),
  } as Partial<GlobalEntity<'partShape'>>)
}

export function createEntities<GE extends GlobalEntityKey>(
  entityKey: GE,
  count: number,
  namePrefix: string,
  factory: (id: string, name: string) => GlobalEntity<GE>
): GlobalEntity<GE>[] {
  return Array.from({ length: count }, (_, index) => {
    const id = `${entityKey}-${index + 1}`
    const name = `${namePrefix} ${index + 1}`
    return factory(id, name)
  })
}

export function createEntitySet() {
  const blockShape = createBlockShape('block-shape-1', 'Test Block Shape')
  const partShape1 = createPartShape('part-shape-1', 'Test Part Shape 1')
  const partShape2 = createPartShape('part-shape-2', 'Test Part Shape 2')
  
  const partInstance1 = createPartInstance('part-1', 'Part 1', {
    partShapeRef: partShape1.id,
    baseTime: 30,
    baseFee: 50,
    orderIndex: 1,
  })
  
  const partInstance2 = createPartInstance('part-2', 'Part 2', {
    partShapeRef: partShape2.id,
    baseTime: 45,
    baseFee: 75,
    orderIndex: 2,
  })
  
  const blockInstance = createBlockInstance('block-1', 'Test Block', {
    blockShapeRef: blockShape.id,
    orderIndex: 1,
  })
  
  return {
    blockShape,
    partShapes: [partShape1, partShape2],
    partInstances: [partInstance1, partInstance2],
    blockInstance,
  }
}

